const Dropoff = require('../models/Dropoff');

// Admin creates a dropoff
exports.createDropoff = async (req, res) => {
  try {
    const { ngoName, locationName, coordinates } = req.body;

    if (!ngoName || !locationName || !coordinates?.lat || !coordinates?.lng) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newDropoff = new Dropoff({
      ngoName,
      locationName,
      coordinates,
      createdBy: req.user?.id,
    });

    await newDropoff.save();
    res.status(201).json(newDropoff);
  } catch (error) {
    res.status(500).json({ message: "Failed to create dropoff", error: error.message });
  }
};

// Get all dropoffs (for volunteer or admin)
// Get all dropoffs (with stats for admin/volunteer)
exports.getDropoffs = async (req, res) => {
  try {
    // Fetch all dropoffs, newest first
    const dropoffs = await Dropoff.find().sort({ createdAt: -1 });

    // Total count
    const totalCount = await Dropoff.countDocuments();

    // Recent count (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentCount = await Dropoff.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    res.json({
      total: totalCount,
      recent: recentCount,
      dropoffs, // list for volunteers
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch dropoffs", error: error.message });
  }
};

