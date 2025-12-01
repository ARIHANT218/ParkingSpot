// controllers/userController.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const dotenv = require('dotenv');
dotenv.config();


// Generate JWT including role
const generateToken = (id, role) => jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1d' });
const ADMIN_CODE = process.env.ADMIN_CODE || 'set_this_secret';
const MANAGER_CODE = process.env.MANAGER_CODE || 'manager_code';

exports.registerUser = async (req, res) => {
  try {
   const { name, email, password, role, managerCode, adminCode } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    let chosenRole = 'user';
    if (role === 'manager') {
      
      if (managerCode !== MANAGER_CODE) return res.status(403).json({ message: 'Invalid manager code' });
      chosenRole = 'manager';
    } else if (role === 'admin') {
      
      if (adminCode !== ADMIN_CODE) return res.status(403).json({ message: 'Invalid admin code' });
      chosenRole = 'admin';
    } else {
      chosenRole = 'user';
    }
    const user = await User.create({ name, email, password, role: chosenRole });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '12h' });
    
    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
      role : user.role
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
     const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '12h' });

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
      role : user.role
    });
  } catch (error) {
    console.error('loginUser error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
