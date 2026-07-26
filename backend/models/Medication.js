const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Medication name is required'],
      trim: true,
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required'],
      trim: true,
    },
    instructions: {
      type: String,
      trim: true,
      default: '',
    },
    // Daily scheduled times in 24-hour HH:mm format, e.g., ["08:00", "20:00"]
    scheduleTimes: {
      type: [String],
      required: [true, 'At least one schedule time is required'],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Medication', medicationSchema);
