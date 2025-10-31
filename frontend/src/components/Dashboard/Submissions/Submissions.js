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

  // Mock data
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
        notes: 'Initial submission completed with all required documents',
        stage: 'under_review',
        priority: 'high'
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
        notes: 'Grant approved with full funding',
        stage: 'completed',
        priority: 'medium'
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
        notes: 'Draft in progress - need to attach financial statements',
        stage: 'draft',
        priority: 'high'
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
        id: Date.now().toString()
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

  const filteredSubmissions = submissions.filter(submission => {
    if (filter === 'all') return true;
    return submission.status === filter;
  });

  if (loading) {
    return (
      <div className="submissions-loading">
        <i className="fas fa-spinner"></i>
        <p>Loading submissions...</p>
      </div>
    );
  }

  return (
    <div className="submissions-container">
      {view === 'list' && (
        <SubmissionList
          submissions={filteredSubmissions}
          onViewSubmission={handleViewSubmission}
          onEditSubmission={handleEditSubmission}
          onCreateSubmission={handleCreateSubmission}
          onDeleteSubmission={handleDeleteSubmission}
          filter={filter}
          onFilterChange={setFilter}
        />
      )}

      {view === 'details' && selectedSubmission && (
        <SubmissionDetails
          submission={selectedSubmission}
          onBack={handleBackToList}
          onEdit={() => setView('edit')}
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