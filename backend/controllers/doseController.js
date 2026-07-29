const DoseLog = require('../models/DoseLog');

/**
 * @desc    Get today's dose logs for logged-in patient (or patient specified by caregiver)
 * @route   GET /api/doses/today
 * @access  Private
 */
const getTodayDoseLogs = async (req, res) => {
  try {
    let patientId = req.user._id;

    if (req.user.role === 'caregiver' && req.query.patientId) {
      patientId = req.query.patientId;
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const doseLogs = await DoseLog.find({
      patient: patientId,
      scheduledTime: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate('medication', 'name dosage instructions scheduleTimes')
      .sort({ scheduledTime: 1 });

    res.json(doseLogs);
  } catch (error) {
    console.error('Get Today Dose Logs Error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Mark a dose as 'taken' by patient
 * @route   PUT /api/doses/:id/taken
 * @access  Private (Patient)
 */
const markDoseTaken = async (req, res) => {
  try {
    const doseLog = await DoseLog.findById(req.params.id);

    if (!doseLog) {
      return res.status(404).json({ message: 'Dose log entry not found' });
    }

    // Verify ownership
    if (doseLog.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this dose log' });
    }

    doseLog.status = 'taken';
    doseLog.takenAt = new Date();
    await doseLog.save();

    const populatedLog = await DoseLog.findById(doseLog._id).populate(
      'medication',
      'name dosage instructions'
    );

    res.json({
      message: 'Dose marked as taken successfully',
      doseLog: populatedLog,
    });
  } catch (error) {
    console.error('Mark Dose Taken Error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get adherence statistics for a patient
 * @route   GET /api/doses/stats
 * @access  Private
 */
const getPatientAdherenceStats = async (req, res) => {
  try {
    let patientId = req.user._id;

    if (req.user.role === 'caregiver' && req.query.patientId) {
      patientId = req.query.patientId;
    }

    // Default to last 30 days
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const doseLogs = await DoseLog.find({
      patient: patientId,
      scheduledTime: { $gte: startDate },
    });

    const totalDoses = doseLogs.length;
    const takenDoses = doseLogs.filter((log) => log.status === 'taken').length;
    const missedDoses = doseLogs.filter((log) => log.status === 'missed').length;
    const pendingDoses = doseLogs.filter((log) => log.status === 'pending').length;

    const adherenceRate =
      totalDoses > 0 ? Math.round((takenDoses / (takenDoses + missedDoses || 1)) * 100) : 100;

    res.json({
      totalDoses,
      takenDoses,
      missedDoses,
      pendingDoses,
      adherenceRate,
      days,
    });
  } catch (error) {
    console.error('Adherence Stats Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTodayDoseLogs,
  markDoseTaken,
  getPatientAdherenceStats,
};
