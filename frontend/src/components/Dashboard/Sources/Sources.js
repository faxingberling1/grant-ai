import React, { useState, useEffect } from 'react';
import SourceList from './SourceList';
import SourceDetails from './SourceDetails';
import SourceForm from './SourceForm';
import GrantsGovIntegration from './GrantsGovIntegration';
import { GrantsGovService } from '../../../services/grantsGovApi';
import './Sources.css';

const Sources = ({ onSourcesUpdate }) => {
  const [view, setView] = useState('list');
  const [selectedSource, setSelectedSource] = useState(null);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [grantsGovData, setGrantsGovData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Enhanced mock data
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
        }
      ]
    }
  ];

  // Load all data
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      console.log('🔄 Loading grant sources data...');
      
      try {
        // Load Grants.gov data
        const grantsData = await GrantsGovService.searchGrants({
          keyword: '',
          rows: 20
        });
        
        console.log(`✅ Loaded ${grantsData.length} grants from Grants.gov`);
        setGrantsGovData(grantsData);
        
        // Convert Grants.gov opportunities to source format
        const grantsGovSources = grantsData.map(grant => ({
          id: grant.id,
          name: grant.agency,
          type: 'government',
          category: grant.category,
          deadline: grant.closeDate,
          amount: `${grant.awardFloor || 'Varies'} - ${grant.awardCeiling || 'Varies'}`,
          status: grant.status,
          matchScore: grant.matchScore,
          website: grant.website,
          contactEmail: grant.grantorContact || '',
          eligibility: grant.eligibility,
          focusAreas: [grant.category],
          notes: grant.description,
          lastUpdated: grant.lastUpdated,
          grants: [{
            id: grant.id,
            title: grant.title,
            amount: grant.estimatedFunding,
            deadline: grant.closeDate,
            category: grant.category,
            status: grant.status,
            description: grant.description,
            opportunityNumber: grant.opportunityNumber,
            source: 'grants.gov'
          }],
          source: 'grants.gov',
          opportunityNumber: grant.opportunityNumber,
          imported: false
        }));

        const allSources = [...mockSources, ...grantsGovSources];
        setSources(allSources);
        setLastUpdated(new Date().toISOString());
        
        console.log(`🎯 Total sources loaded: ${allSources.length} (${mockSources.length} manual + ${grantsGovSources.length} Grants.gov)`);
        
      } catch (error) {
        console.error('❌ Error loading data:', error);
        setSources(mockSources);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Notify parent component when sources change
  useEffect(() => {
    if (onSourcesUpdate && sources.length > 0) {
      console.log('📤 Notifying parent of sources update:', sources.length, 'sources');
      onSourcesUpdate(sources);
    }
  }, [sources, onSourcesUpdate]);

  const handleViewSource = (source) => {
    console.log('👀 Viewing source:', source.name);
    setSelectedSource(source);
    setView('details');
  };

  const handleEditSource = (source) => {
    console.log('✏️ Editing source:', source.name);
    setSelectedSource(source);
    setView('edit');
  };

  const handleCreateSource = () => {
    console.log('➕ Creating new source');
    setSelectedSource(null);
    setView('create');
  };

  const handleSaveSource = (sourceData) => {
    if (sourceData.id) {
      // Update existing source
      console.log('💾 Updating source:', sourceData.name);
      setSources(prev => {
        const updatedSources = prev.map(source => 
          source.id === sourceData.id ? { 
            ...sourceData, 
            lastUpdated: new Date().toISOString().split('T')[0] 
          } : source
        );
        
        // Notify parent of update
        if (onSourcesUpdate) {
          onSourcesUpdate(updatedSources);
        }
        
        return updatedSources;
      });
    } else {
      // Create new source
      console.log('💾 Creating new source:', sourceData.name);
      const newSource = {
        ...sourceData,
        id: Date.now().toString(),
        lastUpdated: new Date().toISOString().split('T')[0],
        source: 'manual'
      };
      
      setSources(prev => {
        const updatedSources = [...prev, newSource];
        
        // Notify parent of update
        if (onSourcesUpdate) {
          onSourcesUpdate(updatedSources);
        }
        
        return updatedSources;
      });
    }
    setView('list');
  };

  const handleDeleteSource = (sourceId) => {
    const sourceToDelete = sources.find(source => source.id === sourceId);
    console.log('🗑️ Deleting source:', sourceToDelete?.name);
    
    setSources(prev => {
      const updatedSources = prev.filter(source => source.id !== sourceId);
      
      // Notify parent of update
      if (onSourcesUpdate) {
        onSourcesUpdate(updatedSources);
      }
      
      return updatedSources;
    });
    setView('list');
  };

  const handleBackToList = () => {
    console.log('↩️ Returning to sources list');
    setView('list');
    setSelectedSource(null);
  };

  const handleImportFromGrantsGov = () => {
    console.log('🌐 Opening Grants.gov integration');
    setView('grants-gov');
  };

  const handleImportGrants = (selectedGrants) => {
    console.log('📥 Importing grants from Grants.gov:', selectedGrants.length);
    
    const newSources = selectedGrants.map(grant => ({
      id: `imported-${grant.opportunityNumber}`,
      name: grant.agency,
      type: 'government',
      category: grant.category,
      deadline: grant.closeDate,
      amount: `${grant.awardFloor || 'Varies'} - ${grant.awardCeiling || 'Varies'}`,
      status: grant.status,
      matchScore: grant.matchScore,
      website: grant.website,
      contactEmail: grant.grantorContact || '',
      eligibility: grant.eligibility,
      focusAreas: [grant.category],
      notes: grant.description,
      lastUpdated: new Date().toISOString().split('T')[0],
      grants: [{
        id: grant.id,
        title: grant.title,
        amount: grant.estimatedFunding,
        deadline: grant.closeDate,
        category: grant.category,
        status: grant.status,
        description: grant.description,
        opportunityNumber: grant.opportunityNumber,
        source: 'grants.gov'
      }],
      source: 'grants.gov',
      opportunityNumber: grant.opportunityNumber,
      imported: true
    }));

    setSources(prev => {
      const updatedSources = [...prev, ...newSources];
      
      // Notify parent of update
      if (onSourcesUpdate) {
        onSourcesUpdate(updatedSources);
      }
      
      return updatedSources;
    });
    setView('list');
    
    console.log(`✅ Imported ${newSources.length} grants from Grants.gov`);
  };

  const handleRefreshGrantsGov = async () => {
    setLoading(true);
    console.log('🔄 Refreshing Grants.gov data...');
    
    try {
      const grantsData = await GrantsGovService.searchGrants({
        keyword: '',
        rows: 20
      });
      
      setGrantsGovData(grantsData);
      
      // Update existing Grants.gov sources
      setSources(prev => {
        const nonGrantsGovSources = prev.filter(source => source.source !== 'grants.gov');
        const updatedGrantsGovSources = grantsData.map(grant => ({
          id: grant.id,
          name: grant.agency,
          type: 'government',
          category: grant.category,
          deadline: grant.closeDate,
          amount: `${grant.awardFloor || 'Varies'} - ${grant.awardCeiling || 'Varies'}`,
          status: grant.status,
          matchScore: grant.matchScore,
          website: grant.website,
          contactEmail: grant.grantorContact || '',
          eligibility: grant.eligibility,
          focusAreas: [grant.category],
          notes: grant.description,
          lastUpdated: new Date().toISOString().split('T')[0],
          grants: [{
            id: grant.id,
            title: grant.title,
            amount: grant.estimatedFunding,
            deadline: grant.closeDate,
            category: grant.category,
            status: grant.status,
            description: grant.description,
            opportunityNumber: grant.opportunityNumber,
            source: 'grants.gov'
          }],
          source: 'grants.gov',
          opportunityNumber: grant.opportunityNumber
        }));
        
        const updatedSources = [...nonGrantsGovSources, ...updatedGrantsGovSources];
        setLastUpdated(new Date().toISOString());
        
        // Notify parent of update
        if (onSourcesUpdate) {
          onSourcesUpdate(updatedSources);
        }
        
        console.log(`✅ Refreshed ${updatedGrantsGovSources.length} Grants.gov opportunities`);
        return updatedSources;
      });
    } catch (error) {
      console.error('❌ Error refreshing Grants.gov data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAllSources = async () => {
    setLoading(true);
    console.log('🔄 Syncing all grant sources...');
    
    try {
      // Simulate syncing with multiple sources
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Refresh Grants.gov data
      await handleRefreshGrantsGov();
      
      console.log('✅ All sources synced successfully');
    } catch (error) {
      console.error('❌ Error syncing sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSources = sources.filter(source => {
    if (filter === 'all') return true;
    return source.status === filter;
  });

  // Calculate statistics
  const stats = {
    total: sources.length,
    active: sources.filter(s => s.status === 'active').length,
    upcoming: sources.filter(s => s.status === 'upcoming').length,
    government: sources.filter(s => s.type === 'government').length,
    foundation: sources.filter(s => s.type === 'private_foundation').length,
    corporate: sources.filter(s => s.type === 'corporate').length,
    grantsGov: sources.filter(s => s.source === 'grants.gov').length,
    manual: sources.filter(s => !s.source || s.source === 'manual').length
  };

  if (loading) {
    return (
      <div className="sources-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading grant sources...</p>
        <div className="loading-details">
          <small>Fetching latest opportunities from Grants.gov</small>
        </div>
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
          onImportFromGrantsGov={handleImportFromGrantsGov}
          onRefreshGrantsGov={handleRefreshGrantsGov}
          onSyncAllSources={handleSyncAllSources}
          filter={filter}
          onFilterChange={setFilter}
          lastUpdated={lastUpdated}
          stats={stats}
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

      {view === 'grants-gov' && (
        <GrantsGovIntegration
          grants={grantsGovData}
          onImport={handleImportGrants}
          onCancel={handleBackToList}
        />
      )}
    </div>
  );
};

export default Sources;