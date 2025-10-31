// frontend/src/components/Dashboard/Sources/Sources.js
import React, { useState, useEffect } from 'react';
import SourceList from './SourceList';
import SourceDetails from './SourceDetails';
import SourceForm from './SourceForm';
import './Sources.css';

const Sources = () => {
  const [view, setView] = useState('list'); // 'list', 'details', 'create', 'edit'
  const [selectedSource, setSelectedSource] = useState(null);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Mock data with enhanced grant opportunities
  useEffect(() => {
    const mockSources = [
      {
        id: '1',
        name: 'National Science Foundation',
        type: 'government',
        category: 'STEM Education',
        deadline: '2024-03-15',
        amount: '500,000 - 2,000,000',
        status: 'active',
        matchScore: 95,
        website: 'https://www.nsf.gov',
        contactEmail: 'grants@nsf.gov',
        eligibility: 'Universities, Research Institutions, Non-profit STEM Organizations',
        focusAreas: ['STEM Education', 'Research', 'Technology', 'Innovation'],
        notes: 'Focus on innovative STEM education programs and research initiatives. Priority given to projects with strong community impact and measurable outcomes.',
        lastUpdated: '2024-01-15',
        grants: [
          {
            id: 'nsf-1',
            title: 'STEM Education Research Grants',
            amount: '$500,000 - $1,500,000',
            deadline: '2024-03-15',
            category: 'Research',
            status: 'active',
            description: 'Support for research projects that advance STEM education through innovative approaches and methodologies.'
          },
          {
            id: 'nsf-2',
            title: 'Technology Innovation Program',
            amount: '$750,000 - $2,000,000',
            deadline: '2024-04-30',
            category: 'Technology',
            status: 'upcoming',
            description: 'Funding for technology-driven solutions in education and research infrastructure.'
          },
          {
            id: 'nsf-3',
            title: 'Graduate Research Fellowships',
            amount: '$50,000 per year',
            deadline: '2024-02-28',
            category: 'Scholarships',
            status: 'active',
            description: 'Three-year fellowships for outstanding graduate students in STEM fields.'
          }
        ]
      },
      {
        id: '2',
        name: 'Ford Foundation',
        type: 'private_foundation',
        category: 'Social Justice',
        deadline: '2024-06-30',
        amount: '100,000 - 1,000,000',
        status: 'active',
        matchScore: 88,
        website: 'https://www.fordfoundation.org',
        contactEmail: 'grants@fordfoundation.org',
        eligibility: 'Nonprofits, Community Organizations, Advocacy Groups',
        focusAreas: ['Social Justice', 'Equity', 'Community Development', 'Civil Rights'],
        notes: 'Priority given to organizations serving marginalized communities and advancing social justice initiatives.',
        lastUpdated: '2024-01-10',
        grants: [
          {
            id: 'ford-1',
            title: 'Racial Justice Initiative',
            amount: '$250,000 - $1,000,000',
            deadline: '2024-06-30',
            category: 'Social Justice',
            status: 'active',
            description: 'Support for organizations working to address systemic racism and promote racial equity.'
          },
          {
            id: 'ford-2',
            title: 'Economic Opportunity Fund',
            amount: '$100,000 - $500,000',
            deadline: '2024-05-15',
            category: 'Community Development',
            status: 'active',
            description: 'Grants for programs that create economic opportunities in underserved communities.'
          },
          {
            id: 'ford-3',
            title: 'Gender Equity Program',
            amount: '$200,000 - $750,000',
            deadline: '2024-07-31',
            category: 'Social Justice',
            status: 'upcoming',
            description: 'Funding for initiatives that promote gender equality and women empowerment.'
          }
        ]
      },
      {
        id: '3',
        name: 'Department of Energy',
        type: 'government',
        category: 'Clean Energy',
        deadline: '2024-04-20',
        amount: '750,000 - 5,000,000',
        status: 'active',
        matchScore: 92,
        website: 'https://www.energy.gov',
        contactEmail: 'funding@energy.gov',
        eligibility: 'Research Institutions, Energy Companies, Universities, National Labs',
        focusAreas: ['Renewable Energy', 'Climate Change', 'Innovation', 'Sustainability'],
        notes: 'Focus on clean energy research, development, and deployment with potential for significant environmental impact.',
        lastUpdated: '2024-01-08',
        grants: [
          {
            id: 'doe-1',
            title: 'Solar Energy Research Program',
            amount: '$1,000,000 - $5,000,000',
            deadline: '2024-04-20',
            category: 'Research',
            status: 'active',
            description: 'Funding for advanced solar energy research and technology development.'
          },
          {
            id: 'doe-2',
            title: 'Grid Modernization Initiative',
            amount: '$750,000 - $3,000,000',
            deadline: '2024-03-31',
            category: 'Technology',
            status: 'active',
            description: 'Support for projects that enhance grid resilience and integrate renewable energy sources.'
          },
          {
            id: 'doe-3',
            title: 'Energy Storage Innovation',
            amount: '$500,000 - $2,500,000',
            deadline: '2024-05-15',
            category: 'Research',
            status: 'upcoming',
            description: 'Grants for developing next-generation energy storage technologies.'
          }
        ]
      },
      {
        id: '4',
        name: 'Gates Foundation',
        type: 'private_foundation',
        category: 'Global Health',
        deadline: '2024-05-15',
        amount: '500,000 - 10,000,000',
        status: 'active',
        matchScore: 85,
        website: 'https://www.gatesfoundation.org',
        contactEmail: 'grants@gatesfoundation.org',
        eligibility: 'Global Health Organizations, Research Institutions, NGOs',
        focusAreas: ['Global Health', 'Education', 'Poverty Alleviation', 'Vaccine Development'],
        notes: 'Focus on global health initiatives, education programs, and poverty alleviation with measurable impact.',
        lastUpdated: '2024-01-05',
        grants: [
          {
            id: 'gates-1',
            title: 'Global Health Innovation',
            amount: '$2,000,000 - $10,000,000',
            deadline: '2024-05-15',
            category: 'Research',
            status: 'active',
            description: 'Large-scale grants for innovative global health solutions and disease prevention.'
          },
          {
            id: 'gates-2',
            title: 'Education Technology Initiative',
            amount: '$500,000 - $2,000,000',
            deadline: '2024-04-10',
            category: 'Technology',
            status: 'active',
            description: 'Support for edtech solutions that improve learning outcomes in developing regions.'
          },
          {
            id: 'gates-3',
            title: 'Agricultural Development',
            amount: '$1,000,000 - $5,000,000',
            deadline: '2024-06-30',
            category: 'Community Development',
            status: 'upcoming',
            description: 'Funding for sustainable agriculture projects in food-insecure regions.'
          }
        ]
      },
      {
        id: '5',
        name: 'National Endowment for the Arts',
        type: 'government',
        category: 'Arts & Culture',
        deadline: '2024-02-28',
        amount: '10,000 - 100,000',
        status: 'upcoming',
        matchScore: 78,
        website: 'https://www.arts.gov',
        contactEmail: 'grants@arts.gov',
        eligibility: 'Arts Organizations, Individual Artists, Cultural Institutions',
        focusAreas: ['Arts Education', 'Cultural Programs', 'Community Arts', 'Performing Arts'],
        notes: 'Supports arts education, community cultural programs, and individual artistic excellence.',
        lastUpdated: '2024-01-12',
        grants: [
          {
            id: 'nea-1',
            title: 'Arts Education Partnership',
            amount: '$25,000 - $100,000',
            deadline: '2024-02-28',
            category: 'Education',
            status: 'upcoming',
            description: 'Grants for arts education programs in schools and community centers.'
          },
          {
            id: 'nea-2',
            title: 'Community Arts Development',
            amount: '$10,000 - $50,000',
            deadline: '2024-03-15',
            category: 'Community Development',
            status: 'upcoming',
            description: 'Support for community-based arts initiatives and cultural programming.'
          },
          {
            id: 'nea-3',
            title: 'Artist Fellowships',
            amount: '$25,000',
            deadline: '2024-01-31',
            category: 'Scholarships',
            status: 'closed',
            description: 'Fellowships for individual artists to support creative work and professional development.'
          }
        ]
      },
      {
        id: '6',
        name: 'Google.org',
        type: 'corporate',
        category: 'Technology',
        deadline: '2024-12-31',
        amount: '250,000 - 2,000,000',
        status: 'active',
        matchScore: 82,
        website: 'https://www.google.org',
        contactEmail: 'grants@google.org',
        eligibility: 'Nonprofits, Social Enterprises, Educational Institutions',
        focusAreas: ['Technology', 'Education', 'Economic Opportunity', 'Crisis Response'],
        notes: 'Google philanthropic arm focusing on technology-driven solutions for social challenges.',
        lastUpdated: '2024-01-18',
        grants: [
          {
            id: 'google-1',
            title: 'Digital Skills Initiative',
            amount: '$500,000 - $2,000,000',
            deadline: '2024-12-31',
            category: 'Education',
            status: 'active',
            description: 'Funding for programs that provide digital skills training to underserved communities.'
          },
          {
            id: 'google-2',
            title: 'AI for Social Good',
            amount: '$250,000 - $1,000,000',
            deadline: '2024-08-31',
            category: 'Technology',
            status: 'active',
            description: 'Grants for projects using artificial intelligence to address social and environmental challenges.'
          }
        ]
      },
      {
        id: '7',
        name: 'Robert Wood Johnson Foundation',
        type: 'private_foundation',
        category: 'Healthcare',
        deadline: '2024-09-30',
        amount: '100,000 - 1,500,000',
        status: 'active',
        matchScore: 87,
        website: 'https://www.rwjf.org',
        contactEmail: 'grants@rwjf.org',
        eligibility: 'Healthcare Organizations, Public Health Agencies, Research Institutions',
        focusAreas: ['Public Health', 'Health Equity', 'Community Health', 'Preventive Care'],
        notes: 'Dedicated to improving health and health equity in the United States.',
        lastUpdated: '2024-01-14',
        grants: [
          {
            id: 'rwjf-1',
            title: 'Health Equity Challenge',
            amount: '$500,000 - $1,500,000',
            deadline: '2024-09-30',
            category: 'Healthcare',
            status: 'active',
            description: 'Funding for initiatives that address health disparities and promote health equity.'
          },
          {
            id: 'rwjf-2',
            title: 'Community Health Leaders',
            amount: '$100,000 - $300,000',
            deadline: '2024-06-15',
            category: 'Community Development',
            status: 'active',
            description: 'Support for community health workers and local health initiatives.'
          },
          {
            id: 'rwjf-3',
            title: 'Public Health Research',
            amount: '$250,000 - $750,000',
            deadline: '2024-07-31',
            category: 'Research',
            status: 'upcoming',
            description: 'Grants for research on public health interventions and policy impact.'
          }
        ]
      },
      {
        id: '8',
        name: 'Environmental Protection Agency',
        type: 'government',
        category: 'Environment',
        deadline: '2024-11-15',
        amount: '200,000 - 3,000,000',
        status: 'active',
        matchScore: 90,
        website: 'https://www.epa.gov',
        contactEmail: 'grants@epa.gov',
        eligibility: 'Environmental Organizations, Local Governments, Tribal Nations, Universities',
        focusAreas: ['Environmental Justice', 'Climate Change', 'Conservation', 'Pollution Prevention'],
        notes: 'Federal agency focused on environmental protection and conservation efforts nationwide.',
        lastUpdated: '2024-01-09',
        grants: [
          {
            id: 'epa-1',
            title: 'Environmental Justice Grants',
            amount: '$500,000 - $3,000,000',
            deadline: '2024-11-15',
            category: 'Community Development',
            status: 'active',
            description: 'Funding for projects that address environmental justice issues in underserved communities.'
          },
          {
            id: 'epa-2',
            title: 'Climate Resilience Program',
            amount: '$200,000 - $1,500,000',
            deadline: '2024-08-31',
            category: 'Research',
            status: 'active',
            description: 'Support for climate adaptation and resilience planning in vulnerable regions.'
          },
          {
            id: 'epa-3',
            title: 'Brownfields Cleanup',
            amount: '$500,000 - $2,000,000',
            deadline: '2024-05-31',
            category: 'Capital Projects',
            status: 'upcoming',
            description: 'Grants for assessment and cleanup of contaminated properties for community reuse.'
          }
        ]
      }
    ];
    
    setSources(mockSources);
    setLoading(false);
  }, []);

  const handleViewSource = (source) => {
    setSelectedSource(source);
    setView('details');
  };

  const handleEditSource = (source) => {
    setSelectedSource(source);
    setView('edit');
  };

  const handleCreateSource = () => {
    setSelectedSource(null);
    setView('create');
  };

  const handleSaveSource = (sourceData) => {
    if (sourceData.id) {
      // Update existing source
      setSources(prev => prev.map(source => 
        source.id === sourceData.id ? { 
          ...sourceData, 
          lastUpdated: new Date().toISOString().split('T')[0] 
        } : source
      ));
    } else {
      // Create new source
      const newSource = {
        ...sourceData,
        id: Date.now().toString(),
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      setSources(prev => [...prev, newSource]);
    }
    setView('list');
  };

  const handleDeleteSource = (sourceId) => {
    setSources(prev => prev.filter(source => source.id !== sourceId));
    setView('list');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedSource(null);
  };

  const filteredSources = sources.filter(source => {
    if (filter === 'all') return true;
    return source.status === filter;
  });

  if (loading) {
    return (
      <div className="sources-loading">
        <i className="fas fa-spinner"></i>
        <p>Loading grant sources...</p>
      </div>
    );
  }

  return (
    <div className="sources-container">
      {view === 'list' && (
        <SourceList
          sources={filteredSources}
          onViewSource={handleViewSource}
          onEditSource={handleEditSource}
          onCreateSource={handleCreateSource}
          onDeleteSource={handleDeleteSource}
          filter={filter}
          onFilterChange={setFilter}
        />
      )}

      {view === 'details' && selectedSource && (
        <SourceDetails
          source={selectedSource}
          onBack={handleBackToList}
          onEdit={() => setView('edit')}
        />
      )}

      {(view === 'create' || view === 'edit') && (
        <SourceForm
          source={view === 'edit' ? selectedSource : null}
          onSave={handleSaveSource}
          onCancel={handleBackToList}
          mode={view}
        />
      )}
    </div>
  );
};

export default Sources;