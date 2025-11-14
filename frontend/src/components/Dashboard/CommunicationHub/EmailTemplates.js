import React, { useState } from 'react';
import { useTemplates } from '../../../context/TemplatesContext';
import './EmailTemplates.css';

const EmailTemplates = ({ onBack, onUseTemplate, activeSection, onSectionChange }) => {
  const { templates, addTemplate, updateTemplate, deleteTemplate, incrementUsage } = useTemplates();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [editedSubject, setEditedSubject] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedCategory, setEditedCategory] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [newTemplate, setNewTemplate] = useState({
    title: '',
    subject: '',
    category: 'proposal',
    description: '',
    content: '',
    variables: ['[Client Name]', '[Your Name]']
  });

  const categories = [
    { id: 'all', label: 'All Templates', icon: 'fas fa-layer-group' },
    { id: 'followup', label: 'Follow-ups', icon: 'fas fa-sync' },
    { id: 'proposal', label: 'Grant Proposals', icon: 'fas fa-handshake' },
    { id: 'meeting', label: 'Meeting Requests', icon: 'fas fa-calendar' },
    { id: 'thankyou', label: 'Thank You Notes', icon: 'fas fa-heart' },
    { id: 'reminder', label: 'Reminders', icon: 'fas fa-bell' }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handlePreviewTemplate = (template) => {
    setSelectedTemplate(template);
    setEditedContent(template.fullContent);
    setEditedSubject(template.subject);
    setEditedTitle(template.title);
    setEditedDescription(template.description);
    setEditedCategory(template.category);
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
    if (selectedTemplate) {
      updateTemplate(selectedTemplate.id, {
        title: editedTitle,
        subject: editedSubject,
        description: editedDescription,
        category: editedCategory,
        fullContent: editedContent,
        variables: extractVariables(editedContent),
        preview: editedContent.substring(0, 100) + '...'
      });
      setIsEditing(false);
      // Update the selected template with new data
      setSelectedTemplate({
        ...selectedTemplate,
        title: editedTitle,
        subject: editedSubject,
        description: editedDescription,
        category: editedCategory,
        fullContent: editedContent,
        variables: extractVariables(editedContent),
        preview: editedContent.substring(0, 100) + '...'
      });
    }
  };

  const handleCancelEdit = () => {
    if (selectedTemplate) {
      setEditedContent(selectedTemplate.fullContent);
      setEditedSubject(selectedTemplate.subject);
      setEditedTitle(selectedTemplate.title);
      setEditedDescription(selectedTemplate.description);
      setEditedCategory(selectedTemplate.category);
    }
    setIsEditing(false);
  };

  const handleUseTemplate = (template) => {
    incrementUsage(template.id);
    if (onUseTemplate) {
      onUseTemplate(template);
    }
    setIsPreviewOpen(false);
  };

  const handleDeleteTemplate = (template) => {
    setTemplateToDelete(template);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (templateToDelete) {
      deleteTemplate(templateToDelete.id);
      setIsDeleteModalOpen(false);
      setTemplateToDelete(null);
      if (isPreviewOpen && selectedTemplate?.id === templateToDelete.id) {
        handleClosePreview();
      }
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setTemplateToDelete(null);
  };

  const handleCreateNewTemplate = () => {
    setIsCreateModalOpen(true);
    setNewTemplate({
      title: '',
      subject: '',
      category: 'proposal',
      description: '',
      content: '',
      variables: ['[Client Name]', '[Your Name]']
    });
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setNewTemplate({
      title: '',
      subject: '',
      category: 'proposal',
      description: '',
      content: '',
      variables: ['[Client Name]', '[Your Name]']
    });
  };

  const handleSaveNewTemplate = () => {
    if (!newTemplate.title.trim() || !newTemplate.subject.trim() || !newTemplate.content.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const templateData = {
      ...newTemplate,
      variables: extractVariables(newTemplate.content),
      fullContent: newTemplate.content,
      usageCount: 0,
      lastUsed: 'Never',
      icon: getCategoryIcon(newTemplate.category),
      preview: newTemplate.content.substring(0, 100) + '...'
    };

    addTemplate(templateData);
    setIsCreateModalOpen(false);
    setNewTemplate({
      title: '',
      subject: '',
      category: 'proposal',
      description: '',
      content: '',
      variables: ['[Client Name]', '[Your Name]']
    });

    alert('Template created successfully!');
  };

  const handleNewTemplateChange = (field, value) => {
    setNewTemplate(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getCategoryIcon = (category) => {
    const categoryMap = {
      proposal: 'fas fa-handshake',
      followup: 'fas fa-sync',
      meeting: 'fas fa-calendar',
      thankyou: 'fas fa-heart',
      reminder: 'fas fa-bell'
    };
    return categoryMap[category] || 'fas fa-envelope';
  };

  const commonVariables = [
    '[Client Name]',
    '[Your Name]',
    '[Company Name]',
    '[Grant Name]',
    '[Date]',
    '[Amount]',
    '[Deadline]',
    '[Project Name]',
    '[Organization]',
    '[Field/Area]',
    '[Available Times]',
    '[Topic]',
    '[Specific Point]',
    '[Review Date]',
    '[Document Deadline]'
  ];

  const extractVariables = (content) => {
    const variableRegex = /\[(.*?)\]/g;
    const matches = content.match(variableRegex);
    return matches ? [...new Set(matches)] : ['[Client Name]', '[Your Name]'];
  };

  const insertVariable = (variable, isNewTemplate = false) => {
    if (isNewTemplate) {
      const textarea = document.querySelector('.communication-hub-template-editor-textarea');
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent = newTemplate.content.substring(0, start) + variable + newTemplate.content.substring(end);
        handleNewTemplateChange('content', newContent);
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }
    } else {
      const textarea = document.querySelector('.communication-hub-template-editor-textarea');
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent = editedContent.substring(0, start) + variable + editedContent.substring(end);
        setEditedContent(newContent);
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }
    }
  };

  return (
    <div className="communication-hub-email-templates">
      {/* Header */}
      <div className="communication-hub-templates-header">
        <div className="communication-hub-templates-header-content">
          <div className="communication-hub-templates-title">
            <h1>Email Templates</h1>
            <p>Pre-built templates for efficient client communication</p>
          </div>
          <div className="communication-hub-templates-actions">
            <button 
              className="communication-hub-btn communication-hub-btn-primary"
              onClick={handleCreateNewTemplate}
            >
              <i className="fas fa-plus"></i>
              New Template
            </button>
          </div>
        </div>
      </div>

      {/* Categories Navigation */}
      <div className="communication-hub-templates-categories">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`communication-hub-template-category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => handleCategoryClick(cat.id)}
          >
            <i className={cat.icon}></i>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="communication-hub-templates-toolbar">
        <div className="communication-hub-templates-search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search templates by title, subject, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="communication-hub-templates-filters">
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="communication-hub-templates-filter-select"
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
      <div className="communication-hub-templates-grid">
        {filteredTemplates.map(template => (
          <div key={template.id} className="communication-hub-template-card">
            <div className="communication-hub-template-header">
              <div className="communication-hub-template-icon">
                <i className={template.icon}></i>
              </div>
              <div className="communication-hub-template-actions-menu">
                <button 
                  className="communication-hub-template-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreviewTemplate(template);
                  }}
                  title="Edit Template"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button 
                  className="communication-hub-template-action-btn communication-hub-template-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTemplate(template);
                  }}
                  title="Delete Template"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
            
            <div className="communication-hub-template-category">
              <i className="fas fa-tag"></i>
              {categories.find(cat => cat.id === template.category)?.label}
            </div>
            
            <div className="communication-hub-template-title">{template.title}</div>
            <div className="communication-hub-template-subject">{template.subject}</div>
            <div className="communication-hub-template-description">{template.description}</div>
            
            <div className="communication-hub-template-stats">
              <div className="communication-hub-template-stat">
                <i className="fas fa-chart-line"></i>
                Used {template.usageCount} times
              </div>
              <div className="communication-hub-template-stat">
                <i className="fas fa-clock"></i>
                {template.lastUsed}
              </div>
            </div>
            
            <div className="communication-hub-template-preview">
              <div className="communication-hub-template-preview-text">{template.preview}</div>
            </div>
            
            <div className="communication-hub-template-actions">
              <button 
                className="communication-hub-template-preview-btn"
                onClick={() => handlePreviewTemplate(template)}
              >
                <i className="fas fa-eye"></i>
                Preview
              </button>
              <button 
                className="communication-hub-template-use-btn"
                onClick={() => handleUseTemplate(template)}
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
        <div className="communication-hub-no-templates">
          <div className="communication-hub-templates-empty-state">
            <i className="fas fa-envelope-open-text"></i>
            <h3>No templates found</h3>
            <p>Try adjusting your search criteria or create a new template</p>
            <button 
              className="communication-hub-btn communication-hub-btn-primary"
              onClick={handleCreateNewTemplate}
            >
              <i className="fas fa-plus"></i>
              Create New Template
            </button>
          </div>
        </div>
      )}

      {/* Template Preview/Edit Modal */}
      {isPreviewOpen && selectedTemplate && (
        <div className="communication-hub-template-preview-modal">
          <div className="communication-hub-template-preview-container">
            <div className="communication-hub-template-preview-header">
              <h3>{isEditing ? 'Edit Template' : selectedTemplate.title}</h3>
              <button className="communication-hub-template-preview-close" onClick={handleClosePreview}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="communication-hub-template-preview-content">
              {isEditing ? (
                <>
                  <div className="communication-hub-template-form">
                    <div className="communication-hub-form-group">
                      <label>Template Title *</label>
                      <input
                        type="text"
                        className="communication-hub-form-input"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        placeholder="Enter template title..."
                      />
                    </div>

                    <div className="communication-hub-form-group">
                      <label>Email Subject *</label>
                      <input
                        type="text"
                        className="communication-hub-form-input"
                        value={editedSubject}
                        onChange={(e) => setEditedSubject(e.target.value)}
                        placeholder="Enter email subject..."
                      />
                    </div>

                    <div className="communication-hub-form-group">
                      <label>Category *</label>
                      <select
                        className="communication-hub-form-select"
                        value={editedCategory}
                        onChange={(e) => setEditedCategory(e.target.value)}
                      >
                        <option value="proposal">Grant Proposals</option>
                        <option value="followup">Follow-ups</option>
                        <option value="meeting">Meeting Requests</option>
                        <option value="thankyou">Thank You Notes</option>
                        <option value="reminder">Reminders</option>
                      </select>
                    </div>

                    <div className="communication-hub-form-group">
                      <label>Description</label>
                      <textarea
                        className="communication-hub-form-textarea"
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        placeholder="Enter template description..."
                        rows="3"
                      />
                    </div>

                    <div className="communication-hub-template-variables">
                      <h4>Available Variables</h4>
                      <p>Click to insert variables into your template</p>
                      <div className="communication-hub-template-variables-list">
                        {commonVariables.map((variable, index) => (
                          <span 
                            key={index} 
                            className="communication-hub-template-variable clickable"
                            onClick={() => insertVariable(variable, false)}
                          >
                            {variable}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="communication-hub-template-editor">
                      <div className="communication-hub-template-editor-header">
                        <div className="communication-hub-template-editor-title">Template Content *</div>
                      </div>
                      <div className="communication-hub-template-editor-content">
                        <textarea
                          className="communication-hub-template-editor-textarea"
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          placeholder="Enter your email template content..."
                          rows="12"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="communication-hub-template-info">
                    <div className="communication-hub-template-info-item">
                      <strong>Category:</strong> {categories.find(cat => cat.id === selectedTemplate.category)?.label}
                    </div>
                    <div className="communication-hub-template-info-item">
                      <strong>Subject:</strong> {selectedTemplate.subject}
                    </div>
                    {selectedTemplate.description && (
                      <div className="communication-hub-template-info-item">
                        <strong>Description:</strong> {selectedTemplate.description}
                      </div>
                    )}
                  </div>
                  
                  <div className="communication-hub-template-variables">
                    <h4>Available Variables</h4>
                    <div className="communication-hub-template-variables-list">
                      {selectedTemplate.variables.map((variable, index) => (
                        <span key={index} className="communication-hub-template-variable">
                          {variable}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="communication-hub-template-full-preview">
                    <div className="communication-hub-template-preview-header">
                      <h4>Template Content</h4>
                    </div>
                    <pre className="communication-hub-template-content-preview">{selectedTemplate.fullContent}</pre>
                  </div>
                </>
              )}

              <div className="communication-hub-template-preview-actions">
                {isEditing ? (
                  <>
                    <button className="communication-hub-template-preview-btn" onClick={handleCancelEdit}>
                      <i className="fas fa-times"></i>
                      Cancel
                    </button>
                    <button className="communication-hub-template-edit-btn" onClick={handleSaveEdit}>
                      <i className="fas fa-save"></i>
                      Save Changes
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      className="communication-hub-template-delete-btn"
                      onClick={() => handleDeleteTemplate(selectedTemplate)}
                    >
                      <i className="fas fa-trash"></i>
                      Delete
                    </button>
                    <button className="communication-hub-template-preview-btn" onClick={handleEditTemplate}>
                      <i className="fas fa-edit"></i>
                      Edit Template
                    </button>
                    <button className="communication-hub-template-draft-btn" onClick={() => handleUseTemplate(selectedTemplate)}>
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

      {/* Create New Template Modal */}
      {isCreateModalOpen && (
        <div className="communication-hub-template-preview-modal">
          <div className="communication-hub-template-preview-container" style={{ maxWidth: '800px' }}>
            <div className="communication-hub-template-preview-header">
              <h3>Create New Email Template</h3>
              <button className="communication-hub-template-preview-close" onClick={handleCloseCreateModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="communication-hub-template-preview-content">
              <div className="communication-hub-template-form">
                <div className="communication-hub-form-group">
                  <label>Template Title *</label>
                  <input
                    type="text"
                    className="communication-hub-form-input"
                    value={newTemplate.title}
                    onChange={(e) => handleNewTemplateChange('title', e.target.value)}
                    placeholder="Enter template title..."
                  />
                </div>

                <div className="communication-hub-form-group">
                  <label>Email Subject *</label>
                  <input
                    type="text"
                    className="communication-hub-form-input"
                    value={newTemplate.subject}
                    onChange={(e) => handleNewTemplateChange('subject', e.target.value)}
                    placeholder="Enter email subject..."
                  />
                </div>

                <div className="communication-hub-form-group">
                  <label>Category *</label>
                  <select
                    className="communication-hub-form-select"
                    value={newTemplate.category}
                    onChange={(e) => handleNewTemplateChange('category', e.target.value)}
                  >
                    <option value="proposal">Grant Proposals</option>
                    <option value="followup">Follow-ups</option>
                    <option value="meeting">Meeting Requests</option>
                    <option value="thankyou">Thank You Notes</option>
                    <option value="reminder">Reminders</option>
                  </select>
                </div>

                <div className="communication-hub-form-group">
                  <label>Description</label>
                  <textarea
                    className="communication-hub-form-textarea"
                    value={newTemplate.description}
                    onChange={(e) => handleNewTemplateChange('description', e.target.value)}
                    placeholder="Enter template description..."
                    rows="3"
                  />
                </div>

                <div className="communication-hub-template-variables">
                  <h4>Common Variables</h4>
                  <p>Click to add variables to your template</p>
                  <div className="communication-hub-template-variables-list">
                    {commonVariables.map((variable, index) => (
                      <span 
                        key={index} 
                        className="communication-hub-template-variable clickable"
                        onClick={() => insertVariable(variable, true)}
                      >
                        {variable}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="communication-hub-form-group">
                  <label>Template Content *</label>
                  <textarea
                    className="communication-hub-template-editor-textarea"
                    value={newTemplate.content}
                    onChange={(e) => handleNewTemplateChange('content', e.target.value)}
                    placeholder="Enter your email template content... Use [brackets] for variables."
                    rows="12"
                  />
                </div>
              </div>

              <div className="communication-hub-template-preview-actions">
                <button className="communication-hub-template-preview-btn" onClick={handleCloseCreateModal}>
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
                <button className="communication-hub-template-edit-btn" onClick={handleSaveNewTemplate}>
                  <i className="fas fa-save"></i>
                  Create Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && templateToDelete && (
        <div className="communication-hub-template-preview-modal">
          <div className="communication-hub-template-preview-container" style={{ maxWidth: '500px' }}>
            <div className="communication-hub-template-preview-header">
              <h3>Delete Template</h3>
              <button className="communication-hub-template-preview-close" onClick={handleCancelDelete}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="communication-hub-template-preview-content">
              <div className="communication-hub-delete-confirmation">
                <div className="communication-hub-delete-icon">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h4>Are you sure you want to delete this template?</h4>
                <p>This action cannot be undone. The template "<strong>{templateToDelete.title}</strong>" will be permanently removed.</p>
                
                <div className="communication-hub-template-preview-actions">
                  <button className="communication-hub-template-preview-btn" onClick={handleCancelDelete}>
                    <i className="fas fa-times"></i>
                    Cancel
                  </button>
                  <button className="communication-hub-template-delete-btn" onClick={handleConfirmDelete}>
                    <i className="fas fa-trash"></i>
                    Delete Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplates;