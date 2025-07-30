const mongoose = require('mongoose');

const foodDonationSchema = new mongoose.Schema(
  {
    foodType: {
      type: String,
      required: true
    },
    quantity: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    lat: { type: Number, required: true },      // new
    lng: { type: Number, required: true },      // new
    status: {
      type: String,
      enum: ['pending', 'picked', 'delivered'],
      default: 'pending'
    },
    volunteer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    pickedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deliveryDuration: {
      type: Number, // in minutes
    },
    deliveryTime: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model('FoodDonation', foodDonationSchema);
