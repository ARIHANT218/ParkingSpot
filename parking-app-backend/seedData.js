const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/user'); // or Admin model

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      name: 'Admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'admin',
    });
    
    await admin.save();
    console.log('✅ Admin created successfully');
    mongoose.connection.close();
  })
  .catch(err => console.error(err));
