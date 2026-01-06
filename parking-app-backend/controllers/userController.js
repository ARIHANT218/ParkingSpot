// controllers/userController.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');


// Generate JWT including role
const generateToken = (id, role) => jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1d' });

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, adminCode } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // Check if admin code is provided and matches "arihantcode"
    const ADMIN_CODE = 'arihantcode';
    const isAdmin = adminCode && adminCode.trim().toLowerCase() === ADMIN_CODE.toLowerCase();

    // Create user with admin status based on code
    const user = await User.create({ 
      name, 
      email, 
      password, 
      isAdmin: isAdmin 
    });

    const userRole = user.isAdmin ? 'admin' : 'user';
    const token = generateToken(user._id, userRole);

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
      role: userRole,
      message: isAdmin ? 'Admin account created successfully' : 'User account created successfully'
    });
  } catch (error) {
    console.error('registerUser error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    const role = user.isAdmin ? 'admin' : 'user';
    const token = generateToken(user._id, role);

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
      role
    });
  } catch (error) {
    console.error('loginUser error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
