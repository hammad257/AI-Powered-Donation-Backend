// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const { getMessages, saveMessage } = require('../controllers/messageController');

router.get('/:roomId', verifyToken, getMessages);
router.post('/', verifyToken, saveMessage);

module.exports = router;
