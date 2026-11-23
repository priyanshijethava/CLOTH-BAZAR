
const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const Product = require("../models/Product");
const StockHistory = require("../models/StockHistory");
const adminMiddleware = require("../middleware/adminMiddleware");

// Get All Products (Public)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Stock History (Admin Only)
router.get("/stock/history", adminMiddleware, async (req, res) => {
  try {
    const history = await StockHistory.find()
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Stock (Admin Only)
router.patch("/:id/stock", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, quantity, reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Product ID" });
    }

    if (
      !["INCREASE", "DECREASE"].includes(action) ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return res.status(400).json({
        message: "Valid action and positive quantity are required",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product Not Found" });
    }

    const previousStock = product.stock ?? 0;

    const newStock =
      action === "INCREASE"
        ? previousStock + quantity
        : previousStock - quantity;

    if (newStock < 0) {
      return res.status(400).json({
        message: "Insufficient stock. Stock cannot be negative.",
      });
    }

    product.stock = newStock;
    await product.save();

    const history = await StockHistory.create({
      productId: product._id,
      productName: product.name,
      action,
      quantity,
      previousStock,
      newStock,
      reason: reason || "",
    });

    res.status(200).json({
      message: "Stock Updated Successfully!",
      product,
      history,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Single Product (Public)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Product ID" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product Not Found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add New Product (Admin Only)
router.post("/", adminMiddleware, async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();

    res.status(201).json({
      message: "Product Added Successfully!",
      product: savedProduct,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update Product (Admin Only)
router.put("/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Product ID" });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      req.body,
      { returnDocument: "after", runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product Not Found" });
    }

    res.status(200).json({
      message: "Product Updated Successfully!",
      product,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete Product (Admin Only)
router.delete("/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Product ID" });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "Product Not Found" });
    }

    res.status(200).json({
      message: "Product Deleted Successfully!",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
