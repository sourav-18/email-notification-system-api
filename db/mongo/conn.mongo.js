const envUtil=require("../../utils/env.util");

const mongoose = require("mongoose");

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(envUtil.MONGODB_URL, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

module.exports = connectDB;
