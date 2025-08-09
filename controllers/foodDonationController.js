const FoodDonation = require('../models/foodDonation');

// 1. 👨‍🍳 Donor creates a food donation
exports.createFoodDonation = async (req, res) => {
  try {
    const { foodType,foodDescription, quantity, location, lat, lng } = req.body;

    if (!foodType || !foodDescription || !quantity || !location || lat === undefined || lng === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const donation = new FoodDonation({
      foodType,
      foodDescription,
      quantity,
      location,
      lat,
      lng,
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

// 6. ✏️ Donor edits a food donation
exports.updateFoodDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const { foodType,foodDescription, quantity, location, lat, lng } = req.body;

    const donation = await FoodDonation.findById(id);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Ensure the logged-in user is the donor
    if (donation.donor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not allowed to edit this donation' });
    }

    // Allow edit only if status is still pending
    if (donation.status !== 'pending') {
      return res.status(400).json({ message: 'You can only edit pending donations' });
    }

    // Update fields
    if (foodType) donation.foodType = foodType;
    if (foodDescription) donation.foodDescription = foodDescription;
    if (quantity) donation.quantity = quantity;
    if (location) donation.location = location;
    if (lat !== undefined) donation.lat = lat;
    if (lng !== undefined) donation.lng = lng;

    await donation.save();

    res.json({ message: 'Donation updated successfully', donation });
  } catch (err) {
    console.error('🍱 updateFoodDonation Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🗑 Donor deletes a food donation
exports.deleteFoodDonation = async (req, res) => {
  try {
    const { id } = req.params;

    const donation = await FoodDonation.findById(id);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.donor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not allowed to delete this donation' });
    }

    if (donation.status !== 'pending') {
      return res.status(400).json({ message: 'You can only delete pending donations' });
    }

    // ✅ Updated for Mongoose 7+
    await donation.deleteOne();

    res.json({ message: 'Donation deleted successfully' });
  } catch (err) {
    console.error('🍱 deleteFoodDonation Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

