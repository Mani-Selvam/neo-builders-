import nodemailer from 'nodemailer';
import 'dotenv/config';

let transporter;

try {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '465', 10),
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      // do not fail on invalid certs for shared hosting
      rejectUnauthorized: false
    }
  });
} catch (error) {
  console.error('[emailUtils] Failed to create transporter:', error);
}

export const sendOTP = async (toEmail, otp) => {
  if (!transporter) {
    console.error('[emailUtils] Transporter not configured.');
    return;
  }
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Your Password Reset OTP',
    text: `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`,
    html: `<p>Your OTP for password reset is: <strong>${otp}</strong></p><p>It will expire in 10 minutes.</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[emailUtils] Email sent to ${toEmail}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('[emailUtils] Error sending email:', error);
    throw error;
  }
};
