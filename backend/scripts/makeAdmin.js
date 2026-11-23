
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected Successfully!");

    
    const email = "admin@gmail.com";

    const user = await User.findOneAndUpdate(
      { email: email.trim().toLowerCase() },
      { $set: { role: "admin" } },
      { returnDocument: "after" }
    );

    if (!user) {
      console.log("User not found. Please check the email.");
      return;
    }

    console.log("Admin role assigned successfully!");
    console.log("Admin Email:", user.email);
    console.log("Admin Role:", user.role);
  } catch (error) {
    console.log("Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

makeAdmin();
