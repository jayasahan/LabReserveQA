const mongoose = require('mongoose')

const requestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required']
    },
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: [true, 'Equipment is required']
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'RETURNED', 'CANCELLED'],
      default: 'PENDING'
    },

    loanDays: {
      type: Number,
      min: [1, 'Loan days must be at least 1'],
      max: [14, 'Loan days must be at most 14'],
      default: 7
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Request', requestSchema)
