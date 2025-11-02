import React, { useState, useRef, useEffect } from 'react';
import './EmailComposer.css';

const EmailComposer = ({ client, onSend, onCancel, template }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(template);
  const [to, setTo] = useState(client?.email || '');
  const [subject, setSubject] = useState(template?.title || '');
  const [content, setContent] = useState(template?.fullContent || '');
  const [attachments, setAttachments] = useState([]);
  const [emailOptions, setEmailOptions] = useState({
    tracking: true,
    readReceipt: false,
    priority: 'normal',
    schedule: false
  });
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const editorRef = useRef(null);

  const templates = [
    {
      id: 1,
      title: 'Initial Grant Inquiry',
      category: 'proposal',
      preview: 'Dear [Client Name], I hope this email finds you well. I am writing to inquire about potential grant opportunities...',
      fullContent: `Dear [Client Name],

I hope this email finds you well. I am writing to inquire about potential grant opportunities that may be available for your organization.

Based on your work in [Field/Area], I believe there are several funding opportunities that could be a great fit. I would be happy to discuss:

• Current grant opportunities that align with your mission
• Application timelines and requirements
• How we can collaborate to strengthen your proposals

Please let me know if you would be available for a brief call next week to explore these possibilities further.

Best regards,
[Your Name]`,
      icon: 'fas fa-handshake',
      variables: ['[Client Name]', '[Field/Area]', '[Your Name]']
    },
    {
      id: 2,
      title: 'Proposal Follow-up',
      category: 'followup',
      preview: 'Dear [Client Name], I wanted to follow up on the grant proposal we submitted on [Date]...',
      fullContent: `Dear [Client Name],

I wanted to follow up on the grant proposal we submitted on [Date] for the [Grant Name] opportunity.

I've been monitoring the application status and wanted to check if you have received any updates or if there are any additional materials needed from our end.

If you have any questions or would like to discuss next steps, please don't hesitate to reach out.

Thank you for your partnership in this important work.

Best regards,
[Your Name]`,
      icon: 'fas fa-sync',
      variables: ['[Client Name]', '[Date]', '[Grant Name]', '[Your Name]']
    },
    {
      id: 3,
      title: 'Meeting Request',
      category: 'meeting',
      preview: 'Dear [Client Name], I would like to schedule a meeting to discuss your grant strategy...',
      fullContent: `Dear [Client Name],

I would like to schedule a meeting to discuss your grant strategy and explore upcoming funding opportunities that could support your important work.

During our meeting, we could cover:

• Review of current grant pipeline
• Upcoming deadlines and opportunities
• Strategy for maximizing funding success
• Any specific challenges or questions you may have

Please let me know what time works best for you next week. I am available [Available Times].

Looking forward to our conversation.

Best regards,
[Your Name]`,
      icon: 'fas fa-calendar',
      variables: ['[Client Name]', '[Available Times]', '[Your Name]']
    }
  ];

  const variables = [
    { name: '[Client Name]', value: client?.name || 'Client Name' },
    { name: '[Your Name]', value: 'Your Name' },
    { name: '[Organization]', value: client?.organization || 'Organization' },
    { name: '[Date]', value: new Date().toLocaleDateString() },
    { name: '[Grant Name]', value: 'Grant Name' },
    { name: '[Field/Area]', value: 'Field/Area' },
    { name: '[Available Times]', value: 'Monday 2-4 PM, Wednesday 10-12 PM' }
  ];

  useEffect(() => {
    if (template) {
      setSelectedTemplate(template);
      setSubject(template.title);
      setContent(template.fullContent);
    }
  }, [template]);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setSubject(template.title);
    setContent(template.fullContent);
  };

  const handleVariableInsert = (variable) => {
    const editor = editorRef.current;
    if (editor) {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(variable.name));
      
      // Focus back on editor
      editor.focus();
    }
  };

  const handleFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
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
      scheduled: emailOptions.schedule ? scheduledDate : null
    };
    
    onSend(emailData);
  };

  const handleSchedule = () => {
    setShowScheduleModal(true);
  };

  const handleScheduleConfirm = () => {
    setEmailOptions({ ...emailOptions, schedule: true });
    setShowScheduleModal(false);
    // In a real app, you would schedule the email here
  };

  const handleSaveDraft = () => {
    // In a real app, you would save to backend
    console.log('Saving draft...');
  };

  return (
    <div className="clients-email-composer">
      {/* Header */}
      <div className="clients-composer-header">
        <div className="clients-composer-header-content">
          <div className="clients-composer-title">
            <h1>Compose Email</h1>
            <p>Send professional emails to your clients</p>
          </div>
          <div className="clients-composer-actions">
            <button className="clients-composer-back-btn" onClick={onCancel}>
              <i className="fas fa-arrow-left"></i>
              Back
            </button>
          </div>
        </div>
      </div>

      <div className="clients-composer-layout">
        {/* Templates Sidebar */}
        <div className="clients-composer-sidebar">
          <div className="clients-composer-sidebar-header">
            <h3>Email Templates</h3>
            <div className="clients-templates-search">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Search templates..." />
            </div>
          </div>
          <div className="clients-templates-list">
            {templates.map(template => (
              <div
                key={template.id}
                className={`clients-template-item ${selectedTemplate?.id === template.id ? 'active' : ''}`}
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="clients-template-item-header">
                  <div className="clients-template-item-icon">
                    <i className={template.icon}></i>
                  </div>
                  <div className="clients-template-item-title">
                    {template.title}
                  </div>
                </div>
                <div className="clients-template-item-preview">
                  {template.preview}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Composer */}
        <div className="clients-composer-main">
          {/* Email Header */}
          <div className="clients-email-header">
            <div className="clients-email-field">
              <label>To</label>
              <input
                type="email"
                className="clients-email-input"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="recipient@example.com"
              />
            </div>
            <div className="clients-email-field">
              <label>Subject</label>
              <input
                type="text"
                className="clients-email-input subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject..."
              />
            </div>
          </div>

          {/* Email Variables */}
          <div className="clients-email-variables">
            <h4>Quick Variables</h4>
            <div className="clients-variables-list">
              {variables.map((variable, index) => (
                <div
                  key={index}
                  className="clients-variable-item"
                  onClick={() => handleVariableInsert(variable)}
                >
                  {variable.name}
                </div>
              ))}
            </div>
          </div>

          {/* Email Editor */}
          <div className="clients-email-editor">
            <div className="clients-editor-toolbar">
              <div className="clients-editor-tool-group">
                <select 
                  className="clients-editor-select"
                  onChange={(e) => handleFormat('fontName', e.target.value)}
                >
                  <option value="Arial">Arial</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Verdana">Verdana</option>
                </select>
                <select 
                  className="clients-editor-select"
                  onChange={(e) => handleFormat('fontSize', e.target.value)}
                >
                  <option value="1">Small</option>
                  <option value="3">Normal</option>
                  <option value="5">Large</option>
                  <option value="7">Huge</option>
                </select>
              </div>
              
              <div className="clients-editor-tool-group">
                <button 
                  className="clients-editor-tool-btn"
                  onClick={() => handleFormat('bold')}
                  title="Bold"
                >
                  <i className="fas fa-bold"></i>
                </button>
                <button 
                  className="clients-editor-tool-btn"
                  onClick={() => handleFormat('italic')}
                  title="Italic"
                >
                  <i className="fas fa-italic"></i>
                </button>
                <button 
                  className="clients-editor-tool-btn"
                  onClick={() => handleFormat('underline')}
                  title="Underline"
                >
                  <i className="fas fa-underline"></i>
                </button>
              </div>
              
              <div className="clients-editor-tool-group">
                <button 
                  className="clients-editor-tool-btn"
                  onClick={() => handleFormat('justifyLeft')}
                  title="Align Left"
                >
                  <i className="fas fa-align-left"></i>
                </button>
                <button 
                  className="clients-editor-tool-btn"
                  onClick={() => handleFormat('justifyCenter')}
                  title="Align Center"
                >
                  <i className="fas fa-align-center"></i>
                </button>
                <button 
                  className="clients-editor-tool-btn"
                  onClick={() => handleFormat('justifyRight')}
                  title="Align Right"
                >
                  <i className="fas fa-align-right"></i>
                </button>
              </div>
              
              <div className="clients-editor-tool-group">
                <button 
                  className="clients-editor-tool-btn"
                  onClick={() => handleFormat('insertUnorderedList')}
                  title="Bullet List"
                >
                  <i className="fas fa-list-ul"></i>
                </button>
                <button 
                  className="clients-editor-tool-btn"
                  onClick={() => handleFormat('insertOrderedList')}
                  title="Numbered List"
                >
                  <i className="fas fa-list-ol"></i>
                </button>
                <button 
                  className="clients-editor-tool-btn"
                  onClick={() => handleFormat('outdent')}
                  title="Outdent"
                >
                  <i className="fas fa-outdent"></i>
                </button>
                <button 
                  className="clients-editor-tool-btn"
                  onClick={() => handleFormat('indent')}
                  title="Indent"
                >
                  <i className="fas fa-indent"></i>
                </button>
              </div>
              
              <div className="clients-editor-tool-group">
                <button 
                  className="clients-editor-tool-btn"
                  onClick={() => handleFormat('createLink', prompt('Enter URL:'))}
                  title="Insert Link"
                >
                  <i className="fas fa-link"></i>
                </button>
                <button 
                  className="clients-editor-tool-btn"
                  onClick={() => handleFormat('unlink')}
                  title="Remove Link"
                >
                  <i className="fas fa-unlink"></i>
                </button>
              </div>
            </div>
            
            <div
              ref={editorRef}
              className="clients-editor-content"
              contentEditable
              dangerouslySetInnerHTML={{ __html: content }}
              onInput={(e) => setContent(e.target.innerHTML)}
              style={{ minHeight: '400px' }}
            />
          </div>

          {/* Attachments */}
          <div className="clients-email-attachments">
            <div className="clients-attachments-dropzone">
              <div className="clients-attachments-icon">
                <i className="fas fa-paperclip"></i>
              </div>
              <div className="clients-attachments-text">
                Drag and drop files here or click to upload
              </div>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="file-upload"
              />
              <label htmlFor="file-upload" className="clients-attachments-btn">
                <i className="fas fa-plus"></i>
                Add Attachments
              </label>
            </div>
            
            {attachments.length > 0 && (
              <div className="clients-attachments-list">
                {attachments.map(attachment => (
                  <div key={attachment.id} className="clients-attachment-item">
                    <div className="clients-attachment-icon">
                      <i className="fas fa-file"></i>
                    </div>
                    <div className="clients-attachment-info">
                      <div className="clients-attachment-name">{attachment.name}</div>
                      <div className="clients-attachment-size">{attachment.size}</div>
                    </div>
                    <div 
                      className="clients-attachment-remove"
                      onClick={() => handleRemoveAttachment(attachment.id)}
                    >
                      <i className="fas fa-times"></i>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Email Options */}
          <div className="clients-email-options">
            <div className="clients-email-option">
              <input
                type="checkbox"
                id="tracking"
                checked={emailOptions.tracking}
                onChange={(e) => setEmailOptions({...emailOptions, tracking: e.target.checked})}
              />
              <label htmlFor="tracking">Email Tracking</label>
            </div>
            <div className="clients-email-option">
              <input
                type="checkbox"
                id="read-receipt"
                checked={emailOptions.readReceipt}
                onChange={(e) => setEmailOptions({...emailOptions, readReceipt: e.target.checked})}
              />
              <label htmlFor="read-receipt">Read Receipt</label>
            </div>
            <div className="clients-email-option">
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
      <div className="clients-composer-actions-footer">
        <div className="clients-composer-secondary-actions">
          <button className="clients-composer-save-btn" onClick={handleSaveDraft}>
            <i className="fas fa-save"></i>
            Save Draft
          </button>
        </div>
        <div className="clients-composer-primary-actions">
          <button className="clients-composer-schedule-btn" onClick={handleSchedule}>
            <i className="fas fa-clock"></i>
            Schedule
          </button>
          <button className="clients-composer-send-btn" onClick={handleSend}>
            <i className="fas fa-paper-plane"></i>
            Send Email
          </button>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="clients-schedule-modal">
          <div className="clients-schedule-container">
            <div className="clients-schedule-header">
              <h3>Schedule Email</h3>
              <button 
                className="clients-schedule-close"
                onClick={() => setShowScheduleModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="clients-schedule-content">
              <div className="clients-schedule-options">
                <div className="clients-schedule-option active">
                  <div className="clients-schedule-option-header">
                    <div className="clients-schedule-option-icon">
                      <i className="fas fa-calendar-day"></i>
                    </div>
                    <div className="clients-schedule-option-title">
                      Custom Schedule
                    </div>
                  </div>
                  <div className="clients-schedule-option-description">
                    Choose a specific date and time to send this email
                  </div>
                </div>
              </div>
              
              <div className="clients-schedule-datetime">
                <label>Schedule Date & Time</label>
                <input
                  type="datetime-local"
                  className="clients-schedule-input"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              
              <div className="clients-schedule-actions">
                <button 
                  className="clients-composer-save-btn"
                  onClick={() => setShowScheduleModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="clients-composer-send-btn"
                  onClick={handleScheduleConfirm}
                >
                  <i className="fas fa-clock"></i>
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