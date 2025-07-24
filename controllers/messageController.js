// controllers/messageController.js
const Message = require('../models/message');

exports.getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ roomId }).sort({ createdAt: 1 }).populate('sender', 'name role');
    res.json(messages);
  } catch (err) {
    console.error('getMessages Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.saveMessage = async (req, res) => {
  try {
    const { roomId, message } = req.body;
    const newMsg = new Message({
      roomId,
      message,
      sender: req.user.id
    });
    await newMsg.save();
    res.status(201).json(newMsg);
  } catch (err) {
    console.error('saveMessage Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
