// frontend/src/components/Dashboard/Submissions/SubmissionTimeline.js
import React from 'react';

const SubmissionTimeline = ({ submission }) => {
  const getTimelineEvents = () => {
    const events = [];

    // Draft created event
    events.push({
      id: 1,
      title: 'Draft Created',
      description: 'Submission draft was created',
      date: submission.createdDate || '2024-01-01',
      status: 'completed',
      icon: 'fa-file-alt'
    });

    // Submitted event (if applicable)
    if (submission.submittedDate) {
      events.push({
        id: 2,
        title: 'Submitted to Funder',
        description: `Application submitted to ${submission.funder}`,
        date: submission.submittedDate,
        status: 'completed',
        icon: 'fa-paper-plane'
      });
    }

    // Under review event (if submitted but not decided)
    if (submission.status === 'submitted' && !submission.decisionDate) {
      events.push({
        id: 3,
        title: 'Under Review',
        description: 'Application is being reviewed by funder',
        date: 'Current',
        status: 'current',
        icon: 'fa-search'
      });
    }

    // Decision events
    if (submission.decisionDate) {
      if (submission.status === 'approved') {
        events.push({
          id: 4,
          title: 'Approved',
          description: 'Grant application was approved',
          date: submission.decisionDate,
          status: 'completed',
          icon: 'fa-check-circle',
          highlight: true
        });
      } else if (submission.status === 'rejected') {
        events.push({
          id: 4,
          title: 'Not Approved',
          description: 'Grant application was not approved',
          date: submission.decisionDate,
          status: 'completed',
          icon: 'fa-times-circle'
        });
      }
    }

    // Future events based on status
    if (submission.status === 'draft') {
      events.push({
        id: 2,
        title: 'Submit Application',
        description: 'Ready to submit to funder',
        date: 'Pending',
        status: 'pending',
        icon: 'fa-paper-plane'
      });
    }

    if (submission.status === 'submitted' && !submission.decisionDate) {
      events.push({
        id: 4,
        title: 'Decision Expected',
        description: 'Awaiting final decision from funder',
        date: 'Future',
        status: 'pending',
        icon: 'fa-clock'
      });
    }

    return events;
  };

  const timelineEvents = getTimelineEvents();

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'Current' || dateString === 'Future' || dateString === 'Pending') {
      return dateString;
    }
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="submission-timeline">
      <h3>Submission Timeline</h3>
      <div className="timeline">
        {timelineEvents.map((event, index) => (
          <div key={event.id} className={`timeline-event ${event.status}`}>
            <div className="timeline-marker">
              <i className={`fas ${event.icon}`}></i>
            </div>
            <div className="timeline-content">
              <div className="timeline-title">{event.title}</div>
              <div className="timeline-description">{event.description}</div>
              <div className="timeline-date">{formatDate(event.date)}</div>
            </div>
            {index < timelineEvents.length - 1 && <div className="timeline-connector"></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubmissionTimeline;