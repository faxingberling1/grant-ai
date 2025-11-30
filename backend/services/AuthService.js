const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const EmailVerification = require('../models/EmailVerification');
const PasswordReset = require('../models/PasswordReset');
const EmailService = require('../EmailService');
const NotificationService = require('../NotificationService');
const { getEnvConfig } = require('../config/environment');

class AuthService {
  constructor() {
    this.config = getEnvConfig();
    this.emailService = new EmailService();
    this.notificationService = new NotificationService();
  }

  generateToken(userId) {
    return jwt.sign({ id: userId }, this.config.JWT_SECRET, { expiresIn: '30d' });
  }

  async login(email, password) {
    const user = await User.findOne({ email });
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await user.correctPassword(password);
    
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    if (!user.approved) {
      throw new Error('Account pending approval. Please contact support.');
    }

    const token = this.generateToken(user._id);
    
    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        approved: user.approved
      }
    };
  }

  async register(userData) {
    const { name, email, password } = userData;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Validate input
    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Check if it's the specific admin email
    const isAdminEmail = email === "admin@deleuxedesign.com";
    
    // Create user with approved status
    const user = await User.create({
      name,
      email,
      password,
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      approved: isAdminEmail,
      role: isAdminEmail ? 'admin' : 'Grant Manager'
    });

    // Send welcome notification for approved users
    if (user.approved) {
      await this.notificationService.createWelcomeNotification(user._id);
    }

    // Send confirmation email
    if (!isAdminEmail && this.emailService.resend) {
      try {
        await this.emailService.sendNotificationEmail(
          user,
          '✅ Welcome! Your Account Is Pending Approval',
          `
            <p>Thank you for registering with <strong>Grant Funds</strong>!</p>
            <p>Your account is currently <strong>pending approval</strong>. We will review your request shortly.</p>
            <p>You'll receive another email once your account is activated.</p>
            <p>If you have any questions, please contact our support team.</p>
          `
        );
      } catch (emailError) {
        console.warn('⚠️ Failed to send confirmation email:', emailError.message);
      }
    }

    // Issue token only if approved (admin or auto-approved)
    let token = null;
    if (user.approved) {
      token = this.generateToken(user._id);
    }

    return {
      token,
      user: user.approved ? {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      } : null,
      message: isAdminEmail 
        ? 'Admin account created successfully!' 
        : 'Registration successful! Please check your email for next steps.'
    };
  }

  async sendVerificationEmail(user) {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    const emailVerification = new EmailVerification({
      userId: user._id,
      token: verificationToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    await emailVerification.save();
    
    const result = await this.emailService.sendVerificationEmail(user, verificationToken);
    return result;
  }

  async verifyEmail(token) {
    const emailVerification = await EmailVerification.findOne({ 
      token,
      expiresAt: { $gt: new Date() }
    });
    
    if (!emailVerification) {
      throw new Error('Invalid or expired verification token');
    }
    
    const user = await User.findByIdAndUpdate(
      emailVerification.userId,
      { 
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      },
      { new: true }
    );
    
    if (!user) {
      throw new Error('User not found');
    }
    
    await EmailVerification.deleteOne({ _id: emailVerification._id });
    await this.emailService.sendWelcomeEmail(user);
    
    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified
      }
    };
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal whether email exists
      return { message: 'If the email exists, a password reset link has been sent' };
    }
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    const passwordReset = new PasswordReset({
      userId: user._id,
      token: resetToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000)
    });
    await passwordReset.save();
    
    await this.emailService.sendPasswordResetEmail(user, resetToken);
    
    return { message: 'If the email exists, a password reset link has been sent' };
  }

  async resetPassword(token, password) {
    const passwordReset = await PasswordReset.findOne({ 
      token,
      expiresAt: { $gt: new Date() }
    });
    
    if (!passwordReset) {
      throw new Error('Invalid or expired reset token');
    }
    
    const user = await User.findById(passwordReset.userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    user.password = password;
    await user.save();
    await PasswordReset.deleteOne({ _id: passwordReset._id });
    
    return { message: 'Password reset successfully' };
  }
}

module.exports = AuthService;