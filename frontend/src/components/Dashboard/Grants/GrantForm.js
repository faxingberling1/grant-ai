// GrantForm.js
import React, { useState, useEffect } from 'react';
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
  Attachment: () => <span>📎</span>,
  Calendar: () => <span>📅</span>,
  Target: () => <span>🎯</span>,
  Requirements: () => <span>📋</span>,
  Timeline: () => <span>⏰</span>,
  Budget: () => <span>💵</span>,
  Evaluation: () => <span>📈</span>
};

const GrantForm = ({ clients = [] }) => {
  const [formData, setFormData] = useState({
    // Grant Basic Information
    grantTitle: '',
    grantReference: '',
    clientId: '',
    fundingSource: '',
    fundingSourceType: 'existing', // 'existing' or 'new'
    
    // New Funding Source Details (when adding manually)
    newFundingSource: {
      organizationName: '',
      website: '',
      contactEmail: '',
      phone: '',
      address: '',
      fundingInterests: [],
      geographicFocus: [],
      averageGrantSize: '',
      applicationProcess: '',
      notes: ''
    },
    
    // Grant Details
    grantAmount: '',
    amountRequested: '',
    matchRequirement: '',
    matchType: '', // cash, in-kind, both
    applicationDeadline: '',
    decisionDate: '',
    grantPeriodStart: '',
    grantPeriodEnd: '',
    grantCategory: '',
    subcategory: '',
    
    // Eligibility & Requirements
    eligibilityRequirements: [],
    reportingRequirements: [],
    funderPriorities: [],
    restrictions: [],
    
    // Proposal Details
    projectTitle: '',
    projectSummary: '',
    problemStatement: '',
    goalsObjectives: [],
    methodology: '',
    timeline: [],
    evaluationPlan: '',
    sustainabilityPlan: '',
    
    // Budget Details
    budgetItems: [{
      category: '',
      description: '',
      amount: '',
      justification: ''
    }],
    
    // Team & Partners
    projectDirector: '',
    keyPersonnel: [],
    partners: [],
    
    // Attachments & Documents
    requiredDocuments: [{
      documentType: '',
      documentName: '',
      file: null,
      status: 'pending'
    }],
    
    // Additional Information
    tags: [],
    internalNotes: '',
    status: 'draft'
  });

  const [currentTag, setCurrentTag] = useState('');
  const [newPersonnel, setNewPersonnel] = useState({ name: '', role: '' });
  const [newPartner, setNewPartner] = useState({ name: '', contribution: '' });
  const [newGoal, setNewGoal] = useState({ goal: '', objective: '' });

  // Initialize with client data if editing existing grant
  useEffect(() => {
    // You can pre-populate form data here if editing an existing grant
  }, []);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parentField, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [field]: value
      }
    }));
  };

  // Budget Management
  const addBudgetItem = () => {
    setFormData(prev => ({
      ...prev,
      budgetItems: [...prev.budgetItems, {
        category: '',
        description: '',
        amount: '',
        justification: ''
      }]
    }));
  };

  const removeBudgetItem = (index) => {
    setFormData(prev => ({
      ...prev,
      budgetItems: prev.budgetItems.filter((_, i) => i !== index)
    }));
  };

  const updateBudgetItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      budgetItems: prev.budgetItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // Document Management
  const addDocument = () => {
    setFormData(prev => ({
      ...prev,
      requiredDocuments: [...prev.requiredDocuments, {
        documentType: '',
        documentName: '',
        file: null,
        status: 'pending'
      }]
    }));
  };

  const removeDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      requiredDocuments: prev.requiredDocuments.filter((_, i) => i !== index)
    }));
  };

  const updateDocument = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      requiredDocuments: prev.requiredDocuments.map((doc, i) => 
        i === index ? { ...doc, [field]: value } : doc
      )
    }));
  };

  // Handle file upload
  const handleFileUpload = (index, file) => {
    updateDocument(index, 'file', file);
    updateDocument(index, 'documentName', file.name);
  };

  // Personnel Management
  const addPersonnel = () => {
    if (newPersonnel.name && newPersonnel.role) {
      setFormData(prev => ({
        ...prev,
        keyPersonnel: [...prev.keyPersonnel, { ...newPersonnel }]
      }));
      setNewPersonnel({ name: '', role: '' });
    }
  };

  const removePersonnel = (index) => {
    setFormData(prev => ({
      ...prev,
      keyPersonnel: prev.keyPersonnel.filter((_, i) => i !== index)
    }));
  };

  // Partners Management
  const addPartner = () => {
    if (newPartner.name && newPartner.contribution) {
      setFormData(prev => ({
        ...prev,
        partners: [...prev.partners, { ...newPartner }]
      }));
      setNewPartner({ name: '', contribution: '' });
    }
  };

  const removePartner = (index) => {
    setFormData(prev => ({
      ...prev,
      partners: prev.partners.filter((_, i) => i !== index)
    }));
  };

  // Goals & Objectives
  const addGoal = () => {
    if (newGoal.goal && newGoal.objective) {
      setFormData(prev => ({
        ...prev,
        goalsObjectives: [...prev.goalsObjectives, { ...newGoal }]
      }));
      setNewGoal({ goal: '', objective: '' });
    }
  };

  const removeGoal = (index) => {
    setFormData(prev => ({
      ...prev,
      goalsObjectives: prev.goalsObjectives.filter((_, i) => i !== index)
    }));
  };

  // Timeline Management
  const addTimelineItem = () => {
    setFormData(prev => ({
      ...prev,
      timeline: [...prev.timeline, {
        phase: '',
        activities: [],
        startDate: '',
        endDate: '',
        responsible: ''
      }]
    }));
  };

  const removeTimelineItem = (index) => {
    setFormData(prev => ({
      ...prev,
      timeline: prev.timeline.filter((_, i) => i !== index)
    }));
  };

  const updateTimelineItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      timeline: prev.timeline.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
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

  // Calculate total budget
  const calculateTotalBudget = () => {
    return formData.budgetItems.reduce((total, item) => {
      return total + (parseFloat(item.amount) || 0);
    }, 0);
  };

  // Form submission
  const handleSubmit = (action) => {
    const submissionData = {
      ...formData,
      totalBudget: calculateTotalBudget(),
      submittedAt: new Date().toISOString(),
      status: action === 'create' ? 'submitted' : 'draft'
    };
    
    console.log(`${action} grant application:`, submissionData);
    // Handle API submission here
  };

  const handleBack = () => {
    window.history.back();
  };

  // Options for selects
  const fundingSourceTypes = [
    'Federal Government',
    'State Government',
    'Local Government',
    'Foundation',
    'Corporate',
    'Community Foundation',
    'Faith-based',
    'International'
  ];

  const grantCategories = [
    'Education & Literacy',
    'Healthcare & Medical Research',
    'Arts & Culture',
    'Environment & Conservation',
    'Community Development',
    'Human Services',
    'Youth Development',
    'Senior Services',
    'Disaster Relief',
    'Research & Innovation',
    'Capacity Building',
    'Social Justice',
    'Animal Welfare',
    'International Development'
  ];

  const eligibilityRequirements = [
    '501(c)(3) status required',
    'Minimum years of operation',
    'Geographic restrictions',
    'Specific population focus',
    'Matching funds required',
    'Collaboration required',
    'Previous grant experience',
    'Audited financials',
    'Board diversity requirements'
  ];

  const reportingRequirements = [
    'Quarterly financial reports',
    'Semi-annual progress reports',
    'Final report',
    'Site visits',
    'Success stories',
    'Photographic documentation',
    'Client testimonials',
    'Financial audit',
    'Outcome measurements'
  ];

  const budgetCategories = [
    'Personnel & Salaries',
    'Fringe Benefits',
    'Consultant Fees',
    'Equipment',
    'Supplies',
    'Travel',
    'Space Rental',
    'Utilities',
    'Printing & Copying',
    'Postage & Shipping',
    'Telephone & Internet',
    'Professional Development',
    'Evaluation',
    'Indirect Costs',
    'Other'
  ];

  const documentTypes = [
    'Proposal Narrative',
    'Budget & Budget Justification',
    'Organizational Chart',
    'Board of Directors List',
    'Financial Statements',
    'Audit Report',
    'IRS Determination Letter',
    'Staff Resumes',
    'Letters of Support',
    'Collaboration Agreements',
    'Logic Model',
    'Evaluation Plan',
    'Timeline',
    'Other'
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
          {/* Section 1: Grant Basic Information */}
          <div className="grants-form-section">
            <div className="grants-form-section-header">
              <h2 className="grants-form-section-title">
                <Icon.Document />
                Grant Basic Information
              </h2>
              <p className="grants-form-section-subtitle">
                Essential details about the grant opportunity
              </p>
            </div>

            <div className="grants-form-grid">
              <div className="grants-form-group grants-form-group-full">
                <label className="grants-form-label grants-form-label-required">
                  Grant Title/Project Name
                </label>
                <input
                  type="text"
                  className="grants-form-input"
                  placeholder="Enter descriptive grant title"
                  value={formData.grantTitle}
                  onChange={(e) => handleInputChange('grantTitle', e.target.value)}
                />
              </div>

              <div className="grants-form-group">
                <label className="grants-form-label">
                  Grant Reference Number
                </label>
                <input
                  type="text"
                  className="grants-form-input"
                  placeholder="e.g., RFP-2024-001"
                  value={formData.grantReference}
                  onChange={(e) => handleInputChange('grantReference', e.target.value)}
                />
              </div>

              <div className="grants-form-group">
                <label className="grants-form-label grants-form-label-required">
                  Client Organization
                </label>
                <select
                  className="grants-form-select"
                  value={formData.clientId}
                  onChange={(e) => handleInputChange('clientId', e.target.value)}
                >
                  <option value="">Select Client</option>
                  {clients.map(client => (
                    <option key={client._id} value={client._id}>
                      {client.organizationName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grants-form-group">
                <label className="grants-form-label grants-form-label-required">
                  Funding Source Type
                </label>
                <select
                  className="grants-form-select"
                  value={formData.fundingSourceType}
                  onChange={(e) => handleInputChange('fundingSourceType', e.target.value)}
                >
                  <option value="existing">Select Existing Funder</option>
                  <option value="new">Add New Funder</option>
                </select>
              </div>

              {formData.fundingSourceType === 'existing' ? (
                <div className="grants-form-group">
                  <label className="grants-form-label grants-form-label-required">
                    Funding Organization
                  </label>
                  <select
                    className="grants-form-select"
                    value={formData.fundingSource}
                    onChange={(e) => handleInputChange('fundingSource', e.target.value)}
                  >
                    <option value="">Select Funder</option>
                    <option value="foundation1">The Ford Foundation</option>
                    <option value="foundation2">The Rockefeller Foundation</option>
                    <option value="foundation3">Bill & Melinda Gates Foundation</option>
                    <option value="government1">Department of Education</option>
                    <option value="government2">National Institutes of Health</option>
                  </select>
                </div>
              ) : (
                <>
                  <div className="grants-form-group grants-form-group-full">
                    <label className="grants-form-label grants-form-label-required">
                      New Funding Organization Name
                    </label>
                    <input
                      type="text"
                      className="grants-form-input"
                      placeholder="Legal name of funding organization"
                      value={formData.newFundingSource.organizationName}
                      onChange={(e) => handleNestedInputChange('newFundingSource', 'organizationName', e.target.value)}
                    />
                  </div>

                  <div className="grants-form-group">
                    <label className="grants-form-label">Website</label>
                    <input
                      type="url"
                      className="grants-form-input"
                      placeholder="https://example.com"
                      value={formData.newFundingSource.website}
                      onChange={(e) => handleNestedInputChange('newFundingSource', 'website', e.target.value)}
                    />
                  </div>

                  <div className="grants-form-group">
                    <label className="grants-form-label">Contact Email</label>
                    <input
                      type="email"
                      className="grants-form-input"
                      placeholder="grants@funder.org"
                      value={formData.newFundingSource.contactEmail}
                      onChange={(e) => handleNestedInputChange('newFundingSource', 'contactEmail', e.target.value)}
                    />
                  </div>

                  <div className="grants-form-group">
                    <label className="grants-form-label">Average Grant Size</label>
                    <input
                      type="text"
                      className="grants-form-input"
                      placeholder="e.g., $50,000 - $100,000"
                      value={formData.newFundingSource.averageGrantSize}
                      onChange={(e) => handleNestedInputChange('newFundingSource', 'averageGrantSize', e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="grants-form-group">
                <label className="grants-form-label grants-form-label-required">
                  Grant Category
                </label>
                <select
                  className="grants-form-select"
                  value={formData.grantCategory}
                  onChange={(e) => handleInputChange('grantCategory', e.target.value)}
                >
                  <option value="">Select Category</option>
                  {grantCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="grants-form-group">
                <label className="grants-form-label">Subcategory</label>
                <input
                  type="text"
                  className="grants-form-input"
                  placeholder="Specific focus area"
                  value={formData.subcategory}
                  onChange={(e) => handleInputChange('subcategory', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Funding & Timeline */}
          <div className="grants-form-section">
            <div className="grants-form-section-header">
              <h2 className="grants-form-section-title">
                <Icon.Funding />
                Funding Details & Timeline
              </h2>
              <p className="grants-form-section-subtitle">
                Financial information and important dates
              </p>
            </div>

            <div className="grants-form-grid">
              <div className="grants-form-group">
                <label className="grants-form-label grants-form-label-required">
                  Total Grant Amount Available
                </label>
                <input
                  type="text"
                  className="grants-form-input"
                  placeholder="e.g., $500,000"
                  value={formData.grantAmount}
                  onChange={(e) => handleInputChange('grantAmount', e.target.value)}
                />
              </div>

              <div className="grants-form-group">
                <label className="grants-form-label grants-form-label-required">
                  Amount Requested
                </label>
                <input
                  type="text"
                  className="grants-form-input"
                  placeholder="e.g., $150,000"
                  value={formData.amountRequested}
                  onChange={(e) => handleInputChange('amountRequested', e.target.value)}
                />
              </div>

              <div className="grants-form-group">
                <label className="grants-form-label">Matching Requirement</label>
                <input
                  type="text"
                  className="grants-form-input"
                  placeholder="e.g., 25% match required"
                  value={formData.matchRequirement}
                  onChange={(e) => handleInputChange('matchRequirement', e.target.value)}
                />
              </div>

              <div className="grants-form-group">
                <label className="grants-form-label">Match Type</label>
                <select
                  className="grants-form-select"
                  value={formData.matchType}
                  onChange={(e) => handleInputChange('matchType', e.target.value)}
                >
                  <option value="">Select Type</option>
                  <option value="cash">Cash</option>
                  <option value="in-kind">In-Kind</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div className="grants-form-group">
                <label className="grants-form-label grants-form-label-required">
                  Application Deadline
                </label>
                <input
                  type="datetime-local"
                  className="grants-form-input"
                  value={formData.applicationDeadline}
                  onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
                />
              </div>

              <div className="grants-form-group">
                <label className="grants-form-label">Expected Decision Date</label>
                <input
                  type="date"
                  className="grants-form-input"
                  value={formData.decisionDate}
                  onChange={(e) => handleInputChange('decisionDate', e.target.value)}
                />
              </div>

              <div className="grants-form-group">
                <label className="grants-form-label">Grant Period Start</label>
                <input
                  type="date"
                  className="grants-form-input"
                  value={formData.grantPeriodStart}
                  onChange={(e) => handleInputChange('grantPeriodStart', e.target.value)}
                />
              </div>

              <div className="grants-form-group">
                <label className="grants-form-label">Grant Period End</label>
                <input
                  type="date"
                  className="grants-form-input"
                  value={formData.grantPeriodEnd}
                  onChange={(e) => handleInputChange('grantPeriodEnd', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Eligibility & Requirements */}
          <div className="grants-form-section">
            <div className="grants-form-section-header">
              <h2 className="grants-form-section-title">
                <Icon.Requirements />
                Eligibility & Requirements
              </h2>
              <p className="grants-form-section-subtitle">
                Funder requirements and restrictions
              </p>
            </div>

            <div className="grants-form-grid">
              <div className="grants-form-group">
                <label className="grants-form-label">Eligibility Requirements</label>
                <div className="grants-form-checkbox-group">
                  {eligibilityRequirements.map(requirement => (
                    <label key={requirement} className="grants-form-checkbox-label">
                      <input
                        type="checkbox"
                        className="grants-form-checkbox"
                        checked={formData.eligibilityRequirements.includes(requirement)}
                        onChange={(e) => handleCheckboxChange('eligibilityRequirements', requirement, e.target.checked)}
                      />
                      {requirement}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grants-form-group">
                <label className="grants-form-label">Reporting Requirements</label>
                <div className="grants-form-checkbox-group">
                  {reportingRequirements.map(requirement => (
                    <label key={requirement} className="grants-form-checkbox-label">
                      <input
                        type="checkbox"
                        className="grants-form-checkbox"
                        checked={formData.reportingRequirements.includes(requirement)}
                        onChange={(e) => handleCheckboxChange('reportingRequirements', requirement, e.target.checked)}
                      />
                      {requirement}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grants-form-group grants-form-group-full">
                <label className="grants-form-label">Funder Priorities & Interests</label>
                <textarea
                  className="grants-form-textarea"
                  placeholder="Describe the funder's specific priorities, focus areas, and interests"
                  value={formData.funderPriorities.join(', ')}
                  onChange={(e) => handleInputChange('funderPriorities', e.target.value.split(', '))}
                />
              </div>

              <div className="grants-form-group grants-form-group-full">
                <label className="grants-form-label">Restrictions & Limitations</label>
                <textarea
                  className="grants-form-textarea"
                  placeholder="List any restrictions on fund usage, geographic limitations, etc."
                  value={formData.restrictions.join(', ')}
                  onChange={(e) => handleInputChange('restrictions', e.target.value.split(', '))}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Project Proposal */}
          <div className="grants-form-section">
            <div className="grants-form-section-header">
              <h2 className="grants-form-section-title">
                <Icon.Program />
                Project Proposal
              </h2>
              <p className="grants-form-section-subtitle">
                Detailed project description and plan
              </p>
            </div>

            <div className="grants-form-grid">
              <div className="grants-form-group grants-form-group-full">
                <label className="grants-form-label grants-form-label-required">
                  Project Title
                </label>
                <input
                  type="text"
                  className="grants-form-input"
                  placeholder="Specific project title"
                  value={formData.projectTitle}
                  onChange={(e) => handleInputChange('projectTitle', e.target.value)}
                />
              </div>

              <div className="grants-form-group grants-form-group-full">
                <label className="grants-form-label grants-form-label-required">
                  Executive Summary
                </label>
                <textarea
                  className="grants-form-textarea"
                  placeholder="Brief overview of the project (2-3 paragraphs)"
                  rows="4"
                  value={formData.projectSummary}
                  onChange={(e) => handleInputChange('projectSummary', e.target.value)}
                />
              </div>

              <div className="grants-form-group grants-form-group-full">
                <label className="grants-form-label grants-form-label-required">
                  Problem Statement & Needs Assessment
                </label>
                <textarea
                  className="grants-form-textarea"
                  placeholder="Describe the problem being addressed and evidence of need"
                  rows="5"
                  value={formData.problemStatement}
                  onChange={(e) => handleInputChange('problemStatement', e.target.value)}
                />
              </div>

              {/* Goals & Objectives */}
              <div className="grants-form-group grants-form-group-full">
                <label className="grants-form-label grants-form-label-required">
                  Goals & Objectives
                </label>
                <div className="grants-form-array-items">
                  {formData.goalsObjectives.map((goalObj, index) => (
                    <div key={index} className="grants-form-array-item">
                      <div className="grants-form-array-item-content">
                        <strong>Goal {index + 1}:</strong> {goalObj.goal}
                        <br />
                        <strong>Objective:</strong> {goalObj.objective}
                      </div>
                      <button
                        type="button"
                        className="grants-form-remove-btn"
                        onClick={() => removeGoal(index)}
                      >
                        <Icon.Remove />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="grants-form-array-inputs">
                  <input
                    type="text"
                    className="grants-form-input"
                    placeholder="Goal"
                    value={newGoal.goal}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, goal: e.target.value }))}
                  />
                  <input
                    type="text"
                    className="grants-form-input"
                    placeholder="Specific, measurable objective"
                    value={newGoal.objective}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, objective: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="grants-form-add-btn"
                    onClick={addGoal}
                  >
                    <Icon.Add />
                    Add Goal
                  </button>
                </div>
              </div>

              <div className="grants-form-group grants-form-group-full">
                <label className="grants-form-label grants-form-label-required">
                  Methodology & Approach
                </label>
                <textarea
                  className="grants-form-textarea"
                  placeholder="Describe how you will achieve the objectives, activities, and approach"
                  rows="6"
                  value={formData.methodology}
                  onChange={(e) => handleInputChange('methodology', e.target.value)}
                />
              </div>

              <div className="grants-form-group grants-form-group-full">
                <label className="grants-form-label grants-form-label-required">
                  Evaluation Plan
                </label>
                <textarea
                  className="grants-form-textarea"
                  placeholder="How will you measure success and outcomes?"
                  rows="4"
                  value={formData.evaluationPlan}
                  onChange={(e) => handleInputChange('evaluationPlan', e.target.value)}
                />
              </div>

              <div className="grants-form-group grants-form-group-full">
                <label className="grants-form-label">
                  Sustainability Plan
                </label>
                <textarea
                  className="grants-form-textarea"
                  placeholder="How will the project continue after grant funding ends?"
                  rows="4"
                  value={formData.sustainabilityPlan}
                  onChange={(e) => handleInputChange('sustainabilityPlan', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 5: Detailed Budget */}
          <div className="grants-form-section">
            <div className="grants-form-section-header">
              <h2 className="grants-form-section-title">
                <Icon.Budget />
                Detailed Budget
              </h2>
              <p className="grants-form-section-subtitle">
                Itemized budget with justifications
              </p>
            </div>

            {formData.budgetItems.map((item, index) => (
              <div key={index} className="grants-form-budget-item">
                <div className="grants-form-budget-header">
                  <h3 className="grants-form-budget-title">Budget Item {index + 1}</h3>
                  {formData.budgetItems.length > 1 && (
                    <button
                      type="button"
                      className="grants-form-remove-btn"
                      onClick={() => removeBudgetItem(index)}
                    >
                      <Icon.Remove />
                      Remove
                    </button>
                  )}
                </div>

                <div className="grants-form-grid">
                  <div className="grants-form-group">
                    <label className="grants-form-label grants-form-label-required">
                      Category
                    </label>
                    <select
                      className="grants-form-select"
                      value={item.category}
                      onChange={(e) => updateBudgetItem(index, 'category', e.target.value)}
                    >
                      <option value="">Select Category</option>
                      {budgetCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grants-form-group">
                    <label className="grants-form-label grants-form-label-required">
                      Amount
                    </label>
                    <input
                      type="text"
                      className="grants-form-input"
                      placeholder="$0.00"
                      value={item.amount}
                      onChange={(e) => updateBudgetItem(index, 'amount', e.target.value)}
                    />
                  </div>

                  <div className="grants-form-group grants-form-group-full">
                    <label className="grants-form-label grants-form-label-required">
                      Description
                    </label>
                    <input
                      type="text"
                      className="grants-form-input"
                      placeholder="Detailed description of expense"
                      value={item.description}
                      onChange={(e) => updateBudgetItem(index, 'description', e.target.value)}
                    />
                  </div>

                  <div className="grants-form-group grants-form-group-full">
                    <label className="grants-form-label grants-form-label-required">
                      Justification
                    </label>
                    <textarea
                      className="grants-form-textarea"
                      placeholder="Explain why this expense is necessary for the project"
                      rows="3"
                      value={item.justification}
                      onChange={(e) => updateBudgetItem(index, 'justification', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="grants-form-budget-total">
              <strong>Total Budget: ${calculateTotalBudget().toLocaleString()}</strong>
            </div>

            <button type="button" className="grants-form-add-btn" onClick={addBudgetItem}>
              <Icon.Add />
              Add Budget Item
            </button>
          </div>

          {/* Section 6: Team & Partners */}
          <div className="grants-form-section">
            <div className="grants-form-section-header">
              <h2 className="grants-form-section-title">
                <Icon.Contact />
                Project Team & Partners
              </h2>
              <p className="grants-form-section-subtitle">
                Key personnel and collaborating organizations
              </p>
            </div>

            <div className="grants-form-grid">
              <div className="grants-form-group">
                <label className="grants-form-label grants-form-label-required">
                  Project Director
                </label>
                <input
                  type="text"
                  className="grants-form-input"
                  placeholder="Name of project director"
                  value={formData.projectDirector}
                  onChange={(e) => handleInputChange('projectDirector', e.target.value)}
                />
              </div>

              {/* Key Personnel */}
              <div className="grants-form-group grants-form-group-full">
                <label className="grants-form-label">Key Personnel</label>
                <div className="grants-form-array-items">
                  {formData.keyPersonnel.map((person, index) => (
                    <div key={index} className="grants-form-array-item">
                      <div className="grants-form-array-item-content">
                        <strong>{person.name}</strong> - {person.role}
                      </div>
                      <button
                        type="button"
                        className="grants-form-remove-btn"
                        onClick={() => removePersonnel(index)}
                      >
                        <Icon.Remove />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="grants-form-array-inputs">
                  <input
                    type="text"
                    className="grants-form-input"
                    placeholder="Name"
                    value={newPersonnel.name}
                    onChange={(e) => setNewPersonnel(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <input
                    type="text"
                    className="grants-form-input"
                    placeholder="Role"
                    value={newPersonnel.role}
                    onChange={(e) => setNewPersonnel(prev => ({ ...prev, role: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="grants-form-add-btn"
                    onClick={addPersonnel}
                  >
                    <Icon.Add />
                    Add
                  </button>
                </div>
              </div>

              {/* Partners */}
              <div className="grants-form-group grants-form-group-full">
                <label className="grants-form-label">Collaborating Partners</label>
                <div className="grants-form-array-items">
                  {formData.partners.map((partner, index) => (
                    <div key={index} className="grants-form-array-item">
                      <div className="grants-form-array-item-content">
                        <strong>{partner.name}</strong> - {partner.contribution}
                      </div>
                      <button
                        type="button"
                        className="grants-form-remove-btn"
                        onClick={() => removePartner(index)}
                      >
                        <Icon.Remove />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="grants-form-array-inputs">
                  <input
                    type="text"
                    className="grants-form-input"
                    placeholder="Partner organization"
                    value={newPartner.name}
                    onChange={(e) => setNewPartner(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <input
                    type="text"
                    className="grants-form-input"
                    placeholder="Contribution/role"
                    value={newPartner.contribution}
                    onChange={(e) => setNewPartner(prev => ({ ...prev, contribution: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="grants-form-add-btn"
                    onClick={addPartner}
                  >
                    <Icon.Add />
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 7: Required Documents */}
          <div className="grants-form-section">
            <div className="grants-form-section-header">
              <h2 className="grants-form-section-title">
                <Icon.Attachment />
                Required Documents & Attachments
              </h2>
              <p className="grants-form-section-subtitle">
                Upload all required supporting documents
              </p>
            </div>

            {formData.requiredDocuments.map((document, index) => (
              <div key={index} className="grants-form-document-item">
                <div className="grants-form-document-header">
                  <h3 className="grants-form-document-title">Document {index + 1}</h3>
                  {formData.requiredDocuments.length > 1 && (
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
                    <label className="grants-form-label">Document Type</label>
                    <select
                      className="grants-form-select"
                      value={document.documentType}
                      onChange={(e) => updateDocument(index, 'documentType', e.target.value)}
                    >
                      <option value="">Select Type</option>
                      {documentTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grants-form-group">
                    <label className="grants-form-label">Document Name</label>
                    <input
                      type="text"
                      className="grants-form-input"
                      placeholder="Descriptive name"
                      value={document.documentName}
                      onChange={(e) => updateDocument(index, 'documentName', e.target.value)}
                    />
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

          {/* Section 8: Additional Information */}
          <div className="grants-form-section">
            <div className="grants-form-section-header">
              <h2 className="grants-form-section-title">
                Additional Information
              </h2>
            </div>

            <div className="grants-form-grid">
              <div className="grants-form-group grants-form-group-full">
                <label className="grants-form-label">Internal Notes</label>
                <textarea
                  className="grants-form-textarea"
                  placeholder="Any additional information, special requirements, or internal comments"
                  value={formData.internalNotes}
                  onChange={(e) => handleInputChange('internalNotes', e.target.value)}
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