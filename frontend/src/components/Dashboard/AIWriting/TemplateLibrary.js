// frontend/src/components/Dashboard/AIWriting/TemplateLibrary.js
import React, { useState, useEffect } from 'react';

const TemplateLibrary = ({ onSelectTemplate, getTemplates }) => {
  const [activeCategory, setActiveCategory] = useState('needs_statement');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  const categories = [
    {
      id: 'needs_statement',
      name: 'Needs Statement',
      description: 'Templates for describing community problems and needs',
      icon: 'fas fa-exclamation-circle'
    },
    {
      id: 'objectives',
      name: 'Goals & Objectives',
      description: 'Templates for creating measurable objectives',
      icon: 'fas fa-bullseye'
    },
    {
      id: 'methodology',
      name: 'Methodology',
      description: 'Program implementation and activity templates',
      icon: 'fas fa-cogs'
    },
    {
      id: 'evaluation',
      name: 'Evaluation',
      description: 'Evaluation plan and measurement templates',
      icon: 'fas fa-chart-line'
    },
    {
      id: 'budget',
      name: 'Budget Narrative',
      description: 'Budget justification templates',
      icon: 'fas fa-dollar-sign'
    },
    {
      id: 'organization',
      name: 'Organization',
      description: 'Organization background and capacity templates',
      icon: 'fas fa-building'
    },
    {
      id: 'executive_summary',
      name: 'Executive Summary',
      description: 'Summary and introduction templates',
      icon: 'fas fa-file-alt'
    },
    {
      id: 'letters',
      name: 'Letters & Support',
      description: 'Cover letters and support document templates',
      icon: 'fas fa-envelope'
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

  return (
    <div className="template-library">
      <div className="library-header">
        <h2>Grant Writing Template Library</h2>
        <p>Professional templates for every section of your grant proposal</p>
      </div>

      <div className="library-content">
        {/* Categories Sidebar */}
        <div className="categories-sidebar">
          <h3>Template Categories</h3>
          <div className="category-list">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-button ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                <i className={category.icon}></i>
                <div className="category-info">
                  <span className="category-name">{category.name}</span>
                  <span className="category-desc">{category.description}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="templates-main">
          <div className="templates-header">
            <h3>
              {categories.find(c => c.id === activeCategory)?.name} Templates
            </h3>
            <div className="templates-stats">
              <span>{templates.length} templates available</span>
            </div>
          </div>

          {loading ? (
            <div className="loading-templates">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading templates...</p>
            </div>
          ) : (
            <div className="templates-grid">
              {templates.map(template => (
                <div key={template.id} className="template-card">
                  <div className="template-header">
                    <h4>{template.name}</h4>
                    <span className="template-type">Template</span>
                  </div>
                  
                  <div className="template-description">
                    <p>{template.description}</p>
                  </div>

                  {template.structure && (
                    <div className="template-structure">
                      <h5>Includes:</h5>
                      <ul>
                        {template.structure.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {template.bestFor && (
                    <div className="template-best-for">
                      <strong>Best for:</strong> {template.bestFor}
                    </div>
                  )}

                  <div className="template-actions">
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleUseTemplate(template)}
                    >
                      <i className="fas fa-use-template"></i>
                      Use This Template
                    </button>
                    <button className="btn btn-outline">
                      <i className="fas fa-eye"></i>
                      Preview
                    </button>
                  </div>
                </div>
              ))}

              {templates.length === 0 && (
                <div className="no-templates">
                  <i className="fas fa-file-alt"></i>
                  <h4>No Templates Available</h4>
                  <p>No templates found for this category. Check back later or try another category.</p>
                </div>
              )}
            </div>
          )}

          {/* Template Tips */}
          <div className="template-tips">
            <h4>Template Best Practices</h4>
            <div className="tips-grid">
              <div className="tip-card">
                <i className="fas fa-edit"></i>
                <h5>Customize Thoroughly</h5>
                <p>Always adapt templates to your specific program and community context</p>
              </div>
              <div className="tip-card">
                <i className="fas fa-data"></i>
                <h5>Add Local Data</h5>
                <p>Incorporate local statistics and community-specific information</p>
              </div>
              <div className="tip-card">
                <i className="fas fa-align-left"></i>
                <h5>Maintain Consistency</h5>
                <p>Ensure template language matches your organization's voice</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateLibrary;