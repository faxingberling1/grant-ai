import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';
import Clients from './Clients/Clients';
import Grants from './Grants/Grants';
import ClientGrantMatching from './Grants/ClientGrantMatching';
import Submissions from './Submissions/Submissions';
import Sources from './Sources/Sources';
import Matching from './Matching/Matching';
import AIWriting from './AIWriting/AIWriting';
import Reports from './Reports/Reports';

import './Dashboard.css';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderPageContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardContent onNavigateToClients={() => setActivePage('clients')} />;
      case 'clients':
        return <Clients />;
      case 'grants':
        return (
          <Grants 
            onNavigateToMatching={() => setActivePage('client-matching')}
            onNavigateToNewGrant={() => {
              alert('New Grant form would open here');
            }}
            onNavigateToDrafts={() => {
              alert('Drafts page would open here');
            }}
          />
        );
      case 'client-matching':
        return (
          <ClientGrantMatching 
            onNavigateToGrants={() => setActivePage('grants')}
            onNavigateToNewGrant={(data) => {
              console.log('Navigate to new grant with:', data);
              alert(`New Grant form would open with client: ${data.client.name} and grant: ${data.grant.grantName}`);
            }}
          />
        );
      case 'submissions':
        return <Submissions />;
      case 'sources':
        return <Sources />;
      case 'matching':
        return <Matching />;
      case 'ai-writing':
        return <AIWriting />;
      case 'reports':
        return <Reports />;
      case 'profile':
        return (
          <div className="page-content">
            <div className="page-header">
              <h1>My Profile</h1>
              <p>Manage your account settings and preferences</p>
            </div>
            <div className="coming-soon">
              <i className="fas fa-user"></i>
              <h2>Profile Management Coming Soon</h2>
              <p>This section is under development and will be available soon.</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="page-content">
            <div className="page-header">
              <h1>Settings</h1>
              <p>Configure your application preferences</p>
            </div>
            <div className="coming-soon">
              <i className="fas fa-cog"></i>
              <h2>Settings Coming Soon</h2>
              <p>This section is under development and will be available soon.</p>
            </div>
          </div>
        );
      case 'help':
        return (
          <div className="page-content">
            <div className="page-header">
              <h1>Help & Support</h1>
              <p>Get help and learn how to use GrantFlow</p>
            </div>
            <div className="coming-soon">
              <i className="fas fa-question-circle"></i>
              <h2>Help Center Coming Soon</h2>
              <p>This section is under development and will be available soon.</p>
            </div>
          </div>
        );
      default:
        return <DashboardContent onNavigateToClients={() => setActivePage('clients')} />;
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
        />
        
        <div className="dashboard-content">
          {renderPageContent()}
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Content Component with Enhanced Recent Clients Section
const DashboardContent = ({ onNavigateToClients }) => {
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
        </div>
        <div className="welcome-actions">
          <button className="btn btn-primary">
            <i className="fas fa-robot"></i>
            Start AI Grant Writing
          </button>
          <button className="btn btn-outline">
            <i className="fas fa-play-circle"></i>
            Take Tour
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
          <div className="action-card primary">
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
          
          <div className="action-card success">
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
          
          <div className="action-card warning">
            <div className="action-icon">
              <i className="fas fa-search"></i>
            </div>
            <div className="action-content">
              <h3>Find Grants</h3>
              <p>Discover new funding opportunities</p>
            </div>
            <div className="action-arrow">
              <i className="fas fa-arrow-right"></i>
            </div>
          </div>
          
          <div className="action-card info">
            <div className="action-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="action-content">
              <h3>View Reports</h3>
              <p>Analyze your grant performance</p>
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
                          <button className="client-action-btn">
                            <i className="fas fa-envelope"></i>
                            <span className="client-action-tooltip">Send Message</span>
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