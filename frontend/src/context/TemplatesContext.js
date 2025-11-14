import React, { createContext, useContext, useState, useEffect } from 'react';

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

  // Load templates from localStorage on component mount
  useEffect(() => {
    const savedTemplates = localStorage.getItem('grantflow_email_templates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    } else {
      // Initialize with default templates if none exist
      const defaultTemplates = [
        {
          id: 1,
          title: 'Initial Grant Inquiry',
          subject: 'Grant Opportunity Inquiry - [Client Name]',
          category: 'proposal',
          description: 'Template for initial contact about grant opportunities',
          preview: 'Dear [Client Name], I hope this email finds you well. I am writing to inquire about potential grant opportunities...',
          fullContent: `Dear [Client Name],

I hope this email finds you well. I am writing to inquire about potential grant opportunities that may be available for your organization.

Based on your work in [Field/Area], I believe there are several funding opportunities that could be a great fit. I would be happy to discuss:

• Current grant opportunities that align with your mission
• Application timelines and requirements
• How we can collaborate to strengthen your proposals

Please let me know if you would be available for a brief call next week to explore these possibilities further.

Best regards,
[Your Name]`,
          icon: 'fas fa-handshake',
          usageCount: 45,
          lastUsed: '2 days ago',
          variables: ['[Client Name]', '[Field/Area]', '[Your Name]']
        },
        {
          id: 2,
          title: 'Proposal Follow-up',
          subject: 'Follow-up: [Grant Name] Proposal Submission',
          category: 'followup',
          description: 'Follow up on submitted grant proposal',
          preview: 'Dear [Client Name], I wanted to follow up on the grant proposal we submitted on [Date]...',
          fullContent: `Dear [Client Name],

I wanted to follow up on the grant proposal we submitted on [Date] for the [Grant Name] opportunity.

I've been monitoring the application status and wanted to check if you have received any updates or if there are any additional materials needed from our end.

If you have any questions or would like to discuss next steps, please don't hesitate to reach out.

Thank you for your partnership in this important work.

Best regards,
[Your Name]`,
          icon: 'fas fa-sync',
          usageCount: 32,
          lastUsed: '1 week ago',
          variables: ['[Client Name]', '[Date]', '[Grant Name]', '[Your Name]']
        },
        {
          id: 3,
          title: 'Meeting Request',
          subject: 'Grant Strategy Meeting Request',
          category: 'meeting',
          description: 'Request a meeting to discuss grant strategy',
          preview: 'Dear [Client Name], I would like to schedule a meeting to discuss your grant strategy...',
          fullContent: `Dear [Client Name],

I would like to schedule a meeting to discuss your grant strategy and explore upcoming funding opportunities that could support your important work.

During our meeting, we could cover:

• Review of current grant pipeline
• Upcoming deadlines and opportunities
• Strategy for maximizing funding success
• Any specific challenges or questions you may have

Please let me know what time works best for you next week. I am available [Available Times].

Looking forward to our conversation.

Best regards,
[Your Name]`,
          icon: 'fas fa-calendar',
          usageCount: 28,
          lastUsed: '3 days ago',
          variables: ['[Client Name]', '[Available Times]', '[Your Name]']
        },
        {
          id: 4,
          title: 'Thank You Note',
          subject: 'Thank You - [Topic] Discussion',
          category: 'thankyou',
          description: 'Express gratitude after a meeting or collaboration',
          preview: 'Dear [Client Name], Thank you for your time today. I truly enjoyed our conversation about [Topic]...',
          fullContent: `Dear [Client Name],

Thank you for your time today. I truly enjoyed our conversation about [Topic] and am excited about the potential opportunities we discussed.

I appreciate you sharing insights about [Specific Point] and look forward to exploring how we can work together to achieve your funding goals.

Please don't hesitate to reach out if you have any additional questions in the meantime.

Warm regards,
[Your Name]`,
          icon: 'fas fa-heart',
          usageCount: 22,
          lastUsed: '5 days ago',
          variables: ['[Client Name]', '[Topic]', '[Specific Point]', '[Your Name]']
        },
        {
          id: 5,
          title: 'Deadline Reminder',
          subject: 'Reminder: [Grant Name] Deadline - [Date]',
          category: 'reminder',
          description: 'Remind clients about upcoming grant deadlines',
          preview: 'Dear [Client Name], This is a friendly reminder about the upcoming deadline for [Grant Name] on [Date]...',
          fullContent: `Dear [Client Name],

This is a friendly reminder about the upcoming deadline for [Grant Name] on [Date].

To ensure we have enough time to prepare a strong application, please make sure to:

• Review the attached materials by [Review Date]
• Provide any necessary documents by [Document Deadline]
• Schedule a final review session if needed

The deadline is approaching quickly, so let's make sure we're on track. Please let me know if you have any questions or need assistance with any part of the process.

Best regards,
[Your Name]`,
          icon: 'fas fa-bell',
          usageCount: 18,
          lastUsed: '1 day ago',
          variables: ['[Client Name]', '[Grant Name]', '[Date]', '[Review Date]', '[Document Deadline]', '[Your Name]']
        }
      ];
      setTemplates(defaultTemplates);
    }
  }, []);

  // Save templates to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('grantflow_email_templates', JSON.stringify(templates));
  }, [templates]);

  const addTemplate = (newTemplate) => {
    const template = {
      ...newTemplate,
      id: Date.now(), // Simple ID generation
      usageCount: 0,
      lastUsed: 'Never',
      icon: getCategoryIcon(newTemplate.category),
      preview: newTemplate.content.substring(0, 100) + '...',
      variables: extractVariables(newTemplate.content + ' ' + newTemplate.subject)
    };
    setTemplates(prev => [template, ...prev]);
    return template;
  };

  const updateTemplate = (id, updatedTemplate) => {
    setTemplates(prev => prev.map(template => 
      template.id === id 
        ? { 
            ...template, 
            ...updatedTemplate,
            preview: updatedTemplate.fullContent ? updatedTemplate.fullContent.substring(0, 100) + '...' : template.preview,
            variables: updatedTemplate.fullContent ? extractVariables(updatedTemplate.fullContent + ' ' + (updatedTemplate.subject || template.subject)) : template.variables
          } 
        : template
    ));
  };

  const deleteTemplate = (id) => {
    setTemplates(prev => prev.filter(template => template.id !== id));
  };

  const incrementUsage = (id) => {
    setTemplates(prev => prev.map(template => 
      template.id === id 
        ? { 
            ...template, 
            usageCount: template.usageCount + 1,
            lastUsed: 'Just now'
          } 
        : template
    ));
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

  const value = {
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    incrementUsage
  };

  return (
    <TemplatesContext.Provider value={value}>
      {children}
    </TemplatesContext.Provider>
  );
};