const express = require('express');
const router = express.Router();
const { registerUser, loginUser, socialLogin } = require('../controllers/authController')

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/social-login', socialLogin);

module.exports = router;
