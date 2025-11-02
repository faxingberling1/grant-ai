import React, { useState, useEffect } from 'react';
import ClientList from './ClientList';
import ClientForm from './ClientForm';
import ClientDetails from './ClientDetails';
import ClientEmails from './ClientEmails';
import ClientCommunication from './ClientCommunication';
import CommunicationHistory from './CommunicationHistory';
import EmailTemplates from './EmailTemplates';
import BulkEmail from './BulkEmail';
import EmailComposer from './EmailComposer';
import CommunicationHub from './CommunicationHub';
import './Clients.css';
import './CommunicationHub.css';
import './EmailTemplates.css';
import './EmailComposer.css';

const Clients = () => {
  const [view, setView] = useState('list');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [communicationTab, setCommunicationTab] = useState('emails');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

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
        tags: ['Environment', 'Technology', 'Non-Profit'],
        communicationHistory: [
          {
            id: 1,
            type: 'email',
            direction: 'outgoing',
            subject: 'Grant Proposal Feedback',
            preview: 'Thank you for submitting the draft proposal...',
            date: '2024-01-15T10:30:00',
            status: 'sent',
            important: true
          },
          {
            id: 2,
            type: 'call',
            direction: 'incoming',
            subject: 'Follow-up call',
            preview: 'Discussed next steps for the NSF grant...',
            date: '2024-01-12T14:20:00',
            duration: '15m',
            status: 'completed'
          }
        ]
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
        tags: ['Healthcare', 'Community', 'Non-Profit'],
        communicationHistory: [
          {
            id: 1,
            type: 'email',
            direction: 'incoming',
            subject: 'Question about budget',
            preview: 'Could you clarify the budget allocation for...',
            date: '2024-01-10T09:15:00',
            status: 'read',
            important: false
          }
        ]
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
        tags: ['Education', 'Youth', 'Foundation'],
        communicationHistory: []
      },
      {
        id: 4,
        name: 'TechStart Inc',
        email: 'info@techstart.com',
        phone: '+1 (555) 234-5678',
        organization: 'TechStart Accelerator',
        status: 'active',
        lastContact: '2024-01-08',
        grantsSubmitted: 6,
        grantsAwarded: 3,
        totalFunding: '$150,000',
        avatar: 'https://i.pravatar.cc/150?img=11',
        notes: 'Early-stage startup with strong growth potential.',
        tags: ['Technology', 'Startup', 'Innovation'],
        communicationHistory: []
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

  const handleEmails = (client) => {
    setSelectedClient(client);
    setView('emails');
  };

  const handleCommunication = (client) => {
    setSelectedClient(client);
    setView('communication');
  };

  const handleViewHistory = (client) => {
    setSelectedClient(client);
    setView('history');
  };

  const handleCommunicationHub = () => {
    setView('communication-hub');
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
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
        communicationHistory: []
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
    setSelectedTemplate(null);
    setView('email-composer');
  };

  const handleComposeEmail = (client = null, template = null) => {
    setSelectedClient(client);
    setSelectedTemplate(template);
    setView('email-composer');
  };

  const handleViewTemplates = () => {
    setView('templates');
  };

  const handleUseTemplate = (template) => {
    setSelectedTemplate(template);
    setSelectedClient(null);
    setView('email-composer');
  };

  const handleAddCommunication = (communication) => {
    if (selectedClient) {
      const updatedClients = clients.map(client => {
        if (client.id === selectedClient.id) {
          return {
            ...client,
            communicationHistory: [
              ...client.communicationHistory,
              {
                ...communication,
                id: Date.now(),
                date: new Date().toISOString()
              }
            ]
          };
        }
        return client;
      });
      setClients(updatedClients);
      setSelectedClient(updatedClients.find(c => c.id === selectedClient.id));
    }
  };

  const handleSendEmailFromComposer = (emailData) => {
    // Handle email sending logic
    console.log('Sending email:', emailData);
    
    // Add to communication history if sending to a specific client
    if (selectedClient) {
      const updatedClients = clients.map(client => {
        if (client.id === selectedClient.id) {
          return {
            ...client,
            communicationHistory: [
              ...client.communicationHistory,
              {
                id: Date.now(),
                type: 'email',
                direction: 'outgoing',
                subject: emailData.subject,
                preview: emailData.content.substring(0, 100) + '...',
                date: new Date().toISOString(),
                status: 'sent',
                important: false
              }
            ]
          };
        }
        return client;
      });
      setClients(updatedClients);
    }
    
    setView('list');
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Simplified logic for determining active states
  const isClientsActive = view === 'list' || view === 'form' || view === 'details' || 
                         view === 'emails' || view === 'communication' || view === 'history';
  
  const isCommunicationHubActive = view === 'communication-hub';

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
            onEmails={handleEmails}
            onBulkEmail={handleBulkEmail}
            onCommunication={handleCommunication}
            onViewHistory={handleViewHistory}
            onCommunicationHub={handleCommunicationHub}
            onViewTemplates={handleViewTemplates}
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
            onEmails={() => handleEmails(selectedClient)}
            onCommunication={() => handleCommunication(selectedClient)}
            onViewHistory={() => handleViewHistory(selectedClient)}
          />
        );
      case 'emails':
        return (
          <ClientEmails
            client={selectedClient}
            onBack={() => setView('list')}
            onSendEmail={() => handleSendEmail(selectedClient)}
            onUseTemplate={handleUseTemplate}
          />
        );
      case 'communication':
        return (
          <ClientCommunication
            client={selectedClient}
            onSendEmail={() => handleSendEmail(selectedClient)}
            onAddCommunication={handleAddCommunication}
            onBack={() => setView('list')}
            activeTab={communicationTab}
            onTabChange={setCommunicationTab}
          />
        );
      case 'history':
        return (
          <CommunicationHistory
            client={selectedClient}
            onBack={() => setView('list')}
            onSendEmail={() => handleSendEmail(selectedClient)}
          />
        );
      case 'templates':
        return (
          <EmailTemplates
            onBack={() => setView('list')}
            onUseTemplate={handleUseTemplate}
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
            template={selectedTemplate}
            onSend={handleSendEmailFromComposer}
            onCancel={() => setView('list')}
          />
        );
      case 'communication-hub':
        return (
          <CommunicationHub
            onBack={() => setView('list')}
            onEmails={() => setView('emails')}
            onTemplates={handleViewTemplates}
            onBulkEmail={handleBulkEmail}
            onComposeEmail={handleComposeEmail}
            clients={clients}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="clients-container">
      {/* Enhanced Navigation Bar - Fixed to show all buttons */}
      <div className="clients-nav">
        <div className="clients-nav-buttons">
          {/* Clients Section */}
          <div className="clients-nav-section">
            <button 
              className={`clients-nav-button ${isClientsActive ? 'active' : ''}`}
              onClick={() => setView('list')}
            >
              <i className="fas fa-users"></i>
              Clients
              {clients.filter(c => c.status === 'active').length > 0 && (
                <span className="clients-nav-badge">
                  {clients.filter(c => c.status === 'active').length}
                </span>
              )}
            </button>
          </div>

          {/* Communication Section */}
          <div className="clients-nav-section">
            <button 
              className={`clients-nav-button ${isCommunicationHubActive ? 'active' : ''}`}
              onClick={handleCommunicationHub}
            >
              <i className="fas fa-comments"></i>
              Communication Hub
              <span className="clients-nav-badge">3</span>
            </button>
            
            {/* Communication Actions - Always Visible */}
            <button 
              className="clients-nav-action-btn"
              onClick={handleViewTemplates}
            >
              <i className="fas fa-layer-group"></i>
              Email Templates
            </button>
            
            {/* Compose Email Button - Added before Bulk Email */}
            <button 
              className="clients-nav-action-btn primary"
              onClick={() => handleComposeEmail()}
            >
              <i className="fas fa-edit"></i>
              Compose Email
            </button>
            
            <button 
              className="clients-nav-action-btn primary"
              onClick={handleBulkEmail}
            >
              <i className="fas fa-mail-bulk"></i>
              Bulk Email
            </button>
          </div>
        </div>
        
        <div className="clients-nav-actions">
          {/* Add Client Button - Moved to right side */}
          <button className="clients-nav-add-btn" onClick={handleAddClient}>
            <i className="fas fa-plus"></i>
            Add Client
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="clients-content">
        {renderView()}
      </div>
    </div>
  );
};

export default Clients;