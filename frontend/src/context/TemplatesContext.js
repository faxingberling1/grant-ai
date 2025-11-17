import React, { createContext, useContext, useState, useEffect } from 'react';
import { templateService } from '../services/templateService';

const TemplatesContext = createContext();

export const useTemplates = () => {
  const context = useContext(TemplatesContext);
  if (!context) {
    throw new Error('useTemplates must be used within a TemplatesProvider');
  }
  return context;
};

export const TemplatesProvider = ({ children }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load templates from MongoDB on component mount
  useEffect(() => {
    console.log('🔄 TemplatesProvider mounted, loading templates...');
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📥 Calling templateService.getTemplates()...');
      
      const response = await templateService.getTemplates();
      console.log('✅ templateService.getTemplates() response:', response);
      
      if (response.success) {
        console.log(`✅ Loaded ${response.data?.length || 0} templates`);
        setTemplates(response.data || []);
      } else {
        console.error('❌ API returned success: false', response);
        throw new Error(response.message || 'Failed to load templates');
      }
    } catch (err) {
      console.error('❌ Error loading templates from MongoDB:', err);
      console.error('❌ Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url
      });
      
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load templates from server';
      setError(errorMessage);
      
      // Fallback to localStorage if MongoDB fails
      const savedTemplates = localStorage.getItem('grantflow_email_templates');
      if (savedTemplates) {
        console.log('🔄 Falling back to localStorage templates');
        const parsedTemplates = JSON.parse(savedTemplates);
        setTemplates(parsedTemplates);
        console.log(`✅ Loaded ${parsedTemplates.length} templates from localStorage`);
      } else {
        console.log('ℹ️  No localStorage templates found');
        // Initialize with empty array if no templates exist
        setTemplates([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const addTemplate = async (newTemplate) => {
    try {
      setError(null);
      console.log('📝 Creating new template:', newTemplate.title);
      
      const response = await templateService.createTemplate(newTemplate);
      
      if (response.success) {
        const savedTemplate = response.data;
        console.log('✅ Template created successfully:', savedTemplate.title);
        
        setTemplates(prev => [savedTemplate, ...prev]);
        
        // Update localStorage as backup
        const updatedTemplates = [savedTemplate, ...templates];
        localStorage.setItem('grantflow_email_templates', JSON.stringify(updatedTemplates));
        
        return savedTemplate;
      } else {
        throw new Error(response.message || 'Failed to create template');
      }
    } catch (err) {
      console.error('❌ Error creating template:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create template';
      setError(errorMessage);
      throw err;
    }
  };

  const updateTemplate = async (id, updatedTemplate) => {
    try {
      setError(null);
      console.log('📝 Updating template:', id);
      
      const response = await templateService.updateTemplate(id, updatedTemplate);
      
      if (response.success) {
        const savedTemplate = response.data;
        console.log('✅ Template updated successfully:', savedTemplate.title);
        
        setTemplates(prev => prev.map(template => 
          template._id === id ? savedTemplate : template
        ));
        
        // Update localStorage as backup
        const updatedTemplates = templates.map(t => t._id === id ? savedTemplate : t);
        localStorage.setItem('grantflow_email_templates', JSON.stringify(updatedTemplates));
        
        return savedTemplate;
      } else {
        throw new Error(response.message || 'Failed to update template');
      }
    } catch (err) {
      console.error('❌ Error updating template:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update template';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteTemplate = async (id) => {
    try {
      setError(null);
      console.log('🗑️ Deleting template:', id);
      
      const response = await templateService.deleteTemplate(id);
      
      if (response.success) {
        console.log('✅ Template deleted successfully');
        
        setTemplates(prev => prev.filter(template => template._id !== id));
        
        // Update localStorage as backup
        const updatedTemplates = templates.filter(template => template._id !== id);
        localStorage.setItem('grantflow_email_templates', JSON.stringify(updatedTemplates));
        
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete template');
      }
    } catch (err) {
      console.error('❌ Error deleting template:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete template';
      setError(errorMessage);
      throw err;
    }
  };

  const incrementUsage = async (id) => {
    try {
      console.log('📈 Incrementing usage for template:', id);
      
      const response = await templateService.incrementUsage(id);
      
      if (response.success) {
        const updatedTemplate = response.data;
        console.log('✅ Usage incremented for:', updatedTemplate.title);
        
        setTemplates(prev => prev.map(template => 
          template._id === id ? updatedTemplate : template
        ));
        
        // Update localStorage as backup
        const updatedTemplates = templates.map(t => t._id === id ? updatedTemplate : t);
        localStorage.setItem('grantflow_email_templates', JSON.stringify(updatedTemplates));
        
        return updatedTemplate;
      } else {
        throw new Error(response.message || 'Failed to update usage');
      }
    } catch (err) {
      console.error('❌ Error incrementing usage:', err);
      // Fallback to local update if API fails
      console.log('🔄 Falling back to local usage increment');
      setTemplates(prev => prev.map(template => 
        template._id === id 
          ? { 
              ...template, 
              usageCount: (template.usageCount || 0) + 1,
              lastUsed: new Date()
            } 
          : template
      ));
    }
  };

  const getCategoryIcon = (category) => {
    const categoryMap = {
      proposal: 'fas fa-handshake',
      followup: 'fas fa-sync',
      meeting: 'fas fa-calendar',
      thankyou: 'fas fa-heart',
      reminder: 'fas fa-bell'
    };
    return categoryMap[category] || 'fas fa-file-alt';
  };

  const extractVariables = (content) => {
    const variableRegex = /\[(.*?)\]/g;
    const matches = content.match(variableRegex);
    return matches ? [...new Set(matches)] : ['[Client Name]', '[Your Name]'];
  };

  const formatLastUsed = (date) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const lastUsedDate = new Date(date);
    const diffTime = Math.abs(now - lastUsedDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return lastUsedDate.toLocaleDateString();
  };

  // Format templates for display (add formatted lastUsed and ensure required fields)
  const formattedTemplates = templates.map(template => ({
    ...template,
    id: template._id || template.id, // Support both _id and id
    lastUsed: formatLastUsed(template.lastUsed),
    icon: template.icon || getCategoryIcon(template.category),
    preview: template.preview || (template.content ? template.content.substring(0, 100) + '...' : ''),
    variables: template.variables || extractVariables((template.content || '') + ' ' + (template.subject || ''))
  }));

  const value = {
    templates: formattedTemplates,
    loading,
    error,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    incrementUsage,
    refetchTemplates: loadTemplates,
    clearError: () => setError(null)
  };

  return (
    <TemplatesContext.Provider value={value}>
      {children}
    </TemplatesContext.Provider>
  );
};