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

  // Mock data - Updated with new comprehensive fields
  useEffect(() => {
    const mockClients = [
      {
        id: 1,
        // Core fields (for backward compatibility)
        name: 'Sarah Chen',
        email: 'sarah.chen@greentech.org',
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
        ],
        
        // New comprehensive fields
        organizationName: 'GreenTech Initiative',
        primaryContactName: 'Sarah Chen',
        titleRole: 'Executive Director',
        emailAddress: 'sarah.chen@greentech.org',
        phoneNumbers: '+1 (555) 123-4567',
        additionalContactName: 'Michael Rodriguez',
        additionalContactTitle: 'Program Manager',
        additionalContactEmail: 'm.rodriguez@greentech.org',
        additionalContactPhone: '+1 (555) 123-4568',
        mailingAddress: '123 Green Street, Eco City, EC 12345',
        website: 'https://greentech.org',
        socialMediaLinks: [
          { platform: 'LinkedIn', url: 'https://linkedin.com/company/greentech' },
          { platform: 'Twitter', url: 'https://twitter.com/greentech' },
          { platform: 'Facebook', url: 'https://facebook.com/greentech' }
        ],
        taxIdEIN: '12-3456789',
        organizationType: 'Nonprofit 501(c)(3)',
        missionStatement: 'To promote sustainable technology solutions for environmental conservation and climate change mitigation through innovative research and community engagement.',
        focusAreas: ['Renewable Energy', 'Climate Tech', 'Sustainable Agriculture', 'Environmental Education'],
        serviceArea: 'National',
        annualBudget: '$1,000,000 - $5,000,000',
        staffCount: '26-50'
      },
      {
        id: 2,
        // Core fields
        name: 'David Kim',
        email: 'david.kim@communityhealth.org',
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
        ],
        
        // New comprehensive fields
        organizationName: 'Community Health Alliance',
        primaryContactName: 'David Kim',
        titleRole: 'Program Director',
        emailAddress: 'david.kim@communityhealth.org',
        phoneNumbers: '+1 (555) 987-6543',
        additionalContactName: 'Maria Gonzalez',
        additionalContactTitle: 'Outreach Coordinator',
        additionalContactEmail: 'maria.gonzalez@communityhealth.org',
        additionalContactPhone: '+1 (555) 987-6544',
        mailingAddress: '456 Health Avenue, Medtown, MT 67890',
        website: 'https://communityhealth.org',
        socialMediaLinks: [
          { platform: 'Facebook', url: 'https://facebook.com/communityhealth' },
          { platform: 'Instagram', url: 'https://instagram.com/communityhealth' }
        ],
        taxIdEIN: '98-7654321',
        organizationType: 'Nonprofit 501(c)(3)',
        missionStatement: 'To provide accessible healthcare services and health education to underserved communities while promoting wellness and preventive care.',
        focusAreas: ['Healthcare Access', 'Community Wellness', 'Preventive Care', 'Health Education'],
        serviceArea: 'Regional',
        annualBudget: '$500,000 - $1,000,000',
        staffCount: '11-25'
      },
      {
        id: 3,
        // Core fields
        name: 'James Wilson',
        email: 'j.wilson@youthfuture.org',
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
        communicationHistory: [],
        
        // New comprehensive fields
        organizationName: 'Youth Future Foundation',
        primaryContactName: 'James Wilson',
        titleRole: 'Foundation Director',
        emailAddress: 'j.wilson@youthfuture.org',
        phoneNumbers: '+1 (555) 456-7890',
        additionalContactName: 'Lisa Thompson',
        additionalContactTitle: 'Grants Manager',
        additionalContactEmail: 'lisa.thompson@youthfuture.org',
        additionalContactPhone: '+1 (555) 456-7891',
        mailingAddress: '789 Future Drive, Progress City, PC 34567',
        website: 'https://youthfuture.org',
        socialMediaLinks: [
          { platform: 'LinkedIn', url: 'https://linkedin.com/company/youthfuture' },
          { platform: 'Twitter', url: 'https://twitter.com/youthfuture' },
          { platform: 'YouTube', url: 'https://youtube.com/c/youthfuture' }
        ],
        taxIdEIN: '45-6789012',
        organizationType: 'Foundation',
        missionStatement: 'Empowering youth through education, mentorship, and opportunity creation for a brighter future.',
        focusAreas: ['Youth Education', 'Mentorship Programs', 'Career Development', 'Scholarships'],
        serviceArea: 'National',
        annualBudget: '$5,000,000 - $10,000,000',
        staffCount: '51-100'
      },
      {
        id: 4,
        // Core fields
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
        communicationHistory: [],
        
        // New comprehensive fields
        organizationName: 'TechStart Accelerator',
        primaryContactName: 'Alex Johnson',
        titleRole: 'CEO',
        emailAddress: 'alex.johnson@techstart.com',
        phoneNumbers: '+1 (555) 234-5678',
        additionalContactName: 'Sarah Martinez',
        additionalContactTitle: 'CTO',
        additionalContactEmail: 'sarah.martinez@techstart.com',
        additionalContactPhone: '+1 (555) 234-5679',
        mailingAddress: '321 Innovation Blvd, Tech Valley, TV 89012',
        website: 'https://techstart.com',
        socialMediaLinks: [
          { platform: 'LinkedIn', url: 'https://linkedin.com/company/techstart' },
          { platform: 'Twitter', url: 'https://twitter.com/techstart' }
        ],
        taxIdEIN: '78-9012345',
        organizationType: 'For-Profit Corporation',
        missionStatement: 'Accelerating technology innovation by supporting early-stage startups with funding, mentorship, and resources.',
        focusAreas: ['Technology Innovation', 'Startup Acceleration', 'Venture Funding', 'Tech Education'],
        serviceArea: 'International',
        annualBudget: 'Over $10,000,000',
        staffCount: '26-50'
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
      // Update existing client - map new form data to client structure
      setClients(clients.map(client => 
        client.id === selectedClient.id 
          ? { 
              ...client,
              // Map new form fields to existing client structure
              name: clientData.primaryContactName || client.name,
              email: clientData.emailAddress || client.email,
              phone: clientData.phoneNumbers || client.phone,
              organization: clientData.organizationName || client.organization,
              status: clientData.status || client.status,
              notes: clientData.notes || client.notes,
              tags: clientData.tags || client.tags,
              // Add new fields
              organizationName: clientData.organizationName,
              primaryContactName: clientData.primaryContactName,
              titleRole: clientData.titleRole,
              emailAddress: clientData.emailAddress,
              phoneNumbers: clientData.phoneNumbers,
              additionalContactName: clientData.additionalContactName,
              additionalContactTitle: clientData.additionalContactTitle,
              additionalContactEmail: clientData.additionalContactEmail,
              additionalContactPhone: clientData.additionalContactPhone,
              mailingAddress: clientData.mailingAddress,
              website: clientData.website,
              socialMediaLinks: clientData.socialMediaLinks,
              taxIdEIN: clientData.taxIdEIN,
              organizationType: clientData.organizationType,
              missionStatement: clientData.missionStatement,
              focusAreas: clientData.focusAreas,
              serviceArea: clientData.serviceArea,
              annualBudget: clientData.annualBudget,
              staffCount: clientData.staffCount
            }
          : client
      ));
    } else {
      // Add new client with complete structure
      const newClient = {
        // Core client data (for backward compatibility)
        id: Date.now(),
        name: clientData.primaryContactName,
        email: clientData.emailAddress,
        phone: clientData.phoneNumbers,
        organization: clientData.organizationName,
        status: clientData.status,
        notes: clientData.notes,
        tags: clientData.tags,
        grantsSubmitted: 0,
        grantsAwarded: 0,
        totalFunding: '$0',
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
        lastContact: new Date().toISOString().split('T')[0],
        communicationHistory: [],
        
        // New comprehensive client data
        organizationName: clientData.organizationName,
        primaryContactName: clientData.primaryContactName,
        titleRole: clientData.titleRole,
        emailAddress: clientData.emailAddress,
        phoneNumbers: clientData.phoneNumbers,
        additionalContactName: clientData.additionalContactName,
        additionalContactTitle: clientData.additionalContactTitle,
        additionalContactEmail: clientData.additionalContactEmail,
        additionalContactPhone: clientData.additionalContactPhone,
        mailingAddress: clientData.mailingAddress,
        website: clientData.website,
        socialMediaLinks: clientData.socialMediaLinks,
        taxIdEIN: clientData.taxIdEIN,
        organizationType: clientData.organizationType,
        missionStatement: clientData.missionStatement,
        focusAreas: clientData.focusAreas,
        serviceArea: clientData.serviceArea,
        annualBudget: clientData.annualBudget,
        staffCount: clientData.staffCount
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
    (client.organizationName || client.organization).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.primaryContactName || client.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.emailAddress || client.email).toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
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