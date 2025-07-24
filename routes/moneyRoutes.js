const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');
const { createDonation, getAllDonations, updateDonationStatus } = require('../controllers/moneyDonationController');

// 🧑 Donor creates donation
router.post('/donate', verifyToken, verifyRole(['donor']), createDonation);

// 🧑‍💼 Admin views all donations
router.get('/all', verifyToken, verifyRole(['admin']), getAllDonations);

// 🧑‍💼 Admin updates status of a donation
router.put(
    '/status/:id',
    verifyToken,
    verifyRole(['admin']),
    updateDonationStatus
  );
  

module.exports = router;
