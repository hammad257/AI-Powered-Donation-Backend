const mongoose = require('mongoose');
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ['admin', 'volunteer', 'donor', 'needy'],
    default: 'donor'
  },
  profilePic: {
    type: String,
    default: ''
  },
  phone:{type: String, default:''},
  address:{type: String, default:''},
  status: { 
    type: String, 
    enum: ['active', 'blocked'], 
    default: 'active' 
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, { timestamps: true });

userSchema.methods.generatePasswordReset = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = resetToken;
  this.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
