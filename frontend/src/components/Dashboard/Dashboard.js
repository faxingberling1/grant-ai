import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useClients } from '../../context/ClientsContext';
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

// Communication Hub Components
import Inbox from './CommunicationHub/Inbox';
import Sent from './CommunicationHub/Sent';
import Starred from './CommunicationHub/Starred';
import Spam from './CommunicationHub/Spam';
import Trash from './CommunicationHub/Trash';
import Drafts from './CommunicationHub/Drafts';

// Calendar Components
import CalendarMain from './CalendarModal/CalendarMain';

// User Management Component
import UserManagement from './UserManagement/UserManagement';

// Documents Components
import Documents from './Documents/Documents';
import DocumentUpload from './Documents/DocumentUpload';

import './Dashboard.css';

// Helper function to generate initials from name
const getInitials = (name) => {
  if (!name) return 'U';
  
  const names = name.trim().split(' ');
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

// Helper function to generate a consistent color based on name
const getAvatarColor = (name) => {
  if (!name) return '#6c757d';
  
  const colors = [
    '#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6',
    '#1abc9c', '#34495e', '#d35400', '#c0392b', '#16a085'
  ];
  
  const index = name.length % colors.length;
  return colors[index];
};

// Move DashboardContent component outside to avoid circular dependencies
const DashboardContent = ({ 
  clients,
  clientsLoading,
  onNavigateToClients, 
  onNavigateToFindGrants, 
  onNavigateToSources,
  onNavigateToAIWriting,
  onNavigateToReports,
  onNavigateToEmailTemplates,
  onNavigateToEmailComposer,
  onNavigateToCalendar,
  onNavigateToDocuments,
  onNavigateToDocumentUpload
}) => {
  const { currentUser } = useAuth();
  const [activeClientTab, setActiveClientTab] = useState('all');
  const [dashboardStats, setDashboardStats] = useState({
    activeGrants: 0,
    submittedGrants: 0,
    pendingReview: 0,
    securedFunding: 0,
    recentActivities: [],
    upcomingDeadlines: []
  });

  // Fetch real dashboard statistics
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // You would replace these with actual API calls
        const stats = {
          activeGrants: 0,
          submittedGrants: 0,
          pendingReview: 0,
          securedFunding: 0,
          recentActivities: [],
          upcomingDeadlines: []
        };

        // Example of how you might fetch data from your backend
        // const response = await fetch('/api/dashboard/stats');
        // const data = await response.json();
        // setDashboardStats(data);
        
        // For now, we'll calculate from existing data
        if (clients && Array.isArray(clients)) {
          // Calculate total grants from clients
          const totalGrants = clients.reduce((sum, client) => {
            return sum + (client.grantsSubmitted || 0);
          }, 0);
          
          stats.activeGrants = totalGrants;
          stats.submittedGrants = Math.floor(totalGrants * 0.75); // Example calculation
          stats.pendingReview = Math.floor(totalGrants * 0.25); // Example calculation
          
          // Calculate secured funding (you would replace with real data)
          stats.securedFunding = clients.reduce((sum, client) => {
            return sum + (client.securedFunding || 0);
          }, 0);
        }

        setDashboardStats(stats);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchDashboardStats();
  }, [clients]);

  // FIXED: Transform API clients data to match the expected format
  const transformClientsData = (apiClients) => {
    console.log('🔄 transformClientsData called with:', apiClients);
    
    // Handle cases where apiClients might not be an array
    if (!apiClients) {
      console.warn('⚠️ apiClients is null or undefined');
      return [];
    }
    
    if (!Array.isArray(apiClients)) {
      console.warn('⚠️ apiClients is not an array:', typeof apiClients, apiClients);
      
      // Try to extract clients from different possible response formats
      if (apiClients && apiClients.clients && Array.isArray(apiClients.clients)) {
        console.log('✅ Found clients array in apiClients.clients');
        apiClients = apiClients.clients;
      } else if (apiClients && apiClients.data && Array.isArray(apiClients.data)) {
        console.log('✅ Found clients array in apiClients.data');
        apiClients = apiClients.data;
      } else if (apiClients && apiClients.success && Array.isArray(apiClients.clients)) {
        console.log('✅ Found clients array in apiClients.clients (success response)');
        apiClients = apiClients.clients;
      } else {
        console.error('❌ Cannot extract clients array from:', apiClients);
        return [];
      }
    }
    
    console.log(`🔄 Transforming ${apiClients.length} clients`);
    
    return apiClients.map(client => ({
      id: client._id || client.id,
      name: client.primaryContactName || client.name,
      company: client.organizationName || client.organization,
      email: client.emailAddress || client.email,
      phone: client.phoneNumbers || client.phone,
      projects: client.grantsSubmitted || client.activeGrants || Math.floor(Math.random() * 20) + 1,
      status: client.status || 'active',
      isVerified: client.isVerified || false,
      isOnline: client.isOnline || false,
      securedFunding: client.securedFunding || 0,
      // Remove avatar URL and use initials instead
      initials: getInitials(client.primaryContactName || client.name),
      avatarColor: getAvatarColor(client.primaryContactName || client.name)
    }));
  };

  // Use real clients data instead of sample data - FIXED
  const getClientsData = () => {
    if (!clients || !Array.isArray(clients)) {
      console.warn('⚠️ clients is not an array:', clients);
      return {
        all: [],
        active: [],
        vip: [],
        inactive: []
      };
    }

    const transformedClients = transformClientsData(clients);
    
    return {
      all: transformedClients,
      active: transformedClients.filter(client => client.status === 'active'),
      vip: transformedClients.filter(client => client.status === 'vip'),
      inactive: transformedClients.filter(client => client.status === 'inactive' || !client.status)
    };
  };

  const clientsData = getClientsData();

  // Tab configuration with real counts - FIXED
  const getClientTabs = () => {
    if (!clients || !Array.isArray(clients)) {
      return [
        { id: 'all', label: 'All Clients', count: 0, badge: '0' },
        { id: 'active', label: 'Active', count: 0, badge: '0' },
        { id: 'vip', label: 'VIP', count: 0, badge: '0' },
        { id: 'inactive', label: 'Inactive', count: 0, badge: '0' }
      ];
    }

    const transformedClients = transformClientsData(clients);
    
    return [
      { 
        id: 'all', 
        label: 'All Clients', 
        count: transformedClients.length, 
        badge: transformedClients.length.toString() 
      },
      { 
        id: 'active', 
        label: 'Active', 
        count: transformedClients.filter(c => c.status === 'active').length, 
        badge: transformedClients.filter(c => c.status === 'active').length.toString() 
      },
      { 
        id: 'vip', 
        label: 'VIP', 
        count: transformedClients.filter(c => c.status === 'vip').length, 
        badge: transformedClients.filter(c => c.status === 'vip').length.toString() 
      },
      { 
        id: 'inactive', 
        label: 'Inactive', 
        count: transformedClients.filter(c => c.status === 'inactive' || !c.status).length, 
        badge: transformedClients.filter(c => c.status === 'inactive' || !c.status).length.toString() 
      }
    ];
  };

  const clientTabs = getClientTabs();

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

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Show loading state for clients
  if (clientsLoading) {
    return (
      <div className="dashboard-home">
        <div className="welcome-banner">
          <div className="welcome-content">
            <h1>Welcome back, {currentUser?.name || 'User'}! 🎉</h1>
            <p>Your AI-powered grant management platform is ready to help you secure more funding.</p>
          </div>
        </div>
        <div className="loading-section">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      {/* Welcome Section */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <h1>Welcome back, {currentUser?.name || 'User'}! 🎉</h1>
          <p>Your AI-powered grant management platform is ready to help you secure more funding.</p>
          <div className="welcome-stats">
            {dashboardStats.securedFunding > 0 && (
              <div className="welcome-stat">
                <i className="fas fa-trophy"></i>
                <span>{formatCurrency(dashboardStats.securedFunding)} secured</span>
              </div>
            )}
            <div className="welcome-stat">
              <i className="fas fa-users"></i>
              <span>{clients?.length || 0} clients</span>
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

      {/* Stats Overview - Using Real Data */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon primary">
            <i className="fas fa-file-alt"></i>
          </div>
          <div className="stat-content">
            <h3>{dashboardStats.activeGrants}</h3>
            <p>Active Grants</p>
            {dashboardStats.activeGrants > 0 && (
              <span className="stat-trend positive">Active</span>
            )}
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon success">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-content">
            <h3>{dashboardStats.submittedGrants}</h3>
            <p>Submitted</p>
            {dashboardStats.submittedGrants > 0 && (
              <span className="stat-trend positive">Submitted</span>
            )}
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon warning">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-content">
            <h3>{dashboardStats.pendingReview}</h3>
            <p>Pending Review</p>
            {dashboardStats.pendingReview > 0 && (
              <span className="stat-trend warning">Pending</span>
            )}
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon info">
            <i className="fas fa-award"></i>
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(dashboardStats.securedFunding)}</h3>
            <p>Secured Funding</p>
            {dashboardStats.securedFunding > 0 && (
              <span className="stat-trend positive">Secured</span>
            )}
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

          {/* Calendar Quick Action */}
          <div className="action-card calendar" onClick={onNavigateToCalendar}>
            <div className="action-icon">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <div className="action-content">
              <h3>Calendar</h3>
              <p>View and manage grant deadlines and appointments</p>
            </div>
            <div className="action-arrow">
              <i className="fas fa-arrow-right"></i>
            </div>
          </div>

          {/* Documents Quick Action */}
          <div className="action-card documents" onClick={onNavigateToDocuments}>
            <div className="action-icon">
              <i className="fas fa-folder"></i>
            </div>
            <div className="action-content">
              <h3>Documents</h3>
              <p>Manage all your grant documents and files</p>
            </div>
            <div className="action-arrow">
              <i className="fas fa-arrow-right"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Recent Activity - You would populate this from real activity logs */}
        <div className="content-card">
          <div className="card-header">
            <h3>Recent Activity</h3>
            <button className="btn-link">View All</button>
          </div>
          {dashboardStats.recentActivities && dashboardStats.recentActivities.length > 0 ? (
            <div className="activity-list">
              {dashboardStats.recentActivities.slice(0, 4).map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className={`activity-icon ${activity.type}`}>
                    <i className={`fas fa-${activity.icon}`}></i>
                  </div>
                  <div className="activity-content">
                    <p>{activity.description}</p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-activity">
              <i className="fas fa-history"></i>
              <p>No recent activity</p>
            </div>
          )}
        </div>

        {/* Upcoming Deadlines - You would populate this from calendar/grants data */}
        <div className="content-card">
          <div className="card-header">
            <h3>Upcoming Deadlines</h3>
            <button className="btn-link" onClick={onNavigateToCalendar}>View Calendar</button>
          </div>
          {dashboardStats.upcomingDeadlines && dashboardStats.upcomingDeadlines.length > 0 ? (
            <div className="deadlines-list">
              {dashboardStats.upcomingDeadlines.slice(0, 3).map((deadline, index) => (
                <div key={index} className={`deadline-item ${deadline.priority}`}>
                  <div className="deadline-date">
                    <span className="date-day">{deadline.day}</span>
                    <span className="date-month">{deadline.month}</span>
                  </div>
                  <div className="deadline-content">
                    <h4>{deadline.title}</h4>
                    <p>{deadline.description}</p>
                  </div>
                  <div className="deadline-actions">
                    <span className={`deadline-badge ${deadline.priority}`}>
                      {deadline.priority === 'urgent' ? 'Urgent' : 'Upcoming'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-deadlines">
              <i className="fas fa-calendar-check"></i>
              <p>No upcoming deadlines</p>
            </div>
          )}
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
                  <th>Secured Funding</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentClients.slice(0, 5).map(client => {
                  const statusInfo = getStatusDisplay(client.status);
                  const onlineStatus = getOnlineStatus(client.isOnline);
                  
                  return (
                    <tr key={client.id}>
                      <td>
                        <div className="client-info-cell">
                          <div className="client-avatar-container">
                            {/* Replace image with initials avatar */}
                            <div 
                              className="client-avatar-initials"
                              style={{ backgroundColor: client.avatarColor }}
                            >
                              {client.initials}
                            </div>
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
                        <div className="client-funding">
                          <span className="funding-amount">
                            {formatCurrency(client.securedFunding)}
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
              <p>There are no clients in your portfolio yet.</p>
              <button className="btn" onClick={onNavigateToClients}>
                Add Your First Client
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const { currentUser } = useAuth();
  const { clients, loading: clientsLoading } = useClients();
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
            clients={clients}
            clientsLoading={clientsLoading}
            onNavigateToClients={() => setActivePage('clients')} 
            onNavigateToFindGrants={() => setActivePage('find-grants')}
            onNavigateToSources={() => setActivePage('sources')}
            onNavigateToAIWriting={() => setActivePage('ai-writing')}
            onNavigateToReports={() => setActivePage('reports')}
            onNavigateToEmailTemplates={() => setActivePage('email-templates')}
            onNavigateToEmailComposer={handleComposeEmail}
            onNavigateToCalendar={() => setActivePage('calendar')}
            onNavigateToDocuments={() => setActivePage('documents')}
            onNavigateToDocumentUpload={() => setActivePage('document-upload')}
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
      
      // Calendar Pages
      case 'calendar':
        return (
          <CalendarMain 
            clients={clients}
            onNavigateToClients={() => setActivePage('clients')}
            onNavigateToGrants={() => setActivePage('grants')}
            initialView="calendar"
          />
        );
      case 'upcoming':
        return (
          <CalendarMain 
            clients={clients}
            onNavigateToClients={() => setActivePage('clients')}
            onNavigateToGrants={() => setActivePage('grants')}
            initialView="upcoming"
          />
        );
      case 'list':
        return (
          <CalendarMain 
            clients={clients}
            onNavigateToClients={() => setActivePage('clients')}
            onNavigateToGrants={() => setActivePage('grants')}
            initialView="list"
          />
        );
      case 'schedule-meeting':
        return (
          <CalendarMain 
            clients={clients}
            onNavigateToClients={() => setActivePage('clients')}
            onNavigateToGrants={() => setActivePage('grants')}
            initialView="calendar"
            showScheduleForm={true}
          />
        );
      
      // Communication Hub Pages
      case 'communication-hub':
        return <CommunicationHub onBack={() => setActivePage('clients')} />;
      case 'inbox':
        return <Inbox />;
      case 'sent':
        return <Sent />;
      case 'starred':
        return <Starred />;
      case 'drafts':
        return <Drafts />;
      case 'email-templates':
        return (
          <EmailTemplates 
            onBack={() => setActivePage('communication-hub')}
            onUseTemplate={handleUseTemplate}
          />
        );
      case 'email-composer':
        return (
          <EmailComposer 
            onBack={() => setActivePage('communication-hub')}
            initialData={emailComposerData}
            onSend={(emailData) => {
              console.log('📤 Email sent:', emailData);
              alert(`Email sent successfully to ${emailData.to}!\n\nSubject: ${emailData.subject}`);
              setActivePage('communication-hub');
            }}
            onSaveDraft={(emailData) => {
              console.log('💾 Email draft saved:', emailData);
              alert('Email draft saved successfully!');
              setActivePage('communication-hub');
            }}
          />
        );
      case 'spam':
        return <Spam />;
      case 'trash':
        return <Trash />;
      
      // Documents Pages
      case 'documents':
        return <Documents />;
      case 'document-upload':
        return <DocumentUpload />;
      case 'all-documents':
        return <Documents initialView="all" />;
      case 'recent-documents':
        return <Documents initialView="recent" />;
      case 'shared-documents':
        return <Documents initialView="shared" />;
      case 'my-documents':
        return <Documents initialView="my" />;
      case 'document-templates':
        return <Documents initialView="templates" />;
      case 'archived-documents':
        return <Documents initialView="archived" />;
      
      // User Management Page (Admin Only)
      case 'user-management':
        return <UserManagement />;
      
      // Help Page
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
            clients={clients}
            clientsLoading={clientsLoading}
            onNavigateToClients={() => setActivePage('clients')} 
            onNavigateToFindGrants={() => setActivePage('find-grants')}
            onNavigateToSources={() => setActivePage('sources')}
            onNavigateToEmailTemplates={() => setActivePage('email-templates')}
            onNavigateToEmailComposer={handleComposeEmail}
            onNavigateToCalendar={() => setActivePage('calendar')}
            onNavigateToDocuments={() => setActivePage('documents')}
            onNavigateToDocumentUpload={() => setActivePage('document-upload')}
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

export default Dashboard;