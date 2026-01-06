// controllers/userController.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');


// Generate JWT including role
const generateToken = (id, role) => jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1d' });

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // Only allow 'user' role for registration (admin must be set manually)
    // Ignore any other role values from frontend for security
    const user = await User.create({ name, email, password, isAdmin: false });

    const userRole = user.isAdmin ? 'admin' : 'user';
    const token = generateToken(user._id, userRole);

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
      role: userRole
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
