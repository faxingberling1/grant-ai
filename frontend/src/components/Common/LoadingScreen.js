// Create a new file: src/components/Common/LoadingScreen.js
import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;