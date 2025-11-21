// frontend/src/components/Dashboard/AIWriting/CollaborationTools.js
import React, { useState } from 'react';
import './CollaborationTools.css';

const CollaborationTools = ({ clients, grants, selectedClient, selectedGrant }) => {
  const [activeTab, setActiveTab] = useState('comments');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newTask, setNewTask] = useState({ title: '', assignee: '', dueDate: '', section: '' });

  const teamMembers = [
    {
      id: 1,
      name: 'You',
      role: 'Grant Writer',
      status: 'online',
      avatar: 'Y',
      color: '#d4af37'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      role: 'Program Director',
      status: 'online',
      avatar: 'SJ',
      color: '#4299e1'
    },
    {
      id: 3,
      name: 'Michael Chen',
      role: 'Finance Director',
      status: 'offline',
      avatar: 'MC',
      color: '#48bb78'
    },
    {
      id: 4,
      name: 'Emily Rodriguez',
      role: 'Executive Director',
      status: 'away',
      avatar: 'ER',
      color: '#9f7aea'
    }
  ];

  const tasks = [
    {
      id: 1,
      title: 'Draft needs statement',
      assignedTo: 1,
      dueDate: '2024-01-20',
      status: 'completed',
      section: 'needs_statement',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Review budget narrative',
      assignedTo: 3,
      dueDate: '2024-01-25',
      status: 'in_progress',
      section: 'budget',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Finalize objectives and outcomes',
      assignedTo: 2,
      dueDate: '2024-01-22',
      status: 'todo',
      section: 'objectives',
      priority: 'high'
    },
    {
      id: 4,
      title: 'Gather supporting documents',
      assignedTo: 4,
      dueDate: '2024-01-28',
      status: 'todo',
      section: 'attachments',
      priority: 'low'
    }
  ];

  const versions = [
    {
      id: 1,
      title: 'Current Version',
      description: 'Latest updates with program director feedback',
      timestamp: 'Today, 2:30 PM',
      author: 'You',
      changes: 12,
      featured: true
    },
    {
      id: 2,
      title: 'Program Director Review',
      description: 'Incorporated budget revisions',
      timestamp: 'Yesterday, 4:15 PM',
      author: 'Sarah Johnson',
      changes: 8,
      featured: false
    },
    {
      id: 3,
      title: 'Initial Draft',
      description: 'First complete draft',
      timestamp: 'Jan 15, 2024',
      author: 'You',
      changes: 15,
      featured: false
    }
  ];

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      content: newComment,
      author: 'You',
      authorAvatar: 'Y',
      authorColor: '#d4af37',
      timestamp: new Date().toLocaleString(),
      section: 'general',
      type: 'comment',
      replies: []
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;

    const task = {
      id: Date.now(),
      ...newTask,
      status: 'todo',
      priority: 'medium'
    };

    // In a real app, this would update the tasks state
    console.log('New task:', task);
    setNewTask({ title: '', assignee: '', dueDate: '', section: '' });
  };

  const handleTaskStatusChange = (taskId, newStatus) => {
    // Task status update logic
    console.log(`Task ${taskId} status changed to ${newStatus}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#48bb78';
      case 'away': return '#ed8936';
      case 'offline': return '#a0aec0';
      default: return '#a0aec0';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#e53e3e';
      case 'medium': return '#ed8936';
      case 'low': return '#48bb78';
      default: return '#a0aec0';
    }
  };

  return (
    <div className="collaboration-tools">
      {/* Header Section */}
      <div className="collaboration-header">
        <div className="header-content">
          <div className="header-title">
            <h1>Team Collaboration</h1>
            <p>Work together seamlessly on grant proposals</p>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-value">{teamMembers.length}</span>
              <span className="stat-label">Team Members</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{tasks.length}</span>
              <span className="stat-label">Active Tasks</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{comments.length}</span>
              <span className="stat-label">Comments</span>
            </div>
          </div>
        </div>
      </div>

      <div className="collaboration-layout">
        {/* Team Sidebar */}
        <div className="team-sidebar">
          <div className="sidebar-section">
            <div className="section-header">
              <h3>Team Members</h3>
              <span className="online-count">
                {teamMembers.filter(m => m.status === 'online').length} online
              </span>
            </div>
            <div className="team-list">
              {teamMembers.map(member => (
                <div key={member.id} className="team-member-card">
                  <div className="member-avatar" style={{ backgroundColor: member.color }}>
                    {member.avatar}
                    <div 
                      className="status-indicator" 
                      style={{ backgroundColor: getStatusColor(member.status) }}
                    ></div>
                  </div>
                  <div className="member-info">
                    <div className="member-name">{member.name}</div>
                    <div className="member-role">{member.role}</div>
                    <div className="member-status">{member.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <div className="section-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="quick-actions">
              <button className="action-btn primary">
                <i className="fas fa-user-plus"></i>
                Invite Member
              </button>
              <button className="action-btn secondary">
                <i className="fas fa-share-alt"></i>
                Share Project
              </button>
              <button className="action-btn secondary">
                <i className="fas fa-download"></i>
                Export Report
              </button>
            </div>
          </div>

          {/* Project Progress */}
          <div className="sidebar-section">
            <div className="section-header">
              <h3>Project Progress</h3>
            </div>
            <div className="progress-stats">
              <div className="progress-item">
                <div className="progress-label">Completion</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '65%' }}></div>
                </div>
                <div className="progress-value">65%</div>
              </div>
              <div className="progress-item">
                <div className="progress-label">Tasks Done</div>
                <div className="progress-value">
                  {tasks.filter(t => t.status === 'completed').length}/{tasks.length}
                </div>
              </div>
              <div className="progress-item">
                <div className="progress-label">Days Left</div>
                <div className="progress-value">12</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Collaboration Area */}
        <div className="collaboration-main">
          {/* Navigation Tabs */}
          <div className="collaboration-tabs">
            <button 
              className={`tab-button ${activeTab === 'comments' ? 'active' : ''}`}
              onClick={() => setActiveTab('comments')}
            >
              <i className="fas fa-comments"></i>
              Comments
              {comments.length > 0 && <span className="tab-badge">{comments.length}</span>}
            </button>
            <button 
              className={`tab-button ${activeTab === 'tasks' ? 'active' : ''}`}
              onClick={() => setActiveTab('tasks')}
            >
              <i className="fas fa-tasks"></i>
              Tasks
              <span className="tab-badge">{tasks.filter(t => t.status !== 'completed').length}</span>
            </button>
            <button 
              className={`tab-button ${activeTab === 'versions' ? 'active' : ''}`}
              onClick={() => setActiveTab('versions')}
            >
              <i className="fas fa-code-branch"></i>
              Versions
            </button>
          </div>

          {/* Comments Section */}
          {activeTab === 'comments' && (
            <div className="tab-content">
              <div className="content-header">
                <h2>Comments & Feedback</h2>
                <div className="header-actions">
                  <select className="filter-select">
                    <option value="all">All Sections</option>
                    <option value="needs_statement">Needs Statement</option>
                    <option value="objectives">Objectives</option>
                    <option value="methodology">Methodology</option>
                    <option value="budget">Budget</option>
                  </select>
                </div>
              </div>

              <div className="add-comment-card">
                <div className="comment-input">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts, ask questions, or provide feedback..."
                    rows="3"
                    className="modern-textarea"
                  />
                </div>
                <div className="comment-actions">
                  <div className="action-buttons">
                    <button className="btn-attach">
                      <i className="fas fa-paperclip"></i>
                      Attach
                    </button>
                    <button className="btn-mention">
                      <i className="fas fa-at"></i>
                      Mention
                    </button>
                  </div>
                  <button 
                    className="btn-post"
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                  >
                    <i className="fas fa-paper-plane"></i>
                    Post Comment
                  </button>
                </div>
              </div>

              <div className="comments-feed">
                {comments.length > 0 ? (
                  comments.map(comment => (
                    <div key={comment.id} className="comment-card">
                      <div className="comment-header">
                        <div 
                          className="comment-avatar"
                          style={{ backgroundColor: comment.authorColor }}
                        >
                          {comment.authorAvatar}
                        </div>
                        <div className="comment-meta">
                          <div className="comment-author">{comment.author}</div>
                          <div className="comment-time">{comment.timestamp}</div>
                        </div>
                      </div>
                      <div className="comment-content">
                        {comment.content}
                      </div>
                      <div className="comment-actions">
                        <button className="btn-reply">
                          <i className="fas fa-reply"></i>
                          Reply
                        </button>
                        <button className="btn-resolve">
                          <i className="fas fa-check"></i>
                          Resolve
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <i className="fas fa-comments"></i>
                    </div>
                    <h3>No Comments Yet</h3>
                    <p>Start the conversation by adding the first comment.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tasks Section */}
          {activeTab === 'tasks' && (
            <div className="tab-content">
              <div className="content-header">
                <h2>Tasks & Assignments</h2>
                <button className="btn-new-task">
                  <i className="fas fa-plus"></i>
                  New Task
                </button>
              </div>

              {/* New Task Form */}
              <div className="new-task-card">
                <h4>Create New Task</h4>
                <div className="task-form">
                  <input
                    type="text"
                    placeholder="Task title..."
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="task-input"
                  />
                  <div className="form-row">
                    <select 
                      value={newTask.assignee}
                      onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
                      className="task-select"
                    >
                      <option value="">Assign to...</option>
                      {teamMembers.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                      className="task-input"
                    />
                  </div>
                  <button 
                    className="btn-create-task"
                    onClick={handleAddTask}
                    disabled={!newTask.title.trim()}
                  >
                    Create Task
                  </button>
                </div>
              </div>

              <div className="tasks-board">
                <div className="task-column">
                  <div className="column-header">
                    <h3>To Do</h3>
                    <span className="column-count">
                      {tasks.filter(t => t.status === 'todo').length}
                    </span>
                  </div>
                  {tasks.filter(task => task.status === 'todo').map(task => (
                    <div key={task.id} className="task-card">
                      <div className="task-header">
                        <div className="task-title">{task.title}</div>
                        <div 
                          className="priority-dot"
                          style={{ backgroundColor: getPriorityColor(task.priority) }}
                        ></div>
                      </div>
                      <div className="task-meta">
                        <span className="task-section">{task.section}</span>
                        <span className="task-due">Due: {task.dueDate}</span>
                      </div>
                      <div className="task-footer">
                        <div className="task-assignee">
                          <div 
                            className="assignee-avatar"
                            style={{ 
                              backgroundColor: teamMembers.find(m => m.id === task.assignedTo)?.color 
                            }}
                          >
                            {teamMembers.find(m => m.id === task.assignedTo)?.avatar}
                          </div>
                        </div>
                        <button 
                          className="btn-start-task"
                          onClick={() => handleTaskStatusChange(task.id, 'in_progress')}
                        >
                          Start
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="task-column">
                  <div className="column-header">
                    <h3>In Progress</h3>
                    <span className="column-count">
                      {tasks.filter(t => t.status === 'in_progress').length}
                    </span>
                  </div>
                  {tasks.filter(task => task.status === 'in_progress').map(task => (
                    <div key={task.id} className="task-card">
                      <div className="task-header">
                        <div className="task-title">{task.title}</div>
                        <div 
                          className="priority-dot"
                          style={{ backgroundColor: getPriorityColor(task.priority) }}
                        ></div>
                      </div>
                      <div className="task-meta">
                        <span className="task-section">{task.section}</span>
                        <span className="task-due">Due: {task.dueDate}</span>
                      </div>
                      <div className="task-footer">
                        <div className="task-assignee">
                          <div 
                            className="assignee-avatar"
                            style={{ 
                              backgroundColor: teamMembers.find(m => m.id === task.assignedTo)?.color 
                            }}
                          >
                            {teamMembers.find(m => m.id === task.assignedTo)?.avatar}
                          </div>
                        </div>
                        <button 
                          className="btn-complete-task"
                          onClick={() => handleTaskStatusChange(task.id, 'completed')}
                        >
                          Complete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="task-column">
                  <div className="column-header">
                    <h3>Completed</h3>
                    <span className="column-count">
                      {tasks.filter(t => t.status === 'completed').length}
                    </span>
                  </div>
                  {tasks.filter(task => task.status === 'completed').map(task => (
                    <div key={task.id} className="task-card completed">
                      <div className="task-header">
                        <div className="task-title">{task.title}</div>
                        <i className="fas fa-check-circle"></i>
                      </div>
                      <div className="task-meta">
                        <span className="task-section">{task.section}</span>
                        <span className="task-due">Completed</span>
                      </div>
                      <div className="task-footer">
                        <div className="task-assignee">
                          <div 
                            className="assignee-avatar"
                            style={{ 
                              backgroundColor: teamMembers.find(m => m.id === task.assignedTo)?.color 
                            }}
                          >
                            {teamMembers.find(m => m.id === task.assignedTo)?.avatar}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Versions Section */}
          {activeTab === 'versions' && (
            <div className="tab-content">
              <div className="content-header">
                <h2>Document Versions</h2>
                <p>Track changes and collaborate on different versions</p>
              </div>

              <div className="versions-list">
                {versions.map(version => (
                  <div key={version.id} className={`version-card ${version.featured ? 'featured' : ''}`}>
                    <div className="version-badge">
                      <i className="fas fa-code-branch"></i>
                    </div>
                    <div className="version-content">
                      <div className="version-header">
                        <h3>{version.title}</h3>
                        {version.featured && <span className="current-badge">Current</span>}
                      </div>
                      <p className="version-description">{version.description}</p>
                      <div className="version-meta">
                        <div className="meta-item">
                          <i className="fas fa-user"></i>
                          {version.author}
                        </div>
                        <div className="meta-item">
                          <i className="fas fa-clock"></i>
                          {version.timestamp}
                        </div>
                        <div className="meta-item">
                          <i className="fas fa-edit"></i>
                          {version.changes} changes
                        </div>
                      </div>
                    </div>
                    <div className="version-actions">
                      <button className="btn-view">
                        <i className="fas fa-eye"></i>
                        View
                      </button>
                      {!version.featured && (
                        <button className="btn-restore">
                          <i className="fas fa-redo"></i>
                          Restore
                        </button>
                      )}
                      <button className="btn-download">
                        <i className="fas fa-download"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollaborationTools;