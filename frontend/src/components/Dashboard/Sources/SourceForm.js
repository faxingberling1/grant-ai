// frontend/src/components/Dashboard/Sources/SourceForm.js
import React, { useState, useEffect } from 'react';

const SourceForm = ({ source, onSave, onCancel, mode }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'private_foundation',
    category: '',
    deadline: '',
    amount: '',
    status: 'active',
    website: '',
    contactEmail: '',
    eligibility: '',
    focusAreas: [],
    notes: '',
    matchScore: 0,
    grants: [] // New field for available grants
  });

  const [newFocusArea, setNewFocusArea] = useState('');
  const [newGrant, setNewGrant] = useState({
    title: '',
    deadline: '',
    amount: '',
    category: '',
    status: 'active'
  });

  const sourceTypes = [
    { value: 'government', label: 'Government Agency' },
    { value: 'private_foundation', label: 'Private Foundation' },
    { value: 'corporate', label: 'Corporate Giving' },
    { value: 'community', label: 'Community Fund' }
  ];

  const categories = [
    'Education',
    'Healthcare',
    'Environment',
    'Arts & Culture',
    'Community Development',
    'Social Justice',
    'STEM Research',
    'Youth Programs',
    'Senior Services',
    'Animal Welfare',
    'Disaster Relief',
    'International Development'
  ];

  const grantCategories = [
    'General Operating',
    'Program Development',
    'Capital Projects',
    'Research',
    'Capacity Building',
    'Emergency Funding',
    'Scholarships',
    'Equipment',
    'Technology',
    'Training & Development'
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'closed', label: 'Closed' }
  ];

  const grantStatusOptions = [
    { value: 'active', label: 'Accepting Applications' },
    { value: 'upcoming', label: 'Opening Soon' },
    { value: 'closed', label: 'Closed' }
  ];

  useEffect(() => {
    if (source) {
      setFormData({
        ...formData,
        ...source
      });
    }
  }, [source]);

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

  const handleAddFocusArea = () => {
    if (newFocusArea.trim() && !formData.focusAreas.includes(newFocusArea.trim())) {
      setFormData({
        ...formData,
        focusAreas: [...formData.focusAreas, newFocusArea.trim()]
      });
      setNewFocusArea('');
    }
  };

  const handleRemoveFocusArea = (areaToRemove) => {
    setFormData({
      ...formData,
      focusAreas: formData.focusAreas.filter(area => area !== areaToRemove)
    });
  };

  const handleGrantChange = (field, value) => {
    setNewGrant({
      ...newGrant,
      [field]: value
    });
  };

  const handleAddGrant = () => {
    if (newGrant.title.trim() && newGrant.amount.trim()) {
      const grantToAdd = {
        ...newGrant,
        id: Date.now().toString(),
        title: newGrant.title.trim()
      };
      
      setFormData({
        ...formData,
        grants: [...formData.grants, grantToAdd]
      });
      
      setNewGrant({
        title: '',
        deadline: '',
        amount: '',
        category: '',
        status: 'active'
      });
    }
  };

  const handleRemoveGrant = (grantId) => {
    setFormData({
      ...formData,
      grants: formData.grants.filter(grant => grant.id !== grantId)
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddFocusArea();
    }
  };

  return (
    <div className="source-form-container">
      <div className="form-header">
        <button className="btn-back" onClick={onCancel}>
          <i className="fas fa-arrow-left"></i>
          Back to Sources
        </button>
        <h1>{mode === 'edit' ? 'Edit Grant Source' : 'Add Grant Source'}</h1>
        <p>{mode === 'edit' ? 'Update source information' : 'Add a new funding source to your database'}</p>
      </div>

      <form onSubmit={handleSubmit} className="source-form">
        {/* Basic Information */}
        <div className="form-section">
          <h2>Basic Information</h2>
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="name">Source Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., National Science Foundation"
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">Source Type *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                {sourceTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="matchScore">Match Score</label>
              <input
                type="number"
                id="matchScore"
                name="matchScore"
                value={formData.matchScore}
                onChange={handleChange}
                min="0"
                max="100"
                placeholder="0-100"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="form-section">
          <h2>Contact Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="website">Website</label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contactEmail">Contact Email</label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder="grants@foundation.org"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="eligibility">Eligibility Requirements</label>
              <textarea
                id="eligibility"
                name="eligibility"
                value={formData.eligibility}
                onChange={handleChange}
                rows="3"
                placeholder="Describe eligibility requirements..."
              />
            </div>
          </div>
        </div>

        {/* Available Grants */}
        <div className="form-section">
          <h2>Available Grant Opportunities</h2>
          <div className="grants-input">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="grantTitle">Grant Title *</label>
                <input
                  type="text"
                  id="grantTitle"
                  value={newGrant.title}
                  onChange={(e) => handleGrantChange('title', e.target.value)}
                  placeholder="e.g., STEM Education Initiative"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="grantAmount">Funding Amount *</label>
                <input
                  type="text"
                  id="grantAmount"
                  value={newGrant.amount}
                  onChange={(e) => handleGrantChange('amount', e.target.value)}
                  placeholder="e.g., $50,000 - $500,000"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="grantDeadline">Application Deadline</label>
                <input
                  type="date"
                  id="grantDeadline"
                  value={newGrant.deadline}
                  onChange={(e) => handleGrantChange('deadline', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="grantCategory">Grant Category</label>
                <select
                  id="grantCategory"
                  value={newGrant.category}
                  onChange={(e) => handleGrantChange('category', e.target.value)}
                >
                  <option value="">Select Category</option>
                  {grantCategories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="grantStatus">Status</label>
                <select
                  id="grantStatus"
                  value={newGrant.status}
                  onChange={(e) => handleGrantChange('status', e.target.value)}
                >
                  {grantStatusOptions.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={handleAddGrant}
              disabled={!newGrant.title.trim() || !newGrant.amount.trim()}
            >
              <i className="fas fa-plus"></i>
              Add Grant Opportunity
            </button>
          </div>

          {/* Grants List */}
          {formData.grants.length > 0 && (
            <div className="grants-list">
              <h4>Added Grant Opportunities ({formData.grants.length})</h4>
              <div className="grants-table">
                {formData.grants.map((grant, index) => (
                  <div key={grant.id} className="grant-item">
                    <div className="grant-info">
                      <div className="grant-title">{grant.title}</div>
                      <div className="grant-details">
                        <span className="grant-amount">{grant.amount}</span>
                        {grant.deadline && (
                          <span className="grant-deadline">
                            Deadline: {new Date(grant.deadline).toLocaleDateString()}
                          </span>
                        )}
                        {grant.category && (
                          <span className="grant-category">{grant.category}</span>
                        )}
                        <span className={`grant-status status-${grant.status}`}>
                          {grantStatusOptions.find(s => s.value === grant.status)?.label}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => handleRemoveGrant(grant.id)}
                      title="Remove Grant"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Focus Areas */}
        <div className="form-section">
          <h2>Focus Areas</h2>
          <div className="form-group full-width">
            <label>Focus Areas & Priorities</label>
            <div className="tags-input">
              <div className="tags-list">
                {formData.focusAreas.map((area, index) => (
                  <span key={index} className="tag">
                    {area}
                    <button
                      type="button"
                      onClick={() => handleRemoveFocusArea(area)}
                      className="tag-remove"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </span>
                ))}
              </div>
              <div className="tag-input-wrapper">
                <input
                  type="text"
                  value={newFocusArea}
                  onChange={(e) => setNewFocusArea(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a focus area and press Enter"
                />
                <button type="button" onClick={handleAddFocusArea} className="btn-tag-add">
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="form-section">
          <h2>Additional Information</h2>
          <div className="form-group full-width">
            <label htmlFor="notes">Notes & Comments</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              placeholder="Add any additional information, special requirements, or comments about this funding source..."
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {mode === 'edit' ? 'Update Source' : 'Add Source'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SourceForm;