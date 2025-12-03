// backend/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const EmailVerification = require('../models/EmailVerification');
const EmailService = require('../services/emailService');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const emailService = new EmailService();

/**
 * Register new user with email verification and document storage initialization
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
      // If user exists but email is not verified, allow resending verification
      if (!existingUser.emailVerified) {
        try {
          const verification = await EmailVerification.createVerification(
            existingUser._id,
            existingUser.email,
            {
              ip: req.ip,
              userAgent: req.get('User-Agent'),
              metadata: {
                browser: req.get('User-Agent') || 'Unknown',
                resendForExisting: true
              }
            }
          );
          
          await emailService.sendVerificationEmail(existingUser, verification.token);
          
          return res.status(200).json({
            success: true,
            message: 'Email already registered but not verified. A new verification email has been sent.',
            requiresVerification: true
          });
        } catch (emailError) {
          console.error('❌ Failed to resend verification email:', emailError);
        }
      }
      
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Check if this is a demo email (auto-approve and skip verification)
    const isDemoEmail = email.toLowerCase() === "demo@grantfunds.com";
    
    // Check if this is an admin email (auto-approve but still verify)
    const isAdminEmail = process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL;

    // Create user with document storage initialization
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      approved: isDemoEmail || isAdminEmail, // Auto-approve demo and admin
      emailVerified: isDemoEmail, // Only demo is auto-verified
      role: isAdminEmail ? 'admin' : (isDemoEmail ? 'Grant Manager' : 'user'),
      // Initialize document storage settings
      documents: [],
      storageUsage: 0,
      storageLimit: isDemoEmail ? 500 * 1024 * 1024 : 100 * 1024 * 1024, // 500MB for demo, 100MB for regular
      documentCount: 0,
      maxDocumentCount: isDemoEmail ? 5000 : 1000, // Higher limits for demo
      documentPreferences: {
        autoCategorize: true,
        defaultCategory: 'other',
        backupEnabled: true,
        versioningEnabled: true,
        allowedFileTypes: [
          'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 
          'txt', 'jpg', 'jpeg', 'png', 'gif', 'zip', 'rar'
        ]
      }
    };

    // For demo user, create and return immediately with sample documents
    if (isDemoEmail) {
      const demoUser = await User.create(userData);
      
      // Add sample documents for demo user
      const sampleDocuments = [
        {
          filename: 'grant-proposal-template.docx',
          originalName: 'Grant Proposal Template.docx',
          fileSize: 2457600,
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          category: 'templates',
          description: 'Comprehensive grant proposal template with all required sections',
          storagePath: 'demo/grant-proposal-template.docx',
          tags: ['template', 'proposal', 'grant'],
          version: 1,
          uploadedBy: demoUser._id
        },
        {
          filename: 'nonprofit-budget-worksheet.xlsx',
          originalName: 'Nonprofit Budget Worksheet.xlsx',
          fileSize: 1887437,
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          category: 'financial',
          description: 'Detailed budget planning worksheet for grant applications',
          storagePath: 'demo/nonprofit-budget-worksheet.xlsx',
          tags: ['budget', 'financial', 'worksheet'],
          version: 1,
          uploadedBy: demoUser._id
        },
        {
          filename: 'project-timeline-template.pptx',
          originalName: 'Project Timeline Template.pptx',
          fileSize: 4194304,
          mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          category: 'planning',
          description: 'Project timeline presentation template for grant proposals',
          storagePath: 'demo/project-timeline-template.pptx',
          tags: ['timeline', 'project', 'presentation'],
          version: 1,
          uploadedBy: demoUser._id
        }
      ];

      // Add sample documents to demo user
      demoUser.documents = sampleDocuments;
      demoUser.documentCount = sampleDocuments.length;
      demoUser.storageUsage = sampleDocuments.reduce((total, doc) => total + doc.fileSize, 0);
      await demoUser.save();

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
          emailVerified: true,
          approved: true,
          storageStats: {
            used: demoUser.storageUsage,
            limit: demoUser.storageLimit,
            available: demoUser.availableStorage,
            percentage: demoUser.getStorageUsagePercentage()
          },
          documentCount: demoUser.documentCount
        }
      });
    }

    // For regular users, create with verification
    const newUser = await User.create(userData);

    // Create email verification record
    let verification;
    try {
      verification = await EmailVerification.createVerification(
        newUser._id,
        newUser.email,
        {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          metadata: {
            browser: req.get('User-Agent') || 'Unknown',
            registrationType: isAdminEmail ? 'admin' : 'regular',
            documentStorageInitialized: true
          }
        }
      );
    } catch (verificationError) {
      console.error('❌ Error creating verification record:', verificationError);
      // Continue with registration even if verification record fails
    }

    // Send verification email
    try {
      if (verification) {
        await emailService.sendVerificationEmail(newUser, verification.token);
      }
      
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
          emailVerified: false,
          approved: false,
          storageStats: {
            used: newUser.storageUsage,
            limit: newUser.storageLimit,
            available: newUser.availableStorage,
            percentage: newUser.getStorageUsagePercentage()
          },
          documentCount: newUser.documentCount
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
          emailVerified: false,
          approved: false,
          storageStats: {
            used: newUser.storageUsage,
            limit: newUser.storageLimit,
            available: newUser.availableStorage,
            percentage: newUser.getStorageUsagePercentage()
          },
          documentCount: newUser.documentCount
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

    // Find user
    const user = await User.findById(verification.userId);
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      // Mark token as used even though already verified
      await verification.markAsUsed();
      
      const authToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
      
      return res.json({
        success: true,
        message: 'Email is already verified',
        token: authToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          emailVerified: true,
          approved: user.approved,
          storageStats: {
            used: user.storageUsage,
            limit: user.storageLimit,
            available: user.availableStorage,
            percentage: user.getStorageUsagePercentage()
          },
          documentCount: user.documentCount
        },
        alreadyVerified: true
      });
    }

    // Verify user email
    user.emailVerified = true;
    user.verificationHistory.push({
      verifiedAt: new Date(),
      method: 'email',
      verifiedBy: null
    });

    // For regular users, auto-approve after email verification
    if (user.role === 'user') {
      user.approved = true;
    }

    await user.save();

    // Mark verification token as used
    await verification.markAsUsed();

    // Send welcome email with document storage information
    try {
      await emailService.sendWelcomeEmail(user, {
        storageLimit: user.storageLimit,
        documentLimit: user.maxDocumentCount,
        features: ['Document Storage', 'File Sharing', 'Version Control']
      });
    } catch (welcomeEmailError) {
      console.warn('⚠️ Failed to send welcome email:', welcomeEmailError.message);
      // Continue even if welcome email fails
    }

    // Generate login token
    const authToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    // Update last login
    user.lastLogin = new Date();
    await user.save();

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
        emailVerified: true,
        approved: user.approved,
        storageStats: {
          used: user.storageUsage,
          limit: user.storageLimit,
          available: user.availableStorage,
          percentage: user.getStorageUsagePercentage()
        },
        documentCount: user.documentCount,
        documentPreferences: user.documentPreferences
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

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
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
    await EmailVerification.invalidatePreviousVerifications(user._id, 'email_verification');

    // Create new verification record
    let verification;
    try {
      verification = await EmailVerification.createVerification(
        user._id,
        user.email,
        {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          metadata: {
            browser: req.get('User-Agent') || 'Unknown',
            resend: true,
            documentStorageInitialized: true
          }
        }
      );
    } catch (verificationError) {
      console.error('❌ Error creating verification record for resend:', verificationError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create verification token'
      });
    }

    // Send new verification email
    try {
      await emailService.sendVerificationEmail(user, verification.token);
      
      res.json({
        success: true,
        message: 'Verification email sent successfully. Please check your inbox.',
        expiresAt: verification.expiresAt
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
 * Send verification email for current user (protected)
 */
