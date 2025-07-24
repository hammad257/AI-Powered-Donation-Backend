const FoodDonation = require('../models/foodDonation');

// 1. 👨‍🍳 Donor creates a food donation
exports.createFoodDonation = async (req, res) => {
  try {
    const { foodType, quantity, location } = req.body;

    if (!foodType || !quantity || !location) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const donation = new FoodDonation({
      foodType,
      quantity,
      location,
      donor: req.user.id
    });

    await donation.save();
    res.status(201).json({ message: 'Food donation submitted successfully', donation });
  } catch (err) {
    console.error('🍱 createFoodDonation Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 2. 👷 Volunteer gets all pending food donations
exports.getPendingFood = async (req, res) => {
  try {
    const donations = await FoodDonation.find({ status: 'pending' })
      .populate('donor', 'name email');

    res.json(donations);
  } catch (err) {
    console.error('🍱 getPendingFood Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 3. 🚚 Volunteer accepts a food donation
exports.acceptFoodDonation = async (req, res) => {
  try {
    const donation = await FoodDonation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.status !== 'pending') {
      return res.status(400).json({ message: 'Donation already accepted or delivered' });
    }

    donation.status = 'accepted';
    donation.volunteer = req.user.id;

    await donation.save();
    res.json({ message: 'Donation accepted', donation });
  } catch (err) {
    console.error('🍱 acceptFoodDonation Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 4. ✅ Volunteer or Admin marks as delivered
exports.markAsDelivered = async (req, res) => {
  try {
    const donation = await FoodDonation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.status !== 'accepted') {
      return res.status(400).json({ message: 'Only accepted donations can be delivered' });
    }

    donation.status = 'delivered';
    await donation.save();

    res.json({ message: 'Donation marked as delivered', donation });
  } catch (err) {
    console.error('🍱 markAsDelivered Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 5. 👨‍🍳 Donor views their own food donations (with volunteer info)
exports.getMyFoodDonations = async (req, res) => {
  try {
    const donations = await FoodDonation.find({ donor: req.user.id })
      .populate('volunteer', 'name email');

    res.json(donations);
  } catch (err) {
    console.error('🍱 getMyFoodDonations Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
