import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';
import Clients from './Clients/Clients';
import Grants from './Grants/Grants';
import FindGrants from './Grants/FindGrants';
import ClientGrantMatching from './Grants/ClientGrantMatching';
import Submissions from './Submissions/Submissions';
import Sources from './Sources/Sources';
import Matching from './Matching/Matching';
import AIWriting from './AIWriting/AIWriting';
import Reports from './Reports/Reports';
import Profile from './Profile/Profile';
import Settings from './Settings/Settings';
import EmailTemplates from './CommunicationHub/EmailTemplates';
import EmailComposer from './CommunicationHub/EmailComposer';

import './Dashboard.css';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');
  const [sourcesData, setSourcesData] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [emailComposerData, setEmailComposerData] = useState(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Function to update sources data from Sources component
  const updateSourcesData = (data) => {
    console.log('📊 Dashboard: Sources data updated', data);
    setSourcesData(data);
  };

  // Function to handle template selection for email composition
  const handleUseTemplate = (template) => {
    console.log('📧 Using template:', template);
    setSelectedTemplate(template);
    setEmailComposerData({
      template: template,
      subject: template.subject,
      content: template.fullContent
    });
    setActivePage('email-composer');
  };

  // Function to handle direct email composition
  const handleComposeEmail = (initialData = null) => {
    console.log('📝 Composing email with data:', initialData);
    setEmailComposerData(initialData);
    setActivePage('email-composer');
  };

  const renderPageContent = () => {
    console.log('🔄 Rendering page:', activePage);
    
    switch (activePage) {
      case 'dashboard':
        return (
          <DashboardContent 
            onNavigateToClients={() => setActivePage('clients')} 
            onNavigateToFindGrants={() => setActivePage('find-grants')}
            onNavigateToSources={() => setActivePage('sources')}
            onNavigateToAIWriting={() => setActivePage('ai-writing')}
            onNavigateToReports={() => setActivePage('reports')}
            onNavigateToEmailTemplates={() => setActivePage('email-templates')}
            onNavigateToEmailComposer={handleComposeEmail}
          />
        );
      case 'clients':
        return <Clients />;
      case 'grants':
        return (
          <Grants 
            onNavigateToMatching={() => setActivePage('client-matching')}
            onNavigateToNewGrant={() => {
              console.log('New grant creation requested');
              alert('New Grant form would open here');
            }}
            onNavigateToDrafts={() => {
              console.log('Drafts page requested');
              alert('Drafts page would open here');
            }}
            onNavigateToFindGrants={() => setActivePage('find-grants')}
          />
        );
      case 'find-grants':
        return (
          <FindGrants 
            onBack={() => setActivePage('grants')}
            sourcesData={sourcesData}
            onViewGrant={(grant) => {
              console.log('Viewing grant details:', grant);
              alert(`Viewing grant: ${grant.title}\n\nThis would open a detailed grant view with full information.`);
            }}
            onImportGrant={(grant) => {
              console.log('Importing grant:', grant);
              alert(`✅ Grant "${grant.title}" has been saved to your grants!\n\nYou can now track this grant in your Grants section.`);
            }}
          />
        );
      case 'client-matching':
        return (
          <ClientGrantMatching 
            onNavigateToGrants={() => setActivePage('grants')}
            onNavigateToNewGrant={(data) => {
              console.log('Navigate to new grant with client data:', data);
              alert(`New Grant form would open with:\n- Client: ${data.client.name}\n- Grant: ${data.grant.grantName}\n- Match Score: ${data.matchScore}%`);
            }}
          />
        );
      case 'submissions':
        return <Submissions />;
      case 'sources':
        return <Sources onSourcesUpdate={updateSourcesData} />;
      case 'matching':
        return <Matching />;
      case 'ai-writing':
        return <AIWriting />;
      case 'reports':
        return <Reports />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      case 'email-templates':
        return (
          <EmailTemplates 
            onBack={() => setActivePage('dashboard')}
            onUseTemplate={handleUseTemplate}
          />
        );
      case 'email-composer':
        return (
          <EmailComposer 
            onBack={() => setActivePage('email-templates')}
            initialData={emailComposerData}
            onSend={(emailData) => {
              console.log('📤 Email sent:', emailData);
              alert(`Email sent successfully to ${emailData.to}!\n\nSubject: ${emailData.subject}`);
              setActivePage('email-templates');
            }}
            onSaveDraft={(emailData) => {
              console.log('💾 Email draft saved:', emailData);
              alert('Email draft saved successfully!');
              setActivePage('email-templates');
            }}
          />
        );
      case 'help':
        return (
          <div className="page-content">
            <div className="page-header">
              <h1>Help & Support</h1>
              <p>Get help and learn how to use GrantFlow</p>
            </div>
            <div className="help-content">
              <div className="help-sections">
                <div className="help-section">
                  <div className="help-icon">
                    <i className="fas fa-book"></i>
                  </div>
                  <h3>Documentation</h3>
                  <p>Comprehensive guides and tutorials</p>
                  <button className="btn btn-outline">View Docs</button>
                </div>
                
                <div className="help-section">
                  <div className="help-icon">
                    <i className="fas fa-video"></i>
                  </div>
                  <h3>Video Tutorials</h3>
                  <p>Step-by-step video guides</p>
                  <button className="btn btn-outline">Watch Videos</button>
                </div>
                
                <div className="help-section">
                  <div className="help-icon">
                    <i className="fas fa-question-circle"></i>
                  </div>
                  <h3>FAQ</h3>
                  <p>Frequently asked questions</p>
                  <button className="btn btn-outline">View FAQ</button>
                </div>
              </div>
              
              <div className="support-contact">
                <h3>Need More Help?</h3>
                <p>Contact our support team for personalized assistance</p>
                <div className="contact-actions">
                  <button className="btn btn-primary">
                    <i className="fas fa-envelope"></i>
                    Email Support
                  </button>
                  <button className="btn btn-outline">
                    <i className="fas fa-phone"></i>
                    Call Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <DashboardContent 
            onNavigateToClients={() => setActivePage('clients')} 
            onNavigateToFindGrants={() => setActivePage('find-grants')}
            onNavigateToSources={() => setActivePage('sources')}
            onNavigateToEmailTemplates={() => setActivePage('email-templates')}
            onNavigateToEmailComposer={handleComposeEmail}
          />
        );
    }
  };

  return (
    <div className="dashboard-container">
      <DashboardSidebar 
        isOpen={sidebarOpen} 
        activePage={activePage}
        onPageChange={setActivePage}
        onToggle={toggleSidebar}
      />
      
      <div className={`dashboard-main ${sidebarOpen ? '' : 'sidebar-closed'}`}>
        <DashboardHeader 
          onToggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
          currentPage={activePage}
          user={currentUser}
        />
        
        <div className="dashboard-content">
          {renderPageContent()}
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Content Component
const DashboardContent = ({ 
  onNavigateToClients, 
  onNavigateToFindGrants, 
  onNavigateToSources,
  onNavigateToAIWriting,
  onNavigateToReports,
  onNavigateToEmailTemplates,
  onNavigateToEmailComposer 
}) => {
  const { currentUser } = useAuth();
  const [activeClientTab, setActiveClientTab] = useState('all');

  // Sample client data
  const clientsData = {
    all: [
      {
        id: 1,
        name: 'GreenTech Initiative',
        company: 'Environmental Technology',
        email: 'contact@greentech.org',
        phone: '(555) 123-4567',
        projects: 12,
        status: 'active',
        isVerified: true,
        isOnline: true,
        avatar: 'https://i.pravatar.cc/150?img=1'
      },
      {
        id: 2,
        name: 'Sarah Chen',
        company: 'Community Health Alliance',
        email: 'sarah@healthalliance.org',
        phone: '(555) 987-6543',
        projects: 8,
        status: 'active',
        isVerified: false,
        isOnline: false,
        avatar: 'https://i.pravatar.cc/150?img=32'
      },
      {
        id: 3,
        name: 'Michael Rodriguez',
        company: 'Youth Future Foundation',
        email: 'mike@youthfuture.org',
        phone: '(555) 456-7890',
        projects: 15,
        status: 'vip',
        isVerified: false,
        isOnline: false,
        avatar: 'https://i.pravatar.cc/150?img=8'
      },
      {
        id: 4,
        name: 'TechStart Inc',
        company: 'Startup Accelerator',
        email: 'info@techstart.com',
        phone: '(555) 234-5678',
        projects: 6,
        status: 'pending',
        isVerified: true,
        isOnline: true,
        avatar: 'https://i.pravatar.cc/150?img=11'
      }
    ],
    active: [
      {
        id: 1,
        name: 'GreenTech Initiative',
        company: 'Environmental Technology',
        email: 'contact@greentech.org',
        phone: '(555) 123-4567',
        projects: 12,
        status: 'active',
        isVerified: true,
        isOnline: true,
        avatar: 'https://i.pravatar.cc/150?img=1'
      },
      {
        id: 2,
        name: 'Sarah Chen',
        company: 'Community Health Alliance',
        email: 'sarah@healthalliance.org',
        phone: '(555) 987-6543',
        projects: 8,
        status: 'active',
        isVerified: false,
        isOnline: false,
        avatar: 'https://i.pravatar.cc/150?img=32'
      }
    ],
    vip: [
      {
        id: 3,
        name: 'Michael Rodriguez',
        company: 'Youth Future Foundation',
        email: 'mike@youthfuture.org',
        phone: '(555) 456-7890',
        projects: 15,
        status: 'vip',
        isVerified: false,
        isOnline: false,
        avatar: 'https://i.pravatar.cc/150?img=8'
      }
    ],
    inactive: [
      {
        id: 5,
        name: 'Global Education Fund',
        company: 'Non-Profit Organization',
        email: 'info@globaledu.org',
        phone: '(555) 345-6789',
        projects: 3,
        status: 'inactive',
        isVerified: false,
        isOnline: false,
        avatar: 'https://i.pravatar.cc/150?img=15'
      }
    ]
  };

  // Tab configuration with counts
  const clientTabs = [
    { id: 'all', label: 'All Clients', count: 8, badge: '8' },
    { id: 'active', label: 'Active', count: 6, badge: '6' },
    { id: 'vip', label: 'VIP', count: 2, badge: '2' },
    { id: 'inactive', label: 'Inactive', count: 2, badge: '2' }
  ];

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'active':
        return { label: 'Active', class: 'active' };
      case 'pending':
        return { label: 'Pending', class: 'pending' };
      case 'inactive':
        return { label: 'Inactive', class: 'inactive' };
      case 'vip':
        return { label: 'VIP', class: 'vip' };
      default:
        return { label: 'Active', class: 'active' };
    }
  };

  const getOnlineStatus = (isOnline) => {
    if (isOnline === true) return '';
    if (isOnline === false) return 'offline';
    return 'away';
  };

  const handleViewAllClients = () => {
    if (onNavigateToClients) {
      onNavigateToClients();
    }
  };

  const currentClients = clientsData[activeClientTab] || [];

  return (
    <div className="dashboard-home">
      {/* Welcome Section */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <h1>Welcome back, {currentUser?.name || 'User'}! 🎉</h1>
          <p>Your AI-powered grant management platform is ready to help you secure more funding.</p>
          <div className="welcome-stats">
            <div className="welcome-stat">
              <i className="fas fa-trophy"></i>
              <span>$2.4M secured this quarter</span>
            </div>
            <div className="welcome-stat">
              <i className="fas fa-clock"></i>
              <span>5 deadlines this week</span>
            </div>
          </div>
        </div>
        <div className="welcome-actions">
          <button className="btn btn-primary" onClick={onNavigateToAIWriting}>
            <i className="fas fa-robot"></i>
            Start AI Grant Writing
          </button>
          <button className="btn btn-outline" onClick={onNavigateToEmailComposer}>
            <i className="fas fa-envelope"></i>
            Compose Email
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon primary">
            <i className="fas fa-file-alt"></i>
          </div>
          <div className="stat-content">
            <h3>24</h3>
            <p>Active Grants</p>
            <span className="stat-trend positive">+12%</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon success">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-content">
            <h3>18</h3>
            <p>Submitted</p>
            <span className="stat-trend positive">+8%</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon warning">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-content">
            <h3>5</h3>
            <p>Pending Review</p>
            <span className="stat-trend negative">-2%</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon info">
            <i className="fas fa-award"></i>
          </div>
          <div className="stat-content">
            <h3>$245K</h3>
            <p>Secured Funding</p>
            <span className="stat-trend positive">+25%</span>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="quick-actions-grid">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <div className="action-card primary" onClick={onNavigateToAIWriting}>
            <div className="action-icon">
              <i className="fas fa-robot"></i>
            </div>
            <div className="action-content">
              <h3>AI Grant Writing</h3>
              <p>Generate compelling grant proposals with AI assistance</p>
            </div>
            <div className="action-arrow">
              <i className="fas fa-arrow-right"></i>
            </div>
          </div>
          
          <div className="action-card success" onClick={onNavigateToClients}>
            <div className="action-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="action-content">
              <h3>Manage Clients</h3>
              <p>View and manage your client portfolio</p>
            </div>
            <div className="action-arrow">
              <i className="fas fa-arrow-right"></i>
            </div>
          </div>
          
          <div className="action-card warning" onClick={onNavigateToFindGrants}>
            <div className="action-icon">
              <i className="fas fa-search"></i>
            </div>
            <div className="action-content">
              <h3>Find Grants</h3>
              <p>Discover funding opportunities from multiple sources</p>
            </div>
            <div className="action-arrow">
              <i className="fas fa-arrow-right"></i>
            </div>
          </div>
          
          <div className="action-card info" onClick={onNavigateToEmailComposer}>
            <div className="action-icon">
              <i className="fas fa-envelope"></i>
            </div>
            <div className="action-content">
              <h3>Compose Email</h3>
              <p>Create and send emails to clients and partners</p>
            </div>
            <div className="action-arrow">
              <i className="fas fa-arrow-right"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Quick Actions Row */}
      <div className="quick-actions-grid">
        <div className="actions-grid">
          <div className="action-card secondary" onClick={onNavigateToEmailTemplates}>
            <div className="action-icon">
              <i className="fas fa-file-alt"></i>
            </div>
            <div className="action-content">
              <h3>Email Templates</h3>
              <p>Use pre-built templates for client communication</p>
            </div>
            <div className="action-arrow">
              <i className="fas fa-arrow-right"></i>
            </div>
          </div>
          
          <div className="action-card tertiary" onClick={onNavigateToReports}>
            <div className="action-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="action-content">
              <h3>View Reports</h3>
              <p>Analyze your grant performance and success metrics</p>
            </div>
            <div className="action-arrow">
              <i className="fas fa-arrow-right"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Recent Activity */}
        <div className="content-card">
          <div className="card-header">
            <h3>Recent Activity</h3>
            <button className="btn-link">View All</button>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon success">
                <i className="fas fa-check"></i>
              </div>
              <div className="activity-content">
                <p>Grant submitted to Johnson Foundation</p>
                <span className="activity-time">2 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon warning">
                <i className="fas fa-clock"></i>
              </div>
              <div className="activity-content">
                <p>Draft ready for GreenTech Initiative</p>
                <span className="activity-time">5 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon info">
                <i className="fas fa-bolt"></i>
              </div>
              <div className="activity-content">
                <p>AI analysis completed for DOE grant</p>
                <span className="activity-time">1 day ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon primary">
                <i className="fas fa-user-plus"></i>
              </div>
              <div className="activity-content">
                <p>New client added: Community Health Alliance</p>
                <span className="activity-time">2 days ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="content-card">
          <div className="card-header">
            <h3>Upcoming Deadlines</h3>
            <button className="btn-link">View Calendar</button>
          </div>
          <div className="deadlines-list">
            <div className="deadline-item urgent">
              <div className="deadline-date">
                <span className="date-day">15</span>
                <span className="date-month">NOV</span>
              </div>
              <div className="deadline-content">
                <h4>National Science Foundation</h4>
                <p>STEM Education Initiative - $500,000</p>
              </div>
              <div className="deadline-actions">
                <span className="deadline-badge urgent">Urgent</span>
              </div>
            </div>
            <div className="deadline-item">
              <div className="deadline-date">
                <span className="date-day">22</span>
                <span className="date-month">NOV</span>
              </div>
              <div className="deadline-content">
                <h4>Department of Energy</h4>
                <p>Clean Energy Research - $750,000</p>
              </div>
              <div className="deadline-actions">
                <span className="deadline-badge">Upcoming</span>
              </div>
            </div>
            <div className="deadline-item">
              <div className="deadline-date">
                <span className="date-day">05</span>
                <span className="date-month">DEC</span>
              </div>
              <div className="deadline-content">
                <h4>Ford Foundation</h4>
                <p>Social Justice Program - $1,000,000</p>
              </div>
              <div className="deadline-actions">
                <span className="deadline-badge">Planning</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Recent Clients Section */}
      <div className="recent-clients">
        <div className="card-header">
          <div className="card-header-content">
            <div className="card-header-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="card-header-text">
              <h3>Recent Clients</h3>
              <p>Manage your client portfolio and track progress</p>
            </div>
          </div>
          <div className="card-header-actions">
            <button className="filter-btn">
              <i className="fas fa-filter"></i>
              Filter
            </button>
            <button className="view-all-btn" onClick={handleViewAllClients}>
              View All Clients
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>

        {/* Clients Tabs */}
        <div className="clients-tabs">
          {clientTabs.map(tab => (
            <button
              key={tab.id}
              className={`clients-tab ${activeClientTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveClientTab(tab.id)}
            >
              {tab.label}
              <span className="clients-tab-badge">{tab.badge}</span>
            </button>
          ))}
        </div>

        {/* Clients Table */}
        <div className="clients-table-container">
          {currentClients.length > 0 ? (
            <table className="clients-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Contact</th>
                  <th>Projects</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentClients.map(client => {
                  const statusInfo = getStatusDisplay(client.status);
                  const onlineStatus = getOnlineStatus(client.isOnline);
                  
                  return (
                    <tr key={client.id}>
                      <td>
                        <div className="client-info-cell">
                          <div className="client-avatar-container">
                            <img src={client.avatar} alt={client.name} className="client-avatar" />
                            <div className={`client-online-status ${onlineStatus}`}></div>
                          </div>
                          <div className="client-details">
                            <div className="client-name">
                              {client.name}
                              {client.isVerified && (
                                <i className="fas fa-badge-check client-verified"></i>
                              )}
                            </div>
                            <div className="client-company">
                              <i className="fas fa-building"></i>
                              {client.company}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="client-contact">
                          <div className="client-contact-item">
                            <i className="fas fa-envelope"></i>
                            {client.email}
                          </div>
                          <div className="client-contact-item">
                            <i className="fas fa-phone"></i>
                            {client.phone}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="client-projects">
                          <span className="projects-badge">
                            <i className="fas fa-file-alt"></i>
                            {client.projects}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`client-status ${statusInfo.class}`}>
                          <span className="client-status-dot"></span>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td>
                        <div className="client-actions">
                          <button className="client-action-btn">
                            <i className="fas fa-edit"></i>
                            <span className="client-action-tooltip">Edit Client</span>
                          </button>
                          <button 
                            className="client-action-btn"
                            onClick={() => onNavigateToEmailComposer({
                              to: client.email,
                              subject: `Follow-up: ${client.company}`,
                              content: `Dear ${client.name},\n\nI hope this email finds you well...`
                            })}
                          >
                            <i className="fas fa-envelope"></i>
                            <span className="client-action-tooltip">Send Email</span>
                          </button>
                          <button className="client-action-btn primary">
                            <i className="fas fa-eye"></i>
                            <span className="client-action-tooltip">View Profile</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="clients-empty-state">
              <i className="fas fa-users"></i>
              <h4>No clients found</h4>
              <p>There are no clients matching your current filter.</p>
              <button className="btn" onClick={() => setActiveClientTab('all')}>
                Show All Clients
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;