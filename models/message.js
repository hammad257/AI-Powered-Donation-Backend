// models/message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true }, // FoodDonation ID
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
