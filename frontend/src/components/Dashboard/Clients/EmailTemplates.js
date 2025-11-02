import React, { useState } from 'react';
import './EmailTemplates.css';

const EmailTemplates = ({ onBack, onUseTemplate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  const categories = [
    { id: 'all', label: 'All Templates', icon: 'fas fa-layer-group' },
    { id: 'followup', label: 'Follow-ups', icon: 'fas fa-sync' },
    { id: 'proposal', label: 'Grant Proposals', icon: 'fas fa-handshake' },
    { id: 'meeting', label: 'Meeting Requests', icon: 'fas fa-calendar' },
    { id: 'thankyou', label: 'Thank You Notes', icon: 'fas fa-heart' },
    { id: 'reminder', label: 'Reminders', icon: 'fas fa-bell' }
  ];

  const templates = [
    {
      id: 1,
      title: 'Initial Grant Inquiry',
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
      category: 'followup',
      description: 'Follow up on submitted grant proposal',
      preview: 'Dear [Client Name], I wanted to follow up on the grant proposal we submitted on [Date]. Please let me know if you need any additional information...',
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
      category: 'meeting',
      description: 'Request a meeting to discuss grant strategy',
      preview: 'Dear [Client Name], I would like to schedule a meeting to discuss your grant strategy and upcoming opportunities...',
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
    }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handlePreviewTemplate = (template) => {
    setSelectedTemplate(template);
    setEditedContent(template.fullContent);
    setIsPreviewOpen(true);
    setIsEditing(false);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setSelectedTemplate(null);
    setIsEditing(false);
  };

  const handleEditTemplate = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    // In a real app, you would save the edited content to your backend
    const updatedTemplate = {
      ...selectedTemplate,
      fullContent: editedContent
    };
    setSelectedTemplate(updatedTemplate);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(selectedTemplate.fullContent);
    setIsEditing(false);
  };

  const handleUseTemplate = () => {
    onUseTemplate(selectedTemplate);
    setIsPreviewOpen(false);
  };

  return (
    <div className="clients-email-templates">
      {/* Header */}
      <div className="clients-templates-header">
        <div className="clients-templates-header-content">
          <div className="clients-templates-title">
            <h1>Email Templates</h1>
            <p>Pre-built templates for efficient client communication</p>
          </div>
          <div className="clients-templates-actions">
            <button className="clients-templates-back-btn" onClick={onBack}>
              <i className="fas fa-arrow-left"></i>
              Back to Clients
            </button>
            <button className="clients-btn clients-btn-primary">
              <i className="fas fa-plus"></i>
              New Template
            </button>
          </div>
        </div>
      </div>

      {/* Categories Navigation */}
      <div className="clients-templates-categories">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`clients-template-category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => handleCategoryClick(cat.id)}
          >
            <i className={cat.icon}></i>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="clients-templates-toolbar">
        <div className="clients-templates-search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search templates by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="clients-templates-filters">
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="clients-templates-filter-select"
          >
            <option value="all">All Categories</option>
            <option value="proposal">Grant Proposals</option>
            <option value="followup">Follow-ups</option>
            <option value="meeting">Meeting Requests</option>
            <option value="thankyou">Thank You Notes</option>
            <option value="reminder">Reminders</option>
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="clients-templates-grid">
        {filteredTemplates.map(template => (
          <div key={template.id} className="clients-template-card">
            <div className="clients-template-icon">
              <i className={template.icon}></i>
            </div>
            
            <div className="clients-template-category">
              <i className="fas fa-tag"></i>
              {categories.find(cat => cat.id === template.category)?.label}
            </div>
            
            <div className="clients-template-title">{template.title}</div>
            <div className="clients-template-description">{template.description}</div>
            
            <div className="clients-template-stats">
              <div className="clients-template-stat">
                <i className="fas fa-chart-line"></i>
                Used {template.usageCount} times
              </div>
              <div className="clients-template-stat">
                <i className="fas fa-clock"></i>
                {template.lastUsed}
              </div>
            </div>
            
            <div className="clients-template-preview">
              <div className="clients-template-preview-text">{template.preview}</div>
            </div>
            
            <div className="clients-template-actions">
              <button 
                className="clients-template-preview-btn"
                onClick={() => handlePreviewTemplate(template)}
              >
                <i className="fas fa-eye"></i>
                Preview
              </button>
              <button 
                className="clients-template-use-btn"
                onClick={() => onUseTemplate(template)}
              >
                <i className="fas fa-envelope"></i>
                Use Template
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="clients-no-templates">
          <div className="clients-templates-empty-state">
            <i className="fas fa-envelope-open-text"></i>
            <h3>No templates found</h3>
            <p>Try adjusting your search criteria or create a new template</p>
            <button className="clients-btn clients-btn-primary">
              <i className="fas fa-plus"></i>
              Create New Template
            </button>
          </div>
        </div>
      )}

      {/* Template Preview Modal */}
      {isPreviewOpen && selectedTemplate && (
        <div className="clients-template-preview-modal">
          <div className="clients-template-preview-container">
            <div className="clients-template-preview-header">
              <h3>{selectedTemplate.title}</h3>
              <button className="clients-template-preview-close" onClick={handleClosePreview}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="clients-template-preview-content">
              <div className="clients-template-variables">
                <h4>Available Variables</h4>
                <div className="clients-template-variables-list">
                  {selectedTemplate.variables.map((variable, index) => (
                    <span key={index} className="clients-template-variable">
                      {variable}
                    </span>
                  ))}
                </div>
              </div>

              {isEditing ? (
                <div className="clients-template-editor">
                  <div className="clients-template-editor-header">
                    <div className="clients-template-editor-title">Edit Template</div>
                  </div>
                  <div className="clients-template-editor-content">
                    <textarea
                      className="clients-template-editor-textarea"
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      placeholder="Enter your email template content..."
                    />
                  </div>
                </div>
              ) : (
                <div className="clients-template-full-preview">
                  {selectedTemplate.fullContent}
                </div>
              )}

              <div className="clients-template-preview-actions">
                {isEditing ? (
                  <>
                    <button className="clients-template-preview-btn" onClick={handleCancelEdit}>
                      <i className="fas fa-times"></i>
                      Cancel
                    </button>
                    <button className="clients-template-edit-btn" onClick={handleSaveEdit}>
                      <i className="fas fa-save"></i>
                      Save Changes
                    </button>
                  </>
                ) : (
                  <>
                    <button className="clients-template-preview-btn" onClick={handleEditTemplate}>
                      <i className="fas fa-edit"></i>
                      Edit Template
                    </button>
                    <button className="clients-template-draft-btn" onClick={handleUseTemplate}>
                      <i className="fas fa-envelope"></i>
                      Use This Template
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplates;