import React, { useState, useEffect } from 'react';
import GrantList from './GrantList';
import GrantForm from './GrantForm';
import GrantDetails from './GrantDetails';
import './Grants.css';

const Grants = () => {
  const [view, setView] = useState('list'); // 'list', 'form', 'details'
  const [selectedGrant, setSelectedGrant] = useState(null);
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // Mock data - Replace with API calls
  useEffect(() => {
    const mockGrants = [
      {
        id: 1,
        title: 'STEM Education Initiative 2024',
        client: 'GreenTech Initiative',
        clientId: 1,
        funder: 'National Science Foundation',
        amount: '$500,000',
        deadline: '2024-11-15',
        status: 'draft',
        stage: 'writing',
        submissionDate: null,
        created: '2024-01-10',
        updated: '2024-01-15',
        category: 'Education',
        tags: ['STEM', 'Youth', 'Technology'],
        priority: 'high',
        notes: 'Focus on underserved communities in urban areas.'
      },
      {
        id: 2,
        title: 'Clean Energy Research Grant',
        client: 'Sarah Chen',
        clientId: 2,
        funder: 'Department of Energy',
        amount: '$750,000',
        deadline: '2024-11-22',
        status: 'in_review',
        stage: 'review',
        submissionDate: '2024-01-12',
        created: '2024-01-05',
        updated: '2024-01-12',
        category: 'Environment',
        tags: ['Clean Energy', 'Research', 'Sustainability'],
        priority: 'medium',
        notes: 'Partnership with local universities required.'
      },
      {
        id: 3,
        title: 'Youth Development Program',
        client: 'Michael Rodriguez',
        clientId: 3,
        funder: 'Johnson Foundation',
        amount: '$250,000',
        deadline: '2024-12-10',
        status: 'submitted',
        stage: 'submitted',
        submissionDate: '2024-01-08',
        created: '2023-12-20',
        updated: '2024-01-08',
        category: 'Youth',
        tags: ['Mentorship', 'Education', 'Community'],
        priority: 'high',
        notes: 'Strong focus on measurable outcomes and impact assessment.'
      },
      {
        id: 4,
        title: 'Community Health Access Program',
        client: 'Sarah Chen',
        clientId: 2,
        funder: 'Health Resources Foundation',
        amount: '$350,000',
        deadline: '2024-10-30',
        status: 'approved',
        stage: 'awarded',
        submissionDate: '2023-11-15',
        created: '2023-10-10',
        updated: '2023-12-01',
        category: 'Healthcare',
        tags: ['Healthcare', 'Access', 'Community'],
        priority: 'medium',
        notes: 'Funding secured for 2-year program implementation.'
      },
      {
        id: 5,
        title: 'Digital Literacy Initiative',
        client: 'GreenTech Initiative',
        clientId: 1,
        funder: 'Tech for Good Foundation',
        amount: '$180,000',
        deadline: '2024-09-15',
        status: 'draft',
        stage: 'planning',
        submissionDate: null,
        created: '2024-01-18',
        updated: '2024-01-18',
        category: 'Technology',
        tags: ['Digital Skills', 'Education', 'Technology'],
        priority: 'low',
        notes: 'Targeting senior citizens and low-income families.'
      }
    ];
    
    setGrants(mockGrants);
    setLoading(false);
  }, []);

  const handleAddGrant = () => {
    setSelectedGrant(null);
    setView('form');
  };

  const handleEditGrant = (grant) => {
    setSelectedGrant(grant);
    setView('form');
  };

  const handleViewGrant = (grant) => {
    setSelectedGrant(grant);
    setView('details');
  };

  const handleSaveGrant = (grantData) => {
    if (selectedGrant) {
      // Update existing grant
      setGrants(grants.map(grant => 
        grant.id === selectedGrant.id 
          ? { ...grant, ...grantData, updated: new Date().toISOString().split('T')[0] }
          : grant
      ));
    } else {
      // Add new grant
      const newGrant = {
        ...grantData,
        id: Date.now(),
        created: new Date().toISOString().split('T')[0],
        updated: new Date().toISOString().split('T')[0],
        stage: 'planning',
        submissionDate: null
      };
      setGrants([...grants, newGrant]);
    }
    setView('list');
  };

  const handleDeleteGrant = (grantId) => {
    if (window.confirm('Are you sure you want to delete this grant?')) {
      setGrants(grants.filter(grant => grant.id !== grantId));
    }
  };

  const handleStatusUpdate = (grantId, newStatus) => {
    setGrants(grants.map(grant => 
      grant.id === grantId 
        ? { 
            ...grant, 
            status: newStatus,
            updated: new Date().toISOString().split('T')[0],
            ...(newStatus === 'submitted' && !grant.submissionDate ? { submissionDate: new Date().toISOString().split('T')[0] } : {})
          }
        : grant
    ));
  };

  // Filter grants based on search and filter
  const filteredGrants = grants.filter(grant => {
    const matchesSearch = 
      grant.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grant.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grant.funder.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' || 
      grant.status === filter ||
      grant.priority === filter ||
      grant.category?.toLowerCase() === filter;
    
    return matchesSearch && matchesFilter;
  });

  const renderView = () => {
    switch (view) {
      case 'list':
        return (
          <GrantList
            grants={filteredGrants}
            loading={loading}
            onAddGrant={handleAddGrant}
            onEditGrant={handleEditGrant}
            onViewGrant={handleViewGrant}
            onDeleteGrant={handleDeleteGrant}
            onStatusUpdate={handleStatusUpdate}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filter={filter}
            onFilterChange={setFilter}
          />
        );
      case 'form':
        return (
          <GrantForm
            grant={selectedGrant}
            clients={grants.map(g => ({ id: g.clientId, name: g.client }))}
            onSave={handleSaveGrant}
            onCancel={() => setView('list')}
          />
        );
      case 'details':
        return (
          <GrantDetails
            grant={selectedGrant}
            onEdit={() => handleEditGrant(selectedGrant)}
            onBack={() => setView('list')}
            onStatusUpdate={handleStatusUpdate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="grants-container">
      {renderView()}
    </div>
  );
};

export default Grants;