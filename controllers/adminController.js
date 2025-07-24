const NeedyPerson = require('../models/needyPerson');
const FoodDonation = require('../models/foodDonation');

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