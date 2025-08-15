const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');
const { getAllNeedy, updateNeedyStatus, getDeliveredFoodDonations,getDashboardStats,getGraphData,
    getAllUsers,
    getUserById,
    deleteUser,
    blockUser,
    unblockUser
 } = require('../controllers/adminController');

// 🧾 Admin views needy people (with filter)
router.get('/needy', verifyToken, verifyRole(['admin']), getAllNeedy);

// ✅ Admin updates status (approve/reject)
router.put('/needy/status/:id', verifyToken, verifyRole(['admin']), updateNeedyStatus);

// ✅ View all delivered food donations
router.get('/food/delivered', getDeliveredFoodDonations);

// 📊 Dashboard Stats
router.get('/dashboard/stats', verifyToken, verifyRole(['admin']), getDashboardStats);

// 📈 Dashboard Graph Data
router.get('/dashboard/graph', verifyToken, verifyRole(['admin']), getGraphData);

router.get('/',  verifyToken, verifyRole(['admin']), getAllUsers);
router.get('/:id',  verifyToken, verifyRole(['admin']), getUserById);
router.delete('/:id',  verifyToken, verifyRole(['admin']), deleteUser);
router.patch('/:id/block',  verifyToken, verifyRole(['admin']), blockUser);
router.patch('/:id/unblock',  verifyToken, verifyRole(['admin']), unblockUser);

module.exports = router;
