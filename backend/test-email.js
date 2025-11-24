// backend/test-gmail.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'arsalan.naqve110@gmail.com',          // ← REPLACE
    pass: 'mfizxpynomwnggdi' // ← REPLACE
  }
});

transporter.verify((err, success) => {
  if (err) {
    console.error('❌ Verify failed:', err.message);
  } else {
    console.log('✅ SMTP connected!');
    transporter.sendMail({
      from: 'your_real@gmail.com',
      to: 'amon.john@hotmail.com',
      subject: 'Test',
      text: 'Working! Sending you from Dashboard'
    }, (mailErr, info) => {
      if (mailErr) {
        console.error('❌ Send failed:', mailErr.message);
      } else {
        console.log('✅ Email sent!');
      }
    });
  }
});