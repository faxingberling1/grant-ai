// components/Dashboard/Grants/GrantsManager.js
import React, { useState } from 'react';
import Grants from './Grants';
import GrantForm from './GrantForm';
import ClientGrantMatching from './ClientGrantMatching';
import GrantDraft from './GrantDraft';

const GrantsManager = () => {
  const [currentView, setCurrentView] = useState('grants'); // 'grants', 'form', 'matching', 'drafts'

  // Navigation handlers
  const handleNavigateToGrantForm = () => {
    setCurrentView('form');
  };

  const handleNavigateToMatching = () => {
    setCurrentView('matching');
  };

  const handleNavigateToDrafts = () => {
    setCurrentView('drafts');
  };

  const handleBackToGrants = () => {
    setCurrentView('grants');
  };

  const handleSaveGrant = (grantData) => {
    console.log('Saving grant:', grantData);
    // Handle saving grant data
    handleBackToGrants();
  };

  // Render the appropriate component based on current view
  switch (currentView) {
    case 'form':
      return (
        <GrantForm
          onSave={handleSaveGrant}
          onCancel={handleBackToGrants}
          mode="create"
        />
      );
    case 'matching':
      return (
        <ClientGrantMatching onBack={handleBackToGrants} />
      );
    case 'drafts':
      return (
        <GrantDraft onBack={handleBackToGrants} />
      );
    default:
      return (
        <Grants
          onNavigateToGrantForm={handleNavigateToGrantForm}
          onNavigateToMatching={handleNavigateToMatching}
          onNavigateToDrafts={handleNavigateToDrafts}
        />
      );
  }
};

export default GrantsManager;