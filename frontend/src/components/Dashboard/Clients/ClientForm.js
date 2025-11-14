import React, { useState, useEffect } from 'react';

const ClientForm = ({ client, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    // Basic Information
    organizationName: '',
    primaryContactName: '',
    titleRole: '',
    emailAddress: '',
    phoneNumbers: '',
    
    // Additional Contact
    additionalContactName: '',
    additionalContactTitle: '',
    additionalContactEmail: '',
    additionalContactPhone: '',
    
    // Organization Details
    mailingAddress: '',
    website: '',
    socialMediaLinks: [], // Changed to array for multiple links
    taxIdEIN: '',
    organizationType: '',
    missionStatement: '',
    focusAreas: [],
    serviceArea: '',
    annualBudget: '',
    staffCount: '',
    
    // Existing fields
    status: 'active',
    notes: '',
    tags: []
  });
  
  const [newTag, setNewTag] = useState('');
  const [newFocusArea, setNewFocusArea] = useState('');
  const [newSocialMedia, setNewSocialMedia] = useState({ platform: '', url: '' });

  useEffect(() => {
    if (client) {
      setFormData({
        organizationName: client.organizationName || '',
        primaryContactName: client.primaryContactName || '',
        titleRole: client.titleRole || '',
        emailAddress: client.emailAddress || '',
        phoneNumbers: client.phoneNumbers || '',
        additionalContactName: client.additionalContactName || '',
        additionalContactTitle: client.additionalContactTitle || '',
        additionalContactEmail: client.additionalContactEmail || '',
        additionalContactPhone: client.additionalContactPhone || '',
        mailingAddress: client.mailingAddress || '',
        website: client.website || '',
        socialMediaLinks: Array.isArray(client.socialMediaLinks) ? client.socialMediaLinks : [],
        taxIdEIN: client.taxIdEIN || '',
        organizationType: client.organizationType || '',
        missionStatement: client.missionStatement || '',
        focusAreas: Array.isArray(client.focusAreas) ? client.focusAreas : [],
        serviceArea: client.serviceArea || '',
        annualBudget: client.annualBudget || '',
        staffCount: client.staffCount || '',
        status: client.status || 'active',
        notes: client.notes || '',
        tags: Array.isArray(client.tags) ? client.tags : []
      });
    }
  }, [client]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddFocusArea = () => {
    if (newFocusArea.trim() && !formData.focusAreas.includes(newFocusArea.trim())) {
      setFormData(prev => ({
        ...prev,
        focusAreas: [...prev.focusAreas, newFocusArea.trim()]
      }));
      setNewFocusArea('');
    }
  };

  const handleRemoveFocusArea = (areaToRemove) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.filter(area => area !== areaToRemove)
    }));
  };

  const handleAddSocialMedia = () => {
    if (newSocialMedia.platform.trim() && newSocialMedia.url.trim()) {
      setFormData(prev => ({
        ...prev,
        socialMediaLinks: [...prev.socialMediaLinks, { 
          platform: newSocialMedia.platform.trim(), 
          url: newSocialMedia.url.trim() 
        }]
      }));
      setNewSocialMedia({ platform: '', url: '' });
    }
  };

  const handleRemoveSocialMedia = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      socialMediaLinks: prev.socialMediaLinks.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSocialMediaChange = (field, value) => {
    setNewSocialMedia(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleFocusAreaKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddFocusArea();
    }
  };

  const handleSocialMediaKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSocialMedia();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const organizationTypes = [
    'Nonprofit 501(c)(3)',
    'Nonprofit 501(c)(4)',
    'Nonprofit 501(c)(6)',
    'Government Agency',
    'Educational Institution',
    'For-Profit Corporation',
    'Small Business',
    'Startup',
    'Community Organization',
    'Religious Organization',
    'Foundation',
    'Other'
  ];

  const budgetRanges = [
    'Under $100,000',
    '$100,000 - $500,000',
    '$500,000 - $1,000,000',
    '$1,000,000 - $5,000,000',
    '$5,000,000 - $10,000,000',
    'Over $10,000,000'
  ];

  const staffSizeRanges = [
    '1-5',
    '6-10',
    '11-25',
    '26-50',
    '51-100',
    '101-250',
    '251-500',
    '501-1000',
    'Over 1000'
  ];

  const socialMediaPlatforms = [
    'LinkedIn',
    'Twitter',
    'Facebook',
    'Instagram',
    'YouTube',
    'TikTok',
    'Pinterest',
    'Snapchat',
    'Reddit',
    'Other'
  ];

  const getSocialMediaIcon = (platform) => {
    const icons = {
      'LinkedIn': 'fab fa-linkedin',
      'Twitter': 'fab fa-twitter',
      'Facebook': 'fab fa-facebook',
      'Instagram': 'fab fa-instagram',
      'YouTube': 'fab fa-youtube',
      'TikTok': 'fab fa-tiktok',
      'Pinterest': 'fab fa-pinterest',
      'Snapchat': 'fab fa-snapchat',
      'Reddit': 'fab fa-reddit',
      'Other': 'fas fa-share-alt'
    };
    return icons[platform] || 'fas fa-globe';
  };

  // Safe rendering for arrays
  const safeFocusAreas = Array.isArray(formData.focusAreas) ? formData.focusAreas : [];
  const safeTags = Array.isArray(formData.tags) ? formData.tags : [];
  const safeSocialMediaLinks = Array.isArray(formData.socialMediaLinks) ? formData.socialMediaLinks : [];

  return (
    <div className="client-form-container">
      <div className="form-header">
        <h1><i className="fas fa-user-plus"></i> {client ? 'Edit Client' : 'Add New Client'}</h1>
        <p>{client ? 'Update client information' : 'Add a new client to your portfolio'}</p>
      </div>

      <form onSubmit={handleSubmit} className="client-form">
        {/* Section 1: Basic Client Information */}
        <div className="form-section">
          <h2><i className="fas fa-building"></i> Basic Client Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="organizationName">
                <i className="fas fa-landmark"></i> Organization Name *
              </label>
              <input
                type="text"
                id="organizationName"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                required
                placeholder="Enter organization name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="primaryContactName">
                <i className="fas fa-user"></i> Primary Contact Name *
              </label>
              <input
                type="text"
                id="primaryContactName"
                name="primaryContactName"
                value={formData.primaryContactName}
                onChange={handleChange}
                required
                placeholder="Enter primary contact's full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="titleRole">
                <i className="fas fa-briefcase"></i> Title / Role *
              </label>
              <input
                type="text"
                id="titleRole"
                name="titleRole"
                value={formData.titleRole}
                onChange={handleChange}
                required
                placeholder="e.g., Executive Director, CEO, Program Manager"
              />
            </div>

            <div className="form-group">
              <label htmlFor="emailAddress">
                <i className="fas fa-envelope"></i> Email Address *
              </label>
              <input
                type="email"
                id="emailAddress"
                name="emailAddress"
                value={formData.emailAddress}
                onChange={handleChange}
                required
                placeholder="Enter primary email address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumbers">
                <i className="fas fa-phone"></i> Phone Number(s)
              </label>
              <input
                type="tel"
                id="phoneNumbers"
                name="phoneNumbers"
                value={formData.phoneNumbers}
                onChange={handleChange}
                placeholder="Enter phone number(s)"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Additional Contact Information */}
        <div className="form-section">
          <h2><i className="fas fa-users"></i> Additional Contact Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="additionalContactName">
                <i className="fas fa-user-plus"></i> Additional Contact Name
              </label>
              <input
                type="text"
                id="additionalContactName"
                name="additionalContactName"
                value={formData.additionalContactName}
                onChange={handleChange}
                placeholder="Enter additional contact name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="additionalContactTitle">
                <i className="fas fa-id-card"></i> Title / Role
              </label>
              <input
                type="text"
                id="additionalContactTitle"
                name="additionalContactTitle"
                value={formData.additionalContactTitle}
                onChange={handleChange}
                placeholder="Enter title/role"
              />
            </div>

            <div className="form-group">
              <label htmlFor="additionalContactEmail">
                <i className="fas fa-envelope"></i> Email Address
              </label>
              <input
                type="email"
                id="additionalContactEmail"
                name="additionalContactEmail"
                value={formData.additionalContactEmail}
                onChange={handleChange}
                placeholder="Enter additional email address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="additionalContactPhone">
                <i className="fas fa-mobile-alt"></i> Phone Number
              </label>
              <input
                type="tel"
                id="additionalContactPhone"
                name="additionalContactPhone"
                value={formData.additionalContactPhone}
                onChange={handleChange}
                placeholder="Enter additional phone number"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Organization Details */}
        <div className="form-section">
          <h2><i className="fas fa-info-circle"></i> Organization Details</h2>
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="mailingAddress">
                <i className="fas fa-map-marker-alt"></i> Mailing Address
              </label>
              <textarea
                id="mailingAddress"
                name="mailingAddress"
                value={formData.mailingAddress}
                onChange={handleChange}
                rows="3"
                placeholder="Enter complete mailing address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="website">
                <i className="fas fa-globe"></i> Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="socialMediaLinks">
                <i className="fas fa-share-alt"></i> Social Media Links
              </label>
              <div className="social-media-input">
                <div className="social-media-list">
                  {safeSocialMediaLinks.map((link, index) => (
                    <div key={index} className="social-media-item">
                      <i className={getSocialMediaIcon(link.platform)}></i>
                      <span className="social-media-platform">{link.platform}</span>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="social-media-url">
                        {link.url}
                      </a>
                      <button
                        type="button"
                        onClick={() => handleRemoveSocialMedia(index)}
                        className="social-media-remove"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="social-media-input-wrapper">
                  <div className="social-media-fields">
                    <select
                      value={newSocialMedia.platform}
                      onChange={(e) => handleSocialMediaChange('platform', e.target.value)}
                      className="social-media-platform-select"
                    >
                      <option value="">Select Platform</option>
                      {socialMediaPlatforms.map(platform => (
                        <option key={platform} value={platform}>{platform}</option>
                      ))}
                    </select>
                    <input
                      type="url"
                      value={newSocialMedia.url}
                      onChange={(e) => handleSocialMediaChange('url', e.target.value)}
                      onKeyPress={handleSocialMediaKeyPress}
                      placeholder="Enter profile URL"
                      className="social-media-url-input"
                    />
                  </div>
                  <button type="button" onClick={handleAddSocialMedia} className="btn-social-media-add">
                    <i className="fas fa-plus"></i> Add
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="taxIdEIN">
                <i className="fas fa-file-invoice-dollar"></i> Tax ID / EIN
              </label>
              <input
                type="text"
                id="taxIdEIN"
                name="taxIdEIN"
                value={formData.taxIdEIN}
                onChange={handleChange}
                placeholder="Enter Tax ID or EIN"
              />
            </div>

            <div className="form-group">
              <label htmlFor="organizationType">
                <i className="fas fa-building"></i> Organization Type *
              </label>
              <select
                id="organizationType"
                name="organizationType"
                value={formData.organizationType}
                onChange={handleChange}
                required
              >
                <option value="">Select organization type</option>
                {organizationTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="annualBudget">
                <i className="fas fa-money-bill-wave"></i> Annual Budget
              </label>
              <select
                id="annualBudget"
                name="annualBudget"
                value={formData.annualBudget}
                onChange={handleChange}
              >
                <option value="">Select budget range</option>
                {budgetRanges.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="staffCount">
                <i className="fas fa-users"></i> Staff Count
              </label>
              <select
                id="staffCount"
                name="staffCount"
                value={formData.staffCount}
                onChange={handleChange}
              >
                <option value="">Select staff size</option>
                {staffSizeRanges.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <div className="form-group full-width">
              <label htmlFor="serviceArea">
                <i className="fas fa-map"></i> Service Area / Geographic Focus
              </label>
              <input
                type="text"
                id="serviceArea"
                name="serviceArea"
                value={formData.serviceArea}
                onChange={handleChange}
                placeholder="e.g., Local, Regional, National, International, Specific cities/states"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="missionStatement">
                <i className="fas fa-bullseye"></i> Mission Statement
              </label>
              <textarea
                id="missionStatement"
                name="missionStatement"
                value={formData.missionStatement}
                onChange={handleChange}
                rows="4"
                placeholder="Enter the organization's mission statement"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="focusAreas">
                <i className="fas fa-tags"></i> Focus Areas / Program Areas
              </label>
              <div className="tags-input">
                <div className="tags-list">
                  {safeFocusAreas.map((area, index) => (
                    <span key={index} className="tag">
                      <i className="fas fa-tag"></i> {area}
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
                    onKeyPress={handleFocusAreaKeyPress}
                    placeholder="Add focus area and press Enter"
                  />
                  <button type="button" onClick={handleAddFocusArea} className="btn-tag-add">
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Additional Information */}
        <div className="form-section">
          <h2><i className="fas fa-ellipsis-h"></i> Additional Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="status">
                <i className="fas fa-circle"></i> Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="prospect">Prospect</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label htmlFor="tags">
                <i className="fas fa-hashtag"></i> Tags
              </label>
              <div className="tags-input">
                <div className="tags-list">
                  {safeTags.map((tag, index) => (
                    <span key={index} className="tag">
                      <i className="fas fa-hashtag"></i> {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
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
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                    placeholder="Add a tag and press Enter"
                  />
                  <button type="button" onClick={handleAddTag} className="btn-tag-add">
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="notes">
                <i className="fas fa-sticky-note"></i> Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                placeholder="Add any additional notes about this client..."
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            <i className="fas fa-times"></i> Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            <i className="fas fa-save"></i> {client ? 'Update Client' : 'Add Client'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientForm;