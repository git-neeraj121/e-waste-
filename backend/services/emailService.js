import nodemailer from 'nodemailer';

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: parseInt(port) === 465, // true for 465, false for other ports
      auth: { user, pass }
    });
  }
  return null;
};

export const emailService = {
  sendPickupConfirmation: async (pickupDetails) => {
    const transporter = createTransporter();
    
    const { id, userName, facilityName, pickupDate, timeSlot, address, items, pointsAwarded } = pickupDetails;
    
    // Parse items list
    const itemsListHtml = items.map(item => `
      <li><strong>${item.type}</strong>: ${item.quantity} unit(s)</li>
    `).join('');

    const subject = `♻️ E-Waste Pickup Confirmation - Booking #${id}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 20px; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #16a34a; text-align: center; margin-bottom: 20px;">Pickup Scheduled Successfully!</h2>
        <p>Dear <strong>${userName}</strong>,</p>
        <p>Thank you for recycling your electronic items responsibly! Your pickup appointment has been registered at <strong>${facilityName}</strong>.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Appointment Details:</h3>
          <ul style="list-style: none; padding-left: 0; line-height: 1.6;">
            <li>📅 <strong>Date:</strong> ${pickupDate}</li>
            <li>🕒 <strong>Time Slot:</strong> ${timeSlot}</li>
            <li>📍 <strong>Address:</strong> ${address}</li>
            <li>🔢 <strong>Booking ID:</strong> ${id}</li>
          </ul>
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: #374151;">Items to Recycle:</h3>
          <ul style="line-height: 1.6;">
            ${itemsListHtml}
          </ul>
        </div>

        <div style="border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 20px; text-align: center;">
          <p style="font-size: 14px; color: #4b5563;">You will be awarded up to <strong style="color: #16a34a;">+${pointsAwarded} Eco Points</strong> upon collection verification!</p>
          <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">EcoLocate - Let's build a clean tomorrow together.</p>
        </div>
      </div>
    `;

    if (transporter) {
      try {
        const mailOptions = {
          from: `"EcoLocate Recycles" <${process.env.SMTP_USER}>`,
          to: pickupDetails.userEmail || process.env.SMTP_USER, // send to user or back to self
          subject,
          html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[SMTP Mailer] Email sent: ${info.messageId}`);
        return true;
      } catch (error) {
        console.error('[SMTP Mailer] Failed to send email:', error);
        // Don't crash the server, fall back to console log
      }
    }

    // SMTP Fallback logger
    console.log('\n--- [EMAIL SERVICE SIMULATED (SMTP Config missing in .env)] ---');
    console.log(`Subject: ${subject}`);
    console.log(`To: ${pickupDetails.userName} (Scheduled for ${pickupDate} @ ${timeSlot})`);
    console.log(`Items list:\n${items.map(i => ` - ${i.type}: x${i.quantity}`).join('\n')}`);
    console.log(`Carbon estimation points: +${pointsAwarded} PTS`);
    console.log('-------------------------------------------------------------\n');
    return true;
  }
};
