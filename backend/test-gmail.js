// test-gmail.js
require('dotenv').config();
const nodemailer = require('nodemailer');

(async () => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  try {
    await transporter.verify();
    console.log('✅ Gmail SMTP connected!');

    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: 'Gmail SMTP Test',
      text: 'If you see this, Gmail SMTP works!'
    });

    console.log('📧 Test email sent! Check your inbox.');
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
})();