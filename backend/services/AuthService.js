// backend/services/AuthService.js
const User = require('../models/User');
const EmailVerification = require('../models/EmailVerification');
const EmailService = require('./emailService');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

class AuthService {
  constructor() {
    this.emailService = new EmailService();
  }

  /**
   * Login user with email verification check
   */
  async login(email, password) {
    try {
      // Find user with password (select: false in schema)
      const user = await User.findOne({ email: email.toLowerCase() })
        .select('+password');
      
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check password
      const isPasswordValid = await user.correctPassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Check if email is verified
      if (!user.emailVerified) {
        // Check if there's an active verification token
        const activeVerifications = await EmailVerification.getActiveVerifications(
          user._id,
          'email_verification'
        );
        
        if (activeVerifications.length > 0) {
          throw new Error('Please verify your email address before logging in. Check your inbox for the verification email.');
        } else {
          // No active verification, send a new one
          await this.sendVerificationEmail(user);
          throw new Error('Email verification required. A new verification email has been sent to your inbox.');
        }
      }

      // Check if account is approved
      if (!user.approved && user.role !== 'admin') {
        throw new Error('Your account is pending approval by an administrator.');
      }

      // Check if account is active
      if (!user.active) {
        throw new Error('Your account has been deactivated. Please contact support.');
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = this.generateToken(user);

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      return {
        user: userResponse,
        token
      };
    } catch (error) {
      console.error('❌ Login service error:', error);
      throw error;
    }
  }

  /**
   * Register new user with email verification
   */
  async register(userData) {
    try {
      const { name, email, password, company, phone } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        // If user exists but email is not verified, allow resending verification
        if (!existingUser.emailVerified) {
          await this.sendVerificationEmail(existingUser);
          throw new Error('Email already registered but not verified. A new verification email has been sent.');
        }
        throw new Error('Email already registered');
      }

      // Create new user
      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        company,
        phone,
        emailVerified: false,
        approved: false,
        role: 'user'
      });

      // Send verification email
      const verificationResult = await this.sendVerificationEmail(user);

      console.log(`✅ User registered: ${email}`);
      console.log(`📧 Verification email sent: ${verificationResult.emailId}`);

