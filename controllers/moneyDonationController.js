const MoneyDonation = require('../models/moneryDonation');

// ➕ Create donation
exports.createDonation = async (req, res) => {
  try {
    const { amount, purpose } = req.body;

    const donation = new MoneyDonation({
      amount,
      purpose,
      donatedBy: req.user.id,
    });

    await donation.save();
    res.status(201).json({ message: 'Donation submitted successfully', donation });
  } catch (err) {
    console.error('💸 Create Donation Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 👀 Get donations by status
exports.getAllDonations = async (req, res) => {
    try {
      const { status } = req.query;
  
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid or missing status query' });
      }
  
      const donations = await MoneyDonation.find({ status })
        .populate('donatedBy', 'name email');
      
      res.json(donations);
    } catch (err) {
      console.error('🔎 Get Donations by Status Error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };
  

// 🧑‍💼 Admin approves or rejects donation
exports.updateDonationStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
  
      // Only allow 'approved' or 'rejected'
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }
  
      const donation = await MoneyDonation.findById(id);
      if (!donation) {
        return res.status(404).json({ message: 'Donation not found' });
      }
  
      donation.status = status;
      await donation.save();
  
      res.json({ message: `Donation ${status} successfully`, donation });
    } catch (err) {
      console.error('🔁 Update Status Error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
// ✏️ Donor updates their own donation
exports.editDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, purpose } = req.body;

    // Find the donation
    const donation = await MoneyDonation.findById(id);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Check if current user is the donor
    if (donation.donatedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this donation' });
    }

    // Allow edit only if donation is still pending
    if (donation.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot edit donation after approval/rejection' });
    }

    // Update fields
    donation.amount = amount || donation.amount;
    donation.purpose = purpose || donation.purpose;

    await donation.save();

    res.json({ message: 'Donation updated successfully', donation });
  } catch (err) {
    console.error('✏️ Edit Donation Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
