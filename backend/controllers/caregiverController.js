const User = require('../models/User');
const Medication = require('../models/Medication');
const DoseLog = require('../models/DoseLog');

/**
 * @desc    Link caregiver to a patient using patient's invite code
 * @route   POST /api/caregiver/link
 * @access  Private (Caregiver)
 */
const linkToPatient = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    if (!inviteCode) {
      return res.status(400).json({ message: 'Please provide a patient invite code' });
    }

    // Find patient with matching invite code
    const patient = await User.findOne({ inviteCode: inviteCode.toUpperCase(), role: 'patient' });

    if (!patient) {
      return res.status(404).json({ message: 'No patient found with this invite code' });
    }

    // Prevent self-linking
    if (patient._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot link to yourself' });
    }

    // Check if patient already has a caregiver
    if (patient.caregiver) {
      return res.status(400).json({ message: 'This patient is already linked to a caregiver' });
    }

    // Link caregiver to patient record
    patient.caregiver = req.user._id;
    await patient.save();

    res.json({
      message: `Successfully linked to patient ${patient.name}`,
      patient: {
        _id: patient._id,
        name: patient.name,
        email: patient.email,
        inviteCode: patient.inviteCode,
      },
    });
  } catch (error) {
    console.error('Link to Patient Error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all patients linked to this caregiver
 * @route   GET /api/caregiver/patients
 * @access  Private (Caregiver)
 */
const getLinkedPatients = async (req, res) => {
  try {
    const patients = await User.find({ caregiver: req.user._id, role: 'patient' }).select(
      '-password'
    );

    res.json(patients);
  } catch (error) {
    console.error('Get Linked Patients Error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get medication list for a linked patient
 * @route   GET /api/caregiver/patients/:patientId/medications
 * @access  Private (Caregiver)
 */
const getPatientMedications = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Verify this patient is linked to the caregiver
    const patient = await User.findOne({ _id: patientId, caregiver: req.user._id });
    if (!patient) {
      return res.status(403).json({ message: 'You are not authorized to view this patient\'s data' });
    }

    const medications = await Medication.find({ patient: patientId, isActive: true }).sort({
      createdAt: -1,
    });

    res.json(medications);
  } catch (error) {
    console.error('Get Patient Medications Error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get dose history and adherence stats for a linked patient
 * @route   GET /api/caregiver/patients/:patientId/doses
 * @access  Private (Caregiver)
 */
const getPatientDoseHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const days = parseInt(req.query.days) || 30;

    // Verify this patient is linked to the caregiver
    const patient = await User.findOne({ _id: patientId, caregiver: req.user._id });
    if (!patient) {
      return res.status(403).json({ message: 'You are not authorized to view this patient\'s data' });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const doseLogs = await DoseLog.find({
      patient: patientId,
      scheduledTime: { $gte: startDate },
    })
      .populate('medication', 'name dosage instructions')
      .sort({ scheduledTime: -1 });

    // Calculate adherence stats
    const totalDoses = doseLogs.length;
    const takenDoses = doseLogs.filter((d) => d.status === 'taken').length;
    const missedDoses = doseLogs.filter((d) => d.status === 'missed').length;
    const pendingDoses = doseLogs.filter((d) => d.status === 'pending').length;
    const adherenceRate =
      totalDoses > 0 ? Math.round((takenDoses / (takenDoses + missedDoses || 1)) * 100) : 100;

    res.json({
      patient: {
        _id: patient._id,
        name: patient.name,
        email: patient.email,
      },
      stats: { totalDoses, takenDoses, missedDoses, pendingDoses, adherenceRate, days },
      doseLogs,
    });
  } catch (error) {
    console.error('Get Patient Dose History Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  linkToPatient,
  getLinkedPatients,
  getPatientMedications,
  getPatientDoseHistory,
};
