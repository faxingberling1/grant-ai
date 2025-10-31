import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';
import Clients from './Clients/Clients';
import Grants from './Grants/Grants';
import Submissions from './Submissions/Submissions'; // Add this import
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
        return <DashboardContent />;
      case 'clients':
        return <Clients />;
      case 'grants':
        return <Grants />; // Fixed: removed the duplicate return
      case 'submissions':
        return <Submissions />; // Now this will render the actual Submissions component
      case 'sources':
        return <Sources />;
        return (
          <div className="page-content">
            <div className="page-header">
              <h1>Grant Sources</h1>
              <p>Discover and manage grant funding sources</p>
            </div>
            <div className="coming-soon">
              <i className="fas fa-database"></i>
              <h2>Grant Sources Coming Soon</h2>
              <p>This section is under development and will be available soon.</p>
            </div>
          </div>
        );
      case 'matching':
        return <Matching />;
        return (
          <div className="page-content">
            <div className="page-header">
              <h1>AI Grant Matching</h1>
              <p>Find the perfect grants for your organization</p>
            </div>
            <div className="coming-soon">
              <i className="fas fa-robot"></i>
              <h2>AI Matching Coming Soon</h2>
              <p>This section is under development and will be available soon.</p>
            </div>
          </div>
        );
      case 'ai-writing':
        return <AIWriting />;
        return (
          <div className="page-content">
            <div className="page-header">
              <h1>AI Grant Writing</h1>
              <p>Create compelling grant proposals with AI assistance</p>
            </div>
            <div className="coming-soon">
              <i className="fas fa-pen-fancy"></i>
              <h2>AI Writing Assistant Coming Soon</h2>
              <p>This section is under development and will be available soon.</p>
            </div>
          </div>
        );
      case 'reports':
        return <Reports />;
        return (
          <div className="page-content">
            <div className="page-header">
              <h1>Reports & Analytics</h1>
              <p>View insights and performance metrics</p>
            </div>
            <div className="coming-soon">
              <i className="fas fa-chart-bar"></i>
              <h2>Analytics Dashboard Coming Soon</h2>
              <p>This section is under development and will be available soon.</p>
            </div>
          </div>
        );
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
        return <DashboardContent />;
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
      
      <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
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

// Main Dashboard Content Component
const DashboardContent = () => {
  const { currentUser } = useAuth();

  return (
    <div className="dashboard-home">
      {/* Welcome Section */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <h1>Welcome back, {currentUser?.name}! 🎉</h1>
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

      {/* Recent Clients */}
      <div className="content-card full-width">
        <div className="card-header">
          <h3>Recent Clients</h3>
          <button className="btn-link">View All Clients</button>
        </div>
        <div className="clients-preview">
          <div className="client-preview-item">
            <img src="https://i.pravatar.cc/150?img=1" alt="GreenTech Initiative" className="client-avatar" />
            <div className="client-info">
              <h4>GreenTech Initiative</h4>
              <p>Environmental Technology</p>
            </div>
            <div className="client-stats">
              <span className="stat">12 Grants</span>
              <span className="stat">$450K</span>
            </div>
            <div className="client-status active">Active</div>
          </div>
          <div className="client-preview-item">
            <img src="https://i.pravatar.cc/150?img=32" alt="Sarah Chen" className="client-avatar" />
            <div className="client-info">
              <h4>Sarah Chen</h4>
              <p>Community Health Alliance</p>
            </div>
            <div className="client-stats">
              <span className="stat">8 Grants</span>
              <span className="stat">$280K</span>
            </div>
            <div className="client-status active">Active</div>
          </div>
          <div className="client-preview-item">
            <img src="https://i.pravatar.cc/150?img=8" alt="Michael Rodriguez" className="client-avatar" />
            <div className="client-info">
              <h4>Michael Rodriguez</h4>
              <p>Youth Future Foundation</p>
            </div>
            <div className="client-stats">
              <span className="stat">15 Grants</span>
              <span className="stat">$620K</span>
            </div>
            <div className="client-status inactive">Inactive</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;