import React, { useState, useEffect } from 'react';

const ReportEditor = ({ report, onSave, onDelete }) => {
  const [editedReport, setEditedReport] = useState(report);
  const [activeSection, setActiveSection] = useState(0);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  useEffect(() => {
    setEditedReport(report);
  }, [report]);

  const defaultSections = [
    { id: 'executive-summary', title: 'Executive Summary', content: '' },
    { id: 'introduction', title: 'Introduction', content: '' },
    { id: 'methodology', title: 'Methodology', content: '' },
    { id: 'findings', title: 'Findings', content: '' },
    { id: 'conclusion', title: 'Conclusion', content: '' }
  ];

  const sections = editedReport.sections || defaultSections;

  const handleContentChange = (sectionIndex, content) => {
    const updatedSections = sections.map((section, index) =>
      index === sectionIndex ? { ...section, content } : section
    );
    setEditedReport(prev => ({
      ...prev,
      sections: updatedSections
    }));
  };

  const handleTitleChange = (newTitle) => {
    setEditedReport(prev => ({ ...prev, title: newTitle }));
  };

  const handleSave = () => {
    onSave(editedReport);
  };

  const addNewSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      content: ''
    };
    setEditedReport(prev => ({
      ...prev,
      sections: [...sections, newSection]
    }));
  };

  const deleteSection = (sectionIndex) => {
    if (sections.length > 1) {
      const updatedSections = sections.filter((_, index) => index !== sectionIndex);
      setEditedReport(prev => ({
        ...prev,
        sections: updatedSections
      }));
      if (activeSection >= sectionIndex) {
        setActiveSection(Math.max(0, activeSection - 1));
      }
    }
  };

  return (
    <div className="report-editor">
      <div className="editor-header">
        <div className="title-section">
          {isEditingTitle ? (
            <input
              type="text"
              value={editedReport.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyPress={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
              className="title-input"
              autoFocus
            />
          ) : (
            <h2 onClick={() => setIsEditingTitle(true)}>
              {editedReport.title}
            </h2>
          )}
          <span className="report-status">{report.status}</span>
        </div>
        
        <div className="editor-actions">
          <button className="secondary-button" onClick={handleSave}>
            💾 Save Draft
          </button>
          <button className="primary-button">
            📤 Export PDF
          </button>
          <button 
            className="danger-button"
            onClick={() => onDelete(report.id)}
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      <div className="editor-layout">
        <div className="sections-sidebar">
          <h4>Report Sections</h4>
          {sections.map((section, index) => (
            <div
              key={section.id}
              className={`section-item ${activeSection === index ? 'active' : ''}`}
              onClick={() => setActiveSection(index)}
            >
              <span>{section.title}</span>
              {sections.length > 1 && (
                <button
                  className="icon-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSection(index);
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button className="add-section-button" onClick={addNewSection}>
            + Add Section
          </button>
        </div>

        <div className="editor-main">
          {sections[activeSection] && (
            <div className="section-editor">
              <div className="section-header">
                <h3>{sections[activeSection].title}</h3>
                <div className="word-count">
                  {sections[activeSection].content.split(/\s+/).filter(word => word.length > 0).length} words
                </div>
              </div>
              
              <textarea
                className="content-editor"
                value={sections[activeSection].content}
                onChange={(e) => handleContentChange(activeSection, e.target.value)}
                placeholder="Start writing your section content here..."
                rows="15"
              />
              
              <div className="editor-tools">
                <button className="tool-button">🔤 Format</button>
                <button className="tool-button">📷 Insert Image</button>
                <button className="tool-button">📊 Add Chart</button>
                <button className="tool-button">🔗 Add Link</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportEditor;