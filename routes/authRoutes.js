const express = require('express');
const router = express.Router();
const { registerUser, loginUser, socialLogin,forgotPassword,resetPassword } = require('../controllers/authController')

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/social-login', socialLogin);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
