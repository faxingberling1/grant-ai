// frontend/src/components/Dashboard/AIWriting/WritingAssistant.js
import React, { useState, useEffect } from 'react';
import './WritingAssistant.css';

const WritingAssistant = ({
  clients,
  grants,
  grantSources,
  selectedClient,
  selectedGrant,
  onSelectClient,
  onSelectGrant,
  onCreateGrant,
  onGenerateContent,
  onImproveContent,
  onAnalyzeContent,
  loading,
  apiStatus
}) => {
  const [activeSection, setActiveSection] = useState('needsStatement');
  const [generatedContent, setGeneratedContent] = useState('');
  const [userInput, setUserInput] = useState('');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [format, setFormat] = useState('paragraph');
  const [improvementType, setImprovementType] = useState('clarity');
  const [analysisType, setAnalysisType] = useState('strength');
  const [wordCount, setWordCount] = useState(0);

  const sections = {
    needsStatement: { label: 'Needs Statement', icon: '🔍' },
    objectives: { label: 'Objectives & Goals', icon: '🎯' },
    methodology: { label: 'Methodology', icon: '⚙️' },
    evaluation: { label: 'Evaluation Plan', icon: '📊' },
    budget: { label: 'Budget Narrative', icon: '💰' },
    sustainability: { label: 'Sustainability', icon: '🌱' }
  };

  const tones = [
    { value: 'professional', label: 'Professional', icon: '💼' },
    { value: 'persuasive', label: 'Persuasive', icon: '🎭' },
    { value: 'compassionate', label: 'Compassionate', icon: '❤️' },
    { value: 'data_driven', label: 'Data-Driven', icon: '📈' },
    { value: 'storytelling', label: 'Storytelling', icon: '📖' }
  ];

  const improvementTypes = [
    { value: 'clarity', label: 'Improve Clarity', icon: '✨' },
    { value: 'persuasiveness', label: 'Enhance Persuasiveness', icon: '🚀' },
    { value: 'professionalism', label: 'Increase Professionalism', icon: '⭐' },
    { value: 'completeness', label: 'Expand & Complete', icon: '🔍' },
    { value: 'alignment', label: 'Improve Alignment', icon: '🎯' }
  ];

  const analysisTypes = [
    { value: 'strength', label: 'Strengths Analysis', icon: '💪' },
    { value: 'alignment', label: 'Grant Alignment', icon: '🎯' },
    { value: 'impact', label: 'Impact Assessment', icon: '🌍' },
    { value: 'readability', label: 'Readability', icon: '📖' }
  ];

  useEffect(() => {
    const words = generatedContent.trim() ? generatedContent.trim().split(/\s+/).length : 0;
    setWordCount(words);
  }, [generatedContent]);

  const handleGenerateContent = async () => {
    if (!selectedClient) {
      alert('Please select a client first');
      return;
    }

    if (!userInput.trim()) {
      alert('Please provide some context or instructions for content generation');
      return;
    }

    try {
      const context = {
        clientInfo: {
          name: selectedClient.name,
          mission: selectedClient.mission,
          focusAreas: selectedClient.focusAreas
        },
        grantInfo: selectedGrant ? {
          title: selectedGrant.title,
          funder: selectedGrant.funder
        } : null,
        tone,
        length,
        format,
        section: activeSection
      };

      const content = await onGenerateContent(userInput, context, activeSection);
      setGeneratedContent(content);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleImproveContent = async () => {
    if (!generatedContent.trim()) {
      alert('Please generate some content first');
      return;
    }

    try {
      const context = {
        clientInfo: selectedClient ? {
          name: selectedClient.name,
          mission: selectedClient.mission
        } : null,
        section: activeSection
      };

      const improvedContent = await onImproveContent(generatedContent, improvementType, context);
      setGeneratedContent(improvedContent);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAnalyzeContent = async () => {
    if (!generatedContent.trim()) {
      alert('Please generate some content first');
      return;
    }

    try {
      const analysis = await onAnalyzeContent(generatedContent, analysisType);
      // Display analysis in a modal or separate section
      alert(`Content Analysis:\n\n${analysis}`);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSaveContent = () => {
    if (selectedGrant) {
      console.log(`Saving content for ${activeSection}:`, generatedContent);
      alert('Content saved successfully!');
    } else {
      alert('Please select or create a grant first');
    }
  };

  const handleClearContent = () => {
    setGeneratedContent('');
    setUserInput('');
  };

  return (
    <div className="writing-assistant">
      {/* Header Section */}
      <div className="assistant-header">
        <div className="header-content">
          <div className="header-title">
            <h1>AI Writing Assistant</h1>
            <p>Craft compelling grant content with AI-powered precision</p>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-value">{wordCount}</span>
              <span className="stat-label">Words</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{Object.keys(sections).length}</span>
              <span className="stat-label">Sections</span>
            </div>
            <div className={`status-indicator ${apiStatus?.connected ? 'connected' : 'disconnected'}`}>
              <div className="status-dot"></div>
              <span>{apiStatus?.connected ? 'AI Connected' : 'AI Offline'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="assistant-layout">
        {/* Left Sidebar - Client & Controls */}
        <div className="assistant-sidebar">
          {/* Client Selection */}
          <div className="sidebar-section">
            <h3 className="section-title">
              <i className="fas fa-users"></i>
              Project Setup
            </h3>
            <div className="selection-cards">
              <div className="selection-card">
                <label className="card-label">Client</label>
                <select 
                  value={selectedClient?.id || ''} 
                  onChange={(e) => onSelectClient(clients.find(c => c.id === e.target.value))}
                  className="modern-select"
                >
                  <option value="">Choose client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="selection-card">
                <label className="card-label">Grant</label>
                <select 
                  value={selectedGrant?.id || ''} 
                  onChange={(e) => onSelectGrant(grants.find(g => g.id === e.target.value))}
                  className="modern-select"
                  disabled={!selectedClient}
                >
                  <option value="">Choose grant...</option>
                  {grants.map(grant => (
                    <option key={grant.id} value={grant.id}>
                      {grant.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Client Context */}
          {selectedClient && (
            <div className="sidebar-section">
              <h3 className="section-title">
                <i className="fas fa-info-circle"></i>
                Client Context
              </h3>
              <div className="context-card">
                <div className="client-header">
                  <h4>{selectedClient.name}</h4>
                  <span className="client-category">{selectedClient.category}</span>
                </div>
                <p className="client-mission">{selectedClient.mission}</p>
                <div className="focus-areas">
                  <strong>Focus Areas:</strong>
                  <div className="focus-tags">
                    {selectedClient.focusAreas?.map((area, index) => (
                      <span key={index} className="focus-tag">{area}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Generation Controls */}
          <div className="sidebar-section">
            <h3 className="section-title">
              <i className="fas fa-sliders-h"></i>
              Content Settings
            </h3>
            <div className="control-cards">
              <div className="control-card">
                <label className="control-label">Tone</label>
                <div className="tone-selector">
                  {tones.map(toneOption => (
                    <button
                      key={toneOption.value}
                      className={`tone-option ${tone === toneOption.value ? 'active' : ''}`}
                      onClick={() => setTone(toneOption.value)}
                    >
                      <span className="tone-icon">{toneOption.icon}</span>
                      <span className="tone-label">{toneOption.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="control-card">
                <label className="control-label">Format & Length</label>
                <div className="format-controls">
                  <select 
                    value={format} 
                    onChange={(e) => setFormat(e.target.value)}
                    className="modern-select"
                  >
                    <option value="paragraph">Paragraph Format</option>
                    <option value="bullet_points">Bullet Points</option>
                    <option value="structured">Structured Sections</option>
                  </select>
                  <select 
                    value={length} 
                    onChange={(e) => setLength(e.target.value)}
                    className="modern-select"
                  >
                    <option value="short">Short (2-3 paragraphs)</option>
                    <option value="medium">Medium (4-6 paragraphs)</option>
                    <option value="long">Long (7-10 paragraphs)</option>
                    <option value="extensive">Extensive (10+ paragraphs)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="assistant-main">
          {/* Section Navigation */}
          <div className="section-navigation">
            <div className="nav-header">
              <h3>Grant Sections</h3>
              <span className="nav-subtitle">Select section to work on</span>
            </div>
            <div className="section-tabs">
              {Object.entries(sections).map(([key, section]) => (
                <button
                  key={key}
                  className={`section-tab ${activeSection === key ? 'active' : ''}`}
                  onClick={() => setActiveSection(key)}
                >
                  <span className="tab-icon">{section.icon}</span>
                  <span className="tab-label">{section.label}</span>
                  {activeSection === key && <div className="tab-indicator"></div>}
                </button>
              ))}
            </div>
          </div>

          {/* Input Panel */}
          <div className="input-panel">
            <div className="panel-header">
              <h3>
                <span className="section-icon">{sections[activeSection].icon}</span>
                {sections[activeSection].label}
              </h3>
              <div className="panel-actions">
                <button 
                  className="btn-clear"
                  onClick={handleClearContent}
                  disabled={!userInput && !generatedContent}
                >
                  <i className="fas fa-eraser"></i>
                  Clear
                </button>
              </div>
            </div>

            <div className="input-area">
              <label className="input-label">
                <i className="fas fa-edit"></i>
                Instructions for AI
              </label>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={`Describe what you want to include in the ${sections[activeSection].label}. Be specific about data, goals, or key messages...`}
                className="modern-textarea"
                rows="5"
              />
              <div className="input-footer">
                <span className="char-count">{userInput.length} characters</span>
                <button 
                  className="btn-generate"
                  onClick={handleGenerateContent}
                  disabled={loading || !selectedClient || !userInput.trim()}
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-robot"></i>
                      Generate Content
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Output Panel */}
          <div className="output-panel">
            <div className="panel-header">
              <h3>
                <i className="fas fa-file-alt"></i>
                Generated Content
              </h3>
              <div className="output-stats">
                <span className="word-count">{wordCount} words</span>
                <div className="output-actions">
                  <div className="action-dropdown">
                    <select 
                      value={improvementType} 
                      onChange={(e) => setImprovementType(e.target.value)}
                      className="action-select"
                    >
                      {improvementTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button 
                    className="btn-improve"
                    onClick={handleImproveContent}
                    disabled={!generatedContent}
                  >
                    <i className="fas fa-magic"></i>
                    Improve
                  </button>
                  <button 
                    className="btn-analyze"
                    onClick={handleAnalyzeContent}
                    disabled={!generatedContent}
                  >
                    <i className="fas fa-chart-bar"></i>
                    Analyze
                  </button>
                  <button 
                    className="btn-save"
                    onClick={handleSaveContent}
                    disabled={!generatedContent}
                  >
                    <i className="fas fa-save"></i>
                    Save
                  </button>
                </div>
              </div>
            </div>

            <div className="content-area">
              {generatedContent ? (
                <div className="generated-content">
                  <div className="content-scroll">
                    {generatedContent}
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <i className="fas fa-robot"></i>
                  </div>
                  <h4>Ready to Create</h4>
                  <p>Your AI-generated content will appear here. Provide instructions and generate to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritingAssistant;