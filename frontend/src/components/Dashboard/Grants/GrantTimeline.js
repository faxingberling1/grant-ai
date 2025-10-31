import React from 'react';

const GrantTimeline = ({ grant }) => {
  const timelineEvents = [
    {
      id: 1,
      type: 'created',
      title: 'Grant Created',
      description: 'Grant application was created in the system',
      date: grant.created,
      icon: 'fas fa-plus',
      color: '#3b82f6'
    },
    ...(grant.updated !== grant.created ? [{
      id: 2,
      type: 'updated',
      title: 'Last Updated',
      description: 'Grant application was last modified',
      date: grant.updated,
      icon: 'fas fa-edit',
      color: '#f59e0b'
    }] : []),
    ...(grant.submissionDate ? [{
      id: 3,
      type: 'submitted',
      title: 'Submitted to Funder',
      description: 'Grant application was submitted to the funding organization',
      date: grant.submissionDate,
      icon: 'fas fa-paper-plane',
      color: '#10b981'
    }] : []),
    {
      id: 4,
      type: 'deadline',
      title: 'Application Deadline',
      description: 'Final submission deadline for the grant application',
      date: grant.deadline,
      icon: 'fas fa-clock',
      color: grant.status === 'submitted' ? '#10b981' : '#ef4444'
    }
  ].sort((a, b) => new Date(a.date) - new Date(b.date));

  const getStatusText = (event) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    
    if (event.type === 'deadline') {
      if (grant.status === 'submitted' || grant.status === 'approved') {
        return 'Completed';
      }
      return now > eventDate ? 'Overdue' : 'Upcoming';
    }
    
    return now >= eventDate ? 'Completed' : 'Scheduled';
  };

  return (
    <div className="grant-timeline">
      <div className="timeline-header">
        <h3>Grant Timeline</h3>
        <p>Track the progress of your grant application</p>
      </div>

      <div className="timeline">
        {timelineEvents.map((event, index) => (
          <div key={event.id} className="timeline-item">
            <div className="timeline-marker">
              <div 
                className="marker-icon"
                style={{ backgroundColor: event.color }}
              >
                <i className={event.icon}></i>
              </div>
              {index !== timelineEvents.length - 1 && (
                <div className="timeline-connector"></div>
              )}
            </div>
            <div className="timeline-content">
              <div className="timeline-header">
                <h4>{event.title}</h4>
                <span className={`timeline-status ${getStatusText(event).toLowerCase()}`}>
                  {getStatusText(event)}
                </span>
              </div>
              <p className="timeline-description">{event.description}</p>
              <div className="timeline-date">
                <i className="fas fa-calendar"></i>
                {new Date(event.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              {event.type === 'deadline' && new Date(event.date) < new Date() && grant.status !== 'submitted' && (
                <div className="timeline-alert">
                  <i className="fas fa-exclamation-triangle"></i>
                  Deadline has passed
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Next Steps */}
      <div className="next-steps">
        <h4>Next Steps</h4>
        <div className="steps-list">
          {grant.status === 'draft' && (
            <div className="step-item">
              <i className="fas fa-edit"></i>
              <span>Complete grant proposal writing</span>
            </div>
          )}
          {grant.status === 'draft' && (
            <div className="step-item">
              <i className="fas fa-check-circle"></i>
              <span>Internal review and approval</span>
            </div>
          )}
          {['draft', 'in_review'].includes(grant.status) && (
            <div className="step-item">
              <i className="fas fa-paper-plane"></i>
              <span>Submit to funding organization</span>
            </div>
          )}
          {grant.status === 'submitted' && (
            <div className="step-item">
              <i className="fas fa-clock"></i>
              <span>Await funder decision</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrantTimeline;