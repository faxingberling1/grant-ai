import React, { useState } from 'react';

const CommunicationThread = ({ client }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'sent',
      subject: 'Grant Proposal Review',
      content: 'Hi Sarah, I\'ve completed the initial draft of the grant proposal for the Johnson Foundation. Please review it at your convenience and let me know if you have any feedback.',
      timestamp: '2024-01-15T14:30:00',
      read: true
    },
    {
      id: 2,
      type: 'received',
      subject: 'Re: Grant Proposal Review',
      content: 'Thanks for sending this over! The draft looks excellent. I particularly like the way you\'ve framed our impact metrics. One suggestion: could we add more specific data about our previous program outcomes?',
      timestamp: '2024-01-15T16:45:00',
      read: true
    },
    {
      id: 3,
      type: 'sent',
      subject: 'Updated Grant Proposal',
      content: 'I\'ve incorporated your feedback and added the specific outcome data from last year\'s program. The success rates and participant feedback should strengthen our case significantly.',
      timestamp: '2024-01-16T09:15:00',
      read: true
    }
  ]);

  const [newMessage, setNewMessage] = useState({
    subject: '',
    content: ''
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.subject || !newMessage.content) return;

    const message = {
      id: messages.length + 1,
      type: 'sent',
      subject: newMessage.subject,
      content: newMessage.content,
      timestamp: new Date().toISOString(),
      read: true
    };

    setMessages([message, ...messages]);
    setNewMessage({ subject: '', content: '' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="communication-thread">
      <div className="thread-header">
        <h3>Communication History</h3>
        <div className="thread-stats">
          <span className="stat">
            <i className="fas fa-envelope"></i>
            {messages.length} messages
          </span>
          <span className="stat">
            <i className="fas fa-clock"></i>
            Last contact: {formatDate(messages[0].timestamp)}
          </span>
        </div>
      </div>

      {/* New Message Form */}
      <div className="new-message-form">
        <h4>Send New Message</h4>
        <form onSubmit={handleSendMessage}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Subject"
              value={newMessage.subject}
              onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <textarea
              placeholder="Type your message here..."
              value={newMessage.content}
              onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
              rows="4"
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              <i className="fas fa-paper-plane"></i>
              Send Message
            </button>
          </div>
        </form>
      </div>

      {/* Messages Thread */}
      <div className="messages-container">
        {messages.map(message => (
          <div key={message.id} className={`message-item ${message.type}`}>
            <div className="message-header">
              <div className="message-sender">
                {message.type === 'sent' ? 'You' : client.name}
              </div>
              <div className="message-time">
                {formatDate(message.timestamp)}
              </div>
            </div>
            <div className="message-subject">
              {message.subject}
            </div>
            <div className="message-content">
              {message.content}
            </div>
            <div className="message-actions">
              <button className="btn-icon" title="Reply">
                <i className="fas fa-reply"></i>
              </button>
              <button className="btn-icon" title="Forward">
                <i className="fas fa-share"></i>
              </button>
              <button className="btn-icon" title="Archive">
                <i className="fas fa-archive"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunicationThread;