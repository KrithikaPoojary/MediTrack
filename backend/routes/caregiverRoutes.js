const express = require('express');
const router = express.Router();
const {
  linkToPatient,
  getLinkedPatients,
  getPatientMedications,
  getPatientDoseHistory,
} = require('../controllers/caregiverController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All caregiver routes are protected AND restricted to 'caregiver' role only
router.post('/link', protect, authorize('caregiver'), linkToPatient);
router.get('/patients', protect, authorize('caregiver'), getLinkedPatients);
router.get('/patients/:patientId/medications', protect, authorize('caregiver'), getPatientMedications);
router.get('/patients/:patientId/doses', protect, authorize('caregiver'), getPatientDoseHistory);

module.exports = router;
