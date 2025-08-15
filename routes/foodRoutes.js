const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');
const {
  createFoodDonation,
  getPendingFood,
  acceptFoodDonation,
  markAsDelivered,
  getMyFoodDonations,
  updateFoodDonation,
  deleteFoodDonation
} = require('../controllers/foodDonationController');
const foodDonation = require('../models/foodDonation');
const upload = require('../middlewares/uploadMiddleware');

// ✅ Admin views all food donations
router.get('/all', verifyToken, verifyRole(['admin']), async (req, res) => {
  try {
    const donations = await foodDonation.find()
      .populate('donor', 'name email')
      .populate('volunteer', 'name email');

    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 1. Donor adds food
router.post('/donate', verifyToken, verifyRole(['donor']), upload.single('image'), createFoodDonation);

// 2. Volunteer gets pending food donations
router.get('/pending', verifyToken, verifyRole(['volunteer']), getPendingFood);

// 3. Volunteer accepts food pickup
router.put('/accept/:id', verifyToken, verifyRole(['volunteer']), acceptFoodDonation);

// 4. Mark donation as delivered
router.put('/delivered/:id', verifyToken, verifyRole(['volunteer', 'admin']), markAsDelivered);

router.get('/donor/my-donations', verifyToken, verifyRole(['donor']), getMyFoodDonations);

router.put('/:id', verifyToken, verifyRole(['donor']),upload.single('image'), updateFoodDonation);

// Delete donation
router.delete('/:id', verifyToken, verifyRole(['donor']), deleteFoodDonation);

module.exports = router;
