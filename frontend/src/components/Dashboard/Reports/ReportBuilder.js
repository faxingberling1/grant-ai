import React, { useState } from 'react';

const ReportBuilder = ({ onCreateReport }) => {
  const [reportType, setReportType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const reportTypes = [
    {
      id: 'progress',
      name: 'Progress Report',
      description: 'Track project milestones and achievements',
      icon: '📈'
    },
    {
      id: 'financial',
      name: 'Financial Report',
      description: 'Budget, expenses, and financial analysis',
      icon: '💰'
    },
    {
      id: 'analytical',
      name: 'Analytical Report',
      description: 'Data analysis and insights',
      icon: '🔍'
    },
    {
      id: 'research',
      name: 'Research Report',
      description: 'Research findings and conclusions',
      icon: '📚'
    },
    {
      id: 'executive',
      name: 'Executive Summary',
      description: 'High-level overview for stakeholders',
      icon: '👔'
    },
    {
      id: 'custom',
      name: 'Custom Report',
      description: 'Build from scratch',
      icon: '⚙️'
    }
  ];

  const handleCreateReport = (type) => {
    const template = reportTypes.find(t => t.id === type);
    onCreateReport({
      type: type,
      title: title || `${template.name} - ${new Date().toLocaleDateString()}`,
      description: description,
      template: template
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    setReportType('');
  };

  return (
    <div className="report-builder">
      <div className="builder-header">
        <h2>Create New Report</h2>
        <p>Select a report type and configure basic settings</p>
      </div>

      <div className="builder-form">
        <div className="form-group">
          <label htmlFor="reportTitle">Report Title</label>
          <input
            type="text"
            id="reportTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter report title..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="reportDescription">Description (Optional)</label>
          <textarea
            id="reportDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the report..."
            rows="3"
          />
        </div>

        <div className="report-types-grid">
          <h3>Select Report Type</h3>
          <div className="types-grid">
            {reportTypes.map(type => (
              <div
                key={type.id}
                className={`type-card ${reportType === type.id ? 'selected' : ''}`}
                onClick={() => setReportType(type.id)}
              >
                <div className="type-icon">{type.icon}</div>
                <h4>{type.name}</h4>
                <p>{type.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="builder-actions">
          <button
            className="primary-button"
            disabled={!reportType}
            onClick={() => handleCreateReport(reportType)}
          >
            Create Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportBuilder;