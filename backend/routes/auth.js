// backend/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const EmailVerification = require('../models/EmailVerification');
const EmailService = require('../services/emailService');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/auth');

const router = express.Router();

/**
 * Register new user with email verification
 */
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

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Check if this is a demo email (auto-approve and skip verification)
    const isDemoEmail = email.toLowerCase() === "demo@grantfunds.com";
    
    // Check if this is an admin email (auto-approve but still verify)
    const isAdminEmail = process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL;

    // Create user
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      approved: isDemoEmail || isAdminEmail, // Auto-approve demo and admin
      emailVerified: isDemoEmail, // Only demo is auto-verified
      role: isAdminEmail ? 'admin' : (isDemoEmail ? 'Grant Manager' : 'user')
    };

    // For demo user, create and return immediately
    if (isDemoEmail) {
      const demoUser = await User.create(userData);
      const token = jwt.sign({ id: demoUser._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
      
      return res.status(201).json({
        success: true,
        message: 'Demo account created successfully!',
        token,
        user: {
          id: demoUser._id,
          name: demoUser.name,
          email: demoUser.email,
          role: demoUser.role,
          avatar: demoUser.avatar,
          emailVerified: true
        }
      });
    }

    // For regular users, create with verification
    const newUser = new User(userData);
    const verificationToken = newUser.generateVerificationToken();
    await newUser.save();

    // Create email verification record
    try {
      await EmailVerification.createVerification(
        newUser._id,
        newUser.email,
        {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          metadata: {
            browser: req.get('User-Agent') || 'Unknown',
            registrationType: isAdminEmail ? 'admin' : 'regular'
          }
        }
      );
    } catch (verificationError) {
      console.error('❌ Error creating verification record:', verificationError);
      // Continue with registration even if verification record fails
    }

    // Send verification email
    try {
      await EmailService.sendVerificationEmail(newUser, verificationToken);
      
      res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        requiresVerification: true,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          avatar: newUser.avatar,
          emailVerified: false
        }
      });
    } catch (emailError) {
      console.error('❌ Failed to send verification email:', emailError);
      
      // If email fails, still create user but inform them
      res.status(201).json({
        success: true,
        message: 'Account created but verification email failed. Please contact support to verify your account.',
        requiresVerification: true,
        emailFailed: true,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          avatar: newUser.avatar,
          emailVerified: false
        }
      });
    }

  } catch (error) {
    console.error('❌ Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Verify email address
 */
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    // Find valid verification token
    const verification = await EmailVerification.findValidToken(token);
    
    if (!verification) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Check if token has exceeded maximum attempts
    if (verification.verificationAttempts >= 5) {
      return res.status(400).json({
        success: false,
        message: 'Too many verification attempts. Please request a new verification email.'
      });
    }

    // Increment verification attempts
    await verification.incrementAttempts();

    // Find user and verify email
    const user = await User.findByVerificationToken(token);
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }

    // Verify user email
    user.verifyEmail();
    await user.save();

    // Mark verification token as used
    await verification.markAsUsed();

    // Send welcome email
    try {
      await EmailService.sendWelcomeEmail(user);
    } catch (welcomeEmailError) {
      console.warn('⚠️ Failed to send welcome email:', welcomeEmailError.message);
      // Continue even if welcome email fails
    }

    // Generate login token
    const authToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    // Update last login
    await user.updateLastLogin();

    res.json({
      success: true,
      message: 'Email verified successfully! Welcome to Grant Funds.',
      token: authToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        emailVerified: true
      }
    });

  } catch (error) {
    console.error('❌ Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during email verification. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Resend verification email
 */
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findByEmail(email);
    
    if (!user) {
      // Don't reveal whether user exists or not for security
      return res.json({
        success: true,
        message: 'If an account exists with this email, a verification link has been sent.'
      });
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Check if user is demo (shouldn't need verification)
    if (user.email === 'demo@grantfunds.com') {
      return res.status(400).json({
        success: false,
        message: 'Demo account does not require verification'
      });
    }

    // Invalidate previous verification tokens
    await EmailVerification.invalidatePreviousVerifications(user._id);

    // Generate new verification token
    const newVerificationToken = user.generateVerificationToken();
    await user.save();

    // Create new verification record
    try {
      await EmailVerification.createVerification(
        user._id,
        user.email,
        {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          metadata: {
            browser: req.get('User-Agent') || 'Unknown',
            resend: true
          }
        }
      );
    } catch (verificationError) {
      console.error('❌ Error creating verification record for resend:', verificationError);
    }

    // Send new verification email
    try {
      await EmailService.sendVerificationEmail(user, newVerificationToken);
      
      res.json({
        success: true,
        message: 'Verification email sent successfully. Please check your inbox.'
      });
    } catch (emailError) {
      console.error('❌ Failed to resend verification email:', emailError);
      
      res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again later.'
      });
    }

  } catch (error) {
    console.error('❌ Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resending verification. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Login with email verification check
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user with password
    const user = await User.findByEmail(email, true);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await user.correctPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // For demo user, allow login without verification
    if (user.email === 'demo@grantfunds.com') {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
      await user.updateLastLogin();
      
      return res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          emailVerified: true
        }
      });
    }

    // Check if email is verified for regular users
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in. Check your inbox for the verification link.',
        requiresVerification: true
      });
    }

    // Check if approved (for non-demo users)
    if (!user.approved) {
      return res.status(403).json({
        success: false,
        message: 'Account pending approval. Please contact support.'
      });
    }

    // Check if account is active
    if (user.active === false) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.'
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    
    // Update last login
    await user.updateLastLogin();

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
        company: user.company,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Get current user (protected)
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
        emailVerified: req.user.emailVerified,
        company: req.user.company,
        phone: req.user.phone,
        timezone: req.user.timezone,
        notifications: req.user.notifications,
        lastLogin: req.user.lastLogin,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user information'
    });
  }
});

/**
 * Check verification status
 */
router.get('/verification-status', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      emailVerified: user.emailVerified,
      approved: user.approved,
      active: user.active,
      status: user.status
    });
  } catch (error) {
    console.error('❌ Verification status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking verification status'
    });
  }
});

/**
 * Update user profile
 */
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, company, phone, timezone, notifications } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (company !== undefined) updateData.company = company.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (timezone) updateData.timezone = timezone;
    if (notifications) updateData.notifications = notifications;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        emailVerified: updatedUser.emailVerified,
        company: updatedUser.company,
        phone: updatedUser.phone,
        timezone: updatedUser.timezone,
        notifications: updatedUser.notifications
      }
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

/**
 * Check email availability
 */
router.get('/check-email', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const exists = await User.emailExists(email);
    
    res.json({
      success: true,
      available: !exists
    });
  } catch (error) {
    console.error('❌ Check email error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking email availability'
    });
  }
});

module.exports = router;