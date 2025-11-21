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
  const [generatedContent, setGeneratedContent] = useState({
    needsStatement: '',
    objectives: '',
    methodology: '',
    evaluation: '',
    budget: '',
    sustainability: ''
  });
  const [userInput, setUserInput] = useState('');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [format, setFormat] = useState('paragraph');
  const [improvementType, setImprovementType] = useState('clarity');
  const [analysisType, setAnalysisType] = useState('strength');
  const [wordCount, setWordCount] = useState(0);
  const [error, setError] = useState('');

  const sections = {
    needsStatement: { label: 'Needs Statement', icon: '🔍' },
    objectives: { label: 'Objectives & Goals', icon: '🎯' },
    methodology: { label: 'Methodology', icon: '⚙️' },
    evaluation: { label: 'Evaluation Plan', icon: '📊' },
    budget: { label: 'Budget Narrative', icon: '💰' },
    sustainability: { label: 'Sustainability', icon: '🌱' }
  };

  // Add the missing tones array
  const tones = [
    { value: 'professional', label: 'Professional', icon: '💼' },
    { value: 'persuasive', label: 'Persuasive', icon: '🎭' },
    { value: 'compassionate', label: 'Compassionate', icon: '❤️' },
    { value: 'data_driven', label: 'Data-Driven', icon: '📈' },
    { value: 'storytelling', label: 'Storytelling', icon: '📖' }
  ];

  // Add the missing improvementTypes array
  const improvementTypes = [
    { value: 'clarity', label: 'Improve Clarity', icon: '✨' },
    { value: 'persuasiveness', label: 'Enhance Persuasiveness', icon: '🚀' },
    { value: 'professionalism', label: 'Increase Professionalism', icon: '⭐' },
    { value: 'completeness', label: 'Expand & Complete', icon: '🔍' },
    { value: 'alignment', label: 'Improve Alignment', icon: '🎯' }
  ];

  // Add the missing analysisTypes array
  const analysisTypes = [
    { value: 'strength', label: 'Strengths Analysis', icon: '💪' },
    { value: 'alignment', label: 'Grant Alignment', icon: '🎯' },
    { value: 'impact', label: 'Impact Assessment', icon: '🌍' },
    { value: 'readability', label: 'Readability', icon: '📖' }
  ];

  // Calculate total word count across all sections
  useEffect(() => {
    const totalWords = Object.values(generatedContent).reduce((total, content) => {
      return total + (content.trim() ? content.trim().split(/\s+/).length : 0);
    }, 0);
    setWordCount(totalWords);
  }, [generatedContent]);

  const handleGenerateContent = async () => {
    console.log('🔄 Starting content generation for section:', activeSection);
    console.log('📝 User input:', userInput);
    
    if (!selectedClient) {
      const errorMsg = 'Please select a client first';
      setError(errorMsg);
      alert(errorMsg);
      return;
    }

    if (!userInput.trim()) {
      const errorMsg = 'Please provide some context or instructions for content generation';
      setError(errorMsg);
      alert(errorMsg);
      return;
    }

    setError('');

    try {
      const context = {
        clientInfo: {
          name: selectedClient.name,
          mission: selectedClient.mission,
          focusAreas: selectedClient.focusAreas,
          category: selectedClient.category
        },
        grantInfo: selectedGrant ? {
          title: selectedGrant.title,
          funder: selectedGrant.funder,
          amount: selectedGrant.amount,
          deadline: selectedGrant.deadline
        } : null,
        tone,
        length,
        format,
        section: activeSection,
        sectionLabel: sections[activeSection].label
      };

      console.log('📋 Context sent to AI:', context);

      // Check if onGenerateContent is a function
      if (typeof onGenerateContent !== 'function') {
        throw new Error('Content generation function is not available');
      }

      const content = await onGenerateContent(userInput, context, activeSection);
      
      console.log('✅ AI Response received:', content);
      console.log('📊 Content type:', typeof content);
      console.log('📏 Content length:', content?.length);

      if (!content || typeof content !== 'string') {
        throw new Error('Invalid content received from AI');
      }

      // Update only the current section's content
      setGeneratedContent(prev => {
        const updated = {
          ...prev,
          [activeSection]: content
        };
        console.log('🔄 Updated content state:', updated);
        return updated;
      });

      // Clear user input after successful generation
      setUserInput('');

    } catch (error) {
      console.error('❌ Error generating content:', error);
      const errorMsg = error.message || 'Failed to generate content. Please try again.';
      setError(errorMsg);
      alert(errorMsg);
    }
  };

  const handleImproveContent = async () => {
    const currentContent = generatedContent[activeSection];
    console.log('🔧 Improving content for section:', activeSection);
    console.log('📝 Current content:', currentContent);

    if (!currentContent.trim()) {
      const errorMsg = 'Please generate some content first';
      setError(errorMsg);
      alert(errorMsg);
      return;
    }

    setError('');

    try {
      const context = {
        clientInfo: selectedClient ? {
          name: selectedClient.name,
          mission: selectedClient.mission
        } : null,
        section: activeSection
      };

      if (typeof onImproveContent !== 'function') {
        throw new Error('Content improvement function is not available');
      }

      const improvedContent = await onImproveContent(currentContent, improvementType, context);
      
      console.log('✅ Improved content received:', improvedContent);

      if (!improvedContent || typeof improvedContent !== 'string') {
        throw new Error('Invalid improved content received');
      }

      setGeneratedContent(prev => ({
        ...prev,
        [activeSection]: improvedContent
      }));

    } catch (error) {
      console.error('❌ Error improving content:', error);
      const errorMsg = error.message || 'Failed to improve content. Please try again.';
      setError(errorMsg);
      alert(errorMsg);
    }
  };

  const handleAnalyzeContent = async () => {
    const currentContent = generatedContent[activeSection];
    console.log('📊 Analyzing content for section:', activeSection);

    if (!currentContent.trim()) {
      alert('Please generate some content first');
      return;
    }

    try {
      if (typeof onAnalyzeContent !== 'function') {
        throw new Error('Content analysis function is not available');
      }

      const analysis = await onAnalyzeContent(currentContent, analysisType);
      console.log('✅ Analysis received:', analysis);
      
      // Display analysis in a modal or separate section
      alert(`Content Analysis for ${sections[activeSection].label}:\n\n${analysis}`);
    } catch (error) {
      console.error('❌ Error analyzing content:', error);
      alert(error.message || 'Failed to analyze content. Please try again.');
    }
  };

  const handleSaveContent = () => {
    if (selectedGrant) {
      const allContent = {
        ...generatedContent,
        client: selectedClient.name,
        grant: selectedGrant.title,
        lastUpdated: new Date().toISOString()
      };
      console.log('💾 Saving all content:', allContent);
      alert('All content saved successfully!');
    } else {
      alert('Please select or create a grant first');
    }
  };

  const handleClearContent = () => {
    console.log('🗑️ Clearing section:', activeSection);
    // Clear only the current section
    setGeneratedContent(prev => ({
      ...prev,
      [activeSection]: ''
    }));
    setUserInput('');
    setError('');
  };

  const handleClearAllContent = () => {
    console.log('🗑️ Clearing all sections');
    // Clear all sections
    setGeneratedContent({
      needsStatement: '',
      objectives: '',
      methodology: '',
      evaluation: '',
      budget: '',
      sustainability: ''
    });
    setUserInput('');
    setError('');
  };

  const getSectionWordCount = (section) => {
    const content = generatedContent[section];
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  };

  const getSectionStatus = (section) => {
    const content = generatedContent[section];
    if (!content.trim()) return 'empty';
    const wordCount = getSectionWordCount(section);
    if (wordCount < 50) return 'draft';
    if (wordCount < 150) return 'in-progress';
    return 'complete';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'empty': return '#a0aec0';
      case 'draft': return '#ed8936';
      case 'in-progress': return '#4299e1';
      case 'complete': return '#48bb78';
      default: return '#a0aec0';
    }
  };

  // Add demo content for testing
  const handleAddDemoContent = (section) => {
    const demoContent = {
      needsStatement: `The community of ${selectedClient?.name || 'our target population'} faces significant challenges in [specific area]. Recent data indicates that [statistic or fact]. This pressing issue requires immediate intervention to address [key problems] and improve outcomes for [target population].`,

      objectives: `Primary Objective: To reduce [specific problem] by [percentage] within [timeline].\nSecondary Objectives:\n• Increase participation in [program activities] by [number] participants\n• Improve [specific metric] by [percentage]\n• Establish [number] sustainable partnerships\n• Train [number] community members in [skills]`,

      methodology: `Our approach employs evidence-based strategies including:\n1. [Activity 1]: Detailed description of implementation\n2. [Activity 2]: Step-by-step procedures\n3. [Activity 3]: Staff roles and responsibilities\n4. [Activity 4]: Participant engagement methods\nTimeline: [Start date] to [End date] with key milestones`,

      evaluation: `Evaluation Framework:\n• Quantitative Metrics: [Specific measurements]\n• Qualitative Data: [Collection methods]\n• Data Collection: [Tools and frequency]\n• Reporting: [Schedule and stakeholders]\nSuccess will be measured by [key indicators]`,

      budget: `Budget Breakdown:\n• Personnel: $[amount] - [justification]\n• Program Activities: $[amount] - [description]\n• Materials: $[amount] - [items list]\n• Administration: $[amount] - [overhead costs]\nTotal Request: $[amount] | Matching Funds: $[amount]`,

      sustainability: `Long-term Sustainability Plan:\n• Funding Diversification: [Strategies]\n• Community Partnerships: [Organization names]\n• Capacity Building: [Training plans]\n• Revenue Generation: [Income sources]\n• Program Replication: [Expansion plans]`
    };

    setGeneratedContent(prev => ({
      ...prev,
      [section]: demoContent[section]
    }));
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
              <span className="stat-label">Total Words</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {Object.values(generatedContent).filter(content => content.trim()).length}
              </span>
              <span className="stat-label">Sections Started</span>
            </div>
            <div className={`status-indicator ${apiStatus?.connected ? 'connected' : 'disconnected'}`}>
              <div className="status-dot"></div>
              <span>{apiStatus?.connected ? 'AI Connected' : 'AI Offline'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
          <button className="error-close" onClick={() => setError('')}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

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

          {/* Progress Overview */}
          <div className="sidebar-section">
            <h3 className="section-title">
              <i className="fas fa-chart-bar"></i>
              Progress Overview
            </h3>
            <div className="progress-overview">
              {Object.entries(sections).map(([key, section]) => (
                <div key={key} className="progress-item">
                  <div className="progress-info">
                    <span className="progress-icon">{section.icon}</span>
                    <span className="progress-label">{section.label}</span>
                  </div>
                  <div className="progress-status">
                    <div 
                      className="status-dot"
                      style={{ backgroundColor: getStatusColor(getSectionStatus(key)) }}
                    ></div>
                    <span className="word-count-small">{getSectionWordCount(key)} words</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Debug Tools - Remove in production */}
          <div className="sidebar-section debug-section">
            <h3 className="section-title">
              <i className="fas fa-bug"></i>
              Debug Tools
            </h3>
            <div className="debug-actions">
              <button 
                className="btn-demo"
                onClick={() => handleAddDemoContent(activeSection)}
              >
                Add Demo Content
              </button>
              <button 
                className="btn-log-state"
                onClick={() => console.log('Current State:', { generatedContent, activeSection, userInput })}
              >
                Log State
              </button>
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
              <button 
                className="btn-clear-all"
                onClick={handleClearAllContent}
                disabled={!Object.values(generatedContent).some(content => content.trim())}
              >
                <i className="fas fa-trash"></i>
                Clear All
              </button>
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
                  <div 
                    className="section-status"
                    style={{ backgroundColor: getStatusColor(getSectionStatus(key)) }}
                  ></div>
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
                <div className="section-stats">
                  <span className="section-word-count">
                    {getSectionWordCount(activeSection)} words
                  </span>
                  <span 
                    className="section-status-badge"
                    style={{ backgroundColor: getStatusColor(getSectionStatus(activeSection)) }}
                  >
                    {getSectionStatus(activeSection).replace('-', ' ')}
                  </span>
                </div>
                <button 
                  className="btn-clear"
                  onClick={handleClearContent}
                  disabled={!generatedContent[activeSection].trim() && !userInput.trim()}
                >
                  <i className="fas fa-eraser"></i>
                  Clear Section
                </button>
              </div>
            </div>

            <div className="input-area">
              <label className="input-label">
                <i className="fas fa-edit"></i>
                Instructions for AI
                <span className="input-tip">
                  Describe what you want to include in this section...
                </span>
              </label>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={getSectionPlaceholder(activeSection)}
                className="modern-textarea"
                rows="4"
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
                      <i className="fas fa-robot"></i>
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
                Generated Content - {sections[activeSection].label}
              </h3>
              <div className="output-stats">
                <span className="word-count">{getSectionWordCount(activeSection)} words</span>
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
                    disabled={!generatedContent[activeSection].trim()}
                  >
                    <i className="fas fa-magic"></i>
                    Improve
                  </button>
                  <button 
                    className="btn-analyze"
                    onClick={handleAnalyzeContent}
                    disabled={!generatedContent[activeSection].trim()}
                  >
                    <i className="fas fa-chart-bar"></i>
                    Analyze
                  </button>
                  <button 
                    className="btn-save"
                    onClick={handleSaveContent}
                    disabled={!Object.values(generatedContent).some(content => content.trim())}
                  >
                    <i className="fas fa-save"></i>
                    Save All
                  </button>
                </div>
              </div>
            </div>

            <div className="content-area">
              {generatedContent[activeSection] ? (
                <div className="generated-content">
                  <div className="content-scroll">
                    {generatedContent[activeSection]}
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <i className="fas fa-robot"></i>
                  </div>
                  <h4>Ready to Create {sections[activeSection].label}</h4>
                  <p>Provide instructions above and click "Generate Content" to create your {sections[activeSection].label.toLowerCase()}.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for section-specific placeholders
const getSectionPlaceholder = (section) => {
  const placeholders = {
    needsStatement: 'Describe the community problem, needs assessment data, target population demographics, and why this issue requires immediate attention...',
    objectives: 'List specific, measurable goals, expected outcomes, target metrics, timeline for achievement, and how success will be measured...',
    methodology: 'Explain program activities, implementation approach, staff roles, participant recruitment, timeline, and step-by-step procedures...',
    evaluation: 'Describe data collection methods, evaluation tools, success indicators, reporting schedule, and how results will inform program improvements...',
    budget: 'Break down costs by category, justify expenses, explain personnel costs, describe matching funds, and show cost-effectiveness...',
    sustainability: 'Explain long-term funding plans, community partnerships, capacity building, revenue generation, and plans for continued impact...'
  };
  return placeholders[section] || 'Describe what you want to include in this section...';
};

export default WritingAssistant;