router.post('/send-verification', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Check if user is demo
    if (user.email === 'demo@grantfunds.com') {
      return res.status(400).json({
        success: false,
        message: 'Demo account does not require verification'
      });
    }

    // Invalidate previous verification tokens
    await EmailVerification.invalidatePreviousVerifications(user._id, 'email_verification');

    // Create new verification record
    let verification;
    try {
      verification = await EmailVerification.createVerification(
        user._id,
        user.email,
        {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          metadata: {
            browser: req.get('User-Agent') || 'Unknown',
            requestedByUser: true
          }
        }
      );
    } catch (verificationError) {
      console.error('❌ Error creating verification record:', verificationError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create verification token'
      });
    }

    // Send verification email
    try {
      await emailService.sendVerificationEmail(user, verification.token);
      
      res.json({
        success: true,
        message: 'Verification email sent successfully. Please check your inbox.',
        expiresAt: verification.expiresAt
      });
    } catch (emailError) {
      console.error('❌ Failed to send verification email:', emailError);
      
      res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again later.'
      });
    }

  } catch (error) {
    console.error('❌ Send verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending verification. Please try again later.'
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
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    
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
      user.lastLogin = new Date();
      await user.save();
      
      return res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          emailVerified: true,
          approved: true,
          storageStats: {
            used: user.storageUsage,
            limit: user.storageLimit,
            available: user.availableStorage,
            percentage: user.getStorageUsagePercentage()
          },
          documentCount: user.documentCount,
          documentPreferences: user.documentPreferences
        }
      });
    }

    // Check if email is verified for regular users
    if (!user.emailVerified) {
      // Check if there's an active verification
      const activeVerifications = await EmailVerification.getActiveVerifications(
        user._id,
        'email_verification'
      );
      
      if (activeVerifications.length === 0) {
        // No active verification, send a new one
        try {
          const verification = await EmailVerification.createVerification(
            user._id,
            user.email,
            {
              ip: req.ip,
              userAgent: req.get('User-Agent'),
              metadata: {
                browser: req.get('User-Agent') || 'Unknown',
                triggeredByLogin: true
              }
            }
          );
          
          await emailService.sendVerificationEmail(user, verification.token);
          
          return res.status(403).json({
            success: false,
            message: 'Email verification required. A new verification email has been sent to your inbox.',
            requiresVerification: true,
            emailResent: true
          });
        } catch (emailError) {
          console.error('❌ Failed to send verification email on login:', emailError);
        }
      }
      
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
    user.lastLogin = new Date();
    await user.save();

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
        approved: user.approved,
        company: user.company,
        phone: user.phone,
        storageStats: {
          used: user.storageUsage,
          limit: user.storageLimit,
          available: user.availableStorage,
          percentage: user.getStorageUsagePercentage()
        },
        documentCount: user.documentCount,
        documentPreferences: user.documentPreferences
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
 * Forgot password
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      // Don't reveal if user exists for security
      return res.json({
        success: true,
        message: 'If your email is registered, you will receive password reset instructions shortly.'
      });
    }

    // Invalidate previous password reset tokens
    await EmailVerification.invalidatePreviousVerifications(user._id, 'password_reset');

    // Create password reset token
    const resetToken = await EmailVerification.createVerification(
      user._id,
      user.email,
      {
        type: 'password_reset',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }
    );

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(user, resetToken.token);
      
      res.json({
        success: true,
        message: 'Password reset instructions sent to your email',
        expiresAt: resetToken.expiresAt
      });
    } catch (emailError) {
      console.error('❌ Failed to send password reset email:', emailError);
      
      res.status(500).json({
        success: false,
        message: 'Failed to send password reset email. Please try again later.'
      });
    }

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing password reset. Please try again later.'
    });
  }
});

