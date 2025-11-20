  // frontend/src/components/Dashboard/Matching/MatchResults.js
  import React from 'react';
  import './MatchResults.css';

  const MatchResults = ({ 
    client, 
    matches, 
    analysis, 
    onViewRecommendations, 
    onNewAnalysis, 
    loading, 
    usingDemoData 
  }) => {
    // Safe data access helper functions
    const getClientName = () => {
      return client?.organizationName || client?.name || 'Unknown Organization';
    };

    const getClientCategory = () => {
      return client?.category || 'Not specified';
    };

    const getMatchScoreColor = (score) => {
      if (score >= 80) return '#27ae60'; // Green
      if (score >= 60) return '#f39c12'; // Orange
      return '#e74c3c'; // Red
    };

    const getMatchScoreLabel = (score) => {
      if (score >= 80) return 'Excellent';
      if (score >= 60) return 'Good';
      if (score >= 40) return 'Fair';
      return 'Poor';
    };

    const getSafeMatches = () => {
      if (!matches || !Array.isArray(matches)) {
        console.warn('Matches is not an array:', matches);
        return [];
      }
      return matches;
    };

    const getSafeAnalysis = () => {
      if (!analysis) {
        return {
          clientStrengths: [],
          improvementAreas: [],
          matchFactors: [],
          timeline: [],
          summary: 'Analysis not available',
          generatedAt: new Date().toISOString()
        };
      }
      return analysis;
    };

    const safeMatches = getSafeMatches();
    const safeAnalysis = getSafeAnalysis();

    if (loading) {
      return (
        <div className="match-results">
          <div className="loading-state">
            <div className="spinner"></div>
            <h3>Analyzing Grant Matches...</h3>
            <p>Our AI is finding the best funding opportunities for {getClientName()}</p>
          </div>
        </div>
      );
    }

    if (!client) {
      return (
        <div className="match-results">
          <div className="error-state">
            <h3>No Client Selected</h3>
            <p>Please select a client to analyze grant matches.</p>
            <button onClick={onNewAnalysis} className="btn-primary">
              Back to Client Selection
            </button>
          </div>
        </div>
      );
    }

    if (safeMatches.length === 0) {
      return (
        <div className="match-results">
          <div className="no-matches">
            <div className="no-matches-icon">🔍</div>
            <h3>No Strong Matches Found</h3>
            <p>We couldn't find strong grant matches for {getClientName()} based on current criteria.</p>
            <div className="suggestions">
              <h4>Suggestions:</h4>
              <ul>
                <li>Expand your program focus areas</li>
                <li>Consider different geographic scopes</li>
                <li>Explore partnerships for larger grants</li>
                <li>Update client information with more details</li>
              </ul>
            </div>
            <button onClick={onNewAnalysis} className="btn-primary">
              Analyze Different Client
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="match-results">
        <div className="results-header">
          <div className="header-content">
            <h2>Grant Match Results</h2>
            <p>AI-powered analysis for {getClientName()}</p>
            {usingDemoData && (
              <div className="demo-badge">
                <span>Demo Data</span>
              </div>
            )}
          </div>
          <div className="header-actions">
            <button onClick={onNewAnalysis} className="btn-secondary">
              Analyze Different Client
            </button>
            <button onClick={onViewRecommendations} className="btn-primary">
              View Recommendations
            </button>
          </div>
        </div>

        {/* Summary Section */}
        <div className="summary-section">
          <div className="summary-card">
            <h3>Analysis Summary</h3>
            <p className="summary-text">{safeAnalysis.summary}</p>
            <div className="summary-stats">
              <div className="stat">
                <span className="stat-number">{safeMatches.length}</span>
                <span className="stat-label">Total Matches</span>
              </div>
              <div className="stat">
                <span className="stat-number">
                  {safeMatches.filter(m => m.matchScore?.total >= 80).length}
                </span>
                <span className="stat-label">Excellent Matches</span>
              </div>
              <div className="stat">
                <span className="stat-number">
                  {safeMatches.filter(m => m.matchScore?.total >= 60).length}
                </span>
                <span className="stat-label">Good Matches</span>
              </div>
            </div>
          </div>
        </div>

        {/* Client Strengths & Improvements */}
        <div className="analysis-section">
          <div className="analysis-column">
            <h4>Organizational Strengths</h4>
            <div className="strengths-list">
              {safeAnalysis.clientStrengths && safeAnalysis.clientStrengths.length > 0 ? (
                safeAnalysis.clientStrengths.map((strength, index) => (
                  <div key={index} className="strength-item">
                    <span className="strength-icon">✅</span>
                    <span>{strength}</span>
                  </div>
                ))
              ) : (
                <div className="no-data">No specific strengths identified</div>
              )}
            </div>
          </div>
          <div className="analysis-column">
            <h4>Areas for Improvement</h4>
            <div className="improvements-list">
              {safeAnalysis.improvementAreas && safeAnalysis.improvementAreas.length > 0 ? (
                safeAnalysis.improvementAreas.map((area, index) => (
                  <div key={index} className="improvement-item">
                    <span className="improvement-icon">💡</span>
                    <span>{area}</span>
                  </div>
                ))
              ) : (
                <div className="no-data">No specific improvements needed</div>
              )}
            </div>
          </div>
        </div>

        {/* Match Factors */}
        {safeAnalysis.matchFactors && safeAnalysis.matchFactors.length > 0 && (
          <div className="factors-section">
            <h4>Key Match Factors</h4>
            <div className="factors-grid">
              {safeAnalysis.matchFactors.map((factor, index) => (
                <div key={index} className="factor-card">
                  <span className="factor-icon">🎯</span>
                  <span>{factor}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grant Matches */}
        <div className="matches-section">
          <h3>Recommended Grant Opportunities</h3>
          <div className="matches-grid">
            {safeMatches.map((match, index) => (
              <div key={index} className="match-card">
                <div className="match-header">
                  <div className="match-source">
                    <h4>{match.grant?.title || 'Unknown Grant'}</h4>
                    <p className="source-name">{match.source?.name || 'Unknown Source'}</p>
                  </div>
                  <div className="match-score">
                    <div 
                      className="score-circle"
                      style={{ 
                        background: `conic-gradient(${getMatchScoreColor(match.matchScore?.total)} ${match.matchScore?.total * 3.6}deg, #ecf0f1 0deg)` 
                      }}
                    >
                      <span className="score-value">{match.matchScore?.total || 0}%</span>
                    </div>
                    <span className="score-label">
                      {getMatchScoreLabel(match.matchScore?.total || 0)} Match
                    </span>
                  </div>
                </div>

                <div className="match-details">
                  <div className="detail-row">
                    <span className="detail-label">Amount:</span>
                    <span className="detail-value">{match.grant?.amount || 'Not specified'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Deadline:</span>
                    <span className="detail-value">
                      {match.grant?.deadline ? new Date(match.grant.deadline).toLocaleDateString() : 'Not specified'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Category:</span>
                    <span className="detail-value">{match.grant?.category || 'Not specified'}</span>
                  </div>
                </div>

                {/* Match Reasons */}
                {match.matchReasons && match.matchReasons.length > 0 && (
                  <div className="match-reasons">
                    <h5>Why this is a good match:</h5>
                    <ul>
                      {match.matchReasons.map((reason, reasonIndex) => (
                        <li key={reasonIndex}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Fit Analysis */}
                {match.fitAnalysis && (
                  <div className="fit-analysis">
                    <div className="fit-section">
                      <h5>Strengths</h5>
                      {match.fitAnalysis.strengths && match.fitAnalysis.strengths.length > 0 ? (
                        <ul>
                          {match.fitAnalysis.strengths.map((strength, strengthIndex) => (
                            <li key={strength} className="strength">✅ {strength}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="no-data">No specific strengths identified</p>
                      )}
                    </div>
                    
                    <div className="fit-section">
                      <h5>Considerations</h5>
                      {match.fitAnalysis.considerations && match.fitAnalysis.considerations.length > 0 ? (
                        <ul>
                          {match.fitAnalysis.considerations.map((consideration, considerationIndex) => (
                            <li key={consideration} className="consideration">⚠️ {consideration}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="no-data">No major considerations</p>
                      )}
                    </div>

                    <div className="fit-section">
                      <h5>Recommendations</h5>
                      {match.fitAnalysis.recommendations && match.fitAnalysis.recommendations.length > 0 ? (
                        <ul>
                          {match.fitAnalysis.recommendations.map((recommendation, recommendationIndex) => (
                            <li key={recommendation} className="recommendation">💡 {recommendation}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="no-data">No specific recommendations</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                {match.timeline && Array.isArray(match.timeline) && match.timeline.length > 0 && (
                  <div className="timeline-section">
                    <h5>Application Timeline</h5>
                    <div className="timeline">
                      {match.timeline.map((step, stepIndex) => (
                        <div key={stepIndex} className="timeline-step">
                          <div className="timeline-marker"></div>
                          <div className="timeline-content">
                            <span className="step-name">{step.step}</span>
                            <span className="step-due">Due: {step.due}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Steps */}
                {match.actionSteps && Array.isArray(match.actionSteps) && match.actionSteps.length > 0 && (
                  <div className="action-steps">
                    <h5>Next Steps</h5>
                    <ol>
                      {match.actionSteps.map((step, stepIndex) => (
                        <li key={stepIndex}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Score Breakdown */}
                {match.matchScore?.breakdown && (
                  <div className="score-breakdown">
                    <h5>Score Breakdown</h5>
                    <div className="breakdown-grid">
                      <div className="breakdown-item">
                        <span className="breakdown-label">Category:</span>
                        <span className="breakdown-value">{match.matchScore.breakdown.category}%</span>
                      </div>
                      <div className="breakdown-item">
                        <span className="breakdown-label">Budget:</span>
                        <span className="breakdown-value">{match.matchScore.breakdown.budget}%</span>
                      </div>
                      <div className="breakdown-item">
                        <span className="breakdown-label">Geographic:</span>
                        <span className="breakdown-value">{match.matchScore.breakdown.geographic}%</span>
                      </div>
                      <div className="breakdown-item">
                        <span className="breakdown-label">Population:</span>
                        <span className="breakdown-value">{match.matchScore.breakdown.population}%</span>
                      </div>
                      <div className="breakdown-item">
                        <span className="breakdown-label">Experience:</span>
                        <span className="breakdown-value">{match.matchScore.breakdown.experience}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="results-actions">
          <button onClick={onNewAnalysis} className="btn-secondary">
            Analyze Different Client
          </button>
          <button onClick={onViewRecommendations} className="btn-primary">
            View Detailed Recommendations
          </button>
        </div>
      </div>
    );
  };

  export default MatchResults;