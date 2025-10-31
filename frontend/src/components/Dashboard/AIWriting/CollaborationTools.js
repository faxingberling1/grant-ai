// frontend/src/components/Dashboard/AIWriting/CollaborationTools.js
import React, { useState } from 'react';

const CollaborationTools = ({ clients, grants, selectedClient, selectedGrant }) => {
  const [activeTab, setActiveTab] = useState('comments');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      name: 'You',
      role: 'Grant Writer',
      status: 'online',
      avatar: 'Y'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      role: 'Program Director',
      status: 'online',
      avatar: 'SJ'
    },
    {
      id: 3,
      name: 'Michael Chen',
      role: 'Finance Director',
      status: 'offline',
      avatar: 'MC'
    }
  ]);

  const tasks = [
    {
      id: 1,
      title: 'Draft needs statement',
      assignedTo: 1,
      dueDate: '2024-01-20',
      status: 'completed',
      section: 'needs_statement'
    },
    {
      id: 2,
      title: 'Review budget narrative',
      assignedTo: 3,
      dueDate: '2024-01-25',
      status: 'in_progress',
      section: 'budget'
    },
    {
      id: 3,
      title: 'Finalize objectives',
      assignedTo: 2,
      dueDate: '2024-01-22',
      status: 'todo',
      section: 'objectives'
    }
  ];

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      content: newComment,
      author: 'You',
      timestamp: new Date().toLocaleString(),
      section: 'general',
      type: 'comment'
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  const handleAddTask = () => {
    // Task creation logic would go here
    console.log('Add new task');
  };

  return (
    <div className="collaboration-tools">
      <div className="collaboration-header">
        <h2>Team Collaboration</h2>
        <p>Work together on grant proposals with your team</p>
      </div>

      <div className="collaboration-layout">
        {/* Team Sidebar */}
        <div className="team-sidebar">
          <div className="team-section">
            <h3>Team Members</h3>
            <div className="team-list">
              {teamMembers.map(member => (
                <div key={member.id} className="team-member">
                  <div className="member-avatar">
                    {member.avatar}
                    <span className={`status-indicator ${member.status}`}></span>
                  </div>
                  <div className="member-info">
                    <div className="member-name">{member.name}</div>
                    <div className="member-role">{member.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="invite-section">
            <button className="btn btn-outline full-width">
              <i className="fas fa-user-plus"></i>
              Invite Team Member
            </button>
          </div>
        </div>

        {/* Main Collaboration Area */}
        <div className="collaboration-main">
          <div className="collaboration-tabs">
            <button 
              className={`tab-button ${activeTab === 'comments' ? 'active' : ''}`}
              onClick={() => setActiveTab('comments')}
            >
              <i className="fas fa-comments"></i>
              Comments & Feedback
            </button>
            <button 
              className={`tab-button ${activeTab === 'tasks' ? 'active' : ''}`}
              onClick={() => setActiveTab('tasks')}
            >
              <i className="fas fa-tasks"></i>
              Tasks & Assignments
            </button>
            <button 
              className={`tab-button ${activeTab === 'versions' ? 'active' : ''}`}
              onClick={() => setActiveTab('versions')}
            >
              <i className="fas fa-code-branch"></i>
              Version Control
            </button>
          </div>

          {activeTab === 'comments' && (
            <div className="comments-section">
              <div className="comments-header">
                <h3>Comments & Feedback</h3>
                <div className="section-filter">
                  <select>
                    <option value="all">All Sections</option>
                    <option value="needs_statement">Needs Statement</option>
                    <option value="objectives">Objectives</option>
                    <option value="methodology">Methodology</option>
                  </select>
                </div>
              </div>

              <div className="add-comment">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment or feedback..."
                  rows="3"
                />
                <div className="comment-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                  >
                    <i className="fas fa-paper-plane"></i>
                    Post Comment
                  </button>
                </div>
              </div>

              <div className="comments-list">
                {comments.length > 0 ? (
                  comments.map(comment => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-header">
                        <div className="comment-author">{comment.author}</div>
                        <div className="comment-time">{comment.timestamp}</div>
                      </div>
                      <div className="comment-content">
                        {comment.content}
                      </div>
                      <div className="comment-actions">
                        <button className="btn-link">Reply</button>
                        <button className="btn-link">Resolve</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-comments">
                    <i className="fas fa-comments"></i>
                    <h4>No Comments Yet</h4>
                    <p>Start the conversation by adding the first comment.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="tasks-section">
              <div className="tasks-header">
                <h3>Tasks & Assignments</h3>
                <button className="btn btn-primary" onClick={handleAddTask}>
                  <i className="fas fa-plus"></i>
                  New Task
                </button>
              </div>

              <div className="tasks-list">
                {tasks.map(task => (
                  <div key={task.id} className="task-item">
                    <div className="task-checkbox">
                      <input 
                        type="checkbox" 
                        checked={task.status === 'completed'}
                        readOnly
                      />
                    </div>
                    <div className="task-content">
                      <div className="task-title">{task.title}</div>
                      <div className="task-meta">
                        <span className="task-section">{task.section}</span>
                        <span className="task-due">Due: {task.dueDate}</span>
                        <span className="task-assignee">
                          Assigned to: {teamMembers.find(m => m.id === task.assignedTo)?.name}
                        </span>
                      </div>
                    </div>
                    <div className="task-status">
                      <span className={`status-badge ${task.status}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'versions' && (
            <div className="versions-section">
              <div className="versions-header">
                <h3>Document Versions</h3>
                <p>Track changes and collaborate on different versions</p>
              </div>

              <div className="versions-list">
                <div className="version-item featured">
                  <div className="version-info">
                    <div className="version-title">Current Version</div>
                    <div className="version-meta">
                      <span>Last updated: Today, 2:30 PM</span>
                      <span>By: You</span>
                    </div>
                  </div>
                  <div className="version-actions">
                    <button className="btn btn-outline">
                      <i className="fas fa-edit"></i>
                      Edit
                    </button>
                  </div>
                </div>

                <div className="version-item">
                  <div className="version-info">
                    <div className="version-title">Version 2 - Program Director Review</div>
                    <div className="version-meta">
                      <span>Last updated: Yesterday, 4:15 PM</span>
                      <span>By: Sarah Johnson</span>
                    </div>
                  </div>
                  <div className="version-actions">
                    <button className="btn btn-outline">
                      <i className="fas fa-eye"></i>
                      View
                    </button>
                    <button className="btn btn-outline">
                      <i className="fas fa-redo"></i>
                      Restore
                    </button>
                  </div>
                </div>

                <div className="version-item">
                  <div className="version-info">
                    <div className="version-title">Version 1 - Initial Draft</div>
                    <div className="version-meta">
                      <span>Last updated: Jan 15, 2024</span>
                      <span>By: You</span>
                    </div>
                  </div>
                  <div className="version-actions">
                    <button className="btn btn-outline">
                      <i className="fas fa-eye"></i>
                      View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollaborationTools;