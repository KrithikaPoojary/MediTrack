const mongoose = require('mongoose');

const doseLogSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    medication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medication',
      required: true,
    },
    scheduledTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'taken', 'missed'],
      default: 'pending',
    },
    takenAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DoseLog', doseLogSchema);
