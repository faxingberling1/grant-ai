// Frontend email service - for making API calls to backend
class FrontendEmailService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  }

  /**
   * Send verification email via backend API
   */
  async sendVerificationEmail(userId) {
    try {
      const response = await fetch(`${this.baseURL}/auth/send-verification-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send verification email');
      }

      return data;
    } catch (error) {
      console.error('❌ Error sending verification email:', error);
      throw error;
    }
  }

  /**
   * Send password reset email via backend API
   */
  async sendPasswordResetEmail(email) {
    try {
      const response = await fetch(`${this.baseURL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send password reset email');
      }

      return data;
    } catch (error) {
      console.error('❌ Error sending password reset email:', error);
      throw error;
    }
  }

  /**
   * Verify email service configuration
   */
  async verifyConfiguration() {
    try {
      const response = await fetch(`${this.baseURL}/email/verify-config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify email configuration');
      }

      return data;
    } catch (error) {
      console.error('❌ Error verifying email configuration:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new FrontendEmailService();