const FoodDonation = require('../models/foodDonation');

// 🔍 Get all unassigned food donations (status: 'pending')
exports.getAvailableDonations = async (req, res) => {
  try {
    const donations = await FoodDonation.find({
      status: { $in: ['pending', 'picked'] } // show pending + picked for current volunteer
    })
      .populate('donor', 'name email')
      .lean();

    // Add custom flag for frontend whether current volunteer accepted this donation
    const result = donations.map((donation) => {
      return {
        ...donation,
        isAcceptedByCurrentUser:
          donation.pickedBy && donation.pickedBy.toString() === req.user.id,
      };
    });

    res.json(result);
  } catch (err) {
    console.error('getAvailableDonations Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// 📦 Get pickups accepted by the current volunteer
exports.getMyPickups = async (req, res) => {
  try {
    const myPickups = await FoodDonation.find({ pickedBy: req.user.id })
      .populate('donor', 'name email')
      .sort({ updatedAt: -1 }); // Optional: sort latest first

    res.json(myPickups);
  } catch (err) {
    console.error('getMyPickups Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// ✅ Volunteer accepts a donation
exports.acceptDonation = async (req, res) => {
  try {
    const donation = await FoodDonation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });

    if (donation.status !== 'pending') {
      return res.status(400).json({ message: 'Donation already picked or delivered' });
    }

    donation.status = 'picked';
    donation.pickedBy = req.user.id;
    await donation.save();

    res.json({ message: 'Donation accepted', donation });
  } catch (err) {
    console.error('acceptDonation Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Volunteer marks donation as delivered
exports.markAsDelivered = async (req, res) => {
  try {
    const donation = await FoodDonation.findById(req.params.id);

    if (!donation) return res.status(404).json({ message: 'Donation not found' });

    // Only assigned volunteer can mark it as delivered
    if (donation.pickedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    donation.status = 'delivered';
    donation.deliveryTime = new Date();
    const durationMs = donation.deliveryTime - donation.updatedAt; // assuming `updatedAt` is pickup time
    donation.deliveryDuration = Math.round(durationMs / (1000 * 60)); // in minutes
    await donation.save();

    res.json({ message: 'Donation marked as delivered' });
  } catch (err) {
    console.error('markAsDelivered Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyDeliveries = async (req, res) => {
  try {
    const deliveries = await FoodDonation.find({
      pickedBy: req.user.id,
      status: 'delivered',
    }).populate('donor', 'name email');

    res.json(deliveries);
  } catch (err) {
    console.error('getMyDeliveries Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /volunteer/food/cancel-accept/:id
exports.cancelAcceptDonation = async (req, res) => {
  try {
    const donation = await FoodDonation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });

    // Only the volunteer who accepted can cancel
    if (!donation.pickedBy || donation.pickedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this pickup' });
    }

    // Reset status and pickedBy
    donation.status = 'pending';
    donation.pickedBy = null;
    await donation.save();

    res.json({ message: 'Pickup acceptance canceled', donation });
  } catch (err) {
    console.error('cancelAcceptDonation Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
