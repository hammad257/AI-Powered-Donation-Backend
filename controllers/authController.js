const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.registerUser = async (req, res) => {
  
  try {
    const { name, email, password, role, phone, address } = req.body;

     if(!name || !email || !password || !role){
      return res.status(400).json({ message: 'All required fields are missing' });
     }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role, phone, address });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, phone:user.phone, address: user.address },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.socialLogin = async (req, res) => {
  try {
    const { name, email, picture } = req.body;

    if (!email) return res.status(400).json({ message: 'Email is required' });

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user
      user = new User({
        name,
        email,
        profilePic: picture,
        password: null, // no password since it's OAuth
        role: 'donor',  // default role or dynamic
      });
      await user.save();
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({ token, user });
  } catch (err) {
    console.error('Social Login Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};