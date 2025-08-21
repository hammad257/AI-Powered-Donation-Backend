const mongoose = require('mongoose');

const dropoffSchema = new mongoose.Schema(
  {
    ngoName: {
      type: String,
      required: true,
    },
    locationName: {
      type: String,
      required: true,
    },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin user
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Dropoff', dropoffSchema);
