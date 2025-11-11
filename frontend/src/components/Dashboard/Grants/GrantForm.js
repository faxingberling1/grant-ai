// GrantForm.js
import React, { useState } from 'react';
import './GrantForm.css';

// Icons
const Icon = {
  Add: () => <span>➕</span>,
  Remove: () => <span>❌</span>,
  Back: () => <span>←</span>,
  Upload: () => <span>📁</span>,
  Document: () => <span>📄</span>,
  Organization: () => <span>🏢</span>,
  Contact: () => <span>👤</span>,
  Program: () => <span>📊</span>,
  Funding: () => <span>💰</span>,
  Location: () => <span>📍</span>,
  Attachment: () => <span>📎</span>
};

const GrantForm = () => {
  const [formData, setFormData] = useState({
    // Basic Grant Information
    grantTitle: '',
    clientOrganization: '',
    fundingOrganization: '',
    fundingAmount: '',
    applicationDeadline: '',
    category: '',
    
    // Client Information
    organizationName: '',
    taxStatus: '',
    ein: '',
    yearEstablished: '',
    mailingAddress: '',
    website: '',
    projectStartDate: '',
    projectEndDate: '',
    
    // Primary Contact Information
    contactName: '',
    title: '',
    email: '',
    phone: '',
    missionStatement: '',
    visionStatement: '',
    
    // Programs & Services
    programs: [{
      programName: '',
      targetPopulation: [],
      geographicArea: '',
      description: ''
    }],
    
    // Target Population
    targetPopulations: [],
    otherTargetPopulation: '',
    
    // Funding Needs
    fundingNeeded: '',
    fundingNeeds: [],
    fundsUsage: '',
    previousGrants: '',
    
    // Geographic Scope
    geographicScope: '',
    grantPreferences: [],
    
    // Required Documents
    documents: [{
      documentName: '',
      documentType: '',
      file: null
    }],
    
    // Additional Information
    additionalNotes: '',
    tags: []
  });

  const [currentTag, setCurrentTag] = useState('');

  // Handle input changes
  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSimpleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Program management
  const addProgram = () => {
    setFormData(prev => ({
      ...prev,
      programs: [...prev.programs, {
        programName: '',
        targetPopulation: [],
        geographicArea: '',
        description: ''
      }]
    }));
  };

  const removeProgram = (index) => {
    setFormData(prev => ({
      ...prev,
      programs: prev.programs.filter((_, i) => i !== index)
    }));
  };

  const updateProgram = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      programs: prev.programs.map((program, i) => 
        i === index ? { ...program, [field]: value } : program
      )
    }));
  };

  // Document management
  const addDocument = () => {
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, {
        documentName: '',
        documentType: '',
        file: null
      }]
    }));
  };

  const removeDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const updateDocument = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.map((doc, i) => 
        i === index ? { ...doc, [field]: value } : doc
      )
    }));
  };

  // Handle file upload
  const handleFileUpload = (index, file) => {
    updateDocument(index, 'file', file);
  };

  // Handle checkbox arrays
  const handleCheckboxChange = (field, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  // Handle tags
  const handleTagAdd = (e) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleTagRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  // Form submission
  const handleSubmit = (action) => {
    console.log(`${action} form:`, formData);
    // Handle form submission logic here
  };

  const handleBack = () => {
    window.history.back();
  };

  // Options for selects
  const taxStatusOptions = [
    '501(c)(3) Public Charity',
    '501(c)(3) Private Foundation',
    'Government Entity',
    'Educational Institution',
    'Religious Organization',
    'Other'
  ];

  const categoryOptions = [
    'Education',
    'Healthcare',
    'Arts & Culture',
    'Environment',
    'Community Development',
    'Human Services',
    'Youth Development',
    'Research'
  ];

  const fundingNeedsOptions = [
    'Program Support',
    'General Operating',
    'Capacity Building',
    'Capital Campaign',
    'Equipment',
    'Technology',
    'Staff Training',
    'Research & Development'
  ];

  const geographicScopeOptions = [
    'Local',
    'Regional',
    'Statewide',
    'National',
    'International'
  ];

  const grantPreferencesOptions = [
    'Private foundations',
    'Government (local/state/federal)',
    'Corporate giving',
    'Faith-based or community funds'
  ];

  const targetPopulationOptions = [
    'Youth',
    'Seniors',
    'BIPOC communities',
    'Veterans',
    'LGBTQ+',
    'People with disabilities',
    'Rural populations',
    'Low-income households'
  ];

  const documentTypeOptions = [
    'EIN Determination Letter',
    'Financial Statements',
    'Annual Report',
    'Board List',
    'Budget',
    'Program Description',
    'Audit Report',
    'Bylaws'
  ];

  return (
    <div className="grants-form-container">
      {/* Navigation Bar */}
      <nav className="grants-form-nav">
        <div className="grants-form-nav-buttons">
          <div className="grants-form-nav-section">
            <button className="grants-form-nav-button" onClick={handleBack}>
              <Icon.Back />
              Back to Grants
            </button>
            <button className="grants-form-nav-button grants-form-active">
              <Icon.Document />
              New Grant Application
            </button>
          </div>
        </div>

        <div className="grants-form-nav-actions">
          <button className="grants-form-nav-add-btn" onClick={() => handleSubmit('create')}>
            <Icon.Add />
            Create Grant
          </button>
        </div>
      </nav>

      {/* Form Container */}
      <div className="grants-form-wrapper">
        {/* Header */}
        <div className="grants-form-header">
          <div className="grants-form-header-content">
            <h1>New Grant Application</h1>
            <p>Complete all required fields to submit your grant application</p>
          </div>
        </div>

        {/* Form Content */}
        <div className="grants-form-content">
          {/* Section 1: Basic Grant Information */}
          <div className="grants-form-section">
            <div className="grants-form-section-header">
              <h2 className="grants-form-section-title">
                <Icon.Document />
                Basic Grant Information
              </h2>
              <p className="grants-form-section-subtitle">
                Provide essential details about the grant application
              </p>
            </div>

            <div className="grants-form-grid">
              <div className="grants-form-group grants-form-group-full">
                <label className="grants-form-label grants-form-label-required">
                  Grant Title
                </label>
                <input
                  type="text"
                  className="grants-form-input"
                  placeholder="Enter grant title"
                  value={formData.grantTitle}
                  onChange={(e) => handleSimpleInputChange('grantTitle', e.target.value)}
                />
              </div>

              <div className="grants-form-group">
                <label className="grants-form-label grants-form-label-required">
                  Client Organization
                </label>
                <select
                  className="grants-form-select"
                  value={formData.clientOrganization}
                  onChange={(e) => handleSimpleInputChange('clientOrganization', e.target.value)}
                >
                  <option value="">Select Client</option>
                  <option value="client1">Client Organization 1</option>
                  <option value="client2">Client Organization 2</option>
                  <option value="client3">Client Organization 3</option>
                </select>
              </div>

              <div className="grants-form-group">
                <label className="grants-form-label grants-form-label-required">
                  Funding Organization
                </label>
                <input
                  type="text"
                  className="grants-form-input"
                  placeholder="Enter funder name"
                  value={formData.fundingOrganization}
                  onChange={(e) => handleSimpleInputChange('fundingOrganization', e.target.value)}
                />
              </div>

              <div className="grants-form-group">
                <label className="grants-form-label grants-form-label-required">
                  Funding Amount Requested
                </label>
                <input
                  type="text"
                  className="grants-form-input"
                  placeholder="e.g., $500,000"
                  value={formData.fundingAmount}
                  onChange={(e) => handleSimpleInputChange('fundingAmount', e.target.value)}
                />
              </div>

              <div className="grants-form-group">
                <label className="grants-form-label grants-form-label-required">
                  Application Deadline
                </label>
                <input
                  type="date"
                  className="grants-form-input"
                  value={formData.applicationDeadline}
                  onChange={(e) => handleSimpleInputChange('applicationDeadline', e.target.value)}
                />
              </div>

              <div className="grants-form-group">
                <label className="grants-form-label">Category</label>
                <select
                  className="grants-form-select"
                  value={formData.category}
                  onChange={(e) => handleSimpleInputChange('category', e.target.value)}
                >
                  <option value="">Select Category</option>
                  {categoryOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Client Information */}
          <div className="grants-form-section">
            <div className="grants-form-section-header">
              <h2 className="grants-form-section-title">
                <Icon.Organization />
                Client Information
              </h2>
              <p className="grants-form-section-subtitle">
                Organization details and legal information
              </p>
            </div>

            <div className="grants-form-grid">
              <div className="grants-form-group grants-form-group-full">
                <label className="grants-form-label grants-form-label-required">
                  Organization Name
                </label>
                <input
                  type="text"
                  className="grants-form-input"
                  placeholder="Legal organization name"
                  value={formData.organizationName}
                  onChange={(e) => handleSimpleInputChange('organizationName', e.target.value)}
                />
              </div>

              <div className="grants-form-group">
                <label className="grants-form-label grants-form-label-required">
                  Tax Status
                </label>
                <select
                  className="grants-form-select"
                  value={formData.taxStatus}
                  onChange={(e) => handleSimpleInputChange('taxStatus', e.target.value)}
                >
                  <option value="">Select Tax Status</option>
                  {taxStatusOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="grants-form-group">
                <label className="grants-form-label grants-form-label-required">
                  EIN / Tax ID
                </label>
                <input
                  type="text"
                  className="grants-form-input"
                  placeholder="XX-XXXXXXX"
                  value={formData.ein}
                  onChange={(e) => handleSimpleInputChange('ein', e.target.value)}
                />
              </div>

              <div className="grants-form-group">
                <label className="grants-form-label grants-form-label-required">
                  Year Established
                </label>
                <input
                  type="number"
                  className="grants-form-input"
                  placeholder="YYYY"
                  value={formData.yearEstablished}
                  onChange={(e) => handleSimpleInputChange('yearEstablished', e.target.value)}
                />
              </div>

              <div className="grants-form-group grants-form-group-full">
                <label className="grants-form-label grants-form-label-required">
                  Mailing Address
                </label>
                <textarea
                  className="grants-form-textarea grants-form-textarea-small"
                  placeholder="Full mailing address"
                  value={formData.mailingAddress}
                  onChange={(e) => handleSimpleInputChange('mailingAddress', e.target.value)}
                />
              </div>

              <div className="grants-form-group">
                <label className="grants-form-label">Website</label>
                <input
                  type="url"
                  className="grants-form-input"
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={(e) => handleSimpleInputChange('website', e.target.value)}
                />
              </div>

              <div className="grants-form-group">
                <label className="grants-form-label">Project Start Date</label>
                <input
                  type="date"
                  className="grants-form-input"
                  value={formData.projectStartDate}
                  onChange={(e) => handleSimpleInputChange('projectStartDate', e.target.value)}
                />
              </div>

              <div className="grants-form-group">
                <label className="grants-form-label">Project End Date</label>
                <input
                  type="date"
                  className="grants-form-input"
                  value={formData.projectEndDate}
                  onChange={(e) => handleSimpleInputChange('projectEndDate', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Primary Contact Information */}
          <div className="grants-form-section">
            <div className="grants-form-section-header">
              <h2 className="grants-form-section-title">
                <Icon.Contact />
                Primary Contact Information
              </h2>
              <p className="grants-form-section-subtitle">
                Main point of contact for this application
              </p>
            </div>

            <div className="grants-form-grid">
              <div className="grants-form-group">
                <label className="grants-form-label grants-form-label-required">
                  Contact Name
                </label>
                <input
                  type="text"
                  className="grants-form-input"
                  placeholder="Full name"
                  value={formData.contactName}
                  onChange={(e) => handleSimpleInputChange('contactName', e.target.value)}
                />
              </div>

              <div className="grants-form-group">
                <label className="grants-form-label grants-form-label-required">
                  Title
                </label>
                <input
                  type="text"
                  className="grants-form-input"
                  placeholder="Job title"
                  value={formData.title}
                  onChange={(e) => handleSimpleInputChange('title', e.target.value)}
                />
              </div>

              <div className="grants-form-group">
                <label className="grants-form-label grants-form-label-required">
                  Email
                </label>
                <input
                  type="email"
                  className="grants-form-input"
                  placeholder="email@organization.org"
                  value={formData.email}
                  onChange={(e) => handleSimpleInputChange('email', e.target.value)}
                />
              </div>

              <div className="grants-form-group">
                <label className="grants-form-label grants-form-label-required">
                  Phone
                </label>
                <input
                  type="tel"
                  className="grants-form-input"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleSimpleInputChange('phone', e.target.value)}
                />
              </div>

              <div className="grants-form-group grants-form-group-full">
                <label className="grants-form-label grants-form-label-required">
                  Mission Statement
                </label>
                <textarea
                  className="grants-form-textarea"
                  placeholder="Organization's mission statement"
                  value={formData.missionStatement}
                  onChange={(e) => handleSimpleInputChange('missionStatement', e.target.value)}
                />
              </div>

              <div className="grants-form-group grants-form-group-full">
                <label className="grants-form-label">Vision Statement</label>
                <textarea
                  className="grants-form-textarea"
                  placeholder="Organization's vision for the future"
                  value={formData.visionStatement}
                  onChange={(e) => handleSimpleInputChange('visionStatement', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Programs & Services */}
          <div className="grants-form-section">
            <div className="grants-form-section-header">
              <h2 className="grants-form-section-title">
                <Icon.Program />
                Programs & Services
              </h2>
              <p className="grants-form-section-subtitle">
                Describe the programs and services your organization provides
              </p>
            </div>

            {formData.programs.map((program, index) => (
              <div key={index} className="grants-form-program">
                <div className="grants-form-program-header">
                  <h3 className="grants-form-program-title">Program {index + 1}</h3>
                  {formData.programs.length > 1 && (
                    <button
                      type="button"
                      className="grants-form-remove-btn"
                      onClick={() => removeProgram(index)}
                    >
                      <Icon.Remove />
                      Remove
                    </button>
                  )}
                </div>

                <div className="grants-form-grid">
                  <div className="grants-form-group grants-form-group-full">
                    <label className="grants-form-label grants-form-label-required">
                      Program Name
                    </label>
                    <input
                      type="text"
                      className="grants-form-input"
                      placeholder="Program name"
                      value={program.programName}
                      onChange={(e) => updateProgram(index, 'programName', e.target.value)}
                    />
                  </div>

                  <div className="grants-form-group">
                    <label className="grants-form-label">Target Population</label>
                    <input
                      type="text"
                      className="grants-form-input"
                      placeholder="Who does this program serve?"
                      value={program.targetPopulation}
                      onChange={(e) => updateProgram(index, 'targetPopulation', e.target.value)}
                    />
                  </div>

                  <div className="grants-form-group">
                    <label className="grants-form-label">Geographic Area Served</label>
                    <input
                      type="text"
                      className="grants-form-input"
                      placeholder="Where is this program offered?"
                      value={program.geographicArea}
                      onChange={(e) => updateProgram(index, 'geographicArea', e.target.value)}
                    />
                  </div>

                  <div className="grants-form-group grants-form-group-full">
                    <label className="grants-form-label grants-form-label-required">
                      Brief Description (2-3 sentences)
                    </label>
                    <textarea
                      className="grants-form-textarea"
                      placeholder="Describe the program's activities, goals, and impact"
                      value={program.description}
                      onChange={(e) => updateProgram(index, 'description', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            <button type="button" className="grants-form-add-btn" onClick={addProgram}>
              <Icon.Add />
              Add Another Program
            </button>
          </div>

          {/* Section 5: Target Population */}
          <div className="grants-form-section">
            <div className="grants-form-section-header">
              <h2 className="grants-form-section-title">
                <Icon.Location />
                Target Population
              </h2>
              <p className="grants-form-section-subtitle">
                Select the populations served by your organization
              </p>
            </div>

            <div className="grants-form-checkbox-group">
              {targetPopulationOptions.map(population => (
                <label key={population} className="grants-form-checkbox-label">
                  <input
                    type="checkbox"
                    className="grants-form-checkbox"
                    checked={formData.targetPopulations.includes(population)}
                    onChange={(e) => handleCheckboxChange('targetPopulations', population, e.target.checked)}
                  />
                  {population}
                </label>
              ))}
            </div>

            <div className="grants-form-group" style={{ marginTop: '1rem' }}>
              <label className="grants-form-label">Other Target Population</label>
              <input
                type="text"
                className="grants-form-input"
                placeholder="Specify other target population"
                value={formData.otherTargetPopulation}
                onChange={(e) => handleSimpleInputChange('otherTargetPopulation', e.target.value)}
              />
            </div>
          </div>

          {/* Section 6: Funding Needs */}
          <div className="grants-form-section">
            <div className="grants-form-section-header">
              <h2 className="grants-form-section-title">
                <Icon.Funding />
                Funding Needs
              </h2>
              <p className="grants-form-section-subtitle">
                Detail your funding requirements and usage
              </p>
            </div>

            <div className="grants-form-grid">
              <div className="grants-form-group">
                <label className="grants-form-label grants-form-label-required">
                  How much funding is needed?
                </label>
                <input
                  type="text"
                  className="grants-form-input"
                  placeholder="e.g., $50,000"
                  value={formData.fundingNeeded}
                  onChange={(e) => handleSimpleInputChange('fundingNeeded', e.target.value)}
                />
              </div>

              <div className="grants-form-group">
                <label className="grants-form-label grants-form-label-required">
                  Funding Needs
                </label>
                <select
                  className="grants-form-select"
                  value={formData.fundingNeeds[0] || ''}
                  onChange={(e) => handleSimpleInputChange('fundingNeeds', [e.target.value])}
                >
                  <option value="">Select Funding Need</option>
                  {fundingNeedsOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="grants-form-group grants-form-group-full">
                <label className="grants-form-label grants-form-label-required">
                  How will funds be used?
                </label>
                <textarea
                  className="grants-form-textarea"
                  placeholder="Provide specific details about how the funds will be allocated and used"
                  value={formData.fundsUsage}
                  onChange={(e) => handleSimpleInputChange('fundsUsage', e.target.value)}
                />
              </div>

              <div className="grants-form-group grants-form-group-full">
                <label className="grants-form-label">Previous Grants Awarded</label>
                <textarea
                  className="grants-form-textarea grants-form-textarea-small"
                  placeholder="List previous funders, amounts awarded, and dates"
                  value={formData.previousGrants}
                  onChange={(e) => handleSimpleInputChange('previousGrants', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 7: Geographic Scope & Preferences */}
          <div className="grants-form-section">
            <div className="grants-form-section-header">
              <h2 className="grants-form-section-title">
                <Icon.Location />
                Geographic Scope & Grant Preferences
              </h2>
            </div>

            <div className="grants-form-grid">
              <div className="grants-form-group">
                <label className="grants-form-label grants-form-label-required">
                  Geographic Scope
                </label>
                <select
                  className="grants-form-select"
                  value={formData.geographicScope}
                  onChange={(e) => handleSimpleInputChange('geographicScope', e.target.value)}
                >
                  <option value="">Select Scope</option>
                  {geographicScopeOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="grants-form-group">
                <label className="grants-form-label">Grant Preferences</label>
                <div className="grants-form-checkbox-group">
                  {grantPreferencesOptions.map(preference => (
                    <label key={preference} className="grants-form-checkbox-label">
                      <input
                        type="checkbox"
                        className="grants-form-checkbox"
                        checked={formData.grantPreferences.includes(preference)}
                        onChange={(e) => handleCheckboxChange('grantPreferences', preference, e.target.checked)}
                      />
                      {preference}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 8: Required Documents */}
          <div className="grants-form-section">
            <div className="grants-form-section-header">
              <h2 className="grants-form-section-title">
                <Icon.Attachment />
                Required Documents
              </h2>
              <p className="grants-form-section-subtitle">
                Upload supporting documents for your application
              </p>
            </div>

            {formData.documents.map((document, index) => (
              <div key={index} className="grants-form-program">
                <div className="grants-form-program-header">
                  <h3 className="grants-form-program-title">Document {index + 1}</h3>
                  {formData.documents.length > 1 && (
                    <button
                      type="button"
                      className="grants-form-remove-btn"
                      onClick={() => removeDocument(index)}
                    >
                      <Icon.Remove />
                      Remove
                    </button>
                  )}
                </div>

                <div className="grants-form-grid">
                  <div className="grants-form-group">
                    <label className="grants-form-label">Document Name</label>
                    <input
                      type="text"
                      className="grants-form-input"
                      placeholder="e.g., EIN Determination Letter"
                      value={document.documentName}
                      onChange={(e) => updateDocument(index, 'documentName', e.target.value)}
                    />
                  </div>

                  <div className="grants-form-group">
                    <label className="grants-form-label">Document Type</label>
                    <select
                      className="grants-form-select"
                      value={document.documentType}
                      onChange={(e) => updateDocument(index, 'documentType', e.target.value)}
                    >
                      <option value="">Select Type</option>
                      {documentTypeOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grants-form-group grants-form-group-full">
                    <label className="grants-form-label">Upload File</label>
                    <div className="grants-form-file-upload">
                      <input
                        type="file"
                        className="grants-form-file-input"
                        id={`file-upload-${index}`}
                        onChange={(e) => handleFileUpload(index, e.target.files[0])}
                      />
                      <label htmlFor={`file-upload-${index}`} className="grants-form-file-label">
                        <Icon.Upload />
                        <span>{document.file ? document.file.name : 'No file chosen'}</span>
                        <span>Click to upload or drag and drop</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button type="button" className="grants-form-add-btn" onClick={addDocument}>
              <Icon.Add />
              Add Document
            </button>
          </div>

          {/* Section 9: Additional Information */}
          <div className="grants-form-section">
            <div className="grants-form-section-header">
              <h2 className="grants-form-section-title">
                Additional Information
              </h2>
            </div>

            <div className="grants-form-grid">
              <div className="grants-form-group grants-form-group-full">
                <label className="grants-form-label">Additional Notes & Comments</label>
                <textarea
                  className="grants-form-textarea"
                  placeholder="Any additional information, special requirements, or comments"
                  value={formData.additionalNotes}
                  onChange={(e) => handleSimpleInputChange('additionalNotes', e.target.value)}
                />
              </div>

              <div className="grants-form-group grants-form-group-full">
                <label className="grants-form-label">Tags</label>
                <div className="grants-form-tags-container">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="grants-form-tag">
                      {tag}
                      <button
                        type="button"
                        className="grants-form-tag-remove"
                        onClick={() => handleTagRemove(index)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    className="grants-form-tags-input"
                    placeholder="Add a tag and press Enter"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={handleTagAdd}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="grants-form-actions">
          <div className="grants-form-actions-left">
            <button type="button" className="grants-form-btn grants-form-btn-back" onClick={handleBack}>
              <Icon.Back />
              Back
            </button>
          </div>
          <div className="grants-form-actions-right">
            <button type="button" className="grants-form-btn grants-form-btn-cancel" onClick={handleBack}>
              Cancel
            </button>
            <button type="button" className="grants-form-btn grants-form-btn-draft" onClick={() => handleSubmit('saveDraft')}>
              Save Draft
            </button>
            <button type="button" className="grants-form-btn grants-form-btn-create" onClick={() => handleSubmit('create')}>
              Create Grant Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrantForm;