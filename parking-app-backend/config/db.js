// config/db.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: './.env' });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
  }
};

module.exports = connectDB;
