const User = require('../models/User');
const fs = require('fs');
const path = require('path');


exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Convert to object so we can modify
    const userObj = user.toObject();

    // Fix: Only prepend host if it's a relative path, not an external URL
    if (userObj.profilePic && !userObj.profilePic.startsWith("http")) {
      userObj.profilePic = `${req.protocol}://${req.get("host")}${userObj.profilePic}`;
    }

    res.json(userObj);
  } catch (err) {
    console.error("getMyProfile Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

  
  

  exports.updateMyProfile = async (req, res) => {
    try {
      const { name, phone, address,  } = req.body;
  
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: { name, phone, address } },
        { new: true }
      ).select('-password');
  
      res.json({ message: 'Profile updated', user });
    } catch (err) {
      console.error('updateMyProfile Error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  // ✅ Add this below your existing exports
exports.uploadProfilePhoto = async (req, res) => {
  try {
    // multer-storage-cloudinary puts the uploaded file info in req.file
    const imageUrl = req.file?.path; // ✅ This is the Cloudinary secure URL

    if (!imageUrl) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePic: imageUrl },
      { new: true }
    ).select('-password');

    res.json({ message: 'Profile photo updated', profilePic: user.profilePic });
  } catch (err) {
    console.error('uploadProfilePhoto Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

  
 exports.removeProfilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.profilePic) {
      // just remove URL from DB
      user.profilePic = '';
      await user.save();
    }

    res.json({ message: 'Profile picture removed' });
  } catch (err) {
    console.error('removeProfilePhoto Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

  