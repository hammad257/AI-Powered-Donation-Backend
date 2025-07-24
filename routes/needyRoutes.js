const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');
const NeedyPerson = require('../models/needyPerson');
const upload = require('../middlewares/uploadMiddleware');

// Allow only needy role
router.use(verifyToken, verifyRole(['needy']));

// POST /api/needy/request
router.post('/request', upload.array('documents', 5), async (req, res) => {
  try {
    const { name, email, phone, reason } = req.body;

    const documentPaths = req.files.map(file => file.filename);

    const newRequest = new NeedyPerson({
      name,
      email,
      phone,
      reason,
      documents: documentPaths,
      submittedBy: req.user.id,
    });

    await newRequest.save();
    res.status(201).json({ message: 'Help request submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 👀 Get current needy person's help request
router.get('/my-request', async (req, res) => {
  try {
    const request = await NeedyPerson.findOne({ submittedBy: req.user.id });

    if (!request) {
      return res.status(404).json({ message: 'No help request found' });
    }

    res.json({
      status: request.status,
      adminNotes: request.adminNotes || 'No notes yet',
      submittedAt: request.createdAt,
      documents: request.documents.map(
        doc => `${req.protocol}://${req.get('host')}/uploads/${doc}`
      )
    });
  } catch (err) {
    console.error('🔥 Error in /my-request:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;
