const { Resend } = require('resend');
const User = require('../models/User');
const EmailVerification = require('../models/EmailVerification');

class EmailService {
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.fromEmail = process.env.RESEND_FROM_EMAIL || 'admin@deleuxedesign.com';
    this.fromName = process.env.RESEND_FROM_NAME || 'Grant Funds';
    this.frontendUrl = process.env.FRONTEND_URL || 'https://grant-ai-eight.vercel.app';
  }

  /**
   * Send email verification to user
   */
  async sendVerificationEmail(user, verificationToken, options = {}) {
    try {
      const verificationUrl = `${this.frontendUrl}/verify-email?token=${verificationToken}`;
      
      const emailData = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: user.email,
        subject: 'Verify Your Email - Grant Funds',
        html: this.getVerificationEmailTemplate(user.name, verificationUrl),
        tags: [
          {
            name: 'category',
            value: 'email_verification'
          }
        ]
      };

      // Add reply_to if provided
      if (options.replyTo) {
        emailData.reply_to = options.replyTo;
      }

      const { data, error } = await this.resend.emails.send(emailData);

      if (error) {
        console.error('❌ Resend API error:', error);
        throw new Error(`Failed to send verification email: ${error.message}`);
      }

      console.log(`✅ Verification email sent to: ${user.email}`);
      console.log(`📧 Email ID: ${data?.id}`);

      // Log email sent event
      await this.logEmailEvent('verification_sent', user._id, data?.id);

      return {
        success: true,
        emailId: data?.id,
        message: 'Verification email sent successfully'
      };

    } catch (error) {
      console.error('❌ Error sending verification email:', error);
      
      // Log email failure
      await this.logEmailEvent('verification_failed', user._id, null, error.message);
      
      throw error;
    }
  }

  /**
   * Send welcome email after successful verification
   */
  async sendWelcomeEmail(user, options = {}) {
    try {
      const emailData = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: user.email,
        subject: 'Welcome to Grant Funds! 🚀',
        html: this.getWelcomeEmailTemplate(user.name),
        tags: [
          {
            name: 'category',
            value: 'welcome'
          }
        ]
      };

      if (options.replyTo) {
        emailData.reply_to = options.replyTo;
      }

      const { data, error } = await this.resend.emails.send(emailData);

      if (error) {
        console.error('❌ Resend API error for welcome email:', error);
        
        // Log failure but don't throw error for welcome email
        await this.logEmailEvent('welcome_failed', user._id, null, error.message);
        return {
          success: false,
          error: error.message
        };
      }

      console.log(`✅ Welcome email sent to: ${user.email}`);
      console.log(`📧 Email ID: ${data?.id}`);

      await this.logEmailEvent('welcome_sent', user._id, data?.id);

      return {
        success: true,
        emailId: data?.id,
        message: 'Welcome email sent successfully'
      };

    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      
      await this.logEmailEvent('welcome_failed', user._id, null, error.message);
      
      // Don't throw error for welcome email failures
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user, resetToken, options = {}) {
    try {
      const resetUrl = `${this.frontendUrl}/reset-password?token=${resetToken}`;
      
      const emailData = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: user.email,
        subject: 'Reset Your Password - Grant Funds',
        html: this.getPasswordResetTemplate(user.name, resetUrl),
        tags: [
          {
            name: 'category',
            value: 'password_reset'
          }
        ]
      };

      if (options.replyTo) {
        emailData.reply_to = options.replyTo;
      }

      const { data, error } = await this.resend.emails.send(emailData);

      if (error) {
        console.error('❌ Resend API error for password reset:', error);
        throw new Error(`Failed to send password reset email: ${error.message}`);
      }

      console.log(`✅ Password reset email sent to: ${user.email}`);
      console.log(`📧 Email ID: ${data?.id}`);

      await this.logEmailEvent('password_reset_sent', user._id, data?.id);

      return {
        success: true,
        emailId: data?.id,
        message: 'Password reset email sent successfully'
      };

    } catch (error) {
      console.error('❌ Error sending password reset email:', error);
      
      await this.logEmailEvent('password_reset_failed', user._id, null, error.message);
      
      throw error;
    }
  }

  /**
   * Send account approval notification
   */
  async sendApprovalEmail(user, options = {}) {
    try {
      const emailData = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: user.email,
        subject: 'Your Grant Funds Account Has Been Approved! ✅',
        html: this.getApprovalEmailTemplate(user.name),
        tags: [
          {
            name: 'category',
            value: 'account_approval'
          }
        ]
      };

      if (options.replyTo) {
        emailData.reply_to = options.replyTo;
      }

      const { data, error } = await this.resend.emails.send(emailData);

      if (error) {
        console.error('❌ Resend API error for approval email:', error);
        throw new Error(`Failed to send approval email: ${error.message}`);
      }

      console.log(`✅ Approval email sent to: ${user.email}`);
      console.log(`📧 Email ID: ${data?.id}`);

      await this.logEmailEvent('approval_sent', user._id, data?.id);

      return {
        success: true,
        emailId: data?.id,
        message: 'Approval email sent successfully'
      };

    } catch (error) {
      console.error('❌ Error sending approval email:', error);
      
      await this.logEmailEvent('approval_failed', user._id, null, error.message);
      
      throw error;
    }
  }

  /**
   * Send general notification email
   */
  async sendNotificationEmail(user, subject, content, options = {}) {
    try {
      const emailData = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: user.email,
        subject: subject,
        html: this.getNotificationTemplate(user.name, content, subject),
        tags: [
          {
            name: 'category',
            value: options.category || 'notification'
          }
        ]
      };

      if (options.replyTo) {
        emailData.reply_to = options.replyTo;
      }

      const { data, error } = await this.resend.emails.send(emailData);

      if (error) {
        console.error('❌ Resend API error for notification email:', error);
        throw new Error(`Failed to send notification email: ${error.message}`);
      }

      console.log(`✅ Notification email sent to: ${user.email}`);
      console.log(`📧 Email ID: ${data?.id}`);

      await this.logEmailEvent('notification_sent', user._id, data?.id, options.category);

      return {
        success: true,
        emailId: data?.id,
        message: 'Notification email sent successfully'
      };

    } catch (error) {
      console.error('❌ Error sending notification email:', error);
      
      await this.logEmailEvent('notification_failed', user._id, null, error.message);
      
      throw error;
    }
  }

  /**
   * Verify email service configuration
   */
  async verifyConfiguration() {
    try {
      // Test Resend API key by making a simple request
      const { data, error } = await this.resend.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: 'test@example.com',
        subject: 'Grant Funds - Service Test',
        html: '<p>This is a test email to verify service configuration.</p>'
      });

      if (error) {
        throw new Error(`Resend configuration error: ${error.message}`);
      }

      return {
        success: true,
        service: 'Resend',
        status: 'configured',
        fromEmail: this.fromEmail,
        fromName: this.fromName
      };

    } catch (error) {
      console.error('❌ Email service configuration error:', error);
      return {
        success: false,
        service: 'Resend',
        status: 'failed',
        error: error.message
      };
    }
  }

  /**
   * Get email sending statistics
   */
  async getEmailStats(days = 30) {
    try {
      // This would typically integrate with Resend's analytics API
      // For now, we'll return basic stats from our logs
      const stats = {
        sent: 0,
        failed: 0,
        categories: {}
      };

      // In a real implementation, you'd query Resend's API or your database
      console.log('📊 Email stats requested for last', days, 'days');

      return {
        success: true,
        stats,
        period: `${days} days`
      };

    } catch (error) {
      console.error('❌ Error getting email stats:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ==================== EMAIL TEMPLATES ====================

  getVerificationEmailTemplate(name, verificationUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email - Grant Funds</title>
          <style>
              body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
              .container { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #1a472a, #2d5a3d); color: white; padding: 40px 30px; text-align: center; }
              .content { padding: 40px 30px; }
              .button { display: inline-block; background: #1a472a; color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; padding: 20px; background: #f5f5f5; }
              .code { background: #f8f9fa; padding: 15px; border-radius: 5px; font-family: 'Courier New', monospace; margin: 15px 0; border-left: 4px solid #1a472a; }
              .feature { background: #f8f9fa; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #1a472a; }
              @media (max-width: 600px) { .content { padding: 20px; } .header { padding: 30px 20px; } }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Welcome to Grant Funds! 🎉</h1>
                  <p>Your AI-Powered Grant Management Platform</p>
              </div>
              <div class="content">
                  <h2>Hello ${name},</h2>
                  <p>Thank you for registering with <strong>Grant Funds</strong>! We're excited to help you streamline your grant management process.</p>
                  
                  <p>To get started and access your dashboard, please verify your email address:</p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                      <a href="${verificationUrl}" class="button">Verify Email Address</a>
                  </div>
                  
                  <p>Or copy and paste this link in your browser:</p>
                  <div class="code">${verificationUrl}</div>
                  
                  <p><strong>This link will expire in 24 hours</strong> for security purposes.</p>
                  
                  <div class="feature">
                      <strong>🚀 What's waiting for you?</strong>
                      <ul style="margin: 10px 0; padding-left: 20px;">
                          <li>AI-powered grant writing assistance</li>
                          <li>Client and grant management tools</li>
                          <li>Professional email templates</li>
                          <li>Funding opportunity tracking</li>
                      </ul>
                  </div>
                  
                  <p>If you have any questions, simply reply to this email - we're here to help!</p>
                  
                  <p>Best regards,<br><strong>The Grant Funds Team</strong></p>
              </div>
              <div class="footer">
                  <p>If you didn't create an account with Grant Funds, please ignore this email.</p>
                  <p>&copy; ${new Date().getFullYear()} Grant Funds. All rights reserved.</p>
                  <p><a href="${this.frontendUrl}" style="color: #1a472a;">Visit Our Website</a></p>
              </div>
          </div>
      </body>
      </html>
    `;
  }

  getWelcomeEmailTemplate(name) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Grant Funds!</title>
          <style>
              body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
              .container { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #1a472a, #2d5a3d); color: white; padding: 40px 30px; text-align: center; }
              .content { padding: 40px 30px; }
              .button { display: inline-block; background: #1a472a; color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; padding: 20px; background: #f5f5f5; }
              .feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 25px 0; }
              .feature { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #e9ecef; }
              .feature-icon { font-size: 24px; margin-bottom: 10px; }
              @media (max-width: 600px) { 
                  .content { padding: 20px; } 
                  .header { padding: 30px 20px; } 
                  .feature-grid { grid-template-columns: 1fr; }
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Email Verified Successfully! ✅</h1>
                  <p>Welcome to the Grant Funds family!</p>
              </div>
              <div class="content">
                  <h2>Welcome aboard, ${name}! 🎉</h2>
                  <p>Your email has been verified and your Grant Funds account is now fully activated!</p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                      <a href="${this.frontendUrl}/dashboard" class="button">Launch Your Dashboard</a>
                  </div>
                  
                  <div class="feature-grid">
                      <div class="feature">
                          <div class="feature-icon">🤖</div>
                          <strong>AI Writing Assistant</strong>
                          <p style="font-size: 14px; margin: 10px 0 0 0;">Get AI-powered help with proposals and content</p>
                      </div>
                      <div class="feature">
                          <div class="feature-icon">👥</div>
                          <strong>Client Management</strong>
                          <p style="font-size: 14px; margin: 10px 0 0 0;">Organize all client information in one place</p>
                      </div>
                      <div class="feature">
                          <div class="feature-icon">📧</div>
                          <strong>Email Templates</strong>
                          <p style="font-size: 14px; margin: 10px 0 0 0;">Professional templates for grant communications</p>
                      </div>
                      <div class="feature">
                          <div class="feature-icon">💼</div>
                          <strong>Grant Sources</strong>
                          <p style="font-size: 14px; margin: 10px 0 0 0;">Discover and track funding opportunities</p>
                      </div>
                  </div>
                  
                  <p><strong>Need help getting started?</strong></p>
                  <ul style="margin: 15px 0; padding-left: 20px;">
                      <li>Check out our <a href="${this.frontendUrl}/guides" style="color: #1a472a;">getting started guide</a></li>
                      <li>Watch our <a href="${this.frontendUrl}/tutorials" style="color: #1a472a;">video tutorials</a></li>
                      <li>Contact our <a href="mailto:support@grantfunds.com" style="color: #1a472a;">support team</a></li>
                  </ul>
                  
                  <p>We're excited to see the impact you'll make!</p>
                  
                  <p>Happy grant writing!<br><strong>The Grant Funds Team</strong></p>
              </div>
              <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} Grant Funds. All rights reserved.</p>
                  <p><a href="${this.frontendUrl}" style="color: #1a472a;">Visit Website</a> • <a href="${this.frontendUrl}/support" style="color: #1a472a;">Get Help</a></p>
              </div>
          </div>
      </body>
      </html>
    `;
  }

  getPasswordResetTemplate(name, resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
              body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
              .container { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 40px 30px; text-align: center; }
              .content { padding: 40px 30px; }
              .button { display: inline-block; background: #dc2626; color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; padding: 20px; background: #f5f5f5; }
              .code { background: #f8f9fa; padding: 15px; border-radius: 5px; font-family: 'Courier New', monospace; margin: 15px 0; border-left: 4px solid #dc2626; }
              @media (max-width: 600px) { .content { padding: 20px; } .header { padding: 30px 20px; } }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Password Reset Request</h1>
                  <p>Grant Funds Account Security</p>
              </div>
              <div class="content">
                  <h2>Hello ${name},</h2>
                  <p>We received a request to reset your password for your Grant Funds account.</p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                      <a href="${resetUrl}" class="button">Reset Your Password</a>
                  </div>
                  
                  <p>Or copy and paste this link in your browser:</p>
                  <div class="code">${resetUrl}</div>
                  
                  <p><strong>This link will expire in 1 hour</strong> for security reasons.</p>
                  
                  <p><strong>Didn't request this change?</strong><br>
                  If you didn't request a password reset, please ignore this email. Your account remains secure.</p>
                  
                  <p>Best regards,<br><strong>The Grant Funds Team</strong></p>
              </div>
              <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} Grant Funds. All rights reserved.</p>
                  <p><a href="${this.frontendUrl}" style="color: #1a472a;">Visit Our Website</a></p>
              </div>
          </div>
      </body>
      </html>
    `;
  }

  getApprovalEmailTemplate(name) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Approved</title>
          <style>
              body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
              .container { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 40px 30px; text-align: center; }
              .content { padding: 40px 30px; }
              .button { display: inline-block; background: #059669; color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; padding: 20px; background: #f5f5f5; }
              @media (max-width: 600px) { .content { padding: 20px; } .header { padding: 30px 20px; } }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Account Approved! ✅</h1>
                  <p>You're ready to get started</p>
              </div>
              <div class="content">
                  <h2>Great news, ${name}!</h2>
                  <p>Your Grant Funds account has been approved and is now fully active!</p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                      <a href="${this.frontendUrl}/dashboard" class="button">Access Your Dashboard</a>
                  </div>
                  
                  <p>You now have full access to all Grant Funds features:</p>
                  <ul style="margin: 15px 0; padding-left: 20px;">
                      <li>AI-powered grant writing tools</li>
                      <li>Client management system</li>
                      <li>Grant tracking and matching</li>
                      <li>Professional communication templates</li>
                      <li>And much more!</li>
                  </ul>
                  
                  <p>If you have any questions or need assistance getting started, don't hesitate to reach out to our support team.</p>
                  
                  <p>Welcome aboard!<br><strong>The Grant Funds Team</strong></p>
              </div>
              <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} Grant Funds. All rights reserved.</p>
                  <p><a href="${this.frontendUrl}" style="color: #1a472a;">Visit Website</a></p>
              </div>
          </div>
      </body>
      </html>
    `;
  }

  getNotificationTemplate(name, content, subject) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
              body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
              .container { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #1a472a, #2d5a3d); color: white; padding: 30px; text-align: center; }
              .content { padding: 40px 30px; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; padding: 20px; background: #f5f5f5; }
              @media (max-width: 600px) { .content { padding: 20px; } .header { padding: 20px; } }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>${subject}</h1>
              </div>
              <div class="content">
                  <h2>Hello ${name},</h2>
                  ${content}
                  <p>Best regards,<br><strong>The Grant Funds Team</strong></p>
              </div>
              <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} Grant Funds. All rights reserved.</p>
                  <p><a href="${this.frontendUrl}" style="color: #1a472a;">Visit Our Website</a></p>
              </div>
          </div>
      </body>
      </html>
    `;
  }

  /**
   * Log email events for analytics and debugging
   */
  async logEmailEvent(eventType, userId, emailId = null, error = null) {
    try {
      const logEntry = {
        eventType,
        userId,
        emailId,
        timestamp: new Date(),
        success: !error,
        ...(error && { error })
      };

      // In a production environment, you might want to store this in a database
      console.log('📧 Email Event:', logEntry);

      return true;
    } catch (logError) {
      console.error('❌ Error logging email event:', logError);
      return false;
    }
  }
}

module.exports = new EmailService();