import React, { useState, useEffect } from 'react';

const GrantForm = ({ grant, clients, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    // Basic Grant Information
    title: '',
    clientId: '',
    funder: '',
    amount: '',
    deadline: '',
    status: 'draft',
    category: '',
    priority: 'medium',
    
    // Client Information
    organizationName: '',
    mailingAddress: '',
    website: '',
    taxStatus: '',
    ein: '',
    yearEstablished: '',
    primaryContactName: '',
    primaryContactTitle: '',
    primaryContactEmail: '',
    primaryContactPhone: '',
    missionStatement: '',
    visionStatement: '',
    projectStartDate: '',
    projectEndDate: '',
    
    // Programs & Services
    programs: [{ name: '', targetPopulation: '', geographicArea: '', description: '' }],
    
    // Target Population
    targetPopulations: [],
    otherTargetPopulation: '',
    
    // Funding Needs
    fundingNeeds: '',
    fundingAmount: '',
    fundUsage: '',
    previousGrants: '',
    
    // Geographic Scope
    geographicScope: '',
    localScope: '',
    statewideScope: '',
    
    // Grant Preferences
    grantPreferences: [],
    
    // Documents
    documents: [],
    
    notes: '',
    tags: []
  });

  const [newTag, setNewTag] = useState('');
  const [newDocument, setNewDocument] = useState({ name: '', type: '', file: null });

  // Options for dropdowns
  const targetPopulationOptions = [
    'Youth', 'Seniors', 'BIPOC communities', 'Veterans', 
    'LGBTQ+', 'People with disabilities', 'Rural populations', 
    'Low-income households'
  ];

  const geographicScopeOptions = [
    'Local', 'Statewide', 'Regional', 'National', 'International'
  ];

  const grantPreferenceOptions = [
    'Private foundations', 'Government (local/state/federal)', 
    'Corporate giving', 'Faith-based or community funds'
  ];

  const taxStatusOptions = [
    '501(c)(3)', '501(c)(4)', '501(c)(6)', 'For-profit', 
    'Fiscally sponsored', 'Government entity', 'Other'
  ];

  useEffect(() => {
    if (grant) {
      setFormData({
        ...formData,
        ...grant
      });
    }
  }, [grant]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'targetPopulations' || name === 'grantPreferences') {
        const updatedArray = checked 
          ? [...formData[name], value]
          : formData[name].filter(item => item !== value);
        setFormData({
          ...formData,
          [name]: updatedArray
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Programs Management
  const handleProgramChange = (index, field, value) => {
    const updatedPrograms = [...formData.programs];
    updatedPrograms[index][field] = value;
    setFormData({
      ...formData,
      programs: updatedPrograms
    });
  };

  const addProgram = () => {
    setFormData({
      ...formData,
      programs: [...formData.programs, { name: '', targetPopulation: '', geographicArea: '', description: '' }]
    });
  };

  const removeProgram = (index) => {
    const updatedPrograms = formData.programs.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      programs: updatedPrograms
    });
  };

  // Documents Management
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

  // Tags Management
  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const documentTypes = [
    'EIN Determination Letter',
    'Financial Statements',
    'Annual Budget',
    'Program Budget',
    'Board List',
    'Staff List',
    'Audit Report',
    'IRS Form 990',
    'Bylaws',
    'Strategic Plan',
    'Other'
  ];

  return (
    <div className="grant-form-container">
      <div className="form-header">
        <div className="header-content">
          <div className="header-title">
            <h1>{grant ? 'Edit Grant Application' : 'New Grant Application'}</h1>
            <button
              type="button"
              className="btn-back"
              onClick={onCancel}
              title="Go back to previous page"
            >
              <i className="fas fa-arrow-left"></i>
              Back
            </button>
          </div>
          <p>{grant ? 'Update grant application information' : 'Complete the grant application form'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grant-form">
        {/* Basic Grant Information */}
        <div className="form-section">
          <h2>Basic Grant Information</h2>
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="title">Grant Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter grant title"
              />
            </div>

            <div className="form-group">
              <label htmlFor="clientId">Client Organization *</label>
              <select
                id="clientId"
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                required
              >
                <option value="">Select Client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
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
                placeholder="Enter funder name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="amount">Funding Amount Requested *</label>
              <input
                type="text"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                placeholder="e.g., $500,000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="deadline">Application Deadline *</label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select Category</option>
                <option value="Education">Education</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Environment">Environment</option>
                <option value="Technology">Technology</option>
                <option value="Arts & Culture">Arts & Culture</option>
                <option value="Community Development">Community Development</option>
                <option value="Youth">Youth</option>
                <option value="Research">Research</option>
                <option value="Social Services">Social Services</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className="form-section">
          <h2>Client Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="organizationName">Organization Name *</label>
              <input
                type="text"
                id="organizationName"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                required
                placeholder="Legal organization name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="taxStatus">Tax Status *</label>
              <select
                id="taxStatus"
                name="taxStatus"
                value={formData.taxStatus}
                onChange={handleChange}
                required
              >
                <option value="">Select Tax Status</option>
                {taxStatusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="ein">EIN / Tax ID *</label>
              <input
                type="text"
                id="ein"
                name="ein"
                value={formData.ein}
                onChange={handleChange}
                required
                placeholder="XX-XXXXXXX"
              />
            </div>

            <div className="form-group">
              <label htmlFor="yearEstablished">Year Established *</label>
              <input
                type="number"
                id="yearEstablished"
                name="yearEstablished"
                value={formData.yearEstablished}
                onChange={handleChange}
                required
                placeholder="YYYY"
                min="1900"
                max="2030"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="mailingAddress">Mailing Address *</label>
              <textarea
                id="mailingAddress"
                name="mailingAddress"
                value={formData.mailingAddress}
                onChange={handleChange}
                required
                rows="3"
                placeholder="Full mailing address"
              />
            </div>

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
              <label htmlFor="projectStartDate">Project Start Date</label>
              <input
                type="date"
                id="projectStartDate"
                name="projectStartDate"
                value={formData.projectStartDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="projectEndDate">Project End Date</label>
              <input
                type="date"
                id="projectEndDate"
                name="projectEndDate"
                value={formData.projectEndDate}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Primary Contact */}
          <div className="sub-section">
            <h3>Primary Contact Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="primaryContactName">Contact Name *</label>
                <input
                  type="text"
                  id="primaryContactName"
                  name="primaryContactName"
                  value={formData.primaryContactName}
                  onChange={handleChange}
                  required
                  placeholder="Full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="primaryContactTitle">Title *</label>
                <input
                  type="text"
                  id="primaryContactTitle"
                  name="primaryContactTitle"
                  value={formData.primaryContactTitle}
                  onChange={handleChange}
                  required
                  placeholder="Job title"
                />
              </div>

              <div className="form-group">
                <label htmlFor="primaryContactEmail">Email *</label>
                <input
                  type="email"
                  id="primaryContactEmail"
                  name="primaryContactEmail"
                  value={formData.primaryContactEmail}
                  onChange={handleChange}
                  required
                  placeholder="email@organization.org"
                />
              </div>

              <div className="form-group">
                <label htmlFor="primaryContactPhone">Phone *</label>
                <input
                  type="tel"
                  id="primaryContactPhone"
                  name="primaryContactPhone"
                  value={formData.primaryContactPhone}
                  onChange={handleChange}
                  required
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="form-group full-width">
            <label htmlFor="missionStatement">Mission Statement *</label>
            <textarea
              id="missionStatement"
              name="missionStatement"
              value={formData.missionStatement}
              onChange={handleChange}
              required
              rows="3"
              placeholder="Organization's mission statement"
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="visionStatement">Vision Statement</label>
            <textarea
              id="visionStatement"
              name="visionStatement"
              value={formData.visionStatement}
              onChange={handleChange}
              rows="3"
              placeholder="Organization's vision for the future"
            />
          </div>
        </div>

        {/* Programs & Services */}
        <div className="form-section">
          <h2>Programs & Services</h2>
          {formData.programs.map((program, index) => (
            <div key={index} className="program-item">
              <div className="program-header">
                <h4>Program {index + 1}</h4>
                {formData.programs.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeProgram(index)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor={`program-name-${index}`}>Program Name *</label>
                  <input
                    type="text"
                    id={`program-name-${index}`}
                    value={program.name}
                    onChange={(e) => handleProgramChange(index, 'name', e.target.value)}
                    required
                    placeholder="Program name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor={`program-target-${index}`}>Target Population</label>
                  <input
                    type="text"
                    id={`program-target-${index}`}
                    value={program.targetPopulation}
                    onChange={(e) => handleProgramChange(index, 'targetPopulation', e.target.value)}
                    placeholder="Who does this program serve?"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor={`program-area-${index}`}>Geographic Area Served</label>
                  <input
                    type="text"
                    id={`program-area-${index}`}
                    value={program.geographicArea}
                    onChange={(e) => handleProgramChange(index, 'geographicArea', e.target.value)}
                    placeholder="Where is this program offered?"
                  />
                </div>
                <div className="form-group full-width">
                  <label htmlFor={`program-desc-${index}`}>Brief Description (2-3 sentences) *</label>
                  <textarea
                    id={`program-desc-${index}`}
                    value={program.description}
                    onChange={(e) => handleProgramChange(index, 'description', e.target.value)}
                    required
                    rows="3"
                    placeholder="Describe the program's activities, goals, and impact"
                  />
                </div>
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-outline" onClick={addProgram}>
            <i className="fas fa-plus"></i>
            Add Another Program
          </button>
        </div>

        {/* Target Population */}
        <div className="form-section">
          <h2>Target Population</h2>
          <div className="checkbox-grid">
            {targetPopulationOptions.map(population => (
              <label key={population} className="checkbox-label">
                <input
                  type="checkbox"
                  name="targetPopulations"
                  value={population}
                  checked={formData.targetPopulations.includes(population)}
                  onChange={handleChange}
                />
                <span className="checkmark"></span>
                {population}
              </label>
            ))}
          </div>
          <div className="form-group">
            <label htmlFor="otherTargetPopulation">Other Target Population</label>
            <input
              type="text"
              id="otherTargetPopulation"
              name="otherTargetPopulation"
              value={formData.otherTargetPopulation}
              onChange={handleChange}
              placeholder="Specify other target population"
            />
          </div>
        </div>

        {/* Funding Needs */}
        <div className="form-section">
          <h2>Funding Needs</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="fundingAmount">How much funding is needed? *</label>
              <input
                type="text"
                id="fundingAmount"
                name="fundingAmount"
                value={formData.fundingAmount}
                onChange={handleChange}
                required
                placeholder="e.g., $50,000"
              />
            </div>
            <div className="form-group full-width">
              <label htmlFor="fundingNeeds">Funding Needs *</label>
              <select
                id="fundingNeeds"
                name="fundingNeeds"
                value={formData.fundingNeeds}
                onChange={handleChange}
                required
              >
                <option value="">Select Funding Need</option>
                <option value="General Operations">General Operations</option>
                <option value="Program Extension">Program Extension</option>
                <option value="Equipment">Equipment</option>
                <option value="Staffing">Staffing</option>
                <option value="Capacity Building">Capacity Building</option>
                <option value="Capital Project">Capital Project</option>
                <option value="Research">Research</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group full-width">
              <label htmlFor="fundUsage">How will funds be used? *</label>
              <textarea
                id="fundUsage"
                name="fundUsage"
                value={formData.fundUsage}
                onChange={handleChange}
                required
                rows="4"
                placeholder="Provide specific details about how the funds will be allocated and used"
              />
            </div>
            <div className="form-group full-width">
              <label htmlFor="previousGrants">Previous Grants Awarded</label>
              <textarea
                id="previousGrants"
                name="previousGrants"
                value={formData.previousGrants}
                onChange={handleChange}
                rows="3"
                placeholder="List previous funders, amounts awarded, and dates"
              />
            </div>
          </div>
        </div>

        {/* Geographic Scope */}
        <div className="form-section">
          <h2>Geographic Scope</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="geographicScope">Geographic Scope *</label>
              <select
                id="geographicScope"
                name="geographicScope"
                value={formData.geographicScope}
                onChange={handleChange}
                required
              >
                <option value="">Select Scope</option>
                {geographicScopeOptions.map(scope => (
                  <option key={scope} value={scope}>{scope}</option>
                ))}
              </select>
            </div>
            {formData.geographicScope === 'Local' && (
              <div className="form-group">
                <label htmlFor="localScope">Specify City/County</label>
                <input
                  type="text"
                  id="localScope"
                  name="localScope"
                  value={formData.localScope}
                  onChange={handleChange}
                  placeholder="e.g., New York City, NY"
                />
              </div>
            )}
            {formData.geographicScope === 'Statewide' && (
              <div className="form-group">
                <label htmlFor="statewideScope">Specify State</label>
                <input
                  type="text"
                  id="statewideScope"
                  name="statewideScope"
                  value={formData.statewideScope}
                  onChange={handleChange}
                  placeholder="e.g., California"
                />
              </div>
            )}
          </div>
        </div>

        {/* Grant Preferences */}
        <div className="form-section">
          <h2>Grant Preferences</h2>
          <div className="checkbox-grid">
            {grantPreferenceOptions.map(preference => (
              <label key={preference} className="checkbox-label">
                <input
                  type="checkbox"
                  name="grantPreferences"
                  value={preference}
                  checked={formData.grantPreferences.includes(preference)}
                  onChange={handleChange}
                />
                <span className="checkmark"></span>
                {preference}
              </label>
            ))}
          </div>
        </div>

        {/* Documents Section */}
        <div className="form-section">
          <h2>Required Documents</h2>
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
                    placeholder="e.g., EIN Determination Letter"
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

        {/* Additional Information */}
        <div className="form-section">
          <h2>Additional Information</h2>
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="notes">Additional Notes & Comments</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                placeholder="Any additional information, special requirements, or comments"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="form-group full-width">
            <label htmlFor="tags">Tags</label>
            <div className="tags-input">
              <div className="tags-list">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
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
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Add a tag and press Enter"
                />
                <button type="button" onClick={handleAddTag} className="btn-tag-add">
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {grant ? 'Update Grant Application' : 'Create Grant Application'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GrantForm;