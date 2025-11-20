import React, { useState, useEffect, useRef } from 'react';
import SourceList from './SourceList';
import SourceDetails from './SourceDetails';
import SourceForm from './SourceForm';
import GrantsGovIntegration from './GrantsGovIntegration';
import GrantWatchIntegration from './GrantWatchIntegration';
import { GrantsGovService } from '../../../services/grantsGovApi';
import { GrantWatchService } from '../../../services/grantWatchApi';
import './Sources.css';

const Sources = ({ onSourcesUpdate, integrations = {} }) => {
  const [view, setView] = useState('list');
  const [selectedSource, setSelectedSource] = useState(null);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [grantsGovData, setGrantsGovData] = useState([]);
  const [grantWatchData, setGrantWatchData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // New state for pagination and loading more
  const [grantsGovPage, setGrantsGovPage] = useState(1);
  const [grantWatchPage, setGrantWatchPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreGrantsGov, setHasMoreGrantsGov] = useState(true);
  const [hasMoreGrantWatch, setHasMoreGrantWatch] = useState(true);
  
  // Refs to track previous states and prevent unnecessary re-renders
  const integrationsRef = useRef(integrations);
  const dataLoadedRef = useRef(false);
  const initialLoadRef = useRef(false);

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
      notes: 'Focus on innovative STEM education programs and research initiatives.',
      lastUpdated: '2024-01-15',
      grants: [
        {
          id: 'nsf-1',
          title: 'STEM Education Research Grants',
          amount: '$500,000 - $1,500,000',
          deadline: '2024-03-15',
          category: 'Research',
          status: 'active',
          description: 'Support for research projects that advance STEM education.'
        }
      ]
    },
    {
      id: '2',
      name: 'Bill & Melinda Gates Foundation',
      type: 'private_foundation',
      category: 'Global Health',
      deadline: '2024-04-30',
      amount: '1,000,000 - 5,000,000',
      status: 'active',
      matchScore: 88,
      website: 'https://www.gatesfoundation.org',
      contactEmail: 'grants@gatesfoundation.org',
      eligibility: 'Non-profit organizations, Research Institutions, Universities',
      focusAreas: ['Global Health', 'Education', 'Poverty Alleviation'],
      notes: 'Focus on innovative solutions for global health and development challenges.',
      lastUpdated: '2024-01-10',
      grants: [
        {
          id: 'gates-1',
          title: 'Global Health Innovation Grant',
          amount: '$2,000,000 - $5,000,000',
          deadline: '2024-04-30',
          category: 'Health',
          status: 'active',
          description: 'Funding for innovative approaches to global health challenges.'
        }
      ]
    }
  ];

  // FIXED: Integration check - enabled by default, only disabled when explicitly false
  const isIntegrationEnabled = (integrationId) => {
    // Default to true, only false when explicitly set to false
    const isEnabled = integrations[integrationId] !== false;
    return isEnabled;
  };

  // Check if integrations have actually changed
  const haveIntegrationsChanged = (prevIntegrations, currentIntegrations) => {
    const prev = prevIntegrations || {};
    const current = currentIntegrations || {};
    
    const grantsGovChanged = prev.grantsGov !== current.grantsGov;
    const grantWatchChanged = prev.grantWatch !== current.grantWatch;
    
    const changed = grantsGovChanged || grantWatchChanged;
    
    if (changed) {
      console.log('🔄 Integrations changed - reloading data');
      console.log('Previous:', prev);
      console.log('Current:', current);
    }
    
    return changed;
  };

  // Load Grants.gov data with pagination
  const loadGrantsGovData = async (page = 1, isLoadMore = false) => {
    if (!isIntegrationEnabled('grantsGov')) {
      console.log('⏸️ Grants.gov integration disabled - skipping API call');
      return [];
    }

    console.log(`🌐 Loading Grants.gov data - Page ${page}...`);
    try {
      const grantsData = await GrantsGovService.searchGrants({
        keyword: '',
        rows: 50, // Increased from 20 to 50 per page
        start: (page - 1) * 50 // Calculate start position for pagination
      });
      
      console.log(`✅ Loaded ${grantsData.length} grants from Grants.gov page ${page}`);
      
      // Check if we have more data
      if (grantsData.length < 50) {
        setHasMoreGrantsGov(false);
        console.log('📭 No more Grants.gov data available');
      }
      
      return grantsData.map(grant => ({
        id: `grants-gov-${grant.id}-page-${page}`,
        name: grant.agency || 'Unknown Agency',
        type: 'government',
        category: grant.category || 'Federal Grant',
        deadline: grant.closeDate,
        amount: `${grant.awardFloor || 'Varies'} - ${grant.awardCeiling || 'Varies'}`,
        status: grant.status || 'active',
        matchScore: grant.matchScore || Math.floor(Math.random() * 30) + 70, // Random score 70-100
        website: grant.website,
        contactEmail: grant.grantorContact || '',
        eligibility: grant.eligibility || 'Various organizations eligible',
        focusAreas: [grant.category, 'Federal Funding'].filter(Boolean),
        notes: grant.description || 'Federal grant opportunity',
        lastUpdated: grant.lastUpdated || new Date().toISOString().split('T')[0],
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
        imported: false,
        page: page
      }));

    } catch (error) {
      console.error('❌ Error loading Grants.gov data:', error);
      // Return empty array instead of fallback to avoid duplicates
      return [];
    }
  };

  // Load GrantWatch data with pagination
  const loadGrantWatchData = async (page = 1, isLoadMore = false) => {
    if (!isIntegrationEnabled('grantWatch')) {
      console.log('⏸️ GrantWatch integration disabled - skipping API call');
      return [];
    }

    console.log(`📊 Loading GrantWatch data - Page ${page}...`);
    try {
      const grantWatchGrants = await GrantWatchService.searchGrants({
        keyword: '',
        rows: 30, // Increased from 15 to 30 per page
        start: (page - 1) * 30 // Calculate start position for pagination
      });
      
      console.log(`✅ Loaded ${grantWatchGrants.length} grants from GrantWatch page ${page}`);
      
      // Check if we have more data
      if (grantWatchGrants.length < 30) {
        setHasMoreGrantWatch(false);
        console.log('📭 No more GrantWatch data available');
      }
      
      return grantWatchGrants.map(grant => ({
        id: `grantwatch-${grant.id}-page-${page}`,
        name: grant.agency,
        type: grant.category === 'Business' ? 'corporate' : 'private_foundation',
        category: grant.category,
        deadline: grant.deadline,
        amount: `${grant.awardFloor ? `$${grant.awardFloor.toLocaleString()}` : 'Varies'} - ${grant.awardCeiling ? `$${grant.awardCeiling.toLocaleString()}` : 'Varies'}`,
        status: grant.status,
        matchScore: grant.matchScore || Math.floor(Math.random() * 30) + 70,
        website: grant.website,
        contactEmail: grant.contactEmail,
        eligibility: grant.eligibility,
        focusAreas: [grant.category, grant.focusArea].filter(Boolean),
        notes: grant.description,
        lastUpdated: grant.lastUpdated,
        grants: [{
          id: grant.id,
          title: grant.title,
          amount: grant.estimatedFunding,
          deadline: grant.deadline,
          category: grant.category,
          status: grant.status,
          description: grant.description,
          source: 'grantwatch',
          region: grant.state
        }],
        source: 'grantwatch',
        region: grant.state,
        imported: false,
        page: page
      }));
    } catch (error) {
      console.error('❌ Error loading GrantWatch data:', error);
      // Return empty array instead of fallback to avoid duplicates
      return [];
    }
  };

  // Load more Grants.gov data
  const handleLoadMoreGrantsGov = async () => {
    if (!hasMoreGrantsGov || loadingMore) return;
    
    setLoadingMore(true);
    const nextPage = grantsGovPage + 1;
    
    try {
      const newGrantsGovSources = await loadGrantsGovData(nextPage, true);
      
      if (newGrantsGovSources.length > 0) {
        setSources(prev => {
          const updatedSources = [...prev, ...newGrantsGovSources];
          
          if (onSourcesUpdate) {
            onSourcesUpdate(updatedSources);
          }
          
          return updatedSources;
        });
        
        setGrantsGovPage(nextPage);
        console.log(`✅ Loaded ${newGrantsGovSources.length} additional Grants.gov sources`);
      }
    } catch (error) {
      console.error('❌ Error loading more Grants.gov data:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Load more GrantWatch data
  const handleLoadMoreGrantWatch = async () => {
    if (!hasMoreGrantWatch || loadingMore) return;
    
    setLoadingMore(true);
    const nextPage = grantWatchPage + 1;
    
    try {
      const newGrantWatchSources = await loadGrantWatchData(nextPage, true);
      
      if (newGrantWatchSources.length > 0) {
        setSources(prev => {
          const updatedSources = [...prev, ...newGrantWatchSources];
          
          if (onSourcesUpdate) {
            onSourcesUpdate(updatedSources);
          }
          
          return updatedSources;
        });
        
        setGrantWatchPage(nextPage);
        console.log(`✅ Loaded ${newGrantWatchSources.length} additional GrantWatch sources`);
      }
    } catch (error) {
      console.error('❌ Error loading more GrantWatch data:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Load all data based on integration status
  useEffect(() => {
    // Skip if this is not the initial load and integrations haven't changed
    if (initialLoadRef.current && !haveIntegrationsChanged(integrationsRef.current, integrations)) {
      console.log('⏭️ Skipping data load - no integration changes detected');
      return;
    }

    const loadAllData = async () => {
      setLoading(true);
      console.log('🔄 Loading grant sources data...');
      console.log('📊 Integration state:', integrations);
      
      try {
        // Reset pagination state
        setGrantsGovPage(1);
        setGrantWatchPage(1);
        setHasMoreGrantsGov(true);
        setHasMoreGrantWatch(true);

        // Load initial data
        const [grantsGovSources, grantWatchSources] = await Promise.all([
          loadGrantsGovData(1),
          loadGrantWatchData(1)
        ]);

        // Build final sources array - ALWAYS include mock sources + enabled integration sources
        let allSources = [...mockSources]; // Always include mock sources
        
        // Add API sources if their integrations are enabled
        if (isIntegrationEnabled('grantsGov')) {
          console.log('➕ Adding Grants.gov sources to final list');
          allSources = [...allSources, ...grantsGovSources];
        }
        
        if (isIntegrationEnabled('grantWatch')) {
          console.log('➕ Adding GrantWatch sources to final list');
          allSources = [...allSources, ...grantWatchSources];
        }
        
        console.log('📊 Final sources breakdown:', {
          total: allSources.length,
          manual: mockSources.length,
          grantsGov: grantsGovSources.length,
          grantWatch: grantWatchSources.length,
          grantsGovEnabled: isIntegrationEnabled('grantsGov'),
          grantWatchEnabled: isIntegrationEnabled('grantWatch')
        });
        
        setSources(allSources);
        setLastUpdated(new Date().toISOString());
        dataLoadedRef.current = true;
        integrationsRef.current = { ...integrations };
        initialLoadRef.current = true;
        
      } catch (error) {
        console.error('❌ Error loading data:', error);
        // Fallback to mock data on error
        setSources(mockSources);
        dataLoadedRef.current = true;
        initialLoadRef.current = true;
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [integrations]); // Only re-run when integrations actually change

  // Notify parent component when sources change
  useEffect(() => {
    if (onSourcesUpdate && sources.length > 0 && dataLoadedRef.current) {
      console.log('📢 Notifying parent of sources update:', sources.length);
      onSourcesUpdate(sources);
    }
  }, [sources, onSourcesUpdate]);

  // Listen for integration updates from other components
  useEffect(() => {
    const handleIntegrationUpdate = (event) => {
      console.log('📡 Sources component received integration update:', event.detail);
      integrationsRef.current = event.detail.allIntegrations || integrationsRef.current;
    };

    window.addEventListener('grantFlowIntegrationUpdate', handleIntegrationUpdate);
    
    return () => {
      window.removeEventListener('grantFlowIntegrationUpdate', handleIntegrationUpdate);
    };
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
      setSources(prev => {
        const updatedSources = prev.map(source => 
          source.id === sourceData.id ? { 
            ...sourceData, 
            lastUpdated: new Date().toISOString().split('T')[0] 
          } : source
        );
        
        if (onSourcesUpdate) {
          onSourcesUpdate(updatedSources);
        }
        
        return updatedSources;
      });
    } else {
      const newSource = {
        ...sourceData,
        id: Date.now().toString(),
        lastUpdated: new Date().toISOString().split('T')[0],
        source: 'manual'
      };
      
      setSources(prev => {
        const updatedSources = [...prev, newSource];
        
        if (onSourcesUpdate) {
          onSourcesUpdate(updatedSources);
        }
        
        return updatedSources;
      });
    }
    setView('list');
  };

  const handleDeleteSource = (sourceId) => {
    setSources(prev => {
      const updatedSources = prev.filter(source => source.id !== sourceId);
      
      if (onSourcesUpdate) {
        onSourcesUpdate(updatedSources);
      }
      
      return updatedSources;
    });
    setView('list');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedSource(null);
  };

  const handleImportFromGrantsGov = () => {
    if (!isIntegrationEnabled('grantsGov')) {
      alert('Grants.gov integration is disabled. Please enable it in Integration Settings.');
      return;
    }
    setView('grants-gov');
  };

  const handleImportFromGrantWatch = () => {
    if (!isIntegrationEnabled('grantWatch')) {
      alert('GrantWatch integration is disabled. Please enable it in Integration Settings.');
      return;
    }
    setView('grantwatch');
  };

  const handleImportGrants = (selectedGrants) => {
    console.log('📥 Importing grants from Grants.gov:', selectedGrants.length);
    
    const newSources = selectedGrants.map(grant => ({
      id: `imported-${grant.opportunityNumber || grant.id}`,
      name: grant.agency,
      type: 'government',
      category: grant.category,
      deadline: grant.closeDate,
      amount: `${grant.awardFloor || 'Varies'} - ${grant.awardCeiling || 'Varies'}`,
      status: grant.status,
      matchScore: grant.matchScore || Math.floor(Math.random() * 30) + 70,
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
      
      if (onSourcesUpdate) {
        onSourcesUpdate(updatedSources);
      }
      
      return updatedSources;
    });
    setView('list');
  };

  const handleImportGrantWatchGrants = (selectedGrants) => {
    const newSources = selectedGrants.map(grant => ({
      id: `imported-gw-${grant.id}`,
      name: grant.agency,
      type: grant.category === 'Business' ? 'corporate' : 'private_foundation',
      category: grant.category,
      deadline: grant.deadline,
      amount: `${grant.awardFloor ? `$${grant.awardFloor.toLocaleString()}` : 'Varies'} - ${grant.awardCeiling ? `$${grant.awardCeiling.toLocaleString()}` : 'Varies'}`,
      status: grant.status,
      matchScore: grant.matchScore || Math.floor(Math.random() * 30) + 70,
      website: grant.website,
      contactEmail: grant.contactEmail,
      eligibility: grant.eligibility,
      focusAreas: [grant.category, grant.focusArea].filter(Boolean),
      notes: grant.description,
      lastUpdated: new Date().toISOString().split('T')[0],
      grants: [{
        id: grant.id,
        title: grant.title,
        amount: grant.estimatedFunding,
        deadline: grant.deadline,
        category: grant.category,
        status: grant.status,
        description: grant.description,
        source: 'grantwatch',
        region: grant.state
      }],
      source: 'grantwatch',
      region: grant.state,
      imported: true
    }));

    setSources(prev => {
      const updatedSources = [...prev, ...newSources];
      
      if (onSourcesUpdate) {
        onSourcesUpdate(updatedSources);
      }
      
      return updatedSources;
    });
    setView('list');
  };

  const handleRefreshGrantsGov = async () => {
    if (!isIntegrationEnabled('grantsGov')) {
      alert('Grants.gov integration is disabled. Please enable it in Integration Settings.');
      return;
    }

    setLoading(true);
    
    try {
      const grantsGovSources = await loadGrantsGovData(1);
      
      setSources(prev => {
        const nonGrantsGovSources = prev.filter(source => source.source !== 'grants.gov');
        const updatedSources = [...nonGrantsGovSources, ...grantsGovSources];
        setLastUpdated(new Date().toISOString());
        
        if (onSourcesUpdate) {
          onSourcesUpdate(updatedSources);
        }
        
        return updatedSources;
      });
      
      // Reset pagination state
      setGrantsGovPage(1);
      setHasMoreGrantsGov(true);
      
    } catch (error) {
      console.error('❌ Error refreshing Grants.gov data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshGrantWatch = async () => {
    if (!isIntegrationEnabled('grantWatch')) {
      alert('GrantWatch integration is disabled. Please enable it in Integration Settings.');
      return;
    }

    setLoading(true);
    
    try {
      const grantWatchSources = await loadGrantWatchData(1);
      
      setSources(prev => {
        const nonGrantWatchSources = prev.filter(source => source.source !== 'grantwatch');
        const updatedSources = [...nonGrantWatchSources, ...grantWatchSources];
        setLastUpdated(new Date().toISOString());
        
        if (onSourcesUpdate) {
          onSourcesUpdate(updatedSources);
        }
        
        return updatedSources;
      });
      
      // Reset pagination state
      setGrantWatchPage(1);
      setHasMoreGrantWatch(true);
      
    } catch (error) {
      console.error('❌ Error refreshing GrantWatch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSources = sources.filter(source => {
    if (filter === 'all') return true;
    if (filter === 'government') return source.type === 'government';
    if (filter === 'private_foundation') return source.type === 'private_foundation';
    if (filter === 'corporate') return source.type === 'corporate';
    if (filter === 'imported') return source.imported === true;
    return true;
  });

  // Count sources by type for the view more buttons
  const grantsGovCount = sources.filter(s => s.source === 'grants.gov').length;
  const grantWatchCount = sources.filter(s => s.source === 'grantwatch').length;

  // Render current view
  const renderCurrentView = () => {
    switch (view) {
      case 'list':
        return (
          <SourceList
            sources={filteredSources}
            onViewSource={handleViewSource}
            onEditSource={handleEditSource}
            onDeleteSource={handleDeleteSource}
            onCreateSource={handleCreateSource}
            onImportFromGrantsGov={handleImportFromGrantsGov}
            onImportFromGrantWatch={handleImportFromGrantWatch}
            onRefreshGrantsGov={handleRefreshGrantsGov}
            onRefreshGrantWatch={handleRefreshGrantWatch}
            onLoadMoreGrantsGov={handleLoadMoreGrantsGov}
            onLoadMoreGrantWatch={handleLoadMoreGrantWatch}
            filter={filter}
            onFilterChange={setFilter}
            loading={loading}
            loadingMore={loadingMore}
            lastUpdated={lastUpdated}
            integrations={integrations}
            grantsGovCount={grantsGovCount}
            grantWatchCount={grantWatchCount}
            hasMoreGrantsGov={hasMoreGrantsGov}
            hasMoreGrantWatch={hasMoreGrantWatch}
          />
        );
      
      case 'details':
        return (
          <SourceDetails
            source={selectedSource}
            onBack={handleBackToList}
            onEdit={handleEditSource}
          />
        );
      
      case 'create':
      case 'edit':
        return (
          <SourceForm
            source={selectedSource}
            onSave={handleSaveSource}
            onCancel={handleBackToList}
            mode={view === 'create' ? 'create' : 'edit'}
          />
        );
      
      case 'grants-gov':
        return (
          <GrantsGovIntegration
            onBack={handleBackToList}
            onImportGrants={handleImportGrants}
            initialData={grantsGovData}
          />
        );
      
      case 'grantwatch':
        return (
          <GrantWatchIntegration
            onBack={handleBackToList}
            onImportGrants={handleImportGrantWatchGrants}
            initialData={grantWatchData}
          />
        );
      
      default:
        return (
          <SourceList
            sources={filteredSources}
            onViewSource={handleViewSource}
            onEditSource={handleEditSource}
            onDeleteSource={handleDeleteSource}
            onCreateSource={handleCreateSource}
            onImportFromGrantsGov={handleImportFromGrantsGov}
            onImportFromGrantWatch={handleImportFromGrantWatch}
            onRefreshGrantsGov={handleRefreshGrantsGov}
            onRefreshGrantWatch={handleRefreshGrantWatch}
            onLoadMoreGrantsGov={handleLoadMoreGrantsGov}
            onLoadMoreGrantWatch={handleLoadMoreGrantWatch}
            filter={filter}
            onFilterChange={setFilter}
            loading={loading}
            loadingMore={loadingMore}
            lastUpdated={lastUpdated}
            integrations={integrations}
            grantsGovCount={grantsGovCount}
            grantWatchCount={grantWatchCount}
            hasMoreGrantsGov={hasMoreGrantsGov}
            hasMoreGrantWatch={hasMoreGrantWatch}
          />
        );
    }
  };

  return (
    <div className="sources-container">
      <div className="sources-header">
        <h1>Grant Sources</h1>
        <p className="sources-subtitle">
          Manage and discover grant funding opportunities from various sources
        </p>
      </div>

      <div className="sources-content">
        {renderCurrentView()}
      </div>
    </div>
  );
};

export default Sources;