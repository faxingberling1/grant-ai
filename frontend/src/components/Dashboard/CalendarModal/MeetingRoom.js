import React, { useState, useEffect, useRef } from 'react';
import './MeetingRoom.css';

const MeetingRoom = ({ meeting, onBack, onEndMeeting }) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [notes, setNotes] = useState('');
  const [participants, setParticipants] = useState(meeting.participants || []);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const intervalRef = useRef();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    // In a real app, this would start actual recording
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // In a real app, this would stop recording and save the file
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setChatMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'You',
        message: newMessage,
        timestamp: new Date().toLocaleTimeString()
      }]);
      setNewMessage('');
    }
  };

  const handleAddParticipant = () => {
    const name = prompt('Enter participant name:');
    if (name) {
      setParticipants(prev => [...prev, name]);
    }
  };

  const handleEndMeeting = () => {
    if (isRecording) {
      handleStopRecording();
    }
    clearInterval(intervalRef.current);
    onEndMeeting();
  };

  return (
    <div className="meeting-room">
      <div className="meeting-room-header">
        <div className="meeting-info">
          <h2>{meeting.title}</h2>
          <p>Meeting in progress - {formatTime(timeElapsed)}</p>
        </div>
        <div className="meeting-controls">
          {isRecording ? (
            <button className="btn btn-danger" onClick={handleStopRecording}>
              <i className="fas fa-stop-circle"></i>
              Stop Recording
            </button>
          ) : (
            <button className="btn btn-outline" onClick={handleStartRecording}>
              <i className="fas fa-record-vinyl"></i>
              Start Recording
            </button>
          )}
          <button className="btn btn-primary" onClick={handleEndMeeting}>
            <i className="fas fa-phone-slash"></i>
            End Meeting
          </button>
        </div>
      </div>

      <div className="meeting-room-content">
        <div className="video-section">
          <div className="video-container">
            <div className="video-placeholder">
              <i className="fas fa-video"></i>
              <p>Video Feed</p>
            </div>
          </div>
          
          <div className="participants-grid">
            {participants.map((participant, index) => (
              <div key={index} className="participant-video">
                <div className="video-placeholder small">
                  <i className="fas fa-user"></i>
                </div>
                <span className="participant-name">{participant}</span>
              </div>
            ))}
            <div className="add-participant" onClick={handleAddParticipant}>
              <i className="fas fa-plus"></i>
              <span>Add Participant</span>
            </div>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="meeting-notes">
            <h4>Meeting Notes</h4>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Take notes during the meeting..."
              rows="8"
            />
            <button className="btn btn-outline" onClick={() => setNotes('')}>
              Clear Notes
            </button>
          </div>

          <div className="meeting-chat">
            <h4>Chat</h4>
            <div className="chat-messages">
              {chatMessages.map(msg => (
                <div key={msg.id} className="chat-message">
                  <strong>{msg.sender}:</strong> {msg.message}
                  <span className="chat-time">{msg.timestamp}</span>
                </div>
              ))}
            </div>
            <div className="chat-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
              />
              <button onClick={handleSendMessage}>
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="meeting-room-footer">
        <div className="meeting-stats">
          <span>Duration: {formatTime(timeElapsed)}</span>
          <span>Participants: {participants.length}</span>
          {isRecording && <span className="recording-indicator">● Recording</span>}
        </div>
        <button className="btn btn-secondary" onClick={onBack}>
          <i className="fas fa-arrow-left"></i>
          Leave Meeting
        </button>
      </div>
    </div>
  );
};

export default MeetingRoom;