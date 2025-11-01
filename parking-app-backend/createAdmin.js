// createAdmin.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/user'); // adjust path if needed

dotenv.config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    // Remove any existing admin with that email (optional)
    await User.deleteOne({ email: 'admin@example.com' });

    // Create admin — pass plaintext password so model's pre-save hook hashes it exactly once
    const admin = new User({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin123', // plaintext: model will hash it once
      isAdmin: true         // use isAdmin if your schema uses this boolean
      // OR if your schema uses role string, use role: 'admin'
    });

    await admin.save();
    console.log('✅ Admin created:', admin.email);
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createAdmin();
