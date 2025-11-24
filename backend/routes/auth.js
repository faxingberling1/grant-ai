// backend/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const nodemailer = require('nodemailer');

const router = express.Router();

// Configure email transporter for Titan Email (Hostinger)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.titan.email',
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: false, // true for port 465, false for 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,    // e.g., info@deleuxedesign.com
    pass: process.env.SMTP_PASS     // Titan email password
  },
  tls: {
    // Required for some Hostinger/Titan setups
    rejectUnauthorized: false
  }
});

// Test SMTP connection on startup (optional but helpful)
transporter.verify((error, success) => {
  if (error) {
    console.warn('⚠️ SMTP connection failed:', error.message);
  } else {
    console.log('✅ SMTP ready for Titan Email');
  }
});

// Register new user (with approval workflow)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user exists (approved or not)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Check if this is an admin email (auto-approve)
    const isAdminEmail = process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL;

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      approved: isAdminEmail, // auto-approve only if matches ADMIN_EMAIL
      role: isAdminEmail ? 'admin' : 'user'
    });

    // Send emails ONLY for non-admin users
    if (!isAdminEmail) {
      // 1. Email to the USER: confirmation
      try {
        await transporter.sendMail({
          from: `"Grant Funds" <${process.env.SMTP_USER}>`,
          to: email,
          subject: '✅ Account Registration Received',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #1a472a;">Hello ${name},</h2>
              <p>Thank you for registering with <strong>Grant Funds</strong>!</p>
              <p>Your account is currently <strong>pending approval</strong>. Our team will review your request shortly.</p>
              <p>You'll receive another email once your account is activated.</p>
              <p>— The Grant Funds Team</p>
              <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #777;">
                This is an automated message. Please do not reply.
              </p>
            </div>
          `
        });
      } catch (userEmailError) {
        console.warn('⚠️ Failed to send user confirmation email:', userEmailError.message);
      }

      // 2. Email to YOU (admin): approval request
      try {
        await transporter.sendMail({
          from: `"Grant Funds" <${process.env.SMTP_USER}>`,
          to: 'info@deleuxedesign.com',
          subject: `🆕 Approval Needed: New User - ${name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #1a472a;">New User Registration</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Registration Time:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Status:</strong> <span style="color: #d32f2f;">Pending Approval</span></p>
              <p>Please review and approve this user in your admin dashboard.</p>
              <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #777;">
                This is an automated notification from Grant Funds.
              </p>
            </div>
          `
        });
      } catch (adminEmailError) {
        console.error('❌ Failed to send admin approval email:', adminEmailError.message);
      }
    }

    // Issue JWT only if approved (e.g., admin)
    let token = null;
    if (newUser.approved) {
      token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    }

    res.status(201).json({
      success: true,
      message: newUser.approved
        ? 'Admin account created successfully!'
        : 'Registration successful! Please check your email for next steps.',
      token,
      user: newUser.approved ? {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar
      } : null
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again later.'
    });
  }
});

// Login (with approval check)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Block unapproved users
    if (!user.approved) {
      return res.status(403).json({
        success: false,
        message: 'Account pending approval. Please contact support.'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again later.'
    });
  }
});

// Get current user (protected)
router.get('/me', authMiddleware, async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

module.exports = router;