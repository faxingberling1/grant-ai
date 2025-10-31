// frontend/src/components/Dashboard/Submissions/SubmissionForm.js
import React, { useState, useEffect } from 'react';

const SubmissionForm = ({ submission, onSave, onCancel, mode }) => {
  const [formData, setFormData] = useState({
    grantId: '',
    grantTitle: '',
    clientName: '',
    funder: '',
    submittedDate: '',
    status: 'draft',
    amount: '',
    decisionDate: '',
    notes: '',
    documents: []
  });

  const [newDocument, setNewDocument] = useState({ name: '', type: '', file: null });

  useEffect(() => {
    if (submission) {
      setFormData({
        ...formData,
        ...submission
      });
    }
  }, [submission]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleDocumentChange = (field, value) => {
    setNewDocument({
      ...newDocument,
      [field]: value
    });
  };

  const addDocument = () => {
    if (newDocument.name && newDocument.type) {
      setFormData({
        ...formData,
        documents: [...formData.documents, { ...newDocument, id: Date.now() }]
      });
      setNewDocument({ name: '', type: '', file: null });
    }
  };

  const removeDocument = (index) => {
    const updatedDocuments = formData.documents.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      documents: updatedDocuments
    });
  };

  const documentTypes = [
    'Proposal Document',
    'Budget Sheet',
    'Financial Statements',
    'Board Resolution',
    'IRS Determination Letter',
    'Audit Report',
    'Program Description',
    'Other'
  ];

  return (
    <div className="submission-form-container">
      <div className="form-header">
        <button className="btn-back" onClick={onCancel}>
          <i className="fas fa-arrow-left"></i>
          Back to Submissions
        </button>
        <h1>{mode === 'edit' ? 'Edit Submission' : 'New Submission'}</h1>
        <p>{mode === 'edit' ? 'Update submission details' : 'Create a new grant submission'}</p>
      </div>

      <form onSubmit={handleSubmit} className="submission-form">
        {/* Basic Information */}
        <div className="form-section">
          <h2>Basic Information</h2>
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="grantTitle">Grant Title *</label>
              <input
                type="text"
                id="grantTitle"
                name="grantTitle"
                value={formData.grantTitle}
                onChange={handleChange}
                required
                placeholder="Enter grant title"
              />
            </div>

            <div className="form-group">
              <label htmlFor="clientName">Client Organization *</label>
              <input
                type="text"
                id="clientName"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                required
                placeholder="Client organization name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="funder">Funding Organization *</label>
              <input
                type="text"
                id="funder"
                name="funder"
                value={formData.funder}
                onChange={handleChange}
                required
                placeholder="Funding organization name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="amount">Funding Amount *</label>
              <input
                type="text"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                placeholder="$0.00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Submission Status *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="submittedDate">Submitted Date</label>
              <input
                type="date"
                id="submittedDate"
                name="submittedDate"
                value={formData.submittedDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="decisionDate">Decision Date</label>
              <input
                type="date"
                id="decisionDate"
                name="decisionDate"
                value={formData.decisionDate}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="form-section">
          <h2>Attached Documents</h2>
          <div className="documents-section">
            <div className="document-input">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="documentName">Document Name</label>
                  <input
                    type="text"
                    id="documentName"
                    value={newDocument.name}
                    onChange={(e) => handleDocumentChange('name', e.target.value)}
                    placeholder="e.g., Proposal Document"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="documentType">Document Type</label>
                  <select
                    id="documentType"
                    value={newDocument.type}
                    onChange={(e) => handleDocumentChange('type', e.target.value)}
                  >
                    <option value="">Select Type</option>
                    {documentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="documentFile">Upload File</label>
                  <input
                    type="file"
                    id="documentFile"
                    onChange={(e) => handleDocumentChange('file', e.target.files[0])}
                  />
                </div>
              </div>
              <button type="button" className="btn btn-outline" onClick={addDocument}>
                <i className="fas fa-plus"></i>
                Add Document
              </button>
            </div>

            {/* Documents List */}
            <div className="documents-list">
              {formData.documents.map((doc, index) => (
                <div key={doc.id || index} className="document-item">
                  <div className="document-info">
                    <i className="fas fa-file"></i>
                    <div>
                      <div className="document-name">{doc.name}</div>
                      <div className="document-type">{doc.type}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeDocument(index)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="form-section">
          <h2>Additional Notes</h2>
          <div className="form-group full-width">
            <label htmlFor="notes">Notes & Comments</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              placeholder="Add any additional notes, comments, or special instructions regarding this submission..."
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {mode === 'edit' ? 'Update Submission' : 'Create Submission'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmissionForm;