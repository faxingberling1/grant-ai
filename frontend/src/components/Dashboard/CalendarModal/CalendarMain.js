import React, { useState, useEffect } from 'react';
import CalendarView from './CalendarView';
import MeetingList from './MeetingList';
import UpcomingMeetings from './UpcomingMeetings';
import ScheduleMeeting from './ScheduleMeeting';
import CalendarSidebar from './CalendarSidebar';
import MeetingDetails from './MeetingDetails';
import MeetingRoom from './MeetingRoom';
import meetingService from '../../../services/meetingService';
import './Calendar.css';
import './CalendarSidebar.css';

const CalendarMain = ({ 
  clients, 
  onNavigateToClients, 
  onNavigateToGrants,
  initialView = 'calendar',
  showScheduleForm = false
}) => {
  const [activeView, setActiveView] = useState(initialView);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [localShowScheduleForm, setLocalShowScheduleForm] = useState(showScheduleForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load meetings from MongoDB
  useEffect(() => {
    loadMeetings();
  }, []);

  // Update local state when props change
  useEffect(() => {
    if (initialView && initialView !== activeView) {
      setActiveView(initialView);
    }
  }, [initialView]);

  useEffect(() => {
    if (showScheduleForm !== localShowScheduleForm) {
      setLocalShowScheduleForm(showScheduleForm);
    }
  }, [showScheduleForm]);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      setError(null);
      const meetingsData = await meetingService.getMeetings();
      setMeetings(meetingsData);
    } catch (error) {
      console.error('Error loading meetings:', error);
      setError('Failed to load meetings. Please try again.');
      // Fallback to localStorage if API fails
      const savedMeetings = localStorage.getItem('grantflow-meetings');
      if (savedMeetings) {
        setMeetings(JSON.parse(savedMeetings));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleMeeting = async (meetingData) => {
    try {
      setError(null);
      const newMeeting = await meetingService.createMeeting(meetingData);
      setMeetings(prev => [newMeeting, ...prev]);
      setLocalShowScheduleForm(false);
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      setError('Failed to schedule meeting. Please try again.');
      // Fallback to localStorage
      const fallbackMeeting = {
        _id: Date.now().toString(),
        ...meetingData,
        status: 'scheduled',
        createdAt: new Date().toISOString()
      };
      setMeetings(prev => [fallbackMeeting, ...prev]);
      setLocalShowScheduleForm(false);
    }
  };

  const handleUpdateMeeting = async (meetingId, updates) => {
    try {
      setError(null);
      const updatedMeeting = await meetingService.updateMeeting(meetingId, updates);
      setMeetings(prev => prev.map(meeting =>
        meeting._id === meetingId ? updatedMeeting : meeting
      ));
      setSelectedMeeting(updatedMeeting);
    } catch (error) {
      console.error('Error updating meeting:', error);
      setError('Failed to update meeting. Please try again.');
      // Fallback to localStorage
      setMeetings(prev => prev.map(meeting =>
        meeting._id === meetingId ? { ...meeting, ...updates } : meeting
      ));
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!window.confirm('Are you sure you want to delete this meeting?')) {
      return;
    }

    try {
      setError(null);
      await meetingService.deleteMeeting(meetingId);
      setMeetings(prev => prev.filter(meeting => meeting._id !== meetingId));
      setSelectedMeeting(null);
    } catch (error) {
      console.error('Error deleting meeting:', error);
      setError('Failed to delete meeting. Please try again.');
      // Fallback to localStorage
      setMeetings(prev => prev.filter(meeting => meeting._id !== meetingId));
      setSelectedMeeting(null);
    }
  };

  const handleStartMeeting = (meeting) => {
    setSelectedMeeting(meeting);
    setActiveView('meeting-room');
  };

  const handleEndMeeting = async (meeting) => {
    try {
      await meetingService.updateMeetingStatus(meeting._id, 'completed');
      setMeetings(prev => prev.map(m =>
        m._id === meeting._id ? { ...m, status: 'completed' } : m
      ));
    } catch (error) {
      console.error('Error updating meeting status:', error);
      // Fallback to localStorage
      setMeetings(prev => prev.map(m =>
        m._id === meeting._id ? { ...m, status: 'completed' } : m
      ));
    }
    setActiveView('calendar');
  };

  const getUpcomingMeetings = () => {
    const now = new Date();
    return meetings
      .filter(meeting => {
        const meetingDate = new Date(meeting.date + 'T' + meeting.time);
        return meetingDate > now && meeting.status !== 'cancelled' && meeting.status !== 'completed';
      })
      .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
  };

  const getPastMeetings = () => {
    const now = new Date();
    return meetings
      .filter(meeting => {
        const meetingDate = new Date(meeting.date + 'T' + meeting.time);
        return meetingDate <= now || meeting.status === 'completed' || meeting.status === 'cancelled';
      })
      .sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));
  };

  const renderMainContent = () => {
    if (loading) {
      return (
        <div className="calendar-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading meetings...</p>
        </div>
      );
    }

    switch (activeView) {
      case 'calendar':
        return (
          <CalendarView
            meetings={meetings}
            onMeetingSelect={setSelectedMeeting}
            onScheduleMeeting={() => setLocalShowScheduleForm(true)}
            loading={loading}
          />
        );
      case 'list':
        return (
          <MeetingList
            meetings={meetings}
            onMeetingSelect={setSelectedMeeting}
            onStartMeeting={handleStartMeeting}
            onEditMeeting={(meeting) => {
              setSelectedMeeting(meeting);
              setLocalShowScheduleForm(true);
            }}
            onDeleteMeeting={handleDeleteMeeting}
          />
        );
      case 'upcoming':
        return (
          <UpcomingMeetings
            meetings={getUpcomingMeetings()}
            onMeetingSelect={setSelectedMeeting}
            onStartMeeting={handleStartMeeting}
          />
        );
      case 'meeting-room':
        return selectedMeeting ? (
          <MeetingRoom
            meeting={selectedMeeting}
            onBack={() => setActiveView('calendar')}
            onEndMeeting={() => handleEndMeeting(selectedMeeting)}
          />
        ) : (
          <div className="calendar-error">
            <p>No meeting selected</p>
            <button onClick={() => setActiveView('calendar')}>Back to Calendar</button>
          </div>
        );
      default:
        return (
          <CalendarView
            meetings={meetings}
            onMeetingSelect={setSelectedMeeting}
            onScheduleMeeting={() => setLocalShowScheduleForm(true)}
          />
        );
    }
  };

  return (
    <div className="calendar-main">
      <div className="calendar-header">
        <div className="calendar-header-content">
          <h1>📅 Grant Calendar</h1>
          <p>Manage your meetings, deadlines, and appointments</p>
        </div>
        <div className="calendar-header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => {
              setSelectedMeeting(null);
              setLocalShowScheduleForm(true);
            }}
            disabled={loading}
          >
            <i className="fas fa-plus"></i>
            Schedule Meeting
          </button>
          <button 
            className="btn btn-outline"
            onClick={loadMeetings}
            disabled={loading}
          >
            <i className="fas fa-sync-alt"></i>
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="calendar-error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="calendar-layout">
        <CalendarSidebar
          activeView={activeView}
          onViewChange={setActiveView}
          upcomingCount={getUpcomingMeetings().length}
          totalMeetings={meetings.length}
          loading={loading}
        />
        
        <div className="calendar-content">
          {renderMainContent()}
        </div>
      </div>

      {localShowScheduleForm && (
        <ScheduleMeeting
          clients={clients}
          meeting={selectedMeeting}
          onSave={(meetingData) => {
            if (selectedMeeting) {
              handleUpdateMeeting(selectedMeeting._id, meetingData);
            } else {
              handleScheduleMeeting(meetingData);
            }
            setSelectedMeeting(null);
            setLocalShowScheduleForm(false);
          }}
          onCancel={() => {
            setSelectedMeeting(null);
            setLocalShowScheduleForm(false);
          }}
        />
      )}

      {selectedMeeting && activeView !== 'meeting-room' && (
        <MeetingDetails
          meeting={selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
          onStartMeeting={handleStartMeeting}
          onEdit={() => {
            setLocalShowScheduleForm(true);
          }}
          onDelete={() => handleDeleteMeeting(selectedMeeting._id)}
        />
      )}
    </div>
  );
};

export default CalendarMain;