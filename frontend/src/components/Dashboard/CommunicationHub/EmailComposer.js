import React, { useState, useRef, useEffect } from 'react';
import { useTemplates } from '../../../context/TemplatesContext';
import { useDocuments } from '../../../context/DocumentsContext';
import { useAuth } from '../../../context/AuthContext';
import './EmailComposer.css';

const EmailComposer = ({ onBack, onSend, onSaveDraft, initialData }) => {
  const { templates, incrementUsage } = useTemplates();
  const { documents, loading: documentsLoading, downloadDocument } = useDocuments();
  const { currentUser } = useAuth();
  
  const [selectedTemplate, setSelectedTemplate] = useState(initialData?.template || null);
  const [to, setTo] = useState(initialData?.to || '');
  const [subject, setSubject] = useState(initialData?.subject || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [attachments, setAttachments] = useState(initialData?.attachments || []);
  const [emailOptions, setEmailOptions] = useState({
    tracking: true,
    readReceipt: false,
    priority: 'normal',
    schedule: false
  });
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [showTemplates, setShowTemplates] = useState(true);
  const [showDocuments, setShowDocuments] = useState(false);
  const [documentsSearchQuery, setDocumentsSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const editorRef = useRef(null);
  const lastContentRef = useRef('');

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

  // Check screen size for responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 1024) {
        setShowTemplates(false);
        setShowDocuments(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Initialize editor content when component mounts or content changes externally
  useEffect(() => {
    if (editorRef.current && content !== lastContentRef.current) {
      editorRef.current.innerHTML = content;
      lastContentRef.current = content;
    }
  }, [content]);

  useEffect(() => {
    if (initialData?.template) {
      handleTemplateSelect(initialData.template, false);
    }
    if (initialData?.to) {
      setTo(initialData.to);
    }
    if (initialData?.subject) {
      setSubject(initialData.subject);
    }
    if (initialData?.content) {
      setContent(initialData.content);
      lastContentRef.current = initialData.content;
    }
    if (initialData?.attachments) {
      setAttachments(initialData.attachments);
    }
  }, [initialData]);

  // Filter available documents for attachment
  const availableDocuments = documents?.filter(doc => {
    if (!doc) return false;
    
    const docName = doc.originalName || doc.name || doc.filename || '';
    const matchesSearch = docName.toLowerCase().includes(documentsSearchQuery.toLowerCase());
    
    // Check if document is already attached
    const isAlreadyAttached = attachments.some(att => 
      att.documentId === (doc._id || doc.id)
    );
    
    return matchesSearch && !isAlreadyAttached;
  }) || [];

  // Get file icon based on type
  const getFileIcon = (document) => {
    if (!document) return 'fas fa-file';
    
    const mimeType = document.mimeType?.toLowerCase() || document.fileType?.toLowerCase() || '';
    const fileName = document.originalName?.toLowerCase() || document.name?.toLowerCase() || document.filename?.toLowerCase() || '';
    
    if (mimeType.includes('pdf') || fileName.endsWith('.pdf')) return 'fas fa-file-pdf';
    if (mimeType.includes('word') || mimeType.includes('document') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
      return 'fas fa-file-word';
    }
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet') || fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
      return 'fas fa-file-excel';
    }
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation') || fileName.endsWith('.ppt') || fileName.endsWith('.pptx')) {
      return 'fas fa-file-powerpoint';
    }
    if (mimeType.includes('image')) return 'fas fa-file-image';
    if (mimeType.includes('zip') || mimeType.includes('archive')) return 'fas fa-file-archive';
    if (mimeType.includes('text')) return 'fas fa-file-alt';
    return 'fas fa-file';
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleTemplateSelect = (template, shouldIncrementUsage = true) => {
    console.log('📧 Selected template:', {
      id: template.id,
      title: template.title,
      subject: template.subject,
      content: template.content
    });

    setSelectedTemplate(template);
    setSubject(template.subject || '');
    
    // Use template.content for the email body
    const emailBody = template.content || '';
    setContent(emailBody);
    lastContentRef.current = emailBody;
    
    // Immediately update the editor content
    if (editorRef.current) {
      editorRef.current.innerHTML = emailBody;
    }
    
    if (shouldIncrementUsage) {
      incrementUsage(template.id);
    }
  };

  const handleVariableInsert = (variable) => {
    const editor = editorRef.current;
    if (editor) {
      // Save current selection
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      
      // Insert the variable
      const textNode = document.createTextNode(variable.name);
      range.deleteContents();
      range.insertNode(textNode);
      
      // Move cursor after the inserted variable
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
      
      editor.focus();
      
      // Update content state
      const newContent = editor.innerHTML;
      setContent(newContent);
      lastContentRef.current = newContent;
    }
  };

  const handleFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    
    // Update content state after formatting
    const newContent = editorRef.current.innerHTML;
    setContent(newContent);
    lastContentRef.current = newContent;
  };

  // Handle file upload from local device
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newAttachments = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      file: file,
      type: 'uploaded',
      documentId: null
    }));
    setAttachments([...attachments, ...newAttachments]);
  };

  // Handle adding document from DocumentList
  const handleAddDocument = async (document) => {
    const documentId = document._id || document.id;
    const documentName = document.originalName || document.name || document.filename || 'Unnamed Document';
    
    // Check if document is already attached
    if (attachments.some(att => att.documentId === documentId)) {
      return;
    }

    try {
      // Create attachment object for the document
      const documentAttachment = {
        id: Math.random().toString(36).substr(2, 9),
        name: documentName,
        size: formatFileSize(document.fileSize || document.size),
        documentId: documentId,
        type: 'document',
        file: null,
        documentData: document
      };
      
      setAttachments([...attachments, documentAttachment]);
    } catch (error) {
      console.error('Error adding document as attachment:', error);
      alert(`Failed to add document: ${error.message}`);
    }
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

  // Fixed content change handler - only update state when content actually changes
  const handleContentChange = (e) => {
    const newContent = e.currentTarget.innerHTML;
    
    // Only update state if content actually changed
    if (newContent !== lastContentRef.current) {
      setContent(newContent);
      lastContentRef.current = newContent;
    }
  };

  // Handle paste events to clean up formatting
  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  // Toggle sidebars with responsive behavior
  const toggleTemplates = () => {
    setShowTemplates(!showTemplates);
    if (isMobile && !showTemplates) {
      setShowDocuments(false);
    }
  };

  const toggleDocuments = () => {
    setShowDocuments(!showDocuments);
    if (isMobile && !showDocuments) {
      setShowTemplates(false);
    }
  };

  // Documents Sidebar Component
  const DocumentsSidebar = () => (
    <div className={`communication-hub-documents-sidebar ${isMobile ? 'mobile-sidebar' : ''}`}>
      <div className="communication-hub-documents-sidebar-header">
        <div className="communication-hub-documents-sidebar-title">
          <h3>Available Documents</h3>
          <button 
            className="communication-hub-documents-sidebar-toggle"
            onClick={toggleDocuments}
          >
            <i className={`fas ${isMobile ? 'fa-times' : 'fa-chevron-right'}`}></i>
          </button>
        </div>
        <div className="communication-hub-documents-search">
          <i className="fas fa-search"></i>
          <input 
            type="text" 
            placeholder="Search documents..." 
            value={documentsSearchQuery}
            onChange={(e) => setDocumentsSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="communication-hub-documents-list">
        {documentsLoading ? (
          <div className="communication-hub-documents-loading">
            <i className="fas fa-spinner fa-spin"></i>
            Loading documents...
          </div>
        ) : availableDocuments.length === 0 ? (
          <div className="communication-hub-documents-empty">
            <i className="fas fa-folder-open"></i>
            <p>No documents available</p>
            {documentsSearchQuery && (
              <p className="communication-hub-documents-empty-hint">
                Try a different search term
              </p>
            )}
          </div>
        ) : (
          availableDocuments.map((document) => {
            const documentId = document._id || document.id;
            const documentName = document.originalName || document.name || document.filename || 'Unnamed Document';
            
            return (
              <div
                key={documentId}
                className="communication-hub-document-item"
                onClick={() => handleAddDocument(document)}
              >
                <div className="communication-hub-document-item-header">
                  <div className="communication-hub-document-item-icon">
                    <i className={getFileIcon(document)}></i>
                  </div>
                  <div className="communication-hub-document-item-title">
                    {documentName}
                  </div>
                  <button
                    className="communication-hub-document-add-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddDocument(document);
                    }}
                    title="Add as attachment"
                  >
                    <i className="fas fa-plus"></i>
                    {!isMobile && 'Add'}
                  </button>
                </div>
                <div className="communication-hub-document-item-meta">
                  <span className="communication-hub-document-size">
                    {formatFileSize(document.fileSize || document.size)}
                  </span>
                  <span className="communication-hub-document-date">
                    {new Date(document.createdAt || document.uploadDate).toLocaleDateString()}
                  </span>
                </div>
                {document.description && (
                  <div className="communication-hub-document-item-description">
                    {document.description}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  // Templates Sidebar Component
  const TemplatesSidebar = () => (
    <div className={`communication-hub-composer-sidebar ${isMobile ? 'mobile-sidebar' : ''}`}>
      <div className="communication-hub-composer-sidebar-header">
        <div className="communication-hub-composer-sidebar-title">
          <h3>Email Templates</h3>
          <button 
            className="communication-hub-composer-sidebar-toggle"
            onClick={toggleTemplates}
          >
            <i className={`fas ${isMobile ? 'fa-times' : 'fa-chevron-left'}`}></i>
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
  );

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
              {!isMobile && 'Back to Templates'}
            </button>
          </div>
        </div>
      </div>

      <div className="communication-hub-composer-layout">
        {/* Templates Sidebar */}
        {showTemplates && <TemplatesSidebar />}

        {/* Main Composer */}
        <div className={`communication-hub-composer-main ${
          !showTemplates && !showDocuments ? 'full-width' : ''
        } ${isMobile ? 'mobile-main' : ''}`}>
          
          {/* Scrollable Content Area */}
          <div className="communication-hub-composer-content">
            {/* Sidebar Toggle Buttons */}
            {!showTemplates && (
              <div className="communication-hub-composer-sidebar-toggle-container">
                <button 
                  className="communication-hub-composer-sidebar-toggle-btn"
                  onClick={toggleTemplates}
                >
                  <i className="fas fa-chevron-right"></i>
                  {!isMobile && 'Show Templates'}
                </button>
              </div>
            )}

            {!showDocuments && (
              <div className="communication-hub-documents-toggle-container">
                <button 
                  className="communication-hub-documents-toggle-btn"
                  onClick={toggleDocuments}
                >
                  <i className="fas fa-chevron-left"></i>
                  {!isMobile && 'Attach Documents'}
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
                </div>
                
                <div className="communication-hub-editor-tool-group">
                  <button 
                    className="communication-hub-editor-tool-btn"
                    onClick={() => handleFormat('createLink', prompt('Enter URL:'))}
                    title="Insert Link"
                  >
                    <i className="fas fa-link"></i>
                  </button>
                </div>
              </div>
              
              {/* ContentEditable Editor */}
              <div
                ref={editorRef}
                className="communication-hub-editor-content"
                contentEditable
                onInput={handleContentChange}
                onPaste={handlePaste}
                suppressContentEditableWarning={true}
              />
            </div>

            {/* Attachments */}
            <div className="communication-hub-email-attachments">
              <div className="communication-hub-attachments-header">
                <h4>Attachments ({attachments.length})</h4>
                <div className="communication-hub-attachments-actions">
                  <label htmlFor="file-upload" className="communication-hub-attachments-btn">
                    <i className="fas fa-upload"></i>
                    {!isMobile && 'Upload Files'}
                  </label>
                  <button 
                    className="communication-hub-attachments-btn"
                    onClick={toggleDocuments}
                  >
                    <i className="fas fa-folder"></i>
                    {!isMobile && 'Add from Documents'}
                  </button>
                </div>
              </div>
              
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="file-upload"
              />
              
              {attachments.length > 0 && (
                <div className="communication-hub-attachments-list">
                  {attachments.map(attachment => (
                    <div key={attachment.id} className="communication-hub-attachment-item">
                      <div className="communication-hub-attachment-icon">
                        <i className={attachment.type === 'document' ? getFileIcon(attachment.documentData) : 'fas fa-file'}></i>
                      </div>
                      <div className="communication-hub-attachment-info">
                        <div className="communication-hub-attachment-name">{attachment.name}</div>
                        <div className="communication-hub-attachment-meta">
                          <span className="communication-hub-attachment-size">{attachment.size}</span>
                          {attachment.type === 'document' && (
                            <span className="communication-hub-attachment-source">From Documents</span>
                          )}
                          {attachment.type === 'uploaded' && (
                            <span className="communication-hub-attachment-source">Uploaded</span>
                          )}
                        </div>
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

        {/* Documents Sidebar */}
        {showDocuments && <DocumentsSidebar />}
      </div>

      {/* Composer Actions */}
      <div className="communication-hub-composer-actions-footer">
        <div className="communication-hub-composer-secondary-actions">
          <button className="communication-hub-composer-save-btn" onClick={handleSaveDraftClick}>
            <i className="fas fa-save"></i>
            {!isMobile && 'Save Draft'}
          </button>
        </div>
        <div className="communication-hub-composer-primary-actions">
          <button className="communication-hub-composer-schedule-btn" onClick={handleSchedule}>
            <i className="fas fa-clock"></i>
            {!isMobile && 'Schedule'}
          </button>
          <button className="communication-hub-composer-send-btn" onClick={handleSend}>
            <i className="fas fa-paper-plane"></i>
            {!isMobile && 'Send Email'}
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