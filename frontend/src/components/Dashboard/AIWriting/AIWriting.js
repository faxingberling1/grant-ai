// frontend/src/components/Dashboard/AIWriting/AIWriting.js
import React, { useState, useEffect } from 'react';
import WritingAssistant from './WritingAssistant';
import TemplateLibrary from './TemplateLibrary';
import ContentEditor from './ContentEditor';
import CollaborationTools from './CollaborationTools';
import './AIWriting.css';

const AIWriting = () => {
  const [activeTab, setActiveTab] = useState('assistant');
  const [clients, setClients] = useState([]);
  const [grants, setGrants] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedGrant, setSelectedGrant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');

  // Check API connection
  useEffect(() => {
    checkAPIStatus();
    loadInitialData();
  }, []);

  const checkAPIStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setApiStatus('connected');
      } else {
        setApiStatus('error');
      }
    } catch (error) {
      console.error('API connection error:', error);
      setApiStatus('error');
    }
  };

  const loadInitialData = () => {
    // Mock data - replace with actual API calls
    const mockClients = [
      {
        id: '1',
        name: 'Tech4Kids Foundation',
        category: 'Education',
        mission: 'Providing STEM education to underprivileged youth',
        focusAreas: ['STEM Education', 'Youth Development']
      },
      {
        id: '2',
        name: 'Green Earth Alliance',
        category: 'Environment',
        mission: 'Promoting environmental conservation',
        focusAreas: ['Conservation', 'Climate Change']
      }
    ];

    const mockGrants = [
      {
        id: '1',
        title: 'NSF STEM Education Grant',
        clientId: '1',
        status: 'draft',
        deadline: '2024-03-15',
        sections: {
          needsStatement: '',
          objectives: '',
          methodology: '',
          evaluation: '',
          budget: ''
        }
      },
      {
        id: '2',
        title: 'Environmental Conservation Program',
        clientId: '2',
        status: 'in_progress',
        deadline: '2024-04-20',
        sections: {
          needsStatement: 'Initial draft completed',
          objectives: 'Objectives defined',
          methodology: '',
          evaluation: '',
          budget: ''
        }
      }
    ];

    setClients(mockClients);
    setGrants(mockGrants);
  };

  const generateContent = async (prompt, context, section) => {
    setLoading(true);
    
    try {
      const requestBody = {
        prompt: prompt,
        context: {
          client: selectedClient,
          grant: selectedGrant,
          section: section,
          ...context
        },
        tone: 'professional',
        length: 'medium',
        format: 'paragraph'
      };

      const response = await fetch('http://localhost:8000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      setLoading(false);
      return data.content;

    } catch (error) {
      console.error('Error generating content:', error);
      setLoading(false);
      throw new Error('Failed to generate content. Please try again.');
    }
  };

  const improveContent = async (content, improvementType) => {
    setLoading(true);
    
    try {
      const requestBody = {
        content: content,
        improvement_type: improvementType,
        context: {
          client: selectedClient,
          grant: selectedGrant
        }
      };

      const response = await fetch('http://localhost:8000/api/improve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      setLoading(false);
      return data.improved_content;

    } catch (error) {
      console.error('Error improving content:', error);
      setLoading(false);
      throw new Error('Failed to improve content. Please try again.');
    }
  };

  const analyzeContent = async (content, analysisType) => {
    setLoading(true);
    
    try {
      const requestBody = {
        content: content,
        analysis_type: analysisType,
        context: {
          client: selectedClient,
          grant: selectedGrant
        }
      };

      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      setLoading(false);
      return data.analysis;

    } catch (error) {
      console.error('Error analyzing content:', error);
      setLoading(false);
      throw new Error('Failed to analyze content. Please try again.');
    }
  };

  const getTemplates = async (templateType) => {
    try {
      const response = await fetch(`http://localhost:8000/api/templates/${templateType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      return data.templates;

    } catch (error) {
      console.error('Error fetching templates:', error);
      // Return fallback templates
      return getFallbackTemplates(templateType);
    }
  };

  const getFallbackTemplates = (templateType) => {
    const templates = {
      needs_statement: [
        {
          id: '1',
          name: 'Community Needs Assessment',
          description: 'Template for describing community problems and needs',
          structure: ['Problem Statement', 'Data & Statistics', 'Impact Description', 'Urgency']
        },
        {
          id: '2',
          name: 'Program Gap Analysis',
          description: 'Identify gaps in existing services and programs',
          structure: ['Current Services', 'Identified Gaps', 'Target Population', 'Proposed Solution']
        }
      ],
      objectives: [
        {
          id: '1',
          name: 'SMART Objectives',
          description: 'Specific, Measurable, Achievable, Relevant, Time-bound objectives',
          structure: ['Specific', 'Measurable', 'Achievable', 'Relevant', 'Time-bound']
        }
      ],
      methodology: [
        {
          id: '1',
          name: 'Program Implementation Plan',
          description: 'Detailed program activities and implementation steps',
          structure: ['Activities', 'Timeline', 'Staffing', 'Resources', 'Monitoring']
        }
      ]
    };

    return templates[templateType] || [];
  };

  return (
    <div className="ai-writing-container">
      {/* Header */}
      <div className="ai-writing-header">
        <div className="header-content">
          <div className="header-title">
            <h1>AI Grant Writing Assistant</h1>
            <div className="api-status">
              <span className={`status-indicator ${apiStatus}`}>
                <i className={`fas fa-${apiStatus === 'connected' ? 'check-circle' : 'exclamation-triangle'}`}></i>
                {apiStatus === 'connected' ? 'AI Assistant Connected' : 'AI Assistant Offline'}
              </span>
            </div>
            <p>Leverage AI to create compelling grant proposals faster and more effectively</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-outline">
              <i className="fas fa-history"></i>
              Writing History
            </button>
            <button className="btn btn-primary">
              <i className="fas fa-download"></i>
              Export Workspace
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="ai-writing-tabs">
        <nav className="tabs-navigation">
          <button 
            className={`tab-button ${activeTab === 'assistant' ? 'active' : ''}`}
            onClick={() => setActiveTab('assistant')}
          >
            <i className="fas fa-robot"></i>
            Writing Assistant
          </button>
          <button 
            className={`tab-button ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            <i className="fas fa-file-alt"></i>
            Template Library
          </button>
          <button 
            className={`tab-button ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => setActiveTab('editor')}
          >
            <i className="fas fa-edit"></i>
            Content Editor
          </button>
          <button 
            className={`tab-button ${activeTab === 'collaboration' ? 'active' : ''}`}
            onClick={() => setActiveTab('collaboration')}
          >
            <i className="fas fa-users"></i>
            Collaboration
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ai-writing-content">
        {activeTab === 'assistant' && (
          <WritingAssistant
            clients={clients}
            grants={grants}
            selectedClient={selectedClient}
            selectedGrant={selectedGrant}
            onSelectClient={setSelectedClient}
            onSelectGrant={setSelectedGrant}
            onGenerateContent={generateContent}
            onImproveContent={improveContent}
            onAnalyzeContent={analyzeContent}
            loading={loading}
            apiStatus={apiStatus}
          />
        )}

        {activeTab === 'templates' && (
          <TemplateLibrary
            onSelectTemplate={(template) => {
              setActiveTab('assistant');
              // Template selection logic would be handled in WritingAssistant
            }}
            getTemplates={getTemplates}
          />
        )}

        {activeTab === 'editor' && (
          <ContentEditor
            clients={clients}
            grants={grants}
            selectedClient={selectedClient}
            selectedGrant={selectedGrant}
            onSelectClient={setSelectedClient}
            onSelectGrant={setSelectedGrant}
          />
        )}

        {activeTab === 'collaboration' && (
          <CollaborationTools
            clients={clients}
            grants={grants}
            selectedClient={selectedClient}
            selectedGrant={selectedGrant}
          />
        )}
      </div>
    </div>
  );
};

export default AIWriting;