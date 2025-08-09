const express = require('express');
const router = express.Router();

const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');
const {
  getAvailableDonations,
  acceptDonation,
  markAsDelivered,
  getMyPickups,
  getMyDeliveries,
  cancelAcceptDonation
} = require('../controllers//volunteerController');

router.use(verifyToken, verifyRole(['volunteer']));

// 🔍 View available food donations
router.get('/food/available', getAvailableDonations);

// ✅ Accept a food donation
router.post('/food/accept/:id', acceptDonation);

// ✅ Mark food donation as delivered
router.post('/food/delivered/:id', markAsDelivered);

// 🆕 My pickups
router.get('/food/my-pickups', getMyPickups);

router.get('/volunteer/my-deliveries',getMyDeliveries);

router.post('/food/cancel-accept/:id', cancelAcceptDonation);


module.exports = router;