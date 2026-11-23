
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");

// Register User
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      mobile,
    });

    const savedUser = await user.save();

    res.status(201).json({
      message: "Registration Successful",
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login User
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Logged-in User
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Cart and Wishlist
router.get("/shop-data", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "cart wishlist"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      cart: user.cart || [],
      wishlist: user.wishlist || [],
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Save Cart and Wishlist
router.put("/shop-data", authMiddleware, async (req, res) => {
  try {
    const { cart, wishlist } = req.body;

    if (!Array.isArray(cart) || !Array.isArray(wishlist)) {
      return res.status(400).json({
        message: "Cart and Wishlist must be arrays",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          cart,
          wishlist,
        },
      },
      { returnDocument: "after", runValidators: true }
    ).select("cart wishlist");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Cart and Wishlist Saved Successfully",
      cart: user.cart,
      wishlist: user.wishlist,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Update Cart Only
router.patch("/shop-data/cart", authMiddleware, async (req, res) => {
  try {
    const { cart } = req.body;

    if (!Array.isArray(cart)) {
      return res.status(400).json({
        message: "Cart must be an array",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { cart } },
      { returnDocument: "after", runValidators: true }
    ).select("cart");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Cart Saved Successfully",
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Update Wishlist Only
router.patch("/shop-data/wishlist", authMiddleware, async (req, res) => {
  try {
    const { wishlist } = req.body;

    if (!Array.isArray(wishlist)) {
      return res.status(400).json({
        message: "Wishlist must be an array",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { wishlist } },
      { returnDocument: "after", runValidators: true }
    ).select("wishlist");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Wishlist Saved Successfully",
      wishlist: user.wishlist,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        message: "Email and new password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: "Password Reset Successful",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
