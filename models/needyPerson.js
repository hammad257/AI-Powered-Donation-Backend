const mongoose = require('mongoose');

const needyPersonSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    reason: String,
    documents: [String],
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // ✅ Replacing verified + rejected with a single flexible status
    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected'],
      default: 'pending',
    },

    // 📝 Optional notes admin can add for each submission
    adminNotes: {
      type: String,
      default: '',
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('NeedyPerson', needyPersonSchema);
