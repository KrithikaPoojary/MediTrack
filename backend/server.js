const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const initDoseScheduler = require('./jobs/cronJobs');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const medicationRoutes = require('./routes/medicationRoutes');
const doseRoutes = require('./routes/doseRoutes');

// Models (for health check)
const User = require('./models/User');
const Medication = require('./models/Medication');
const DoseLog = require('./models/DoseLog');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Initialize Cron Jobs
initDoseScheduler();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/doses', doseRoutes);

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'MediTrack Backend Server is running!' });
});

// Database & Models health check route
app.get('/api/db-health', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const medCount = await Medication.countDocuments();
    const logCount = await DoseLog.countDocuments();

    res.status(200).json({
      status: 'ok',
      message: 'MongoDB models & connection initialized successfully!',
      stats: {
        users: userCount,
        medications: medCount,
        doseLogs: logCount,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
