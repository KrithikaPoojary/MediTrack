const express = require('express');
const router = express.Router();
const {
  getTodayDoseLogs,
  markDoseTaken,
  getPatientAdherenceStats,
} = require('../controllers/doseController');
const { protect } = require('../middleware/authMiddleware');

// All dose routes are protected
router.get('/today', protect, getTodayDoseLogs);
router.put('/:id/taken', protect, markDoseTaken);
router.get('/stats', protect, getPatientAdherenceStats);

module.exports = router;
