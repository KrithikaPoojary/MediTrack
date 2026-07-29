const cron = require('node-cron');
const Medication = require('../models/Medication');
const DoseLog = require('../models/DoseLog');

const GRACE_PERIOD_MINUTES = parseInt(process.env.GRACE_PERIOD_MINUTES) || 30;

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
 * Check and mark pending doses as 'missed' if past the grace period (30 minutes)
 */
const checkMissedDoses = async () => {
  try {
    const cutoffTime = new Date(Date.now() - GRACE_PERIOD_MINUTES * 60 * 1000);

    // Find all 'pending' doses whose scheduledTime is older than cutoffTime
    const overdueDoses = await DoseLog.find({
      status: 'pending',
      scheduledTime: { $lt: cutoffTime },
    }).populate('medication patient');

    for (const dose of overdueDoses) {
      dose.status = 'missed';
      await dose.save();
      console.log(
        `[Cron Job] Marked dose as 'missed' for Patient '${dose.patient?.name}' - Medication '${dose.medication?.name}' (Scheduled: ${dose.scheduledTime})`
      );
    }
  } catch (error) {
    console.error('[Cron Job Error checking missed doses]:', error.message);
  }
};

/**
 * Initialize background cron job that runs every minute
 * 1. Generates 'pending' DoseLogs when medication doses are due
 * 2. Detects and marks overdue doses as 'missed' after 30-minute grace period
 */
const initDoseScheduler = () => {
  console.log(
    `Initializing Dose Scheduler Cron Job (every minute, grace period: ${GRACE_PERIOD_MINUTES} mins)...`
  );

  // Run every minute: '* * * * *'
  cron.schedule('* * * * *', async () => {
    try {
      const currentHHMM = getCurrentHHMM();

      // 1. Check active medications for due doses
      const activeMedications = await Medication.find({ isActive: true });

      for (const med of activeMedications) {
        if (med.scheduleTimes && med.scheduleTimes.includes(currentHHMM)) {
          const scheduledTimeDate = getScheduledDateForToday(currentHHMM);

          const existingLog = await DoseLog.findOne({
            patient: med.patient,
            medication: med._id,
            scheduledTime: {
              $gte: new Date(scheduledTimeDate.valueOf() - 59000),
              $lte: new Date(scheduledTimeDate.valueOf() + 59000),
            },
          });

          if (!existingLog) {
            await DoseLog.create({
              patient: med.patient,
              medication: med._id,
              scheduledTime: scheduledTimeDate,
              status: 'pending',
            });
            console.log(
              `[Cron Job] Created 'pending' DoseLog for Medication '${med.name}' at ${currentHHMM}`
            );
          }
        }
      }

      // 2. Check for overdue pending doses and mark as 'missed'
      await checkMissedDoses();
    } catch (error) {
      console.error('[Cron Job Error]:', error.message);
    }
  });
};

module.exports = initDoseScheduler;
