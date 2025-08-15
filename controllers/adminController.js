const NeedyPerson = require('../models/needyPerson');
const FoodDonation = require('../models/foodDonation');
const User = require('../models/User');

// 🧾 View all needy applicants (with optional status filter)
exports.getAllNeedy = async (req, res) => {
  try {
    const { status } = req.query;

    let filter = {};
    if (status === 'pending') filter = { verified: false, rejected: false };
    if (status === 'approved') filter = { verified: true };
    if (status === 'rejected') filter = { rejected: true };

    const people = await NeedyPerson.find(filter).populate('submittedBy', 'name email role');

    const enhancedPeople = people.map(person => ({
      ...person.toObject(),
      documents: person.documents.map(doc => `${req.protocol}://${req.get('host')}/uploads/${doc}`)
    }));

    res.json(enhancedPeople);
  } catch (err) {
    console.error('🔥 getAllNeedy Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Flexible status update (approve or reject)
exports.updateNeedyStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const allowedStatuses = ['pending', 'under_review', 'approved', 'rejected'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const person = await NeedyPerson.findById(req.params.id);
    if (!person) return res.status(404).json({ message: 'Needy person not found' });

    person.status = status;
    person.adminNotes = adminNotes || '';
    await person.save();

    res.json({ message: `Needy person marked as ${status}`, person });
  } catch (err) {
    console.error('🔥 updateNeedyStatus Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🟢 Get all delivered food donations with volunteer and donor info
exports.getDeliveredFoodDonations = async (req, res) => {
  try {
    const donations = await FoodDonation.find({ status: 'delivered' })
      .populate('donor', 'name email')
      .populate('pickedBy', 'name email');

    res.json(donations);
  } catch (err) {
    console.error('getDeliveredFoodDonations Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 📊 Admin Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Total users by role
    const totalUsers = await User.countDocuments();
    const totalVolunteers = await User.countDocuments({ role: 'volunteer' });
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const totalNeedy = await User.countDocuments({ role: 'needy' });

    // 2. Donations & Delivered Orders
    const totalDonations = await FoodDonation.countDocuments();
    const deliveredOrders = await FoodDonation.countDocuments({ status: 'delivered' });

    res.json({
      users: {
        total: totalUsers,
        volunteers: totalVolunteers,
        donors: totalDonors,
        needy: totalNeedy,
      },
      donations: {
        total: totalDonations,
        delivered: deliveredOrders,
      },
    });
  } catch (err) {
    console.error("🔥 getDashboardStats Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 📈 Graph Data - Daily Deliveries & Donations
exports.getGraphData = async (req, res) => {
  try {
    const dailyDonations = await FoodDonation.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          total: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    const dailyDeliveries = await FoodDonation.aggregate([
      { $match: { status: "delivered" } },
      {
        $group: {
          _id: {
            year: { $year: "$updatedAt" },
            month: { $month: "$updatedAt" },
            day: { $dayOfMonth: "$updatedAt" },
          },
          total: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    res.json({ dailyDonations, dailyDeliveries });
  } catch (err) {
    console.error("🔥 getGraphData Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 📌 Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // exclude password
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 Block user
exports.blockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'blocked' },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User blocked', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 Unblock user
exports.unblockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'active' },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User unblocked', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};