      // Generate JWT token for immediate login (but user must verify email)
      const token = this.generateToken(user);

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      return {
        user: userResponse,
        token,
        message: 'Registration successful! Please check your email to verify your account.',
        verificationSent: true
      };
    } catch (error) {
      console.error('❌ Registration service error:', error);
      
      // Handle duplicate email error
      if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
        throw new Error('Email already registered');
      }
      
      throw error;
    }
  }

  /**
   * Send verification email to user
   */
  async sendVerificationEmail(user, options = {}) {
    try {
      // Invalidate previous verification tokens for this user
      await EmailVerification.invalidatePreviousVerifications(
        user._id,
        'email_verification'
      );

      // Create new verification token
      const verification = await EmailVerification.createVerification(
        user._id,
        user.email,
        {
          ip: options.ip || req?.ip,
          userAgent: options.userAgent || req?.headers['user-agent'],
          metadata: options.metadata
        }
      );

      // Send verification email via Resend
      const emailResult = await this.emailService.sendVerificationEmail(
        user,
        verification.token,
        options
      );

      // Log verification email sent
      user.verificationHistory.push({
        verifiedAt: null,
        method: 'email_sent',
        verifiedBy: null
      });
      await user.save();

      return {
        verificationToken: verification.token,
        expiresAt: verification.expiresAt,
        emailResult
      };
    } catch (error) {
      console.error('❌ Send verification email error:', error);
      throw new Error(`Failed to send verification email: ${error.message}`);
    }
  }

  /**
   * Resend verification email (for unverified users)
   */
  async resendVerificationEmail(email) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        throw new Error('User not found');
      }

      if (user.emailVerified) {
        throw new Error('Email is already verified');
      }

      // Send verification email
      const result = await this.sendVerificationEmail(user);

      return {
        message: 'Verification email sent successfully',
        expiresAt: result.expiresAt
      };
    } catch (error) {
      console.error('❌ Resend verification email error:', error);
      throw error;
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token) {
    try {
      // Find valid verification token
      const verification = await EmailVerification.findValidToken(token);
      
      if (!verification) {
        throw new Error('Invalid or expired verification token');
      }

      // Check if user already verified
      const user = await User.findById(verification.userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.emailVerified) {
        // Mark token as used even though already verified
        await verification.markAsUsed();
        return {
          message: 'Email is already verified',
          user: user.toObject(),
          alreadyVerified: true
        };
      }

      // Mark email as verified
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

      // Send welcome email
      try {
        await this.emailService.sendWelcomeEmail(user, {
          storageLimit: user.storageLimit,
          features: [
            'AI-powered grant writing assistance',
            'Client management tools',
            'Grant tracking and matching',
            'Professional email templates',
            'Secure document storage'
          ]
        });
      } catch (emailError) {
        console.error('❌ Welcome email error (non-critical):', emailError);
        // Don't throw error for welcome email failure
      }

      // Generate new token for immediate login
      const newToken = this.generateToken(user);

      console.log(`✅ Email verified: ${user.email}`);

      return {
        message: 'Email verified successfully! Welcome to Grant Funds.',
        user: user.toObject(),
        token: newToken
      };
    } catch (error) {
      console.error('❌ Verify email error:', error);
      
      // Increment verification attempts for security
      if (error.message.includes('Invalid or expired')) {
        await EmailVerification.incrementAttempts(token);
      }
      
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(email) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        // Don't reveal if user exists for security
        return {
          message: 'If your email is registered, you will receive password reset instructions shortly.'
        };
      }

      // Invalidate previous password reset tokens
      await EmailVerification.invalidatePreviousVerifications(
        user._id,
        'password_reset'
      );

      // Create password reset token
      const resetToken = await EmailVerification.createVerification(
        user._id,
        user.email,
        {
          type: 'password_reset',
          expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        }
      );

      // Send password reset email
      await this.emailService.sendPasswordResetEmail(user, resetToken.token);

      return {
        message: 'Password reset instructions sent to your email',
        expiresAt: resetToken.expiresAt
      };
    } catch (error) {
      console.error('❌ Forgot password error:', error);
      throw new Error('Failed to process password reset request');
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token, newPassword) {
    try {
      // Find valid password reset token
      const verification = await EmailVerification.findOne({
        token,
        type: 'password_reset',
        used: false,
        expiresAt: { $gt: new Date() }
      }).populate('userId');

      if (!verification) {
        throw new Error('Invalid or expired password reset token');
      }

      const user = verification.userId;

      // Update password
      user.password = newPassword;
      await user.save();

      // Mark token as used
      verification.used = true;
      verification.usedAt = new Date();
      await verification.save();

      // Send confirmation email
      await this.emailService.sendNotificationEmail(
        user,
        'Password Reset Successful',
        `Your password was successfully reset on ${new Date().toLocaleString()}. If you did not perform this action, please contact support immediately.`
      );

      return {
        message: 'Password reset successfully'
      };
    } catch (error) {
      console.error('❌ Reset password error:', error);
      throw error;
    }
  }

  /**
   * Generate JWT token
   */
  generateToken(user) {
    return jwt.sign(
      {
        _id: user._id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        approved: user.approved
      },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    );
  }

  /**
   * Verify JWT token
   */
  verifyToken(token) {
    try {
      return jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
      );
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Get user by token (for auth middleware)
   */
  async getUserByToken(token) {
    try {
      const decoded = this.verifyToken(token);
      const user = await User.findById(decoded._id);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Check if user is active
      if (!user.active) {
        throw new Error('Account is deactivated');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check verification status
   */
  async getVerificationStatus(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const activeVerifications = await EmailVerification.getActiveVerifications(
        userId,
        'email_verification'
      );

      return {
        emailVerified: user.emailVerified,
        approved: user.approved,
        active: user.active,
        hasActiveVerification: activeVerifications.length > 0,
        verificationHistory: user.verificationHistory,
        nextVerificationAvailable: user.emailVerified ? false : (activeVerifications.length === 0)
      };
    } catch (error) {
      console.error('❌ Get verification status error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updateData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Fields that can be updated
      const allowedUpdates = ['name', 'company', 'phone', 'timezone', 'notifications', 'documentPreferences'];
      const updates = {};
      
      allowedUpdates.forEach(field => {
        if (updateData[field] !== undefined) {
          updates[field] = updateData[field];
        }
      });

      // Apply updates
      Object.assign(user, updates);
      await user.save();

      return {
        user: user.toObject(),
        message: 'Profile updated successfully'
      };
    } catch (error) {
      console.error('❌ Update profile error:', error);
      throw error;
    }
  }

  /**
   * Change password (for logged-in users)
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isPasswordValid = await user.correctPassword(currentPassword);
      if (!isPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      user.password = newPassword;
      await user.save();

      // Send notification email
      await this.emailService.sendNotificationEmail(
        user,
        'Password Changed',
        `Your password was changed on ${new Date().toLocaleString()}. If you did not perform this action, please contact support immediately.`
      );

      return {
        message: 'Password changed successfully'
      };
    } catch (error) {
      console.error('❌ Change password error:', error);
      throw error;
    }
  }
}

module.exports = AuthService;