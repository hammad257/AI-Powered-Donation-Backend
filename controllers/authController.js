const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const sendEmail = require('../utils/sendMail');

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

    if (user.status === 'blocked') {
      return res.status(200).json({ message: 'Your account is blocked. Contact admin.' });
    }

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

// ✅ Updated Social Login with Role Check
exports.socialLogin = async (req, res) => {
  try {
    const { name, email, picture, role } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user
    let user = await User.findOne({ email });

    if (!user) {
      // New user must provide role
      if (!role) {
        return res.status(400).json({ message: 'Role is required for new users' });
      }

      user = new User({
        name,
        email,
        profilePic: picture,
        password: null, // Google user
        role,
      });
      await user.save();
    } else {
      // ✅ Check role mismatch
      if (user.role !== role) {
        return res.status(200).json({
          message: `You are already registered as ${user.role}. Please use another Google account to register as ${role}.`
        });
      }
    }

    // ✅ Always include role in JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        phone: user.phone,
        address: user.address,
      }
    });
  } catch (err) {
    console.error('Social Login Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = user.generatePasswordReset();
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password/${resetToken}`;
    const message = `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
    `;

    await sendEmail(user.email, "Password Reset", "Reset your password", message);

    res.json({ message: "Password reset link sent to email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    console.log(req.body);
    

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old and new passwords are required" });
    }

    const userId = req.user.id; // coming from verifyToken middleware
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    // 🔑 Check if old password matches
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // 🔑 Hash and set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// controllers/userController.js
exports.updateVisibility = async (req, res) => {
  try {
    const { emailVisible, phoneVisible } = req.body;
    const userId = req.user.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { emailVisible, phoneVisible },
      { new: true }
    ).select("-password"); // exclude password

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Visibility updated", user });
  } catch (err) {
    console.error("Visibility Update Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
