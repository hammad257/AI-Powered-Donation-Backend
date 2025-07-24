const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');
const { getAllNeedy, updateNeedyStatus, getDeliveredFoodDonations } = require('../controllers/adminController');

// 🧾 Admin views needy people (with filter)
router.get('/needy', verifyToken, verifyRole(['admin']), getAllNeedy);

// ✅ Admin updates status (approve/reject)
router.put('/needy/status/:id', verifyToken, verifyRole(['admin']), updateNeedyStatus);

// ✅ View all delivered food donations
router.get('/food/delivered', getDeliveredFoodDonations);

module.exports = router;
