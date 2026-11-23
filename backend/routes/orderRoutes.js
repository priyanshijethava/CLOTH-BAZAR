
const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const StockHistory = require("../models/StockHistory");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const processDemoPayment = require("../controllers/demoPaymentController");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

// Available Coupons
const coupons = {
  STYLE10: {
    discount: 10,
    category: "All",
  },
  FASHION20: {
    discount: 20,
    category: "Women",
  },
  KIDS15: {
    discount: 15,
    category: "Kids",
  },
};

// ==========================================
// DEMO PAYMENT
// ==========================================

router.post(
  "/demo-payment",
  authMiddleware,
  processDemoPayment
);

// ==========================================
// ADMIN ORDER MANAGEMENT
// ==========================================

// Admin - Get All Orders
router.get("/admin/all", adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Admin - Update Order Status
router.patch("/admin/:id/status", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const allowedStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
    ];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid Order ID.",
      });
    }

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        message: "Invalid order status.",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({
        message: "Cancelled orders cannot be updated.",
      });
    }

    order.orderStatus = orderStatus;

    const updatedOrder = await order.save();

    res.status(200).json({
      message: "Order status updated successfully!",
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ==========================================
// CUSTOMER ORDER MANAGEMENT
// ==========================================

// Get Logged-in User's Orders
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const orders = await Order.find({
      email: user.email,
    }).sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ==========================================
// CANCEL ORDER + RESTORE STOCK + HISTORY
// ==========================================

router.patch("/:id/cancel", authMiddleware, async (req, res) => {
  let session;

  try {
    session = await mongoose.startSession();

    let cancelledOrder;

    await session.withTransaction(async () => {
      const user = await User.findById(req.user.id).session(session);

      if (!user) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
      }

      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Invalid Order ID.");
        error.statusCode = 400;
        throw error;
      }

      const order = await Order.findOne({
        _id: id,
        email: user.email,
      }).session(session);

      if (!order) {
        const error = new Error("Order not found.");
        error.statusCode = 404;
        throw error;
      }

      if (order.orderStatus !== "Pending") {
        const error = new Error(
          "Only Pending orders can be cancelled."
        );
        error.statusCode = 400;
        throw error;
      }

      // Check Product IDs before restoring stock.
      for (const item of order.items) {
        if (
          !item.productId ||
          !mongoose.Types.ObjectId.isValid(
            String(item.productId)
          )
        ) {
          const error = new Error(
            "This order cannot be cancelled with automatic stock restoration because its product ID is missing."
          );
          error.statusCode = 400;
          throw error;
        }
      }

      // Combine quantities of duplicate products.
      const productQuantities = new Map();

      for (const item of order.items) {
        const productId = String(item.productId);
        const quantity = Number(item.quantity);

        if (!Number.isInteger(quantity) || quantity < 1) {
          const error = new Error(
            "Invalid product quantity in this order."
          );
          error.statusCode = 400;
          throw error;
        }

        productQuantities.set(
          productId,
          (productQuantities.get(productId) || 0) + quantity
        );
      }

      // Restore stock and save cancellation history.
      for (const [productId, totalQuantity] of productQuantities) {
        const updatedProduct = await Product.findByIdAndUpdate(
          productId,
          {
            $inc: { stock: totalQuantity },
          },
          {
            returnDocument: "after",
            session,
          }
        );

        if (!updatedProduct) {
          const error = new Error(
            "A product from this order was not found. Stock restoration failed."
          );
          error.statusCode = 400;
          throw error;
        }

        await StockHistory.create(
          [
            {
              productId: updatedProduct._id,
              productName: updatedProduct.name,
              action: "CANCELLATION",
              quantity: totalQuantity,
              previousStock: updatedProduct.stock - totalQuantity,
              newStock: updatedProduct.stock,
              reason: "Order cancelled - stock restored",
            },
          ],
          { session }
        );
      }

      // Cancel order after restoring stock.
      order.orderStatus = "Cancelled";

      cancelledOrder = await order.save({ session });
    });

    res.status(200).json({
      message: "Order Cancelled Successfully! Product stock restored.",
      order: cancelledOrder,
    });
  } catch (error) {
    console.error("Cancel Order Error:", error);

    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
});

// ==========================================
// PLACE NEW ORDER + PAYMENT + STOCK HISTORY
// ==========================================

router.post("/", authMiddleware, async (req, res) => {
  let session;

  try {
    session = await mongoose.startSession();

    let savedOrder;

    await session.withTransaction(async () => {
      const user = await User.findById(req.user.id).session(session);

      if (!user) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
      }

      const {
        customerName,
        mobile,
        address,
        city,
        state,
        pincode,
        items,
        couponCode,
        paymentMethod = "COD",
        paymentToken,
      } = req.body;

      // Validate Delivery Details
      if (
        !customerName ||
        !mobile ||
        !address ||
        !city ||
        !state ||
        !pincode
      ) {
        const error = new Error(
          "Please provide all delivery details."
        );
        error.statusCode = 400;
        throw error;
      }

      if (!Array.isArray(items) || items.length === 0) {
        const error = new Error(
          "Your order must contain at least one product."
        );
        error.statusCode = 400;
        throw error;
      }

      // Validate Payment Method
      const allowedPaymentMethods = [
        "UPI",
        "Card",
        "Net Banking",
        "COD",
      ];

      if (!allowedPaymentMethods.includes(paymentMethod)) {
        const error = new Error("Invalid payment method.");
        error.statusCode = 400;
        throw error;
      }

      // Verify Products and Calculate Subtotal
      let subtotal = 0;
      const verifiedItems = [];
      const productQuantities = new Map();
      const productDetails = new Map();

      for (const item of items) {
        if (
          !item.productId ||
          !Number.isInteger(Number(item.quantity)) ||
          Number(item.quantity) < 1 ||
          !item.size
        ) {
          const error = new Error("Invalid product details.");
          error.statusCode = 400;
          throw error;
        }

        if (!mongoose.Types.ObjectId.isValid(item.productId)) {
          const error = new Error("Invalid Product ID.");
          error.statusCode = 400;
          throw error;
        }

        const productId = String(item.productId);

        const product = await Product.findById(productId).session(
          session
        );

        if (!product) {
          const error = new Error(
            "One of the selected products was not found."
          );
          error.statusCode = 400;
          throw error;
        }

        if (
          product.sizes.length > 0 &&
          !product.sizes.includes(item.size)
        ) {
          const error = new Error(
            `Invalid size for ${product.name}.`
          );
          error.statusCode = 400;
          throw error;
        }

        const quantity = Number(item.quantity);

        productQuantities.set(
          productId,
          (productQuantities.get(productId) || 0) + quantity
        );

        productDetails.set(productId, product);

        subtotal += product.price * quantity;

        verifiedItems.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity,
          size: item.size,
          image: product.image,
        });
      }

      // Validate Available Stock
      for (const [productId, totalQuantity] of productQuantities) {
        const product = productDetails.get(productId);

        if (product.stock < totalQuantity) {
          const error = new Error(
            `${product.name} is out of stock or has insufficient stock.`
          );
          error.statusCode = 400;
          throw error;
        }
      }

      // Validate Coupon
      const normalizedCoupon = couponCode
        ? String(couponCode).trim().toUpperCase()
        : "";

      let discountAmount = 0;

      if (normalizedCoupon) {
        const selectedCoupon = coupons[normalizedCoupon];

        if (!selectedCoupon) {
          const error = new Error("Invalid coupon code.");
          error.statusCode = 400;
          throw error;
        }

        let eligibleAmount = 0;

        if (selectedCoupon.category === "All") {
          eligibleAmount = subtotal;
        } else {
          for (const [productId, totalQuantity] of productQuantities) {
            const product = productDetails.get(productId);

            if (product.category === selectedCoupon.category) {
              eligibleAmount += product.price * totalQuantity;
            }
          }
        }

        if (eligibleAmount === 0) {
          const error = new Error(
            `This coupon is valid only for ${selectedCoupon.category} products.`
          );
          error.statusCode = 400;
          throw error;
        }

        discountAmount = Math.round(
          (eligibleAmount * selectedCoupon.discount) / 100
        );
      }

      const totalAmount = Math.max(
        0,
        subtotal - discountAmount
      );

      // Verify Online Demo Payment Token
      let paymentStatus = "Pending";
      let transactionId = "";

      if (paymentMethod !== "COD") {
        if (!paymentToken) {
          const error = new Error(
            "Successful demo payment is required before placing this order."
          );
          error.statusCode = 400;
          throw error;
        }

        let decodedPayment;

        try {
          decodedPayment = jwt.verify(
            paymentToken,
            process.env.JWT_SECRET
          );
        } catch (tokenError) {
          const error = new Error(
            "Payment verification failed or payment token expired. Please try payment again."
          );
          error.statusCode = 400;
          throw error;
        }

        if (
          String(decodedPayment.userId) !== String(req.user.id) ||
          decodedPayment.paymentMethod !== paymentMethod ||
          Number(decodedPayment.amount) !== totalAmount ||
          !decodedPayment.transactionId
        ) {
          const error = new Error(
            "Payment details do not match this order."
          );
          error.statusCode = 400;
          throw error;
        }

        paymentStatus = "Success";
        transactionId = decodedPayment.transactionId;
      } else {
        // COD orders do not require online payment.
        paymentStatus = "Pending";
        transactionId = "";
      }

      // Reduce Product Stock and save order history.
      for (const [productId, totalQuantity] of productQuantities) {
        const updatedProduct = await Product.findOneAndUpdate(
          {
            _id: productId,
            stock: { $gte: totalQuantity },
          },
          {
            $inc: { stock: -totalQuantity },
          },
          {
            returnDocument: "after",
            session,
          }
        );

        if (!updatedProduct) {
          const error = new Error(
            "Product stock changed or is insufficient. Please try again."
          );
          error.statusCode = 400;
          throw error;
        }

        await StockHistory.create(
          [
            {
              productId: updatedProduct._id,
              productName: updatedProduct.name,
              action: "ORDER",
              quantity: totalQuantity,
              previousStock: updatedProduct.stock + totalQuantity,
              newStock: updatedProduct.stock,
              reason: "Stock reduced for order placement",
            },
          ],
          { session }
        );
      }

      // Create Order
      const order = new Order({
        customerName,
        email: user.email,
        mobile,
        address,
        city,
        state,
        pincode,
        items: verifiedItems,
        couponCode: normalizedCoupon,
        discountAmount,
        totalAmount,
        paymentMethod,
        paymentStatus,
        transactionId,
      });

      const orders = await Order.create(
        [order],
        { session }
      );

      savedOrder = orders[0];
    });

    res.status(201).json({
      message: "Order Placed Successfully!",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Place Order Error:", error);

    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
});

module.exports = router;
