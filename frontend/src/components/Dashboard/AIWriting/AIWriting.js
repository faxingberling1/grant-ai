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
  const [grantSources, setGrantSources] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedGrant, setSelectedGrant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');

  // Get the API URL from environment variables
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'; // Fallback remains localhost for local dev

  // Check API connection
  useEffect(() => {
    checkAPIStatus();
    loadInitialData();
  }, []);

  const checkAPIStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('🔍 Checking API status at:', `${API_URL}/api/health`);

      const response = await fetch(`${API_URL}/api/health`, {
        method: 'GET',
        headers: headers,
      });

      const data = await response.json();
      console.log('✅ API Health response:', data);

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

  const loadInitialData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('🔄 Fetching clients from:', `${API_URL}/api/clients`);

      // Fetch real clients from API
      const clientsResponse = await fetch(`${API_URL}/api/clients`, {
        method: 'GET',
        headers: headers,
      });

      console.log('📡 Clients response status:', clientsResponse.status);

      if (clientsResponse.ok) {
        const clientsData = await clientsResponse.json();
        console.log('✅ Clients data received:', clientsData.length, 'clients');

        const transformedClients = clientsData.map(client => ({
          id: client._id,
          name: client.organizationName,
          category: client.category || client.organizationType || 'General',
          mission: client.missionStatement,
          focusAreas: client.focusAreas || [],
          fullData: client // Include all original data for AI context
        }));

        setClients(transformedClients);
        console.log('✅ Transformed clients:', transformedClients);
      } else {
        console.log('❌ Clients fetch failed, using mock data');
        // Fallback to mock data if API fails
        loadMockData();
      }

      // Fetch grant sources
      await loadGrantSources();

    } catch (error) {
      console.error('Error loading initial data:', error);
      loadMockData();
    }
  };

  const loadGrantSources = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('🔄 Fetching grant sources from:', `${API_URL}/api/grants/sources`);

      // Fetch grant sources from API
      const grantSourcesResponse = await fetch(`${API_URL}/api/grants/sources`, {
        method: 'GET',
        headers: headers,
      });

      console.log('📡 Grant sources response status:', grantSourcesResponse.status);

      if (grantSourcesResponse.ok) {
        const grantSourcesData = await grantSourcesResponse.json();
        console.log('✅ Grant sources data received:', grantSourcesData.length, 'sources');
        setGrantSources(grantSourcesData);
      } else {
        console.log('❌ Grant sources fetch failed, using mock data');
        // Fallback to mock grant sources if API fails
        loadMockGrantSources();
      }
    } catch (error) {
      console.error('Error loading grant sources:', error);
      loadMockGrantSources();
    }
  };

  const loadMockGrantSources = () => {
    const mockGrantSources = [
      {
        id: '1',
        title: 'NSF STEM Education Grant',
        funder: 'National Science Foundation',
        category: 'Education',
        deadline: '2024-03-15',
        maxAward: 500000,
        focusAreas: ['STEM Education', 'K-12', 'Underserved Communities'],
        eligibility: 'Non-profit organizations, educational institutions',
        url: 'https://www.nsf.gov/funding/'
      },
      {
        id: '2',
        title: 'Environmental Conservation Program',
        funder: 'Environmental Protection Agency',
        category: 'Environment',
        deadline: '2024-04-20',
        maxAward: 750000,
        focusAreas: ['Conservation', 'Climate Change', 'Sustainability'],
        eligibility: 'Non-profit organizations, government agencies',
        url: 'https://www.epa.gov/grants'
      },
      {
        id: '3',
        title: 'Community Health Initiative',
        funder: 'Department of Health and Human Services',
        category: 'Healthcare',
        deadline: '2024-05-30',
        maxAward: 1000000,
        focusAreas: ['Public Health', 'Community Wellness', 'Healthcare Access'],
        eligibility: 'Non-profit organizations, healthcare providers',
        url: 'https://www.hhs.gov/grants/'
      },
      {
        id: '4',
        title: 'Youth Development Fund',
        funder: 'Department of Education',
        category: 'Youth Development',
        deadline: '2024-06-15',
        maxAward: 300000,
        focusAreas: ['After-school Programs', 'Mentorship', 'Career Readiness'],
        eligibility: 'Non-profit organizations, schools, community centers',
        url: 'https://www.ed.gov/funding'
      },
      {
        id: '5',
        title: 'Arts and Culture Grant',
        funder: 'National Endowment for the Arts',
        category: 'Arts & Culture',
        deadline: '2024-07-01',
        maxAward: 250000,
        focusAreas: ['Arts Education', 'Cultural Programs', 'Community Arts'],
        eligibility: 'Non-profit organizations, arts institutions',
        url: 'https://www.arts.gov/grants'
      }
    ];

    setGrantSources(mockGrantSources);
  };

  const loadMockData = () => {
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

  const createNewGrant = async (grantData) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('🔄 Creating grant at:', `${API_URL}/api/grants`);

      const response = await fetch(`${API_URL}/api/grants`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(grantData),
      });

      const data = await response.json();
      console.log('📡 Create grant response:', data);

      if (response.ok && data.success) {
        // Add the new grant to the grants list
        setGrants(prevGrants => [...prevGrants, data.data]);
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to create grant');
      }
    } catch (error) {
      console.error('Error creating grant:', error);
      throw new Error('Failed to create grant. Please try again.');
    }
  };

  const generateContent = async (prompt, context, section) => {
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const requestBody = {
        prompt: prompt,
        context: {
          clientId: selectedClient?.id,
          grantId: selectedGrant?.id,
          section: section,
          ...context
        },
        tone: context?.tone || 'professional',
        length: context?.length || 'medium',
        format: context?.format || 'paragraph'
      };

      console.log('🚀 Generating content at:', `${API_URL}/api/generate`);
      console.log('📝 Request body:', requestBody);

      const response = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('📡 Generate content response:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'API request failed');
      }

      setLoading(false);
      return data.content;

    } catch (error) {
      console.error('Error generating content:', error);
      setLoading(false);
      throw new Error(error.message || 'Failed to generate content. Please try again.');
    }
  };

  const improveContent = async (content, improvementType, context = {}) => {
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const requestBody = {
        content: content,
        improvement_type: improvementType,
        context: {
          clientId: selectedClient?.id,
          grantId: selectedGrant?.id,
          ...context
        }
      };

      console.log('🔧 Improving content at:', `${API_URL}/api/improve`);

      const response = await fetch(`${API_URL}/api/improve`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'API request failed');
      }

      setLoading(false);
      return data.improved_content;

    } catch (error) {
      console.error('Error improving content:', error);
      setLoading(false);
      throw new Error(error.message || 'Failed to improve content. Please try again.');
    }
  };

  const analyzeContent = async (content, analysisType, context = {}) => {
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const requestBody = {
        content: content,
        analysis_type: analysisType,
        context: {
          clientId: selectedClient?.id,
          grantId: selectedGrant?.id,
          ...context
        }
      };

      console.log('📊 Analyzing content at:', `${API_URL}/api/analyze`);

      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'API request failed');
      }

      setLoading(false);
      return data.analysis;

    } catch (error) {
      console.error('Error analyzing content:', error);
      setLoading(false);
      throw new Error(error.message || 'Failed to analyze content. Please try again.');
    }
  };

  const getTemplates = async (templateType) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('📋 Fetching templates at:', `${API_URL}/api/templates/${templateType}`);

      const response = await fetch(`${API_URL}/api/templates/${templateType}`, {
        method: 'GET',
        headers: headers,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'API request failed');
      }

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
          structure: ['Problem Statement', 'Data & Statistics', 'Impact Description', 'Urgency'],
          prompt: 'Write a compelling needs statement for a grant proposal focusing on community needs and gaps in services.'
        },
        {
          id: '2',
          name: 'Program Gap Analysis',
          description: 'Identify gaps in existing services and programs',
          structure: ['Current Services', 'Identified Gaps', 'Target Population', 'Proposed Solution'],
          prompt: 'Create a gap analysis showing the need for a new program or service.'
        }
      ],
      objectives: [
        {
          id: '1',
          name: 'SMART Objectives',
          description: 'Specific, Measurable, Achievable, Relevant, Time-bound objectives',
          structure: ['Specific', 'Measurable', 'Achievable', 'Relevant', 'Time-bound'],
          prompt: 'Develop SMART objectives for a grant proposal that are clear and achievable.'
        },
        {
          id: '2',
          name: 'Program Outcomes',
          description: 'Define expected program outcomes and impact',
          structure: ['Short-term Outcomes', 'Long-term Impact', 'Measurement Methods', 'Timeline'],
          prompt: 'Outline the expected outcomes and impact of the proposed program.'
        }
      ],
      methodology: [
        {
          id: '1',
          name: 'Program Implementation Plan',
          description: 'Detailed program activities and implementation steps',
          structure: ['Activities', 'Timeline', 'Staffing', 'Resources', 'Monitoring'],
          prompt: 'Describe the methodology and implementation plan for the proposed program.'
        },
        {
          id: '2',
          name: 'Project Timeline',
          description: 'Clear timeline for project activities and milestones',
          structure: ['Phase 1', 'Phase 2', 'Phase 3', 'Milestones', 'Deliverables'],
          prompt: 'Create a detailed project timeline with clear milestones and deliverables.'
        }
      ],
      evaluation: [
        {
          id: '1',
          name: 'Program Evaluation Plan',
          description: 'Comprehensive evaluation framework and methods',
          structure: ['Evaluation Questions', 'Data Collection', 'Analysis Methods', 'Reporting'],
          prompt: 'Develop an evaluation plan to measure program success and impact.'
        }
      ],
      budget: [
        {
          id: '1',
          name: 'Budget Narrative Template',
          description: 'Justify and explain budget items clearly',
          structure: ['Personnel Costs', 'Operating Expenses', 'Equipment', 'Indirect Costs'],
          prompt: 'Write a budget narrative that clearly justifies each expense in the proposal.'
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
            grantSources={grantSources}
            selectedClient={selectedClient}
            selectedGrant={selectedGrant}
            onSelectClient={setSelectedClient}
            onSelectGrant={setSelectedGrant}
            onCreateGrant={createNewGrant}
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
            grantSources={grantSources}
            selectedClient={selectedClient}
            selectedGrant={selectedGrant}
            onSelectClient={setSelectedClient}
            onSelectGrant={setSelectedGrant}
            onCreateGrant={createNewGrant}
            onImproveContent={improveContent}
            onAnalyzeContent={analyzeContent}
            loading={loading}
          />
        )}

        {activeTab === 'collaboration' && (
          <CollaborationTools
            clients={clients}
            grants={grants}
            grantSources={grantSources}
            selectedClient={selectedClient}
            selectedGrant={selectedGrant}
          />
        )}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <i className="fas fa-robot fa-spin"></i>
            <p>AI is generating content...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIWriting;