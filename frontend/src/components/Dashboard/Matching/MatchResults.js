// frontend/src/components/Dashboard/Matching/MatchResults.js
import React from 'react';

const MatchResults = ({ client, matches, analysis, onViewRecommendations, onNewAnalysis, loading }) => {
  const getMatchLevel = (score) => {
    if (score >= 90) return { level: 'Excellent', color: '#10b981' };
    if (score >= 80) return { level: 'Strong', color: '#3b82f6' };
    if (score >= 70) return { level: 'Good', color: '#f59e0b' };
    return { level: 'Fair', color: '#6b7280' };
  };

  const formatAmount = (amountString) => {
    return amountString.replace(/\$/g, '');
  };

  const daysUntilDeadline = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    return Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="loading-results">
        <div className="loading-content">
          <i className="fas fa-robot fa-spin"></i>
          <h3>AI Analysis in Progress</h3>
          <p>Analyzing {client.name}'s profile against funding database...</p>
          <div className="loading-steps">
            <div className="loading-step active">
              <i className="fas fa-check"></i>
              <span>Client Profile Analysis</span>
            </div>
            <div className="loading-step active">
              <i className="fas fa-spinner fa-spin"></i>
              <span>Grant Source Matching</span>
            </div>
            <div className="loading-step">
              <i className="fas fa-clock"></i>
              <span>Generating Recommendations</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="match-results">
      {/* Header */}
      <div className="results-header">
        <div className="header-content">
          <div className="header-title">
            <button className="btn-back" onClick={onNewAnalysis}>
              <i className="fas fa-arrow-left"></i>
              New Analysis
            </button>
            <div>
              <h1>Match Results for {client.name}</h1>
              <p>AI-powered analysis of funding opportunities</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={onViewRecommendations}>
              <i className="fas fa-chart-line"></i>
              View Strategic Recommendations
            </button>
          </div>
        </div>
      </div>

      {/* Results Content */}
      <div className="results-content">
        {/* Summary Stats */}
        <div className="results-summary">
          <div className="summary-card">
            <h3>Analysis Summary</h3>
            <div className="summary-stats">
              <div className="summary-stat">
                <div className="stat-value">{matches.length}</div>
                <div className="stat-label">Total Matches</div>
              </div>
              <div className="summary-stat">
                <div className="stat-value">
                  {matches.filter(m => m.matchScore >= 80).length}
                </div>
                <div className="stat-label">Strong Matches</div>
              </div>
              <div className="summary-stat">
                <div className="stat-value">
                  ${matches.reduce((total, match) => {
                    const amount = match.grant.amount.match(/\$?([\d,]+)/g);
                    if (amount) {
                      const maxAmount = Math.max(...amount.map(a => parseInt(a.replace(/[$,]/g, ''))));
                      return total + maxAmount;
                    }
                    return total;
                  }, 0).toLocaleString()}
                </div>
                <div className="stat-label">Total Funding</div>
              </div>
              <div className="summary-stat">
                <div className="stat-value">
                  {Math.round(matches.reduce((acc, match) => acc + match.matchScore, 0) / matches.length)}%
                </div>
                <div className="stat-label">Avg Match Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Client Analysis */}
        <div className="client-analysis">
          <h3>Client Strengths & Opportunities</h3>
          <div className="analysis-grid">
            <div className="analysis-card strengths">
              <h4>Key Strengths</h4>
              <ul>
                {analysis.clientStrengths.map((strength, index) => (
                  <li key={index}>
                    <i className="fas fa-check-circle"></i>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
            <div className="analysis-card opportunities">
              <h4>Growth Opportunities</h4>
              <ul>
                {analysis.improvementAreas.map((area, index) => (
                  <li key={index}>
                    <i className="fas fa-lightbulb"></i>
                    {area}
                  </li>
                ))}
              </ul>
            </div>
            <div className="analysis-card factors">
              <h4>Match Factors</h4>
              <ul>
                {analysis.matchFactors.map((factor, index) => (
                  <li key={index}>
                    <i className="fas fa-star"></i>
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Top Matches */}
        <div className="top-matches">
          <h3>Top Grant Matches</h3>
          <div className="matches-grid">
            {matches.slice(0, 6).map((match, index) => {
              const matchLevel = getMatchLevel(match.matchScore);
              const daysLeft = daysUntilDeadline(match.grant.deadline);
              
              return (
                <div key={match.grant.id} className="match-card">
                  <div className="match-header">
                    <div className="match-score">
                      <div 
                        className="score-circle"
                        style={{ 
                          background: `conic-gradient(${matchLevel.color} ${match.matchScore * 3.6}deg, #e5e7eb 0deg)` 
                        }}
                      >
                        <span>{match.matchScore}%</span>
                      </div>
                      <div className="match-level" style={{ color: matchLevel.color }}>
                        {matchLevel.level}
                      </div>
                    </div>
                    <div className="match-info">
                      <h4>{match.grant.title}</h4>
                      <div className="grant-source">{match.source.name}</div>
                      <div className="grant-amount">{formatAmount(match.grant.amount)}</div>
                    </div>
                  </div>

                  <div className="match-details">
                    <div className="detail-row">
                      <span className="label">Deadline:</span>
                      <span className={`value ${daysLeft < 30 ? 'urgent' : ''}`}>
                        {new Date(match.grant.deadline).toLocaleDateString()} 
                        ({daysLeft} days)
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Category:</span>
                      <span className="value">{match.grant.category}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Focus Areas:</span>
                      <span className="value">{match.grant.focusAreas.join(', ')}</span>
                    </div>
                  </div>

                  <div className="match-reasons">
                    <h5>Why it's a good match:</h5>
                    <ul>
                      {match.matchReasons.slice(0, 2).map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="match-actions">
                    <button className="btn btn-outline">
                      <i className="fas fa-eye"></i>
                      View Details
                    </button>
                    <button className="btn btn-primary">
                      <i className="fas fa-paper-plane"></i>
                      Start Application
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Plan */}
        <div className="action-plan">
          <h3>Recommended Next Steps</h3>
          <div className="plan-steps">
            <div className="plan-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Prioritize Top 3 Matches</h4>
                <p>Focus on grants with 85%+ match scores and approaching deadlines</p>
              </div>
            </div>
            <div className="plan-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Review Eligibility Requirements</h4>
                <p>Ensure all documentation and prerequisites are in order</p>
              </div>
            </div>
            <div className="plan-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Develop Application Timeline</h4>
                <p>Create detailed schedule for proposal development</p>
              </div>
            </div>
          </div>
        </div>

        {/* View All Matches */}
        {matches.length > 6 && (
          <div className="view-all-section">
            <button className="btn btn-outline">
              <i className="fas fa-list"></i>
              View All {matches.length} Matches
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchResults;