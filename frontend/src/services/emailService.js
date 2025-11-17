import api from './api';

const emailService = {
  // Send email
  sendEmail: async (emailData) => {
    try {
      const response = await api.post('/api/email/send', emailData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send email');
    }
  },

  // Test SMTP configuration
  testSMTP: async (smtpConfig) => {
    try {
      const response = await api.post('/api/email/test-smtp', { smtpConfig });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'SMTP test failed');
    }
  },

  // Get email templates
  getTemplates: async () => {
    try {
      const response = await api.get('/api/email/templates');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch templates');
    }
  },

  // Save email template
  saveTemplate: async (template) => {
    try {
      const response = await api.post('/api/email/templates', template);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to save template');
    }
  },

  // Delete email template
  deleteTemplate: async (templateId) => {
    try {
      const response = await api.delete(`/api/email/templates/${templateId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete template');
    }
  },

  // Get email statistics
  getEmailStats: async () => {
    try {
      const response = await api.get('/api/email/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch email statistics');
    }
  },

  // Send bulk email
  sendBulkEmail: async (bulkEmailData) => {
    try {
      const response = await api.post('/api/email/bulk-send', bulkEmailData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send bulk email');
    }
  },

  // Mock function for demo purposes (when backend is not ready)
  mockTestSMTP: async (smtpConfig) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Validate required fields
    if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.pass) {
      throw new Error('Missing required SMTP configuration fields');
    }

    // Simulate different test scenarios
    const testScenarios = {
      'smtp.gmail.com': { success: true, message: 'Successfully connected to Gmail SMTP server!' },
      'smtp.office365.com': { success: true, message: 'Successfully connected to Outlook SMTP server!' },
      'smtp.sendgrid.net': { success: true, message: 'Successfully connected to SendGrid SMTP server!' },
      'smtp.mailgun.org': { success: true, message: 'Successfully connected to Mailgun SMTP server!' }
    };

    const result = testScenarios[smtpConfig.host] || { 
      success: true, 
      message: 'Successfully connected to SMTP server!' 
    };

    return result;
  },

  // Mock send email for demo
  mockSendEmail: async (emailData) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      message: 'Email sent successfully!',
      messageId: `mock-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  }
};

export default emailService;