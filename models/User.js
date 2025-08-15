const mongoose = require('mongoose');

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
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
