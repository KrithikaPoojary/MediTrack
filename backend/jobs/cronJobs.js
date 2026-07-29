const cron = require('node-cron');
const Medication = require('../models/Medication');
const DoseLog = require('../models/DoseLog');

/**
 * Helper to get current HH:mm time string in 24-hour format
 */
const getCurrentHHMM = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Helper to construct a Date object for today at specific HH:mm
 */
const getScheduledDateForToday = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const scheduledDate = new Date();
  scheduledDate.setHours(hours, minutes, 0, 0);
  return scheduledDate;
};

/**
 * Initialize background cron job that runs every minute
 * Checks all active medications and generates 'pending' DoseLogs when due
 */
const initDoseScheduler = () => {
  console.log('Initializing Dose Scheduler Cron Job (runs every minute)...');

  // Run every minute: '* * * * *'
  cron.schedule('* * * * *', async () => {
    try {
      const currentHHMM = getCurrentHHMM();
      console.log(`[Cron Job] Checking medication schedules for time: ${currentHHMM}`);

      // Find all active medications
      const activeMedications = await Medication.find({ isActive: true });

      for (const med of activeMedications) {
        // Check if current time matches any of the medication's scheduled times
        if (med.scheduleTimes && med.scheduleTimes.includes(currentHHMM)) {
          const scheduledTimeDate = getScheduledDateForToday(currentHHMM);

          // Check if a DoseLog entry already exists for this scheduled dose today
          const existingLog = await DoseLog.findOne({
            patient: med.patient,
            medication: med._id,
            scheduledTime: {
              $gte: new Date(scheduledTimeDate.valueOf() - 59000),
              $lte: new Date(scheduledTimeDate.valueOf() + 59000),
            },
          });

          if (!existingLog) {
            const newLog = await DoseLog.create({
              patient: med.patient,
              medication: med._id,
              scheduledTime: scheduledTimeDate,
              status: 'pending',
            });
            console.log(
              `[Cron Job] Created 'pending' DoseLog for Medication '${med.name}' (Patient: ${med.patient}) at ${currentHHMM}`
            );
          }
        }
      }
    } catch (error) {
      console.error('[Cron Job Error]:', error.message);
    }
  });
};

module.exports = initDoseScheduler;
