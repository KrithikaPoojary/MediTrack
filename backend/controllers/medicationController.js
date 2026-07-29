const Medication = require('../models/Medication');

/**
 * @desc    Create a new medication for logged-in patient
 * @route   POST /api/medications
 * @access  Private (Patient)
 */
const createMedication = async (req, res) => {
  try {
    const { name, dosage, instructions, scheduleTimes, startDate, endDate } = req.body;

    if (!name || !dosage || !scheduleTimes || !Array.isArray(scheduleTimes) || scheduleTimes.length === 0) {
      return res.status(400).json({
        message: 'Please provide medication name, dosage, and at least one schedule time (HH:mm)',
      });
    }

    const medication = await Medication.create({
      patient: req.user._id,
      name,
      dosage,
      instructions: instructions || '',
      scheduleTimes,
      startDate: startDate || Date.now(),
      endDate: endDate || null,
    });

    res.status(201).json(medication);
  } catch (error) {
    console.error('Create Medication Error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all medications for logged-in patient (or target patient for caregiver)
 * @route   GET /api/medications
 * @access  Private
 */
const getMedications = async (req, res) => {
  try {
    let patientId = req.user._id;

    // If caregiver requesting patient's medications via query param ?patientId=xxx
    if (req.user.role === 'caregiver' && req.query.patientId) {
      patientId = req.query.patientId;
    }

    const medications = await Medication.find({ patient: patientId, isActive: true }).sort({
      createdAt: -1,
    });

    res.json(medications);
  } catch (error) {
    console.error('Get Medications Error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get single medication by ID
 * @route   GET /api/medications/:id
 * @access  Private
 */
const getMedicationById = async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);

    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    // Verify ownership or caregiver authorization
    if (
      medication.patient.toString() !== req.user._id.toString() &&
      req.user.role !== 'caregiver'
    ) {
      return res.status(403).json({ message: 'Not authorized to access this medication' });
    }

    res.json(medication);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update medication
 * @route   PUT /api/medications/:id
 * @access  Private (Patient)
 */
const updateMedication = async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);

    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    // Check ownership
    if (medication.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this medication' });
    }

    const updatedMedication = await Medication.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json(updatedMedication);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete medication (soft delete by setting isActive: false)
 * @route   DELETE /api/medications/:id
 * @access  Private (Patient)
 */
const deleteMedication = async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);

    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    // Check ownership
    if (medication.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this medication' });
    }

    medication.isActive = false;
    await medication.save();

    res.json({ message: 'Medication deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createMedication,
  getMedications,
  getMedicationById,
  updateMedication,
  deleteMedication,
};
