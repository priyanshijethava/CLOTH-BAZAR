const jwt = require("jsonwebtoken");

// Allowed Payment Methods
const allowedMethods = ["UPI", "Card", "Net Banking"];

// Demo Payment Controller
const processDemoPayment = async (req, res) => {
  try {
    const { paymentMethod, demoResult, amount } = req.body;

    // Validate Payment Method
    if (!allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({
        message: "Invalid payment method.",
      });
    }

    // Validate Amount
    if (
      typeof amount !== "number" ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return res.status(400).json({
        message: "Invalid payment amount.",
      });
    }

    // Validate Demo Result
    if (!["Success", "Failed"].includes(demoResult)) {
      return res.status(400).json({
        message: "Invalid demo payment result.",
      });
    }

    // Demo Payment Failed
    if (demoResult === "Failed") {
      return res.status(200).json({
        success: false,
        paymentStatus: "Failed",
        message: "Demo payment failed. Please try again.",
      });
    }

    // Generate Dummy Transaction ID
    const transactionId =
      "CBDEMO" + Date.now() + Math.floor(Math.random() * 1000);

    // Create a short-lived verified demo payment token
    const paymentToken = jwt.sign(
      {
        userId: req.user.id,
        paymentMethod,
        amount,
        transactionId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    return res.status(200).json({
      success: true,
      paymentStatus: "Success",
      paymentMethod,
      transactionId,
      paymentToken,
      message: "Demo payment successful!",
    });
  } catch (error) {
    console.error("Demo Payment Error:", error);

    return res.status(500).json({
      message: "Demo payment processing failed.",
    });
  }
};

module.exports = processDemoPayment;

