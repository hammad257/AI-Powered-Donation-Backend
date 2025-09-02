const express = require('express');
const router = express.Router();
const { registerUser, loginUser, socialLogin,forgotPassword,resetPassword,changePassword,updateVisibility } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/social-login', socialLogin);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/change-password', verifyToken, changePassword);
router.put("/visibility", verifyToken, updateVisibility);

module.exports = router;
