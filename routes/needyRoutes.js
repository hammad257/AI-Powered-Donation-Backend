const express = require('express');
const router = express.Router();
const NeedyPerson = require('../models/needyPerson');
const upload = require('../middlewares/uploadMiddleware');

// POST /api/needy/request
router.post('/request', upload.array('documents', 5), async (req, res) => {
  try {
   
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const { name, email, phone, reason } = req.body;

    // CloudinaryStorage gives us file.path = Cloudinary secure_url
    const documentUrls = req.files.map(file => file.path);

    const newRequest = new NeedyPerson({
      name,
      email,
      phone,
      reason,
      documents: documentUrls,
      submittedBy: null,
    });

    await newRequest.save();
    res.status(201).json({ message: 'Help request submitted successfully', documents: documentUrls });
  } catch (err) {
    console.error("❌ Upload Error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// Get needy person's request
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
      documents: request.documents // ✅ already Cloudinary URLs
    });
  } catch (err) {
    console.error('🔥 Error in /my-request:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
