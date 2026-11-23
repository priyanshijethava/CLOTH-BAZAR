
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Contact = require("../models/Contact");
const adminMiddleware = require("../middleware/adminMiddleware");

// CUSTOMER: Submit Contact Message
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    const newContact = new Contact({
      name,
      email,
      subject,
      message,
    });

    await newContact.save();

    res.status(201).json({
      message: "Your message has been submitted successfully!",
      contact: newContact,
    });
  } catch (error) {
    console.log("Contact Form Error:", error);

    res.status(500).json({
      message: "Failed to submit your message",
    });
  }
});

// ADMIN: Get All Contact Messages
router.get("/admin/all", adminMiddleware, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({
      createdAt: -1,
    });

    res.status(200).json(contacts);
  } catch (error) {
    console.log("Fetch Contact Messages Error:", error);

    res.status(500).json({
      message: "Failed to fetch contact messages",
    });
  }
});

// ADMIN: Delete Contact Message
router.delete("/admin/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid message ID",
      });
    }

    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({
        message: "Contact message not found",
      });
    }

    res.status(200).json({
      message: "Contact message deleted successfully!",
    });
  } catch (error) {
    console.log("Delete Contact Message Error:", error);

    res.status(500).json({
      message: "Failed to delete contact message",
    });
  }
});

module.exports = router;
