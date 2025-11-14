import React, { useState, useRef, useEffect } from 'react';
import { useTemplates } from '../../../context/TemplatesContext';
import './EmailComposer.css';

const EmailComposer = ({ onBack, onSend, onSaveDraft, initialData }) => {
  const { templates, incrementUsage } = useTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState(initialData?.template || null);
  const [to, setTo] = useState(initialData?.to || '');
  const [subject, setSubject] = useState(initialData?.subject || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [attachments, setAttachments] = useState([]);
  const [emailOptions, setEmailOptions] = useState({
    tracking: true,
    readReceipt: false,
    priority: 'normal',
    schedule: false
  });
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [showTemplates, setShowTemplates] = useState(true);
  const editorRef = useRef(null);

  const variables = [
    { name: '[Client Name]', value: 'Client Name' },
    { name: '[Your Name]', value: 'Your Name' },
    { name: '[Organization]', value: 'Organization' },
    { name: '[Date]', value: new Date().toLocaleDateString() },
    { name: '[Grant Name]', value: 'Grant Name' },
    { name: '[Field/Area]', value: 'Field/Area' },
    { name: '[Available Times]', value: 'Monday 2-4 PM, Wednesday 10-12 PM' },
    { name: '[Topic]', value: 'Discussion Topic' },
    { name: '[Specific Point]', value: 'Specific Discussion Point' },
    { name: '[Review Date]', value: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString() },
    { name: '[Document Deadline]', value: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString() }
  ];

  useEffect(() => {
    if (initialData?.template) {
      setSelectedTemplate(initialData.template);
      setSubject(initialData.template.subject);
      setContent(initialData.template.fullContent);
    }
    if (initialData?.to) {
      setTo(initialData.to);
    }
    if (initialData?.subject) {
      setSubject(initialData.subject);
    }
    if (initialData?.content) {
      setContent(initialData.content);
    }
  }, [initialData]);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setSubject(template.subject);
    setContent(template.fullContent);
    incrementUsage(template.id);
  };

  const handleVariableInsert = (variable) => {
    const editor = editorRef.current;
    if (editor) {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(variable.name);
      range.insertNode(textNode);
      
      // Move cursor after the inserted variable
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Focus back on editor and update content
      editor.focus();
      setContent(editor.innerHTML);
    }
  };

  const handleFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    setContent(editorRef.current.innerHTML);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newAttachments = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      file: file
    }));
    setAttachments([...attachments, ...newAttachments]);
  };

  const handleRemoveAttachment = (attachmentId) => {
    setAttachments(attachments.filter(att => att.id !== attachmentId));
  };

  const handleSend = () => {
    const emailData = {
      to,
      subject,
      content,
      attachments,
      options: emailOptions,
      scheduled: emailOptions.schedule ? scheduledDate : null,
      template: selectedTemplate
    };
    
    if (onSend) {
      onSend(emailData);
    }
  };

  const handleSchedule = () => {
    setShowScheduleModal(true);
  };

  const handleScheduleConfirm = () => {
    setEmailOptions({ ...emailOptions, schedule: true });
    setShowScheduleModal(false);
  };

  const handleSaveDraftClick = () => {
    const draftData = {
      to,
      subject,
      content,
      attachments,
      options: emailOptions,
      template: selectedTemplate
    };
    
    if (onSaveDraft) {
      onSaveDraft(draftData);
    }
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="communication-hub-email-composer">
      {/* Header */}
      <div className="communication-hub-composer-header">
        <div className="communication-hub-composer-header-content">
          <div className="communication-hub-composer-title">
            <h1>Compose Email</h1>
            <p>Send professional emails to your clients and partners</p>
          </div>
          <div className="communication-hub-composer-actions">
            <button className="communication-hub-composer-back-btn" onClick={onBack}>
              <i className="fas fa-arrow-left"></i>
              Back to Templates
            </button>
          </div>
        </div>
      </div>

      <div className="communication-hub-composer-layout">
        {/* Templates Sidebar */}
        {showTemplates && (
          <div className="communication-hub-composer-sidebar">
            <div className="communication-hub-composer-sidebar-header">
              <div className="communication-hub-composer-sidebar-title">
                <h3>Email Templates</h3>
                <button 
                  className="communication-hub-composer-sidebar-toggle"
                  onClick={() => setShowTemplates(false)}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
              </div>
              <div className="communication-hub-templates-search">
                <i className="fas fa-search"></i>
                <input type="text" placeholder="Search templates..." />
              </div>
            </div>
            <div className="communication-hub-templates-list">
              {templates.map(template => (
                <div
                  key={template.id}
                  className={`communication-hub-template-item ${selectedTemplate?.id === template.id ? 'active' : ''}`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="communication-hub-template-item-header">
                    <div className="communication-hub-template-item-icon">
                      <i className={template.icon}></i>
                    </div>
                    <div className="communication-hub-template-item-title">
                      {template.title}
                    </div>
                  </div>
                  <div className="communication-hub-template-item-subject">
                    {template.subject}
                  </div>
                  <div className="communication-hub-template-item-preview">
                    {template.preview}
                  </div>
                  <div className="communication-hub-template-item-stats">
                    <span>Used {template.usageCount} times</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Composer */}
        <div className={`communication-hub-composer-main ${!showTemplates ? 'full-width' : ''}`}>
          {!showTemplates && (
            <div className="communication-hub-composer-sidebar-toggle-container">
              <button 
                className="communication-hub-composer-sidebar-toggle-btn"
                onClick={() => setShowTemplates(true)}
              >
                <i className="fas fa-chevron-right"></i>
                Show Templates
              </button>
            </div>
          )}

          {/* Email Header */}
          <div className="communication-hub-email-header">
            <div className="communication-hub-email-field">
              <label>To</label>
              <input
                type="email"
                className="communication-hub-email-input"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="recipient@example.com"
              />
            </div>
            <div className="communication-hub-email-field">
              <label>Subject</label>
              <input
                type="text"
                className="communication-hub-email-input subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject..."
              />
            </div>
          </div>

          {/* Email Variables */}
          <div className="communication-hub-email-variables">
            <h4>Quick Variables</h4>
            <div className="communication-hub-variables-list">
              {variables.map((variable, index) => (
                <button
                  key={index}
                  className="communication-hub-variable-item"
                  onClick={() => handleVariableInsert(variable)}
                  title={`Insert ${variable.name}`}
                >
                  {variable.name}
                </button>
              ))}
            </div>
          </div>

          {/* Email Editor */}
          <div className="communication-hub-email-editor">
            <div className="communication-hub-editor-toolbar">
              <div className="communication-hub-editor-tool-group">
                <select 
                  className="communication-hub-editor-select"
                  onChange={(e) => handleFormat('fontName', e.target.value)}
                >
                  <option value="Arial">Arial</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Verdana">Verdana</option>
                </select>
                <select 
                  className="communication-hub-editor-select"
                  onChange={(e) => handleFormat('fontSize', e.target.value)}
                >
                  <option value="1">Small</option>
                  <option value="3">Normal</option>
                  <option value="5">Large</option>
                  <option value="7">Huge</option>
                </select>
              </div>
              
              <div className="communication-hub-editor-tool-group">
                <button 
                  className="communication-hub-editor-tool-btn"
                  onClick={() => handleFormat('bold')}
                  title="Bold"
                >
                  <i className="fas fa-bold"></i>
                </button>
                <button 
                  className="communication-hub-editor-tool-btn"
                  onClick={() => handleFormat('italic')}
                  title="Italic"
                >
                  <i className="fas fa-italic"></i>
                </button>
                <button 
                  className="communication-hub-editor-tool-btn"
                  onClick={() => handleFormat('underline')}
                  title="Underline"
                >
                  <i className="fas fa-underline"></i>
                </button>
              </div>
              
              <div className="communication-hub-editor-tool-group">
                <button 
                  className="communication-hub-editor-tool-btn"
                  onClick={() => handleFormat('justifyLeft')}
                  title="Align Left"
                >
                  <i className="fas fa-align-left"></i>
                </button>
                <button 
                  className="communication-hub-editor-tool-btn"
                  onClick={() => handleFormat('justifyCenter')}
                  title="Align Center"
                >
                  <i className="fas fa-align-center"></i>
                </button>
                <button 
                  className="communication-hub-editor-tool-btn"
                  onClick={() => handleFormat('justifyRight')}
                  title="Align Right"
                >
                  <i className="fas fa-align-right"></i>
                </button>
              </div>
              
              <div className="communication-hub-editor-tool-group">
                <button 
                  className="communication-hub-editor-tool-btn"
                  onClick={() => handleFormat('insertUnorderedList')}
                  title="Bullet List"
                >
                  <i className="fas fa-list-ul"></i>
                </button>
                <button 
                  className="communication-hub-editor-tool-btn"
                  onClick={() => handleFormat('insertOrderedList')}
                  title="Numbered List"
                >
                  <i className="fas fa-list-ol"></i>
                </button>
                <button 
                  className="communication-hub-editor-tool-btn"
                  onClick={() => handleFormat('outdent')}
                  title="Outdent"
                >
                  <i className="fas fa-outdent"></i>
                </button>
                <button 
                  className="communication-hub-editor-tool-btn"
                  onClick={() => handleFormat('indent')}
                  title="Indent"
                >
                  <i className="fas fa-indent"></i>
                </button>
              </div>
              
              <div className="communication-hub-editor-tool-group">
                <button 
                  className="communication-hub-editor-tool-btn"
                  onClick={() => handleFormat('createLink', prompt('Enter URL:'))}
                  title="Insert Link"
                >
                  <i className="fas fa-link"></i>
                </button>
                <button 
                  className="communication-hub-editor-tool-btn"
                  onClick={() => handleFormat('unlink')}
                  title="Remove Link"
                >
                  <i className="fas fa-unlink"></i>
                </button>
              </div>
            </div>
            
            <div
              ref={editorRef}
              className="communication-hub-editor-content"
              contentEditable
              dangerouslySetInnerHTML={{ __html: content }}
              onInput={handleContentChange}
              style={{ minHeight: '400px' }}
            />
          </div>

          {/* Attachments */}
          <div className="communication-hub-email-attachments">
            <div className="communication-hub-attachments-dropzone">
              <div className="communication-hub-attachments-icon">
                <i className="fas fa-paperclip"></i>
              </div>
              <div className="communication-hub-attachments-text">
                Drag and drop files here or click to upload
              </div>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="file-upload"
              />
              <label htmlFor="file-upload" className="communication-hub-attachments-btn">
                <i className="fas fa-plus"></i>
                Add Attachments
              </label>
            </div>
            
            {attachments.length > 0 && (
              <div className="communication-hub-attachments-list">
                {attachments.map(attachment => (
                  <div key={attachment.id} className="communication-hub-attachment-item">
                    <div className="communication-hub-attachment-icon">
                      <i className="fas fa-file"></i>
                    </div>
                    <div className="communication-hub-attachment-info">
                      <div className="communication-hub-attachment-name">{attachment.name}</div>
                      <div className="communication-hub-attachment-size">{attachment.size}</div>
                    </div>
                    <button
                      className="communication-hub-attachment-remove"
                      onClick={() => handleRemoveAttachment(attachment.id)}
                      title="Remove attachment"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Email Options */}
          <div className="communication-hub-email-options">
            <div className="communication-hub-email-option">
              <input
                type="checkbox"
                id="tracking"
                checked={emailOptions.tracking}
                onChange={(e) => setEmailOptions({...emailOptions, tracking: e.target.checked})}
              />
              <label htmlFor="tracking">Email Tracking</label>
            </div>
            <div className="communication-hub-email-option">
              <input
                type="checkbox"
                id="read-receipt"
                checked={emailOptions.readReceipt}
                onChange={(e) => setEmailOptions({...emailOptions, readReceipt: e.target.checked})}
              />
              <label htmlFor="read-receipt">Read Receipt</label>
            </div>
            <div className="communication-hub-email-option">
              <select
                value={emailOptions.priority}
                onChange={(e) => setEmailOptions({...emailOptions, priority: e.target.value})}
              >
                <option value="low">Low Priority</option>
                <option value="normal">Normal Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Composer Actions */}
      <div className="communication-hub-composer-actions-footer">
        <div className="communication-hub-composer-secondary-actions">
          <button className="communication-hub-composer-save-btn" onClick={handleSaveDraftClick}>
            <i className="fas fa-save"></i>
            Save Draft
          </button>
        </div>
        <div className="communication-hub-composer-primary-actions">
          <button className="communication-hub-composer-schedule-btn" onClick={handleSchedule}>
            <i className="fas fa-clock"></i>
            Schedule
          </button>
          <button className="communication-hub-composer-send-btn" onClick={handleSend}>
            <i className="fas fa-paper-plane"></i>
            Send Email
          </button>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="communication-hub-schedule-modal">
          <div className="communication-hub-schedule-container">
            <div className="communication-hub-schedule-header">
              <h3>Schedule Email</h3>
              <button 
                className="communication-hub-schedule-close"
                onClick={() => setShowScheduleModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="communication-hub-schedule-content">
              <div className="communication-hub-schedule-options">
                <div className="communication-hub-schedule-option active">
                  <div className="communication-hub-schedule-option-header">
                    <div className="communication-hub-schedule-option-icon">
                      <i className="fas fa-calendar-day"></i>
                    </div>
                    <div className="communication-hub-schedule-option-title">
                      Custom Schedule
                    </div>
                  </div>
                  <div className="communication-hub-schedule-option-description">
                    Choose a specific date and time to send this email
                  </div>
                </div>
              </div>
              
              <div className="communication-hub-schedule-datetime">
                <label>Schedule Date & Time</label>
                <input
                  type="datetime-local"
                  className="communication-hub-schedule-input"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              
              <div className="communication-hub-schedule-actions">
                <button 
                  className="communication-hub-composer-save-btn"
                  onClick={() => setShowScheduleModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="communication-hub-composer-send-btn"
                  onClick={handleScheduleConfirm}
                >
                  Schedule Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailComposer;