const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // const adminExists = await User.findOne({ role: "admin" });
    // if (adminExists) {
    //   console.log("Admin already exists!");
    //   return process.exit();
    // }

    await User.create({
      name: "Super Admin",
      email: "Superadmin@gmail.com",
      password: "Admin@123", // hash will run inside model
      role: "admin"
    });

    console.log("Admin created successfully!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit();
  }
}

createAdmin();
