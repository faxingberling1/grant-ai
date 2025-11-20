import React, { useState, useEffect } from 'react';
import './ClientForm.css';

const ClientForm = ({ client, onSave, onCancel, loading, environment, isNewClient }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [grantSources, setGrantSources] = useState([]);
  
  // Updated categories to match Mongoose schema exactly
  const predefinedCategories = [
    'Education', 'Healthcare', 'Environment', 'Arts & Culture', 'Social Justice', 
    'STEM Education', 'Clean Energy', 'Other'
  ];

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
    socialMediaLinks: [],
    taxIdEIN: '',
    organizationType: '',
    missionStatement: '',
    focusAreas: [],
    serviceArea: '',
    annualBudget: '',
    staffCount: '',
    
    // Status and Metadata
    status: 'active',
    notes: '',
    tags: [],
    
    // Category Fields - FIXED: Ensure these are properly initialized
    category: '',
    priority: 'medium',
    referralSource: '',
    grantPotential: '',
    nextFollowUp: '',
    grantSources: [],
    fundingAreas: []
  });
  
  const [newTag, setNewTag] = useState('');
  const [newFocusArea, setNewFocusArea] = useState('');
  const [newSocialMedia, setNewSocialMedia] = useState({ platform: '', url: '' });
  const [newFundingArea, setNewFundingArea] = useState('');

  // Fetch grant sources
  useEffect(() => {
    fetchGrantSources();
  }, []);

  // FIXED: Enhanced initialization with proper fallbacks and debugging
  useEffect(() => {
    if (client) {
      console.log('🔄 INITIALIZING FORM WITH CLIENT DATA:', client);

      setFormData({
        // Basic Information
        organizationName: client.organizationName || client.organization || '',
        primaryContactName: client.primaryContactName || client.name || '',
        titleRole: client.titleRole || '',
        emailAddress: client.emailAddress || client.email || '',
        phoneNumbers: client.phoneNumbers || client.phone || '',
        
        // Additional Contact
        additionalContactName: client.additionalContactName || '',
        additionalContactTitle: client.additionalContactTitle || '',
        additionalContactEmail: client.additionalContactEmail || '',
        additionalContactPhone: client.additionalContactPhone || '',
        
        // Organization Details
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
        
        // Status and Metadata
        status: client.status || 'active',
        notes: client.notes || '',
        tags: Array.isArray(client.tags) ? client.tags : [],
        
        // Category Fields - FIXED: Proper fallbacks and validation
        category: client.category || '',
        priority: client.priority || 'medium',
        referralSource: client.referralSource || '',
        grantPotential: client.grantPotential || '',
        nextFollowUp: client.nextFollowUp || '',
        grantSources: Array.isArray(client.grantSources) ? client.grantSources : [],
        fundingAreas: Array.isArray(client.fundingAreas) ? client.fundingAreas : []
      });

    } else {
      console.log('🆕 INITIALIZING EMPTY FORM FOR NEW CLIENT');
      // Reset to empty form for new client
      setFormData(prev => ({
        ...prev,
        organizationName: '',
        primaryContactName: '',
        titleRole: '',
        emailAddress: '',
        phoneNumbers: '',
        additionalContactName: '',
        additionalContactTitle: '',
        additionalContactEmail: '',
        additionalContactPhone: '',
        mailingAddress: '',
        website: '',
        socialMediaLinks: [],
        taxIdEIN: '',
        organizationType: '',
        missionStatement: '',
        focusAreas: [],
        serviceArea: '',
        annualBudget: '',
        staffCount: '',
        status: 'active',
        notes: '',
        tags: [],
        category: '',
        priority: 'medium',
        referralSource: '',
        grantPotential: '',
        nextFollowUp: '',
        grantSources: [],
        fundingAreas: []
      }));
    }
  }, [client]);

  const fetchGrantSources = async () => {
    try {
      // Simulated API call
      const mockGrantSources = [
        { _id: '1', name: 'Federal Education Grants', category: 'Education', type: 'Federal' },
        { _id: '2', name: 'State Healthcare Funding', category: 'Healthcare', type: 'State' },
        { _id: '3', name: 'Environmental Protection Fund', category: 'Environment', type: 'Federal' },
        { _id: '4', name: 'Arts and Culture Foundation', category: 'Arts & Culture', type: 'Private' },
        { _id: '5', name: 'Social Justice Innovation Fund', category: 'Social Justice', type: 'Federal' },
        { _id: '6', name: 'STEM Education Grants', category: 'STEM Education', type: 'Corporate' },
        { _id: '7', name: 'Clean Energy Initiative', category: 'Clean Energy', type: 'Foundation' },
        { _id: '8', name: 'General Community Fund', category: 'Other', type: 'Private' }
      ];

      setGrantSources(mockGrantSources);
      
    } catch (error) {
      console.error('Error fetching grant sources:', error);
    }
  };

  // FIXED: Enhanced change handler with category-specific debugging
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    console.log(`📝 Field changed: ${name} = ${value}, type: ${type}`);

    if (type === 'checkbox') {
      if (name === 'grantSources') {
        setFormData(prev => {
          const currentSources = prev.grantSources || [];
          let updatedSources;
          
          if (checked) {
            updatedSources = [...currentSources, value];
            console.log(`✅ Added grant source: ${value}`);
          } else {
            updatedSources = currentSources.filter(id => id !== value);
            console.log(`❌ Removed grant source: ${value}`);
          }
          
          console.log(`📊 Updated grant sources:`, updatedSources);
          return { ...prev, grantSources: updatedSources };
        });
      }
    } else {
      // Special handling for category changes
      if (name === 'category') {
        console.log(`🎯 Category changed from "${formData.category}" to "${value}"`);
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // FIXED: Enhanced tag management with better state updates
  const handleAddTag = () => {
    const tagToAdd = newTag.trim();
    if (tagToAdd && !formData.tags.includes(tagToAdd)) {
      const updatedTags = [...formData.tags, tagToAdd];
      console.log(`🏷️ Adding tag: "${tagToAdd}", updated tags:`, updatedTags);
      
      setFormData(prev => ({
        ...prev,
        tags: updatedTags
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const updatedTags = formData.tags.filter(tag => tag !== tagToRemove);
    console.log(`🗑️ Removing tag: "${tagToRemove}", updated tags:`, updatedTags);
    
    setFormData(prev => ({
      ...prev,
      tags: updatedTags
    }));
  };

  const handleAddFocusArea = () => {
    const areaToAdd = newFocusArea.trim();
    if (areaToAdd && !formData.focusAreas.includes(areaToAdd)) {
      const updatedAreas = [...formData.focusAreas, areaToAdd];
      console.log(`🎯 Adding focus area: "${areaToAdd}", updated areas:`, updatedAreas);
      
      setFormData(prev => ({
        ...prev,
        focusAreas: updatedAreas
      }));
      setNewFocusArea('');
    }
  };

  const handleRemoveFocusArea = (areaToRemove) => {
    const updatedAreas = formData.focusAreas.filter(area => area !== areaToRemove);
    console.log(`🗑️ Removing focus area: "${areaToRemove}", updated areas:`, updatedAreas);
    
    setFormData(prev => ({
      ...prev,
      focusAreas: updatedAreas
    }));
  };

  const handleAddFundingArea = () => {
    const areaToAdd = newFundingArea.trim();
    if (areaToAdd && !formData.fundingAreas.includes(areaToAdd)) {
      const updatedAreas = [...formData.fundingAreas, areaToAdd];
      console.log(`💰 Adding funding area: "${areaToAdd}", updated areas:`, updatedAreas);
      
      setFormData(prev => ({
        ...prev,
        fundingAreas: updatedAreas
      }));
      setNewFundingArea('');
    }
  };

  const handleRemoveFundingArea = (areaToRemove) => {
    const updatedAreas = formData.fundingAreas.filter(area => area !== areaToRemove);
    console.log(`🗑️ Removing funding area: "${areaToRemove}", updated areas:`, updatedAreas);
    
    setFormData(prev => ({
      ...prev,
      fundingAreas: updatedAreas
    }));
  };

  const handleAddSocialMedia = () => {
    if (newSocialMedia.platform.trim() && newSocialMedia.url.trim()) {
      const newLink = { 
        platform: newSocialMedia.platform.trim(), 
        url: newSocialMedia.url.trim() 
      };
      const updatedLinks = [...formData.socialMediaLinks, newLink];
      console.log(`📱 Adding social media:`, newLink);
      
      setFormData(prev => ({
        ...prev,
        socialMediaLinks: updatedLinks
      }));
      setNewSocialMedia({ platform: '', url: '' });
    }
  };

  const handleRemoveSocialMedia = (indexToRemove) => {
    const updatedLinks = formData.socialMediaLinks.filter((_, index) => index !== indexToRemove);
    console.log(`🗑️ Removing social media at index: ${indexToRemove}`);
    
    setFormData(prev => ({
      ...prev,
      socialMediaLinks: updatedLinks
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

  const handleFundingAreaKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddFundingArea();
    }
  };

  const handleSocialMediaKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSocialMedia();
    }
  };

  // FIXED: Enhanced submit with comprehensive category data validation
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.organizationName.trim() || !formData.primaryContactName.trim() || !formData.emailAddress.trim()) {
      alert('Please fill in all required fields (Organization Name, Primary Contact Name, and Email Address)');
      return;
    }

    // Prepare final data with all category fields
    const submitData = {
      // Basic Information
      organizationName: formData.organizationName.trim(),
      primaryContactName: formData.primaryContactName.trim(),
      titleRole: formData.titleRole.trim(),
      emailAddress: formData.emailAddress.trim(),
      phoneNumbers: formData.phoneNumbers.trim(),
      
      // Additional Contact
      additionalContactName: formData.additionalContactName.trim(),
      additionalContactTitle: formData.additionalContactTitle.trim(),
      additionalContactEmail: formData.additionalContactEmail.trim(),
      additionalContactPhone: formData.additionalContactPhone.trim(),
      
      // Organization Details
      mailingAddress: formData.mailingAddress.trim(),
      website: formData.website.trim(),
      socialMediaLinks: formData.socialMediaLinks,
      taxIdEIN: formData.taxIdEIN.trim(),
      organizationType: formData.organizationType,
      missionStatement: formData.missionStatement.trim(),
      focusAreas: formData.focusAreas,
      serviceArea: formData.serviceArea.trim(),
      annualBudget: formData.annualBudget,
      staffCount: formData.staffCount,
      
      // Status and Metadata
      status: formData.status,
      notes: formData.notes.trim(),
      tags: formData.tags,
      
      // Category Fields - FIXED: Ensure all category data is included
      category: formData.category,
      priority: formData.priority,
      referralSource: formData.referralSource,
      grantPotential: formData.grantPotential,
      nextFollowUp: formData.nextFollowUp,
      grantSources: formData.grantSources,
      fundingAreas: formData.fundingAreas
    };

    console.log('🚀 SUBMITTING CLIENT DATA WITH CATEGORIES:', {
      ...submitData,
      categoryInfo: {
        category: submitData.category,
        tagsCount: submitData.tags.length,
        focusAreasCount: submitData.focusAreas.length,
        fundingAreasCount: submitData.fundingAreas.length,
        grantSourcesCount: submitData.grantSources.length
      }
    });

    onSave(submitData);
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

  const priorities = [
    { value: 'low', label: 'Low', color: '#48bb78' },
    { value: 'medium', label: 'Medium', color: '#ed8936' },
    { value: 'high', label: 'High', color: '#e53e3e' },
    { value: 'critical', label: 'Critical', color: '#9b2c2c' }
  ];

  const grantPotentialOptions = [
    'Under $10,000',
    '$10,000 - $50,000',
    '$50,000 - $100,000',
    '$100,000 - $250,000',
    '$250,000 - $500,000',
    '$500,000 - $1,000,000',
    'Over $1,000,000'
  ];

  const referralSources = [
    'Referral from Existing Client',
    'Website Inquiry',
    'Conference/Event',
    'Social Media',
    'Partner Organization',
    'Online Search',
    'Advertising',
    'Other'
  ];

  const getPriorityColor = (priority) => {
    const priorityObj = priorities.find(p => p.value === priority);
    return priorityObj ? priorityObj.color : '#6b7280';
  };

  // Safe rendering for arrays
  const safeFocusAreas = Array.isArray(formData.focusAreas) ? formData.focusAreas : [];
  const safeTags = Array.isArray(formData.tags) ? formData.tags : [];
  const safeSocialMediaLinks = Array.isArray(formData.socialMediaLinks) ? formData.socialMediaLinks : [];
  const safeFundingAreas = Array.isArray(formData.fundingAreas) ? formData.fundingAreas : [];

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

  // Render Functions
  const renderBasicInfo = () => (
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
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );

  const renderAdditionalContacts = () => (
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
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );

  const renderOrganizationDetails = () => (
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
            disabled={loading}
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
            disabled={loading}
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
                  <a 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="social-media-url"
                  >
                    {link.url}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleRemoveSocialMedia(index)}
                    className="social-media-remove"
                    disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>
              <button 
                type="button" 
                onClick={handleAddSocialMedia} 
                className="btn-social-media-add"
                disabled={loading}
              >
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
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="organizationType">
            <i className="fas fa-building"></i> Organization Type
          </label>
          <select
            id="organizationType"
            name="organizationType"
            value={formData.organizationType}
            onChange={handleChange}
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="focusAreas">
            <i className="fas fa-tags"></i> Focus Areas / Program Areas
            <span className="counter">({safeFocusAreas.length})</span>
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
                    disabled={loading}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              ))}
              {safeFocusAreas.length === 0 && (
                <span className="no-items-message">No focus areas added</span>
              )}
            </div>
            <div className="tag-input-wrapper">
              <input
                type="text"
                value={newFocusArea}
                onChange={(e) => setNewFocusArea(e.target.value)}
                onKeyPress={handleFocusAreaKeyPress}
                placeholder="Add focus area and press Enter"
                disabled={loading}
              />
              <button 
                type="button" 
                onClick={handleAddFocusArea} 
                className="btn-tag-add"
                disabled={loading}
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCategoryInfo = () => (
    <div className="form-section">
      <h2><i className="fas fa-folder"></i> Category & Grant Alignment</h2>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="category">
            <i className="fas fa-tag"></i> Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">Select category</option>
            {predefinedCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="priority">
            <i className="fas fa-flag"></i> Priority Level
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            disabled={loading}
            style={{ 
              borderLeft: `4px solid ${getPriorityColor(formData.priority)}` 
            }}
          >
            {priorities.map(priority => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="referralSource">
            <i className="fas fa-handshake"></i> Referral Source
          </label>
          <select
            id="referralSource"
            name="referralSource"
            value={formData.referralSource}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">Select referral source</option>
            {referralSources.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="grantPotential">
            <i className="fas fa-chart-line"></i> Grant Potential
          </label>
          <select
            id="grantPotential"
            name="grantPotential"
            value={formData.grantPotential}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">Select grant potential</option>
            {grantPotentialOptions.map(potential => (
              <option key={potential} value={potential}>{potential}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="nextFollowUp">
            <i className="fas fa-calendar-alt"></i> Next Follow-up Date
          </label>
          <input
            type="date"
            id="nextFollowUp"
            name="nextFollowUp"
            value={formData.nextFollowUp}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        {/* Funding Areas */}
        <div className="form-group full-width">
          <label htmlFor="fundingAreas">
            <i className="fas fa-money-bill-wave"></i> Specific Funding Areas
            <span className="counter">({safeFundingAreas.length})</span>
          </label>
          <div className="tags-input">
            <div className="tags-list">
              {safeFundingAreas.map((area, index) => (
                <span key={index} className="tag">
                  <i className="fas fa-dollar-sign"></i> {area}
                  <button
                    type="button"
                    onClick={() => handleRemoveFundingArea(area)}
                    className="tag-remove"
                    disabled={loading}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              ))}
              {safeFundingAreas.length === 0 && (
                <span className="no-items-message">No funding areas added</span>
              )}
            </div>
            <div className="tag-input-wrapper">
              <input
                type="text"
                value={newFundingArea}
                onChange={(e) => setNewFundingArea(e.target.value)}
                onKeyPress={handleFundingAreaKeyPress}
                placeholder="Add funding area and press Enter"
                disabled={loading}
              />
              <button 
                type="button" 
                onClick={handleAddFundingArea} 
                className="btn-tag-add"
                disabled={loading}
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="tags">
            <i className="fas fa-hashtag"></i> Tags
            <span className="counter">({safeTags.length})</span>
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
                    disabled={loading}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              ))}
              {safeTags.length === 0 && (
                <span className="no-items-message">No tags added</span>
              )}
            </div>
            <div className="tag-input-wrapper">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder="Add a tag and press Enter"
                disabled={loading}
              />
              <button 
                type="button" 
                onClick={handleAddTag} 
                className="btn-tag-add"
                disabled={loading}
              >
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
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );

  const renderAdditionalInfo = () => (
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
            disabled={loading}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="prospect">Prospect</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="client-form-container">
      <div className="form-header">
        <h1>
          <i className="fas fa-user-plus"></i> 
          {client ? 'Edit Client' : 'Add New Client'}
        </h1>
        <p>
          {client ? 'Update client information' : 'Add a new client to your portfolio'}
          {environment && (
            <span className="environment-badge">
              Environment: {environment}
            </span>
          )}
        </p>
      </div>

      {/* Category Tabs */}
      <div className="form-tabs">
        <button
          type="button"
          className={`form-tab ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          <i className="fas fa-user"></i>
          Basic Info
        </button>
        <button
          type="button"
          className={`form-tab ${activeTab === 'contacts' ? 'active' : ''}`}
          onClick={() => setActiveTab('contacts')}
        >
          <i className="fas fa-users"></i>
          Contacts
        </button>
        <button
          type="button"
          className={`form-tab ${activeTab === 'organization' ? 'active' : ''}`}
          onClick={() => setActiveTab('organization')}
        >
          <i className="fas fa-building"></i>
          Organization
        </button>
        <button
          type="button"
          className={`form-tab ${activeTab === 'category' ? 'active' : ''}`}
          onClick={() => setActiveTab('category')}
        >
          <i className="fas fa-folder"></i>
          Category & Grants
        </button>
        <button
          type="button"
          className={`form-tab ${activeTab === 'additional' ? 'active' : ''}`}
          onClick={() => setActiveTab('additional')}
        >
          <i className="fas fa-cog"></i>
          Additional
        </button>
      </div>

      <form onSubmit={handleSubmit} className="client-form">
        {activeTab === 'basic' && renderBasicInfo()}
        {activeTab === 'contacts' && renderAdditionalContacts()}
        {activeTab === 'organization' && renderOrganizationDetails()}
        {activeTab === 'category' && renderCategoryInfo()}
        {activeTab === 'additional' && renderAdditionalInfo()}

        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-outline" 
            onClick={onCancel}
            disabled={loading}
          >
            <i className="fas fa-times"></i> Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> 
                {client ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <i className="fas fa-save"></i> 
                {client ? 'Update Client' : 'Add Client'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientForm;