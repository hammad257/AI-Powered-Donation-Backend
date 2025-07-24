const mongoose = require('mongoose');


const moneyDonationSchema = new mongoose.Schema(
    {
      amount:{
        type: Number,
        required: true
      },
      purpose: {
        type: String,
        enum: ['Zakat', 'Sadqa', 'Charity'],
        required: true
      },
      status: {
        type: String,
        enum: ['pending','approved','rejected'],
        default:'pending'
      },
      donatedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
      },
    },
    {timestamps:true}
)

module.exports = mongoose.model('MoneyDonation',moneyDonationSchema)