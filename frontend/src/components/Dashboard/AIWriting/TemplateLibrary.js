// frontend/src/components/Dashboard/AIWriting/TemplateLibrary.js
import React, { useState, useEffect } from 'react';
import './TemplateLibrary.css';

const TemplateLibrary = ({ onSelectTemplate, getTemplates }) => {
  const [activeCategory, setActiveCategory] = useState('needs_statement');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const categories = [
    {
      id: 'needs_statement',
      name: 'Needs Statement',
      description: 'Describe community problems and needs',
      icon: '🔍',
      color: '#d4af37'
    },
    {
      id: 'objectives',
      name: 'Goals & Objectives',
      description: 'Create measurable objectives and outcomes',
      icon: '🎯',
      color: '#48bb78'
    },
    {
      id: 'methodology',
      name: 'Methodology',
      description: 'Program implementation and activities',
      icon: '⚙️',
      color: '#4299e1'
    },
    {
      id: 'evaluation',
      name: 'Evaluation',
      description: 'Evaluation plans and measurement',
      icon: '📊',
      color: '#9f7aea'
    },
    {
      id: 'budget',
      name: 'Budget Narrative',
      description: 'Budget justification and explanations',
      icon: '💰',
      color: '#ed8936'
    },
    {
      id: 'organization',
      name: 'Organization',
      description: 'Background and capacity statements',
      icon: '🏢',
      color: '#38b2ac'
    },
    {
      id: 'executive_summary',
      name: 'Executive Summary',
      description: 'Summary and introduction templates',
      icon: '📄',
      color: '#e53e3e'
    },
    {
      id: 'letters',
      name: 'Letters & Support',
      description: 'Cover letters and support documents',
      icon: '✉️',
      color: '#3182ce'
    }
  ];

  useEffect(() => {
    loadTemplates();
  }, [activeCategory]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const templateData = await getTemplates(activeCategory);
      setTemplates(templateData);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = (template) => {
    onSelectTemplate(template);
  };

  const handlePreviewTemplate = (template) => {
    setSelectedTemplate(template);
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCurrentCategory = () => categories.find(c => c.id === activeCategory);

  return (
    <div className="template-library">
      {/* Header Section */}
      <div className="library-header">
        <div className="header-content">
          <div className="header-title">
            <h1>Template Library</h1>
            <p>Professional grant writing templates for every section</p>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-value">{templates.length}</span>
              <span className="stat-label">Templates</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{categories.length}</span>
              <span className="stat-label">Categories</span>
            </div>
          </div>
        </div>
      </div>

      <div className="library-layout">
        {/* Categories Sidebar */}
        <div className="categories-sidebar">
          <div className="sidebar-header">
            <h3>Categories</h3>
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="category-list">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-card ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
                style={{ '--category-color': category.color }}
              >
                <div className="category-icon" style={{ backgroundColor: category.color }}>
                  {category.icon}
                </div>
                <div className="category-content">
                  <h4 className="category-name">{category.name}</h4>
                  <p className="category-desc">{category.description}</p>
                </div>
                <div className="category-indicator"></div>
              </button>
            ))}
          </div>

          {/* Quick Tips */}
          <div className="quick-tips">
            <h4>Quick Tips</h4>
            <div className="tips-list">
              <div className="tip-item">
                <i className="fas fa-lightbulb"></i>
                <span>Customize templates to fit your specific needs</span>
              </div>
              <div className="tip-item">
                <i className="fas fa-lightbulb"></i>
                <span>Add local data and statistics for credibility</span>
              </div>
              <div className="tip-item">
                <i className="fas fa-lightbulb"></i>
                <span>Maintain consistent tone across all sections</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="templates-main">
          {/* Category Header */}
          <div className="category-header">
            <div className="category-info">
              <div 
                className="category-badge"
                style={{ backgroundColor: getCurrentCategory()?.color }}
              >
                <span className="badge-icon">{getCurrentCategory()?.icon}</span>
              </div>
              <div className="category-details">
                <h2>{getCurrentCategory()?.name}</h2>
                <p>{getCurrentCategory()?.description}</p>
              </div>
            </div>
            <div className="category-stats">
              <span className="template-count">
                {filteredTemplates.length} templates available
              </span>
            </div>
          </div>

          {/* Templates List - Changed to single column layout */}
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <h3>Loading Templates</h3>
              <p>Fetching the best templates for your grant writing needs...</p>
            </div>
          ) : (
            <>
              <div className="templates-list">
                {filteredTemplates.map(template => (
                  <div key={template.id} className="template-card-full">
                    <div className="template-header-full">
                      <div className="template-title">
                        <h3>{template.name}</h3>
                        <span className="template-badge">Template</span>
                      </div>
                      <div className="template-meta">
                        {template.difficulty && (
                          <span className={`difficulty-badge ${template.difficulty}`}>
                            {template.difficulty}
                          </span>
                        )}
                        {template.estimatedTime && (
                          <span className="time-estimate">
                            <i className="fas fa-clock"></i>
                            {template.estimatedTime}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="template-description">
                      <p>{template.description}</p>
                    </div>

                    {template.structure && (
                      <div className="template-structure">
                        <h4>Includes:</h4>
                        <div className="structure-tags">
                          {template.structure.map((item, index) => (
                            <span key={index} className="structure-tag">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {template.bestFor && (
                      <div className="template-best-for">
                        <div className="best-for-header">
                          <i className="fas fa-star"></i>
                          <strong>Best For:</strong>
                        </div>
                        <p>{template.bestFor}</p>
                      </div>
                    )}

                    <div className="template-actions">
                      <button 
                        className="btn-use-template"
                        onClick={() => handleUseTemplate(template)}
                      >
                        <i className="fas fa-magic"></i>
                        Use Template
                      </button>
                      <button 
                        className="btn-preview"
                        onClick={() => handlePreviewTemplate(template)}
                      >
                        <i className="fas fa-eye"></i>
                        Preview
                      </button>
                    </div>
                  </div>
                ))}

                {filteredTemplates.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <i className="fas fa-file-alt"></i>
                    </div>
                    <h3>No Templates Found</h3>
                    <p>
                      {searchTerm 
                        ? `No templates match "${searchTerm}". Try a different search term.`
                        : `No templates available for ${getCurrentCategory()?.name}. Check back later.`
                      }
                    </p>
                    {searchTerm && (
                      <button 
                        className="btn-clear-search"
                        onClick={() => setSearchTerm('')}
                      >
                        Clear Search
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Best Practices Section */}
              <div className="best-practices">
                <div className="practices-header">
                  <h3>Best Practices</h3>
                  <p>Maximize your success with these template tips</p>
                </div>
                <div className="practices-grid">
                  <div className="practice-card">
                    <div className="practice-icon">
                      <i className="fas fa-edit"></i>
                    </div>
                    <h4>Customize Thoroughly</h4>
                    <p>Always adapt templates to your specific program context and community needs</p>
                  </div>
                  <div className="practice-card">
                    <div className="practice-icon">
                      <i className="fas fa-chart-bar"></i>
                    </div>
                    <h4>Add Local Data</h4>
                    <p>Incorporate local statistics and community-specific information for credibility</p>
                  </div>
                  <div className="practice-card">
                    <div className="practice-icon">
                      <i className="fas fa-palette"></i>
                    </div>
                    <h4>Maintain Consistency</h4>
                    <p>Ensure template language matches your organization's voice and brand</p>
                  </div>
                  <div className="practice-card">
                    <div className="practice-icon">
                      <i className="fas fa-check-double"></i>
                    </div>
                    <h4>Review & Refine</h4>
                    <p>Always review and refine template content for accuracy and completeness</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <div className="preview-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedTemplate.name}</h2>
              <button 
                className="modal-close"
                onClick={() => setSelectedTemplate(null)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="preview-content">
                <h3>Template Preview</h3>
                <div className="template-preview">
                  {selectedTemplate.previewContent || selectedTemplate.description}
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-use-template"
                onClick={() => {
                  handleUseTemplate(selectedTemplate);
                  setSelectedTemplate(null);
                }}
              >
                <i className="fas fa-magic"></i>
                Use This Template
              </button>
              <button 
                className="btn-cancel"
                onClick={() => setSelectedTemplate(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateLibrary;