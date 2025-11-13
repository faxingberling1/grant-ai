// frontend/src/components/Dashboard/Submissions/Submissions.js
import React, { useState, useEffect } from 'react';
import SubmissionList from './SubmissionList';
import SubmissionDetails from './SubmissionDetails';
import SubmissionForm from './SubmissionForm';
import './Submissions.css';

const Submissions = () => {
  const [view, setView] = useState('list'); // 'list', 'details', 'create', 'edit'
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Enhanced mock data with more realistic submissions
  useEffect(() => {
    const mockSubmissions = [
      {
        id: '1',
        grantId: 'grant-1',
        grantTitle: 'Education Technology Initiative',
        clientName: 'Tech4Kids Foundation',
        funder: 'National Education Foundation',
        submittedDate: '2024-01-15',
        status: 'submitted',
        amount: 50000,
        decisionDate: '2024-03-15',
        notes: 'Initial submission completed with all required documents. Waiting for review committee meeting scheduled for March 10th.',
        stage: 'under_review',
        priority: 'high',
        contactPerson: 'Dr. Sarah Johnson',
        contactEmail: 's.johnson@nef.org',
        nextFollowUp: '2024-02-20',
        documents: [
          { name: 'Proposal Document.pdf', type: 'pdf', size: '2.4 MB', uploaded: '2024-01-14' },
          { name: 'Budget Spreadsheet.xlsx', type: 'excel', size: '1.2 MB', uploaded: '2024-01-14' }
        ],
        timeline: [
          { event: 'Draft Created', date: '2024-01-10', status: 'completed', description: 'Initial draft prepared by grant writer' },
          { event: 'Internal Review', date: '2024-01-12', status: 'completed', description: 'Reviewed by program director' },
          { event: 'Submitted', date: '2024-01-15', status: 'completed', description: 'Submitted to funding organization' },
          { event: 'Under Review', date: '2024-02-01', status: 'current', description: 'Currently being reviewed by committee' },
          { event: 'Decision', date: '2024-03-15', status: 'upcoming', description: 'Expected decision date' }
        ]
      },
      {
        id: '2',
        grantId: 'grant-2',
        grantTitle: 'Community Health Program',
        clientName: 'Healthy Communities Inc.',
        funder: 'State Health Department',
        submittedDate: '2024-01-10',
        status: 'approved',
        amount: 75000,
        decisionDate: '2024-02-20',
        notes: 'Grant approved with full funding. Contract signing scheduled for next week.',
        stage: 'completed',
        priority: 'medium',
        contactPerson: 'Michael Chen',
        contactEmail: 'm.chen@healthdept.gov',
        nextFollowUp: '2024-03-01',
        documents: [
          { name: 'Final Proposal.pdf', type: 'pdf', size: '3.1 MB', uploaded: '2024-01-09' },
          { name: 'Budget Details.xlsx', type: 'excel', size: '0.8 MB', uploaded: '2024-01-09' },
          { name: 'Organization Profile.pdf', type: 'pdf', size: '1.5 MB', uploaded: '2024-01-09' }
        ],
        timeline: [
          { event: 'Draft Created', date: '2024-01-05', status: 'completed', description: 'Initial draft prepared' },
          { event: 'Submitted', date: '2024-01-10', status: 'completed', description: 'Submitted to State Health Department' },
          { event: 'Approved', date: '2024-02-20', status: 'completed', description: 'Grant approved with full funding' }
        ]
      },
      {
        id: '3',
        grantId: 'grant-3',
        grantTitle: 'Environmental Conservation Project',
        clientName: 'Green Earth Alliance',
        funder: 'EcoFuture Foundation',
        submittedDate: null,
        status: 'draft',
        amount: 120000,
        decisionDate: null,
        notes: 'Draft in progress - need to attach financial statements and environmental impact assessment.',
        stage: 'draft',
        priority: 'high',
        contactPerson: 'Emily Rodriguez',
        contactEmail: 'e.rodriguez@ecofuture.org',
        nextFollowUp: '2024-02-25',
        documents: [
          { name: 'Draft Proposal.docx', type: 'word', size: '1.8 MB', uploaded: '2024-02-15' }
        ],
        timeline: [
          { event: 'Draft Created', date: '2024-02-15', status: 'current', description: 'Working on finalizing proposal' },
          { event: 'Internal Review', date: '2024-02-25', status: 'upcoming', description: 'Scheduled for board review' },
          { event: 'Submission', date: '2024-03-10', status: 'upcoming', description: 'Target submission date' }
        ]
      },
      {
        id: '4',
        grantId: 'grant-4',
        grantTitle: 'Arts Education Outreach',
        clientName: 'Creative Youth Collective',
        funder: 'Arts Council National',
        submittedDate: '2024-01-20',
        status: 'rejected',
        amount: 45000,
        decisionDate: '2024-02-28',
        notes: 'Application rejected due to budget constraints. Encouraged to reapply next funding cycle.',
        stage: 'completed',
        priority: 'low',
        contactPerson: 'David Thompson',
        contactEmail: 'd.thompson@artscouncil.org',
        nextFollowUp: '2024-06-01',
        documents: [
          { name: 'Arts Proposal.pdf', type: 'pdf', size: '2.1 MB', uploaded: '2024-01-19' },
          { name: 'Program Budget.xlsx', type: 'excel', size: '0.9 MB', uploaded: '2024-01-19' }
        ],
        timeline: [
          { event: 'Submitted', date: '2024-01-20', status: 'completed', description: 'Application submitted' },
          { event: 'Under Review', date: '2024-02-01', status: 'completed', description: 'Reviewed by arts committee' },
          { event: 'Rejected', date: '2024-02-28', status: 'completed', description: 'Not funded this cycle' }
        ]
      },
      {
        id: '5',
        grantId: 'grant-5',
        grantTitle: 'STEM Workforce Development',
        clientName: 'Future Innovators Inc.',
        funder: 'TechGrowth Foundation',
        submittedDate: '2024-02-01',
        status: 'submitted',
        amount: 150000,
        decisionDate: '2024-04-15',
        notes: 'Strong application with excellent community partnerships. Follow-up meeting scheduled with program officer.',
        stage: 'under_review',
        priority: 'high',
        contactPerson: 'Dr. Lisa Wang',
        contactEmail: 'l.wang@techgrowth.org',
        nextFollowUp: '2024-03-05',
        documents: [
          { name: 'STEM Proposal.pdf', type: 'pdf', size: '4.2 MB', uploaded: '2024-01-31' },
          { name: 'Partnership Letters.pdf', type: 'pdf', size: '1.8 MB', uploaded: '2024-01-31' },
          { name: 'Detailed Budget.xlsx', type: 'excel', size: '1.5 MB', uploaded: '2024-01-31' }
        ],
        timeline: [
          { event: 'Submitted', date: '2024-02-01', status: 'completed', description: 'Application submitted' },
          { event: 'Initial Screening', date: '2024-02-15', status: 'completed', description: 'Passed initial screening' },
          { event: 'Program Officer Review', date: '2024-03-05', status: 'current', description: 'Scheduled meeting with program officer' },
          { event: 'Final Decision', date: '2024-04-15', status: 'upcoming', description: 'Board decision expected' }
        ]
      }
    ];
    
    setSubmissions(mockSubmissions);
    setLoading(false);
  }, []);

  const handleViewSubmission = (submission) => {
    setSelectedSubmission(submission);
    setView('details');
  };

  const handleEditSubmission = (submission) => {
    setSelectedSubmission(submission);
    setView('edit');
  };

  const handleCreateSubmission = () => {
    setSelectedSubmission(null);
    setView('create');
  };

  const handleSaveSubmission = (submissionData) => {
    if (submissionData.id) {
      setSubmissions(prev => prev.map(sub => 
        sub.id === submissionData.id ? submissionData : sub
      ));
    } else {
      const newSubmission = {
        ...submissionData,
        id: Date.now().toString(),
        timeline: [
          { event: 'Draft Created', date: new Date().toISOString().split('T')[0], status: 'completed', description: 'New submission created' }
        ]
      };
      setSubmissions(prev => [...prev, newSubmission]);
    }
    setView('list');
  };

  const handleDeleteSubmission = (submissionId) => {
    setSubmissions(prev => prev.filter(sub => sub.id !== submissionId));
    setView('list');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedSubmission(null);
  };

  const handleUpdateStatus = (submissionId, newStatus) => {
    setSubmissions(prev => prev.map(sub => 
      sub.id === submissionId ? { ...sub, status: newStatus } : sub
    ));
  };

  // Filter and search submissions
  const filteredSubmissions = submissions.filter(submission => {
    const matchesFilter = filter === 'all' || submission.status === filter;
    const matchesSearch = searchQuery === '' || 
      submission.grantTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.funder.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Calculate statistics
  const stats = {
    total: submissions.length,
    draft: submissions.filter(s => s.status === 'draft').length,
    submitted: submissions.filter(s => s.status === 'submitted').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
    highPriority: submissions.filter(s => s.priority === 'high').length
  };

  if (loading) {
    return (
      <div className="submissions-loading">
        <div className="loading-icon">📋</div>
        <p>Loading Submissions...</p>
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="submissions-container">
      {view === 'list' && (
        <SubmissionList
          submissions={filteredSubmissions}
          stats={stats}
          onViewSubmission={handleViewSubmission}
          onEditSubmission={handleEditSubmission}
          onCreateSubmission={handleCreateSubmission}
          onDeleteSubmission={handleDeleteSubmission}
          onUpdateStatus={handleUpdateStatus}
          filter={filter}
          onFilterChange={setFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}

      {view === 'details' && selectedSubmission && (
        <SubmissionDetails
          submission={selectedSubmission}
          onBack={handleBackToList}
          onEdit={() => setView('edit')}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {(view === 'create' || view === 'edit') && (
        <SubmissionForm
          submission={view === 'edit' ? selectedSubmission : null}
          onSave={handleSaveSubmission}
          onCancel={handleBackToList}
          mode={view}
        />
      )}
    </div>
  );
};

export default Submissions;