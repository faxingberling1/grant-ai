import React, { useState, useEffect } from 'react';
import './DisableConfirmationModal.css';

const DisableConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  integrationName = "Grants.gov",
  cooldownMinutes = 5 
}) => {
  const [timeLeft, setTimeLeft] = useState(cooldownMinutes * 60);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(cooldownMinutes * 60);
      setIsConfirmed(false);
      return;
    }

    // Start countdown only for visual purposes after confirmation
    if (timeLeft > 0 && isConfirmed) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, timeLeft, isConfirmed, cooldownMinutes]);

  if (!isOpen) return null;

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleConfirm = () => {
    // Call onConfirm immediately to disable the integration
    onConfirm();
    // Then start the visual countdown
    setIsConfirmed(true);
  };

  const handleCancel = () => {
    onClose();
  };

  const handleCloseAfterCooldown = () => {
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="disable-confirmation-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="modal-title">
            <h3>Disable {integrationName}?</h3>
            <p>Please confirm this action</p>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">
          {!isConfirmed ? (
            <>
              <div className="warning-section">
                <div className="warning-icon">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <div className="warning-content">
                  <h4>Important Notice</h4>
                  <p>
                    Disabling {integrationName} will:
                  </p>
                  <ul className="consequences-list">
                    <li>
                      <i className="fas fa-times-circle"></i>
                      Stop automatic grant data syncing
                    </li>
                    <li>
                      <i className="fas fa-times-circle"></i>
                      Remove access to real-time grant opportunities
                    </li>
                    <li>
                      <i className="fas fa-times-circle"></i>
                      Affect grant matching recommendations
                    </li>
                    <li>
                      <i className="fas fa-clock"></i>
                      Require {cooldownMinutes}-minute cooldown to re-enable
                    </li>
                  </ul>
                </div>
              </div>

              <div className="data-warning">
                <i className="fas fa-database"></i>
                <span>
                  Your existing grant data will be preserved, but no new data will be synced.
                </span>
              </div>
            </>
          ) : (
            <div className="cooldown-section">
              <div className="cooldown-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="cooldown-content">
                <h4>Integration Disabled</h4>
                <p>
                  {integrationName} has been temporarily disabled. You can re-enable it after the cooldown period.
                </p>
                <div className="cooldown-timer">
                  <div className="timer-display">
                    <span className="timer-label">Re-enable available in:</span>
                    <span className="timer-value">{formatTime(timeLeft)}</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${((cooldownMinutes * 60 - timeLeft) / (cooldownMinutes * 60)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div className="cooldown-note">
                  <i className="fas fa-info-circle"></i>
                  <span>The timer will continue counting down even if you close this dialog.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          {!isConfirmed ? (
            <>
              <button 
                className="btn btn-outline"
                onClick={handleCancel}
              >
                <i className="fas fa-times"></i>
                Cancel
              </button>
              <button 
                className="btn btn-warning"
                onClick={handleConfirm}
              >
                <i className="fas fa-power-off"></i>
                Yes, Disable Integration
              </button>
            </>
          ) : (
            <button 
              className="btn btn-primary"
              onClick={handleCloseAfterCooldown}
            >
              <i className="fas fa-check"></i>
              Close
            </button>
          )}
        </div>

        {/* Close Button */}
        <button 
          className="modal-close-btn"
          onClick={isConfirmed ? handleCloseAfterCooldown : handleCancel}
          aria-label="Close dialog"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
};

export default DisableConfirmationModal;