import React from 'react';

const ReportTemplates = ({ onUseTemplate }) => {
  const templates = [
    {
      id: 'monthly-progress',
      name: 'Monthly Progress Report',
      category: 'Progress',
      description: 'Standard template for monthly project updates',
      icon: '📅',
      sections: ['Executive Summary', 'Milestones', 'Challenges', 'Next Steps'],
      estimatedTime: '15 min'
    },
    {
      id: 'financial-quarterly',
      name: 'Quarterly Financial Report',
      category: 'Financial',
      description: 'Comprehensive financial analysis for stakeholders',
      icon: '📊',
      sections: ['Financial Summary', 'Revenue', 'Expenses', 'Forecast'],
      estimatedTime: '30 min'
    },
    {
      id: 'research-paper',
      name: 'Research Paper Template',
      category: 'Research',
      description: 'Academic-style research report structure',
      icon: '🎓',
      sections: ['Abstract', 'Introduction', 'Methodology', 'Results', 'Conclusion'],
      estimatedTime: '45 min'
    },
    {
      id: 'executive-brief',
      name: 'Executive Brief',
      category: 'Executive',
      description: 'Concise one-page executive summary',
      icon: '📋',
      sections: ['Key Findings', 'Recommendations', 'Action Items'],
      estimatedTime: '10 min'
    },
    {
      id: 'analytical-deepdive',
      name: 'Analytical Deep Dive',
      category: 'Analytical',
      description: 'Detailed data analysis and insights',
      icon: '🔬',
      sections: ['Data Overview', 'Analysis', 'Insights', 'Recommendations'],
      estimatedTime: '25 min'
    },
    {
      id: 'grant-progress',
      name: 'Grant Progress Report',
      category: 'Progress',
      description: 'Specific template for grant-funded projects',
      icon: '🎯',
      sections: ['Objectives', 'Activities', 'Outputs', 'Impact'],
      estimatedTime: '20 min'
    }
  ];

  const categories = [...new Set(templates.map(t => t.category))];

  return (
    <div className="report-templates">
      <div className="templates-header">
        <h2>Report Templates</h2>
        <p>Choose from professionally designed templates to get started quickly</p>
      </div>

      <div className="templates-categories">
        {categories.map(category => (
          <div key={category} className="category-section">
            <h3>{category} Templates</h3>
            <div className="templates-grid">
              {templates
                .filter(template => template.category === category)
                .map(template => (
                  <div key={template.id} className="template-card">
                    <div className="template-header">
                      <div className="template-icon">{template.icon}</div>
                      <div className="template-info">
                        <h4>{template.name}</h4>
                        <span className="estimated-time">
                          ⏱️ {template.estimatedTime}
                        </span>
                      </div>
                    </div>
                    
                    <p className="template-description">{template.description}</p>
                    
                    <div className="template-sections">
                      <strong>Sections included:</strong>
                      <ul>
                        {template.sections.map((section, index) => (
                          <li key={index}>{section}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <button
                      className="primary-button"
                      onClick={() => onUseTemplate(template)}
                    >
                      Use This Template
                    </button>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportTemplates;