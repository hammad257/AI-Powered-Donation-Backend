
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { getMyProfile, updateMyProfile, uploadProfilePhoto,removeProfilePhoto } = require('../controllers/profileController');

router.get('/me', verifyToken, getMyProfile);
router.put('/me', verifyToken, updateMyProfile);
router.post('/upload-photo', verifyToken, upload.single('photo'), uploadProfilePhoto);
router.delete('/remove-photo', verifyToken, removeProfilePhoto);

module.exports = router;
