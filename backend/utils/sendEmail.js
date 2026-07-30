const nodemailer = require('nodemailer');

/**
 * Create reusable mail transporter using Gmail SMTP or Ethereal for testing
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * @desc  Send an email reminder to patient when a dose is due
 * @param {Object} options - { toEmail, patientName, medicationName, dosage, scheduledTime }
 */
const sendDoseReminderEmail = async ({ toEmail, patientName, medicationName, dosage, scheduledTime }) => {
  try {
    const transporter = createTransporter();

    const formattedTime = new Date(scheduledTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    await transporter.sendMail({
      from: `"MediTrack" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `💊 Medication Reminder: Time to take ${medicationName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background: #0284c7; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">💊 MediTrack Reminder</h1>
          </div>
          <div style="padding: 24px;">
            <p style="font-size: 16px;">Hello <strong>${patientName}</strong>,</p>
            <p style="font-size: 15px;">This is your scheduled medication reminder:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr style="background: #f0f9ff;">
                <td style="padding: 10px 14px; font-weight: bold; border: 1px solid #e0e0e0;">Medication</td>
                <td style="padding: 10px 14px; border: 1px solid #e0e0e0;">${medicationName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; font-weight: bold; border: 1px solid #e0e0e0;">Dosage</td>
                <td style="padding: 10px 14px; border: 1px solid #e0e0e0;">${dosage}</td>
              </tr>
              <tr style="background: #f0f9ff;">
                <td style="padding: 10px 14px; font-weight: bold; border: 1px solid #e0e0e0;">Scheduled Time</td>
                <td style="padding: 10px 14px; border: 1px solid #e0e0e0;">${formattedTime}</td>
              </tr>
            </table>
            <p style="color: #64748b; font-size: 13px;">Please log into MediTrack to mark this dose as taken after consuming your medication.</p>
          </div>
          <div style="background: #f8fafc; padding: 14px; text-align: center; font-size: 12px; color: #94a3b8;">
            MediTrack — Medicine Reminder & Adherence Tracker
          </div>
        </div>
      `,
    });

    console.log(`[Email] Reminder sent to ${toEmail} for ${medicationName} at ${formattedTime}`);
  } catch (error) {
    console.error(`[Email Error] Reminder email to ${toEmail} failed:`, error.message);
  }
};

/**
 * @desc  Send a missed-dose alert email to the patient's linked caregiver
 * @param {Object} options - { toEmail, caregiverName, patientName, medicationName, dosage, scheduledTime }
 */
const sendMissedDoseAlertEmail = async ({ toEmail, caregiverName, patientName, medicationName, dosage, scheduledTime }) => {
  try {
    const transporter = createTransporter();

    const formattedTime = new Date(scheduledTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    await transporter.sendMail({
      from: `"MediTrack" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `⚠️ Missed Dose Alert: ${patientName} missed ${medicationName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background: #dc2626; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Missed Dose Alert</h1>
          </div>
          <div style="padding: 24px;">
            <p style="font-size: 16px;">Hello <strong>${caregiverName}</strong>,</p>
            <p style="font-size: 15px;">Your patient <strong>${patientName}</strong> missed their scheduled medication:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr style="background: #fef2f2;">
                <td style="padding: 10px 14px; font-weight: bold; border: 1px solid #fecaca;">Patient</td>
                <td style="padding: 10px 14px; border: 1px solid #fecaca;">${patientName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; font-weight: bold; border: 1px solid #fecaca;">Medication</td>
                <td style="padding: 10px 14px; border: 1px solid #fecaca;">${medicationName}</td>
              </tr>
              <tr style="background: #fef2f2;">
                <td style="padding: 10px 14px; font-weight: bold; border: 1px solid #fecaca;">Dosage</td>
                <td style="padding: 10px 14px; border: 1px solid #fecaca;">${dosage}</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; font-weight: bold; border: 1px solid #fecaca;">Scheduled Time</td>
                <td style="padding: 10px 14px; border: 1px solid #fecaca;">${formattedTime}</td>
              </tr>
            </table>
            <p style="color: #64748b; font-size: 13px;">Please follow up with your patient as soon as possible.</p>
          </div>
          <div style="background: #f8fafc; padding: 14px; text-align: center; font-size: 12px; color: #94a3b8;">
            MediTrack — Medicine Reminder & Adherence Tracker
          </div>
        </div>
      `,
    });

    console.log(`[Email] Missed-dose alert sent to caregiver ${toEmail} for patient ${patientName}`);
  } catch (error) {
    console.error(`[Email Error] Missed-dose alert to ${toEmail} failed:`, error.message);
  }
};

module.exports = { sendDoseReminderEmail, sendMissedDoseAlertEmail };