/**
 * Reset password
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Find valid password reset token
    const verification = await EmailVerification.findValidToken(token, 'password_reset');
    
    if (!verification) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token'
      });
    }

    // Find user
    const user = await User.findById(verification.userId).select('+password');
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid password reset token'
      });
    }

    // Update password
    user.password = password;
    await user.save();

    // Mark token as used
    await verification.markAsUsed();

    // Send confirmation email
    try {
      await emailService.sendNotificationEmail(
        user,
        'Password Reset Successful',
        `Your password was successfully reset on ${new Date().toLocaleString()}. If you did not perform this action, please contact support immediately.`
      );
    } catch (emailError) {
      console.warn('⚠️ Failed to send password reset confirmation email:', emailError.message);
    }

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error resetting password. Please try again later.'
    });
  }
});

/**
 * Change password (protected)
 */
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await user.correctPassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Send notification email
    try {
      await emailService.sendNotificationEmail(
        user,
        'Password Changed',
        `Your password was changed on ${new Date().toLocaleString()}. If you did not perform this action, please contact support immediately.`
      );
    } catch (emailError) {
      console.warn('⚠️ Failed to send password change confirmation email:', emailError.message);
    }

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error changing password. Please try again later.'
    });
  }
});

/**
 * Get current user (protected) with document storage info
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // Get fresh user data with document stats
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
        approved: user.approved,
        company: user.company,
        phone: user.phone,
        timezone: user.timezone,
        notifications: user.notifications,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        // Document storage information
        storageStats: {
          used: user.storageUsage,
          limit: user.storageLimit,
          available: user.availableStorage,
          percentage: user.getStorageUsagePercentage(),
          formatted: user.storageUsageFormatted
        },
        documentCount: user.documentCount,
        maxDocumentCount: user.maxDocumentCount,
        documentPreferences: user.documentPreferences,
        // Quick document stats
        documentStats: {
          totalDocuments: user.documentCount,
          totalStorage: user.storageUsage,
          categories: user.documents.reduce((acc, doc) => {
            acc[doc.category] = (acc[doc.category] || 0) + 1;
            return acc;
          }, {})
        }
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

    const activeVerifications = await EmailVerification.getActiveVerifications(
      user._id,
      'email_verification'
    );

    res.json({
      success: true,
      emailVerified: user.emailVerified,
      approved: user.approved,
      active: user.active,
      status: user.status,
      hasActiveVerification: activeVerifications.length > 0,
      verificationHistory: user.verificationHistory,
      nextVerificationAvailable: user.emailVerified ? false : (activeVerifications.length === 0),
      storageStats: {
        used: user.storageUsage,
        limit: user.storageLimit,
        available: user.availableStorage,
        percentage: user.getStorageUsagePercentage()
      },
      documentCount: user.documentCount
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
 * Update user profile with document preferences
 */
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, company, phone, timezone, notifications, documentPreferences } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (company !== undefined) updateData.company = company.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (timezone) updateData.timezone = timezone;
    if (notifications) updateData.notifications = notifications;
    
    // Update document preferences if provided
    if (documentPreferences) {
      updateData.documentPreferences = {
        autoCategorize: documentPreferences.autoCategorize !== undefined ? documentPreferences.autoCategorize : req.user.documentPreferences.autoCategorize,
        defaultCategory: documentPreferences.defaultCategory || req.user.documentPreferences.defaultCategory,
        backupEnabled: documentPreferences.backupEnabled !== undefined ? documentPreferences.backupEnabled : req.user.documentPreferences.backupEnabled,
        versioningEnabled: documentPreferences.versioningEnabled !== undefined ? documentPreferences.versioningEnabled : req.user.documentPreferences.versioningEnabled,
        allowedFileTypes: documentPreferences.allowedFileTypes || req.user.documentPreferences.allowedFileTypes
      };
    }

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
        approved: updatedUser.approved,
        company: updatedUser.company,
        phone: updatedUser.phone,
        timezone: updatedUser.timezone,
        notifications: updatedUser.notifications,
        storageStats: {
          used: updatedUser.storageUsage,
          limit: updatedUser.storageLimit,
          available: updatedUser.availableStorage,
          percentage: updatedUser.getStorageUsagePercentage()
        },
        documentCount: updatedUser.documentCount,
        documentPreferences: updatedUser.documentPreferences
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

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    
    res.json({
      success: true,
      available: !exists,
      isVerified: exists ? exists.emailVerified : false,
      isApproved: exists ? exists.approved : false
    });
  } catch (error) {
    console.error('❌ Check email error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking email availability'
    });
  }
});

