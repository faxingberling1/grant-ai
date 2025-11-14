import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import './Profile.css';
import ProfileHeader from './ProfileHeader';
import ProfileSettings from './ProfileSettings';
import SubscriptionPlan from './SubscriptionPlan';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('settings');
  const { currentUser } = useAuth();
  
  // Initialize user data with data from AuthContext
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    title: '',
    organization: '',
    department: '',
    bio: '',
    location: '',
    website: '',
    linkedin: '',
    twitter: '',
    stats: {
      grantsSubmitted: 0,
      successRate: 0,
      activeClients: 0,
      totalFunding: 0,
      avgResponseTime: 0
    },
    subscription: {
      plan: 'Business',
      status: 'active',
      renewalDate: '2024-12-15',
      price: '$249/month',
      maintenance: '$150/month',
      features: [
        'Unlimited Active Grants',
        'Advanced AI Writing Assistant',
        'Priority Support',
        'Custom Templates',
        'API Access',
        'Advanced Analytics',
        'Team Collaboration'
      ],
      usage: {
        grants: 24,
        clients: 12,
        aiCredits: 245,
        storage: 2.4
      }
    }
  });

  // Load user data when component mounts or currentUser changes
  useEffect(() => {
    if (currentUser) {
      const userData = {
        name: currentUser.name || currentUser.displayName || 'User',
        email: currentUser.email || '',
        phone: currentUser.phoneNumber || '+1 (555) 123-4567',
        title: 'Senior Grant Writer',
        organization: 'Nonprofit Solutions Inc.',
        department: 'Grant Writing Department',
        bio: 'Experienced grant writer with over 8 years in nonprofit fundraising and development. Specialized in federal grants and foundation relations. Passionate about helping organizations secure funding for meaningful projects.',
        location: 'New York, NY',
        website: 'https://www.sarahjohnson-grants.com',
        linkedin: 'https://linkedin.com/in/sarahjohnson',
        twitter: 'https://twitter.com/sarahjohnson',
        stats: {
          grantsSubmitted: 47,
          successRate: 68,
          activeClients: 12,
          totalFunding: 2450000,
          avgResponseTime: 2.4
        },
        subscription: {
          plan: 'Business',
          status: 'active',
          renewalDate: '2024-12-15',
          price: '$249/month',
          maintenance: '$150/month',
          features: [
            'Unlimited Active Grants',
            'Advanced AI Writing Assistant',
            'Priority Support',
            'Custom Templates',
            'API Access',
            'Advanced Analytics',
            'Team Collaboration'
          ],
          usage: {
            grants: 24,
            clients: 12,
            aiCredits: 245,
            storage: 2.4
          }
        }
      };
      setUser(userData);
    }
  }, [currentUser]);

  const handleSaveProfile = (updatedData) => {
    setUser(prev => ({
      ...prev,
      ...updatedData
    }));
    console.log('Saving profile data:', updatedData);
  };

  const handleSubscriptionChange = (newPlan) => {
    console.log('Changing subscription to:', newPlan);
    setUser(prev => ({
      ...prev,
      subscription: {
        ...prev.subscription,
        plan: newPlan,
        price: newPlan === 'Professional' ? '$199/month' : newPlan === 'Business' ? '$249/month' : '$499/month'
      }
    }));
  };

  const handleAvatarClick = () => {
    console.log('Avatar click - implement upload modal');
  };

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'settings':
        return (
          <ProfileSettings 
            user={user} 
            onSave={handleSaveProfile}
          />
        );
      case 'subscription':
        return (
          <SubscriptionPlan 
            subscription={user.subscription}
            onPlanChange={handleSubscriptionChange}
          />
        );
      default:
        return (
          <ProfileSettings 
            user={user} 
            onSave={handleSaveProfile}
          />
        );
    }
  };

  return (
    <div className="profile-container">
      <ProfileHeader 
        user={user} 
        onAvatarClick={handleAvatarClick}
      />
      
      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="profile-nav">
            <div 
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              Personal Information
            </div>
            <div 
              className={`nav-item ${activeTab === 'subscription' ? 'active' : ''}`}
              onClick={() => setActiveTab('subscription')}
            >
              <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
              </svg>
              Subscription Plan
            </div>
          </div>

          {/* Quick Stats Sidebar */}
          <div className="profile-quick-stats">
            <h4>Quick Stats</h4>
            <div className="quick-stat">
              <div className="quick-stat-icon">
                <i className="fas fa-file-alt"></i>
              </div>
              <div className="quick-stat-content">
                <span className="quick-stat-value">{user.stats.grantsSubmitted}</span>
                <span className="quick-stat-label">Grants</span>
              </div>
            </div>
            <div className="quick-stat">
              <div className="quick-stat-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="quick-stat-content">
                <span className="quick-stat-value">{user.stats.activeClients}</span>
                <span className="quick-stat-label">Clients</span>
              </div>
            </div>
            <div className="quick-stat">
              <div className="quick-stat-icon">
                <i className="fas fa-trophy"></i>
              </div>
              <div className="quick-stat-content">
                <span className="quick-stat-value">{user.stats.successRate}%</span>
                <span className="quick-stat-label">Success Rate</span>
              </div>
            </div>
            <div className="quick-stat">
              <div className="quick-stat-icon">
                <i className="fas fa-dollar-sign"></i>
              </div>
              <div className="quick-stat-content">
                <span className="quick-stat-value">${(user.stats.totalFunding / 1000000).toFixed(1)}M</span>
                <span className="quick-stat-label">Secured</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="profile-main">
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

export default Profile;