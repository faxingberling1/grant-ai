import React, { useState, useEffect } from 'react';
import ClientList from './ClientList';
import ClientForm from './ClientForm';
import ClientDetails from './ClientDetails';
import BulkEmail from './BulkEmail';
import EmailComposer from './EmailComposer';
import './Clients.css';

const Clients = () => {
  const [view, setView] = useState('list'); // 'list', 'form', 'details', 'bulk-email'
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - Replace with API calls
  useEffect(() => {
    const mockClients = [
      {
        id: 1,
        name: 'GreenTech Initiative',
        email: 'contact@greentech.org',
        phone: '+1 (555) 123-4567',
        organization: 'GreenTech Initiative',
        status: 'active',
        lastContact: '2024-01-15',
        grantsSubmitted: 12,
        grantsAwarded: 8,
        totalFunding: '$450,000',
        avatar: 'https://i.pravatar.cc/150?img=1',
        notes: 'Very responsive and organized. Great partnership potential.',
        tags: ['Environment', 'Technology', 'Non-Profit']
      },
      {
        id: 2,
        name: 'Sarah Chen',
        email: 'sarah.chen@communityhealth.org',
        phone: '+1 (555) 987-6543',
        organization: 'Community Health Alliance',
        status: 'active',
        lastContact: '2024-01-10',
        grantsSubmitted: 8,
        grantsAwarded: 5,
        totalFunding: '$280,000',
        avatar: 'https://i.pravatar.cc/150?img=32',
        notes: 'Focuses on healthcare access in underserved communities.',
        tags: ['Healthcare', 'Community', 'Non-Profit']
      },
      {
        id: 3,
        name: 'Michael Rodriguez',
        email: 'm.rodriguez@youthfuture.org',
        phone: '+1 (555) 456-7890',
        organization: 'Youth Future Foundation',
        status: 'inactive',
        lastContact: '2023-12-20',
        grantsSubmitted: 15,
        grantsAwarded: 10,
        totalFunding: '$620,000',
        avatar: 'https://i.pravatar.cc/150?img=8',
        notes: 'Excellent track record with education grants.',
        tags: ['Education', 'Youth', 'Foundation']
      }
    ];
    
    setClients(mockClients);
    setLoading(false);
  }, []);

  const handleAddClient = () => {
    setSelectedClient(null);
    setView('form');
  };

  const handleEditClient = (client) => {
    setSelectedClient(client);
    setView('form');
  };

  const handleViewClient = (client) => {
    setSelectedClient(client);
    setView('details');
  };

  const handleSaveClient = (clientData) => {
    if (selectedClient) {
      // Update existing client
      setClients(clients.map(client => 
        client.id === selectedClient.id 
          ? { ...client, ...clientData }
          : client
      ));
    } else {
      // Add new client
      const newClient = {
        ...clientData,
        id: Date.now(),
        grantsSubmitted: 0,
        grantsAwarded: 0,
        totalFunding: '$0',
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
      };
      setClients([...clients, newClient]);
    }
    setView('list');
  };

  const handleDeleteClient = (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      setClients(clients.filter(client => client.id !== clientId));
    }
  };

  const handleBulkEmail = () => {
    setView('bulk-email');
  };

  const handleSendEmail = (client) => {
    setSelectedClient(client);
    setView('email-composer');
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderView = () => {
    switch (view) {
      case 'list':
        return (
          <ClientList
            clients={filteredClients}
            loading={loading}
            onAddClient={handleAddClient}
            onEditClient={handleEditClient}
            onViewClient={handleViewClient}
            onDeleteClient={handleDeleteClient}
            onSendEmail={handleSendEmail}
            onBulkEmail={handleBulkEmail}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        );
      case 'form':
        return (
          <ClientForm
            client={selectedClient}
            onSave={handleSaveClient}
            onCancel={() => setView('list')}
          />
        );
      case 'details':
        return (
          <ClientDetails
            client={selectedClient}
            onEdit={() => handleEditClient(selectedClient)}
            onBack={() => setView('list')}
            onSendEmail={() => handleSendEmail(selectedClient)}
          />
        );
      case 'bulk-email':
        return (
          <BulkEmail
            clients={clients}
            onSend={() => setView('list')}
            onCancel={() => setView('list')}
          />
        );
      case 'email-composer':
        return (
          <EmailComposer
            client={selectedClient}
            onSend={() => setView('list')}
            onCancel={() => setView('list')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="clients-container">
      {renderView()}
    </div>
  );
};

export default Clients;