/**
 * Check registration status
 */
router.post('/check-registration', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      return res.json({
        success: true,
        exists: false,
        emailVerified: false,
        approved: false
      });
    }

    res.json({
      success: true,
      exists: true,
      emailVerified: user.emailVerified,
      approved: user.approved,
      status: user.status
    });
  } catch (error) {
    console.error('❌ Check registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking registration status'
    });
  }
});

/**
 * Get user storage statistics (protected)
 */
router.get('/storage/stats', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate document category distribution
    const categoryStats = user.documents.reduce((acc, doc) => {
      acc[doc.category] = (acc[doc.category] || 0) + 1;
      return acc;
    }, {});

    // Get recent documents
    const recentDocuments = user.documents
      .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
      .slice(0, 5)
      .map(doc => ({
        id: doc._id,
        filename: doc.originalName,
        category: doc.category,
        fileSize: doc.fileSize,
        uploadDate: doc.uploadDate
      }));

    res.json({
      success: true,
      stats: {
        storage: {
          used: user.storageUsage,
          limit: user.storageLimit,
          available: user.availableStorage,
          percentage: user.getStorageUsagePercentage(),
          formatted: user.storageUsageFormatted
        },
        documents: {
          total: user.documentCount,
          limit: user.maxDocumentCount,
          available: user.maxDocumentCount - user.documentCount
        },
        categories: categoryStats,
        recentUploads: recentDocuments
      }
    });
  } catch (error) {
    console.error('❌ Storage stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving storage statistics'
    });
  }
});

