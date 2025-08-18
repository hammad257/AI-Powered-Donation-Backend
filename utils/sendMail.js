const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

async function sendEmail(to, subject, text, html) {
  try {
    await transporter.sendMail({
      from: '"Donation App" <no-reply@donationapp.com>',
      to,
      subject,
      text,
      html,
    });
    console.log("✅ Email sent successfully!");
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
}

module.exports = sendEmail;
