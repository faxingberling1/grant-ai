// src/services/templateService.js - PRODUCTION VERSION
import ApiService from './api';

export const templateService = {
  getTemplates: async () => {
    try {
      console.log('📥 templateService.getTemplates() called');
      const response = await ApiService.request('/api/templates');
      console.log('✅ templateService.getTemplates() response:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching templates:', error);
      throw error;
    }
  },

  getTemplate: async (id) => {
    try {
      const response = await ApiService.request(`/api/templates/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching template:', error);
      throw error;
    }
  },

  createTemplate: async (templateData) => {
    try {
      const response = await ApiService.request('/api/templates', {
        method: 'POST',
        body: JSON.stringify(templateData),
      });
      return response;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },

  updateTemplate: async (id, templateData) => {
    try {
      const response = await ApiService.request(`/api/templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(templateData),
      });
      return response;
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  },

  deleteTemplate: async (id) => {
    try {
      const response = await ApiService.request(`/api/templates/${id}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  },

  incrementUsage: async (id) => {
    try {
      const response = await ApiService.request(`/api/templates/${id}/usage`, {
        method: 'PATCH',
      });
      return response;
    } catch (error) {
      console.error('Error incrementing usage:', error);
      throw error;
    }
  }
};