/**
 * Upgrade storage plan (placeholder for future implementation)
 */
router.post('/storage/upgrade', authMiddleware, async (req, res) => {
  try {
    const { plan } = req.body;
    
    if (!plan) {
      return res.status(400).json({
        success: false,
        message: 'Storage plan is required'
      });
    }

    const plans = {
      basic: { storage: 100 * 1024 * 1024, documents: 1000 },
      professional: { storage: 500 * 1024 * 1024, documents: 5000 },
      enterprise: { storage: 2 * 1024 * 1024 * 1024, documents: 20000 }
    };

    const selectedPlan = plans[plan];
    if (!selectedPlan) {
      return res.status(400).json({
        success: false,
        message: 'Invalid storage plan'
      });
    }

    // In a real implementation, you would process payment here
    // For now, we'll just update the user's limits
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        storageLimit: selectedPlan.storage,
        maxDocumentCount: selectedPlan.documents
      },
      { new: true }
    );

    res.json({
      success: true,
      message: `Storage plan upgraded to ${plan} successfully!`,
      user: {
        storageStats: {
          used: updatedUser.storageUsage,
          limit: updatedUser.storageLimit,
          available: updatedUser.availableStorage,
          percentage: updatedUser.getStorageUsagePercentage()
        },
        documentCount: updatedUser.documentCount,
        maxDocumentCount: updatedUser.maxDocumentCount
      }
    });
  } catch (error) {
    console.error('❌ Storage upgrade error:', error);
    res.status(500).json({
      success: false,
      message: 'Error upgrading storage plan'
    });
  }
});

module.exports = router;