import React, { useState, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useDocuments } from '../../../context/DocumentsContext';
import { useClients } from '../../../context/ClientsContext';
import './DocumentUpload.css';

const DocumentUpload = ({ onUploadComplete, onCancel, clientId = null, clientName = null }) => {
  const { user } = useAuth();
  const { uploadDocument, loading } = useDocuments();
  const { clients } = useClients();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploading, setUploading] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(clientId || 'personal');
  const fileInputRef = useRef(null);

  const categories = [
    { value: 'proposals', label: 'Grant Proposals', icon: 'fas fa-handshake' },
    { value: 'financial', label: 'Financial Documents', icon: 'fas fa-chart-line' },
    { value: 'guidelines', label: 'Guidelines', icon: 'fas fa-book' },
    { value: 'planning', label: 'Planning Documents', icon: 'fas fa-project-diagram' },
    { value: 'reports', label: 'Reports', icon: 'fas fa-chart-bar' },
    { value: 'templates', label: 'Templates', icon: 'fas fa-copy' },
    { value: 'grants', label: 'Grant Documents', icon: 'fas fa-file-contract' },
    { value: 'contracts', label: 'Contracts', icon: 'fas fa-handshake' },
    { value: 'other', label: 'Other Documents', icon: 'fas fa-file' }
  ];

  const sensitivityLevels = [
    { value: 'public', label: 'Public' },
    { value: 'internal', label: 'Internal' },
    { value: 'confidential', label: 'Confidential' },
    { value: 'restricted', label: 'Restricted' }
  ];

  const visibilityOptions = [
    { value: 'private', label: 'Private' },
    { value: 'shared', label: 'Shared' },
    { value: 'public', label: 'Public' }
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files) => {
    const newFiles = files.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      category: 'other',
      description: '',
      tags: '',
      visibility: 'private',
      sensitivityLevel: 'internal',
      clientId: selectedClientId
    }));
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const updateFileMetadata = (fileId, field, value) => {
    setSelectedFiles(prev => 
      prev.map(file => 
        file.id === fileId ? { ...file, [field]: value } : file
      )
    );
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    const progress = {};
    selectedFiles.forEach(file => {
      progress[file.id] = 0;
    });
    setUploadProgress(progress);

    try {
      const uploadPromises = selectedFiles.map(async (fileData) => {
        // Get the final client ID (either from props, selection, or personal)
        const finalClientId = clientId || selectedClientId;
        let finalClientName = null;

        if (finalClientId !== 'personal') {
          const selectedClient = clients.find(client => client._id === finalClientId);
          finalClientName = selectedClient ? selectedClient.organizationName || selectedClient.name : clientName;
        } else {
          finalClientName = 'Personal Documents';
        }

        // Simulate upload progress
        for (let i = 0; i <= 100; i += 20) {
          await new Promise(resolve => setTimeout(resolve, 200));
          setUploadProgress(prev => ({
            ...prev,
            [fileData.id]: i
          }));
        }

        // Prepare document data for MongoDB
        const documentData = {
          file: fileData.file,
          originalName: fileData.name,
          description: fileData.description,
          category: fileData.category,
          tags: fileData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          visibility: fileData.visibility,
          sensitivityLevel: fileData.sensitivityLevel,
          clientId: finalClientId === 'personal' ? null : finalClientId,
          clientName: finalClientName
        };

        console.log('📤 Uploading document:', documentData);

        // Upload to MongoDB - FIXED: Single parameter call
        await uploadDocument(documentData);
        
        // Complete progress
        setUploadProgress(prev => ({
          ...prev,
          [fileData.id]: 100
        }));
      });

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);

      // Clear files after successful upload
      setSelectedFiles([]);
      setUploadProgress({});
      
      // Call completion callback
      if (onUploadComplete) {
        onUploadComplete();
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Error uploading files: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return 'fas fa-file-pdf';
    if (fileType.includes('word') || fileType.includes('document')) return 'fas fa-file-word';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'fas fa-file-excel';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'fas fa-file-powerpoint';
    if (fileType.includes('image')) return 'fas fa-file-image';
    if (fileType.includes('zip') || fileType.includes('archive')) return 'fas fa-file-archive';
    if (fileType.includes('text')) return 'fas fa-file-alt';
    return 'fas fa-file';
  };

  return (
    <div className="document-upload">
      <div className="upload-header">
        <h2>Upload Documents{clientName && ` for ${clientName}`}</h2>
        <p>Add new documents to your library{clientName && ` for ${clientName}`}</p>
      </div>

      {/* Document Type Selection */}
      <div className="document-type-section">
        <div className="form-group">
          <label className="form-label">Document Type *</label>
          <div className="document-type-options">
            <label className="document-type-option">
              <input
                type="radio"
                name="documentType"
                value="personal"
                checked={selectedClientId === 'personal'}
                onChange={(e) => setSelectedClientId(e.target.value)}
                disabled={uploading || clientId} // Disable if client is pre-selected
                className="document-type-radio"
              />
              <div className="document-type-content">
                <i className="fas fa-user document-type-icon"></i>
                <div className="document-type-info">
                  <span className="document-type-label">Personal Document</span>
                  <span className="document-type-description">Store in your personal document library</span>
                </div>
              </div>
            </label>

            <label className="document-type-option">
              <input
                type="radio"
                name="documentType"
                value="client"
                checked={selectedClientId !== 'personal'}
                onChange={(e) => setSelectedClientId('')}
                disabled={uploading || clientId} // Disable if client is pre-selected
                className="document-type-radio"
              />
              <div className="document-type-content">
                <i className="fas fa-users document-type-icon"></i>
                <div className="document-type-info">
                  <span className="document-type-label">Client Document</span>
                  <span className="document-type-description">Associate with a specific client</span>
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Client Selection (only show if client document type is selected and no client pre-selected) */}
      {selectedClientId !== 'personal' && !clientId && (
        <div className="client-selection-section">
          <div className="form-group">
            <label className="form-label">Select Client *</label>
            <select
              value={selectedClientId || ''}
              onChange={(e) => setSelectedClientId(e.target.value)}
              disabled={uploading}
              className="form-select client-select"
              required
            >
              <option value="">Choose a client...</option>
              {clients.map(client => (
                <option key={client._id} value={client._id}>
                  {client.organizationName || client.name} - {client.primaryContactName}
                </option>
              ))}
            </select>
            <div className="form-hint">Documents will be associated with the selected client</div>
          </div>
        </div>
      )}

      {/* Show current selection */}
      {selectedClientId && (
        <div className="selection-info">
          <i className="fas fa-info-circle"></i>
          <span>
            {selectedClientId === 'personal' 
              ? 'Documents will be stored in your personal library'
              : clientId 
                ? `Documents will be associated with ${clientName}`
                : `Documents will be associated with ${clients.find(c => c._id === selectedClientId)?.organizationName || 'selected client'}`
            }
          </span>
        </div>
      )}

      {/* Drag & Drop Area */}
      <div 
        className={`upload-dropzone ${dragActive ? 'active' : ''} ${selectedFiles.length > 0 ? 'has-files' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="dropzone-content">
          <i className="fas fa-cloud-upload-alt dropzone-icon"></i>
          <h3>Drag & Drop Files Here</h3>
          <p>Supported files: PDF, Word, Excel, PowerPoint, Images, Text</p>
          <p>Maximum file size: 50MB</p>
          <p>or</p>
          <button 
            className="browse-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || (selectedClientId !== 'personal' && !selectedClientId && !clientId)}
            type="button"
          >
            Browse Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            disabled={uploading}
          />
        </div>
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="selected-files">
          <h4>Selected Files ({selectedFiles.length})</h4>
          <div className="files-list">
            {selectedFiles.map((fileData) => (
              <div key={fileData.id} className="file-item">
                <div className="file-info">
                  <div className="file-icon">
                    <i className={getFileIcon(fileData.type)}></i>
                  </div>
                  <div className="file-details">
                    <div className="file-name">{fileData.name}</div>
                    <div className="file-size">{formatFileSize(fileData.size)}</div>
                    {uploadProgress[fileData.id] > 0 && (
                      <div className="upload-progress">
                        <div 
                          className="progress-bar"
                          style={{ width: `${uploadProgress[fileData.id]}%` }}
                        ></div>
                        <span className="progress-text">{uploadProgress[fileData.id]}%</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="file-metadata">
                  <div className="metadata-row">
                    <div className="metadata-field">
                      <label>Category *</label>
                      <select
                        value={fileData.category}
                        onChange={(e) => updateFileMetadata(fileData.id, 'category', e.target.value)}
                        disabled={uploading}
                        className="form-select"
                        required
                      >
                        {categories.map(cat => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="metadata-field">
                      <label>Visibility</label>
                      <select
                        value={fileData.visibility}
                        onChange={(e) => updateFileMetadata(fileData.id, 'visibility', e.target.value)}
                        disabled={uploading}
                        className="form-select"
                      >
                        {visibilityOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="metadata-field">
                      <label>Sensitivity</label>
                      <select
                        value={fileData.sensitivityLevel}
                        onChange={(e) => updateFileMetadata(fileData.id, 'sensitivityLevel', e.target.value)}
                        disabled={uploading}
                        className="form-select"
                      >
                        {sensitivityLevels.map(level => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="metadata-row">
                    <div className="metadata-field full-width">
                      <label>Description</label>
                      <input
                        type="text"
                        placeholder="Enter document description..."
                        value={fileData.description}
                        onChange={(e) => updateFileMetadata(fileData.id, 'description', e.target.value)}
                        disabled={uploading}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="metadata-row">
                    <div className="metadata-field full-width">
                      <label>Tags</label>
                      <input
                        type="text"
                        placeholder="Enter tags separated by commas (e.g., grant, proposal, budget)"
                        value={fileData.tags}
                        onChange={(e) => updateFileMetadata(fileData.id, 'tags', e.target.value)}
                        disabled={uploading}
                        className="form-input"
                      />
                      <div className="form-hint">Separate multiple tags with commas</div>
                    </div>
                  </div>
                </div>

                <button
                  className="remove-file-btn"
                  onClick={() => removeFile(fileData.id)}
                  disabled={uploading}
                  type="button"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="upload-actions">
        <button
          className="cancel-btn"
          onClick={onCancel}
          disabled={uploading}
          type="button"
        >
          Cancel
        </button>
        <button
          className="upload-btn"
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || uploading || (selectedClientId !== 'personal' && !selectedClientId && !clientId)}
          type="button"
        >
          {uploading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Uploading...
            </>
          ) : (
            <>
              <i className="fas fa-cloud-upload-alt"></i>
              Upload {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}
            </>
          )}
        </button>
      </div>

      {/* Upload Status */}
      {uploading && (
        <div className="upload-status">
          <div className="status-info">
            <i className="fas fa-info-circle"></i>
            <span>Uploading files to MongoDB Atlas... Please don't close this window.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;