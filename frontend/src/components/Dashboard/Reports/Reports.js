import React, { useState } from 'react';
import ReportBuilder from './ReportBuilder';
import ReportTemplates from './ReportTemplates';
import ReportEditor from './ReportEditor';
import ReportAnalytics from './ReportAnalytics';
import ReportSharing from './ReportSharing';
import './Reports.css';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('builder');
  const [currentReport, setCurrentReport] = useState(null);
  const [reports, setReports] = useState([]);

  const handleCreateReport = (template) => {
    const newReport = {
      id: Date.now(),
      title: `New Report - ${new Date().toLocaleDateString()}`,
      template: template,
      content: '',
      createdAt: new Date().toISOString(),
      status: 'draft'
    };
    setCurrentReport(newReport);
    setReports(prev => [newReport, ...prev]);
    setActiveTab('editor');
  };

  const handleSaveReport = (updatedReport) => {
    setReports(prev => 
      prev.map(report => 
        report.id === updatedReport.id ? updatedReport : report
      )
    );
    setCurrentReport(updatedReport);
  };

  const handleDeleteReport = (reportId) => {
    setReports(prev => prev.filter(report => report.id !== reportId));
    if (currentReport?.id === reportId) {
      setCurrentReport(null);
    }
  };

  const tabs = [
    { id: 'builder', label: 'Report Builder', icon: '🏗️' },
    { id: 'templates', label: 'Templates', icon: '📋' },
    { id: 'editor', label: 'Editor', icon: '✏️' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'sharing', label: 'Sharing', icon: '🔗' }
  ];

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>Reports Dashboard</h1>
        <p>Create, manage, and share professional reports</p>
      </div>

      <div className="reports-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="reports-content">
        {activeTab === 'builder' && (
          <ReportBuilder onCreateReport={handleCreateReport} />
        )}
        
        {activeTab === 'templates' && (
          <ReportTemplates onUseTemplate={handleCreateReport} />
        )}
        
        {activeTab === 'editor' && currentReport && (
          <ReportEditor
            report={currentReport}
            onSave={handleSaveReport}
            onDelete={handleDeleteReport}
          />
        )}
        
        {activeTab === 'analytics' && (
          <ReportAnalytics reports={reports} />
        )}
        
        {activeTab === 'sharing' && currentReport && (
          <ReportSharing report={currentReport} />
        )}
      </div>

      {activeTab === 'editor' && !currentReport && (
        <div className="no-report-selected">
          <h3>No Report Selected</h3>
          <p>Please create a new report or select a template to start editing.</p>
          <button 
            className="primary-button"
            onClick={() => setActiveTab('builder')}
          >
            Create New Report
          </button>
        </div>
      )}
    </div>
  );
};

export default Reports;