// frontend/src/components/Dashboard/AIWriting/WritingAssistant.js
import React, { useState, useEffect } from 'react';

const WritingAssistant = ({
  clients,
  grants,
  selectedClient,
  selectedGrant,
  onSelectClient,
  onSelectGrant,
  onGenerateContent,
  onImproveContent,
  onAnalyzeContent,
  loading,
  apiStatus
}) => {
  const [activeSection, setActiveSection] = useState('needs_statement');
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [history, setHistory] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const grantSections = [
    {
      id: 'needs_statement',
      name: 'Needs Statement',
      description: 'Describe the problem and community needs',
      icon: 'fas fa-exclamation-circle'
    },
    {
      id: 'objectives',
      name: 'Goals & Objectives',
      description: 'Define program goals and measurable objectives',
      icon: 'fas fa-bullseye'
    },
    {
      id: 'methodology',
      name: 'Methodology',
      description: 'Explain program activities and implementation plan',
      icon: 'fas fa-cogs'
    },
    {
      id: 'evaluation',
      name: 'Evaluation Plan',
      description: 'Describe how success will be measured',
      icon: 'fas fa-chart-line'
    },
    {
      id: 'budget',
      name: 'Budget Narrative',
      description: 'Justify budget items and costs',
      icon: 'fas fa-dollar-sign'
    },
    {
      id: 'organization',
      name: 'Organization Background',
      description: 'Showcase your organization\'s capacity',
      icon: 'fas fa-building'
    }
  ];

  const toneOptions = [
    { value: 'professional', label: 'Professional', description: 'Formal and authoritative' },
    { value: 'persuasive', label: 'Persuasive', description: 'Compelling and convincing' },
    { value: 'compassionate', label: 'Compassionate', description: 'Empathetic and caring' },
    { value: 'data_driven', label: 'Data-Driven', description: 'Fact-based and statistical' },
    { value: 'storytelling', label: 'Storytelling', description: 'Narrative and engaging' }
  ];

  const lengthOptions = [
    { value: 'brief', label: 'Brief', description: '1-2 paragraphs' },
    { value: 'medium', label: 'Medium', description: '3-4 paragraphs' },
    { value: 'detailed', label: 'Detailed', description: '5+ paragraphs' }
  ];

  const improvementTypes = [
    { value: 'clarity', label: 'Improve Clarity', description: 'Make content clearer and more concise' },
    { value: 'persuasiveness', label: 'Enhance Persuasiveness', description: 'Make arguments more compelling' },
    { value: 'professionalism', label: 'Increase Professionalism', description: 'Make tone more formal and authoritative' },
    { value: 'impact', label: 'Strengthen Impact', description: 'Emphasize outcomes and benefits' },
    { value: 'structure', label: 'Improve Structure', description: 'Enhance organization and flow' }
  ];

  const analysisTypes = [
    { value: 'readability', label: 'Readability Score', description: 'Assess reading level and clarity' },
    { value: 'persuasion', label: 'Persuasion Analysis', description: 'Evaluate compelling arguments' },
    { value: 'alignment', label: 'Grant Alignment', description: 'Check alignment with funder priorities' },
    { value: 'completeness', label: 'Completeness Check', description: 'Identify missing information' }
  ];

  useEffect(() => {
    // Load default prompt for selected section
    const section = grantSections.find(s => s.id === activeSection);
    if (section) {
      setPrompt(getDefaultPrompt(section.id));
    }
  }, [activeSection]);

  const getDefaultPrompt = (sectionId) => {
    const prompts = {
      needs_statement: `Describe the community problem and needs that this grant will address. Include relevant statistics and data to demonstrate the urgency and scope of the issue.`,
      objectives: `Create specific, measurable, achievable, relevant, and time-bound (SMART) objectives for this program. Focus on outcomes and impact.`,
      methodology: `Outline the program activities, implementation steps, timeline, and resources needed. Explain why this approach will be effective.`,
      evaluation: `Describe how program success will be measured, including evaluation methods, metrics, data collection, and reporting.`,
      budget: `Provide a narrative justification for the budget items, explaining how each cost supports program objectives and represents efficient use of funds.`,
      organization: `Highlight the organization's experience, capacity, and track record in relevant areas to demonstrate capability to implement the proposed program.`
    };
    return prompts[sectionId] || 'Write compelling content for this grant section.';
  };

  const handleGenerate = async () => {
    if (!selectedClient || !selectedGrant) {
      alert('Please select a client and grant first.');
      return;
    }

    if (!prompt.trim()) {
      alert('Please enter a prompt or instructions.');
      return;
    }

    setIsGenerating(true);

    try {
      const context = {
        customInstructions,
        tone,
        length,
        section: activeSection
      };

      const content = await onGenerateContent(prompt, context, activeSection);
      setGeneratedContent(content);

      // Add to history
      setHistory(prev => [{
        id: Date.now(),
        section: activeSection,
        prompt: prompt,
        content: content,
        timestamp: new Date().toLocaleString(),
        client: selectedClient.name,
        grant: selectedGrant.title
      }, ...prev.slice(0, 9)]); // Keep last 10 items

    } catch (error) {
      alert(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImprove = async (improvementType) => {
    if (!generatedContent.trim()) {
      alert('Please generate some content first.');
      return;
    }

    setIsGenerating(true);

    try {
      const improvedContent = await onImproveContent(generatedContent, improvementType);
      setGeneratedContent(improvedContent);

      // Add to history
      setHistory(prev => [{
        id: Date.now(),
        section: 'improvement',
        prompt: `Improve: ${improvementType}`,
        content: improvedContent,
        timestamp: new Date().toLocaleString(),
        client: selectedClient.name,
        grant: selectedGrant.title
      }, ...prev.slice(0, 9)]);

    } catch (error) {
      alert(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyze = async (analysisType) => {
    if (!generatedContent.trim()) {
      alert('Please generate some content first.');
      return;
    }

    setIsGenerating(true);

    try {
      const analysis = await onAnalyzeContent(generatedContent, analysisType);
      
      // Show analysis results
      alert(`Analysis Results (${analysisType}):\n\n${analysis}`);

    } catch (error) {
      alert(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseTemplate = (template) => {
    setPrompt(template.prompt);
    setCustomInstructions(template.instructions || '');
  };

  const handleSaveContent = () => {
    if (!generatedContent.trim()) {
      alert('No content to save.');
      return;
    }

    // Here you would typically save to your database
    console.log('Saving content:', {
      section: activeSection,
      content: generatedContent,
      client: selectedClient?.id,
      grant: selectedGrant?.id
    });

    alert('Content saved successfully!');
  };

  const handleCopyContent = () => {
    if (!generatedContent.trim()) {
      alert('No content to copy.');
      return;
    }

    navigator.clipboard.writeText(generatedContent);
    alert('Content copied to clipboard!');
  };

  return (
    <div className="writing-assistant">
      <div className="assistant-layout">
        {/* Left Sidebar - Controls */}
        <div className="controls-sidebar">
          {/* Client & Grant Selection */}
          <div className="control-section">
            <h3>Project Setup</h3>
            
            <div className="form-group">
              <label>Select Client</label>
              <select 
                value={selectedClient?.id || ''} 
                onChange={(e) => onSelectClient(clients.find(c => c.id === e.target.value))}
              >
                <option value="">Choose a client...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Select Grant</label>
              <select 
                value={selectedGrant?.id || ''} 
                onChange={(e) => onSelectGrant(grants.find(g => g.id === e.target.value))}
                disabled={!selectedClient}
              >
                <option value="">Choose a grant...</option>
                {grants
                  .filter(grant => grant.clientId === selectedClient?.id)
                  .map(grant => (
                    <option key={grant.id} value={grant.id}>
                      {grant.title}
                    </option>
                  ))
                }
              </select>
            </div>
          </div>

          {/* Section Selection */}
          <div className="control-section">
            <h3>Grant Section</h3>
            <div className="section-buttons">
              {grantSections.map(section => (
                <button
                  key={section.id}
                  className={`section-button ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <i className={section.icon}></i>
                  <span>{section.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Writing Settings */}
          <div className="control-section">
            <h3>Writing Settings</h3>
            
            <div className="form-group">
              <label>Tone</label>
              <select value={tone} onChange={(e) => setTone(e.target.value)}>
                {toneOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <small>{toneOptions.find(t => t.value === tone)?.description}</small>
            </div>

            <div className="form-group">
              <label>Length</label>
              <select value={length} onChange={(e) => setLength(e.target.value)}>
                {lengthOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <small>{lengthOptions.find(l => l.value === length)?.description}</small>
            </div>

            <div className="form-group">
              <label>Custom Instructions</label>
              <textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Any specific instructions or requirements..."
                rows="3"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="control-section">
            <h3>Quick Actions</h3>
            <div className="quick-actions">
              <button 
                className="btn btn-outline"
                onClick={() => setPrompt(getDefaultPrompt(activeSection))}
              >
                <i className="fas fa-magic"></i>
                Default Prompt
              </button>
              <button 
                className="btn btn-outline"
                onClick={handleSaveContent}
                disabled={!generatedContent.trim()}
              >
                <i className="fas fa-save"></i>
                Save Content
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="content-area">
          {/* Prompt Input */}
          <div className="prompt-section">
            <h3>AI Instructions</h3>
            <div className="prompt-input">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want the AI to write... Be specific about the content, key points, and any requirements."
                rows="6"
              />
              <div className="prompt-actions">
                <button 
                  className="btn btn-primary generate-btn"
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating || !selectedClient || !selectedGrant || apiStatus !== 'connected'}
                >
                  {isGenerating ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Generating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-robot"></i>
                      Generate Content
                    </>
                  )}
                </button>
                <div className="prompt-tips">
                  <small>
                    <i className="fas fa-lightbulb"></i>
                    Tip: Be specific about data, outcomes, and key messages you want to include.
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Generated Content */}
          <div className="content-section">
            <div className="content-header">
              <h3>Generated Content</h3>
              <div className="content-actions">
                <button 
                  className="btn btn-outline"
                  onClick={handleCopyContent}
                  disabled={!generatedContent.trim()}
                >
                  <i className="fas fa-copy"></i>
                  Copy
                </button>
                <button 
                  className="btn btn-outline"
                  onClick={() => setGeneratedContent('')}
                  disabled={!generatedContent.trim()}
                >
                  <i className="fas fa-trash"></i>
                  Clear
                </button>
              </div>
            </div>
            
            <div className="content-output">
              {generatedContent ? (
                <div className="generated-content">
                  <div className="content-text">
                    {generatedContent}
                  </div>
                  
                  {/* Improvement Tools */}
                  <div className="improvement-tools">
                    <h4>Enhance Content</h4>
                    <div className="improvement-buttons">
                      {improvementTypes.map(type => (
                        <button
                          key={type.value}
                          className="btn btn-outline improvement-btn"
                          onClick={() => handleImprove(type.value)}
                          disabled={isGenerating}
                        >
                          <i className="fas fa-wand-magic-sparkles"></i>
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Analysis Tools */}
                  <div className="analysis-tools">
                    <h4>Analyze Content</h4>
                    <div className="analysis-buttons">
                      {analysisTypes.map(type => (
                        <button
                          key={type.value}
                          className="btn btn-outline analysis-btn"
                          onClick={() => handleAnalyze(type.value)}
                          disabled={isGenerating}
                        >
                          <i className="fas fa-chart-bar"></i>
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-content">
                  <i className="fas fa-robot"></i>
                  <h4>No Content Generated Yet</h4>
                  <p>Enter your instructions above and click "Generate Content" to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - History & Templates */}
        <div className="sidebar-right">
          {/* Writing History */}
          <div className="history-section">
            <h3>Recent Generations</h3>
            <div className="history-list">
              {history.length > 0 ? (
                history.map(item => (
                  <div key={item.id} className="history-item">
                    <div className="history-header">
                      <span className="history-section">{item.section}</span>
                      <span className="history-time">{item.timestamp}</span>
                    </div>
                    <div className="history-preview">
                      {item.content.substring(0, 100)}...
                    </div>
                    <div className="history-actions">
                      <button 
                        className="btn-link"
                        onClick={() => {
                          setGeneratedContent(item.content);
                          setActiveSection(item.section);
                        }}
                      >
                        <i className="fas fa-redo"></i>
                        Use
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-history">
                  <i className="fas fa-history"></i>
                  <p>No generation history yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Templates */}
          <div className="templates-section">
            <h3>Quick Templates</h3>
            <div className="template-buttons">
              <button 
                className="btn btn-outline template-btn"
                onClick={() => handleUseTemplate({
                  prompt: 'Write a compelling needs statement that highlights the urgency of the problem and demonstrates clear community need using relevant statistics and local data.',
                  instructions: 'Focus on specific demographics and include recent data'
                })}
              >
                Needs Statement
              </button>
              <button 
                className="btn btn-outline template-btn"
                onClick={() => handleUseTemplate({
                  prompt: 'Create SMART objectives that are specific, measurable, achievable, relevant, and time-bound. Include both process and outcome objectives.',
                  instructions: 'Ensure objectives align with funder priorities'
                })}
              >
                SMART Objectives
              </button>
              <button 
                className="btn btn-outline template-btn"
                onClick={() => handleUseTemplate({
                  prompt: 'Develop a detailed methodology section that explains program activities, timeline, staffing, and resources. Justify why this approach will be effective.',
                  instructions: 'Include specific activities and implementation steps'
                })}
              >
                Methodology
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritingAssistant;