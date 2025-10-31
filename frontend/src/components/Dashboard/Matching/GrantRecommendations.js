// frontend/src/components/Dashboard/Matching/GrantRecommendations.js
import React from 'react';

const GrantRecommendations = ({ client, matches, analysis, onBackToResults, onNewAnalysis }) => {
  const getPriorityMatches = () => {
    return matches
      .filter(match => match.matchScore >= 80)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);
  };

  const getTimelineMatches = () => {
    return matches
      .filter(match => {
        const deadline = new Date(match.grant.deadline);
        const today = new Date();
        const daysUntil = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
        return daysUntil <= 90; // Within 3 months
      })
      .sort((a, b) => new Date(a.grant.deadline) - new Date(b.grant.deadline));
  };

  const getStrategicMatches = () => {
    return matches
      .filter(match => match.grant.amount.includes('000,000')) // Major grants
      .sort((a, b) => {
        const amountA = Math.max(...a.grant.amount.match(/\d+/g).map(Number));
        const amountB = Math.max(...b.grant.amount.match(/\d+/g).map(Number));
        return amountB - amountA;
      });
  };

  return (
    <div className="grant-recommendations">
      {/* Header */}
      <div className="recommendations-header">
        <div className="header-content">
          <div className="header-title">
            <button className="btn-back" onClick={onBackToResults}>
              <i className="fas fa-arrow-left"></i>
              Back to Results
            </button>
            <div>
              <h1>Strategic Recommendations for {client.name}</h1>
              <p>AI-powered funding strategy and application roadmap</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn btn-outline" onClick={onNewAnalysis}>
              <i className="fas fa-sync"></i>
              New Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Recommendations Content */}
      <div className="recommendations-content">
        {/* Executive Summary */}
        <div className="executive-summary">
          <h3>Executive Summary</h3>
          <div className="summary-content">
            <div className="summary-text">
              <p>
                Based on our AI analysis of {client.name}'s profile, we've identified{' '}
                <strong>{matches.length} strong funding opportunities</strong> with a total potential 
                funding value of approximately{' '}
                <strong>$
                  {matches.reduce((total, match) => {
                    const amounts = match.grant.amount.match(/\$?([\d,]+)/g);
                    if (amounts) {
                      const maxAmount = Math.max(...amounts.map(a => parseInt(a.replace(/[$,]/g, ''))));
                      return total + maxAmount;
                    }
                    return total;
                  }, 0).toLocaleString()}
                </strong>. The analysis reveals excellent alignment in {client.category} funding space 
                with several immediate opportunities for application.
              </p>
            </div>
            <div className="summary-stats">
              <div className="summary-stat">
                <div className="stat-value">{getPriorityMatches().length}</div>
                <div className="stat-label">Priority Grants</div>
              </div>
              <div className="summary-stat">
                <div className="stat-value">{getTimelineMatches().length}</div>
                <div className="stat-label">Urgent Deadlines</div>
              </div>
              <div className="summary-stat">
                <div className="stat-value">{getStrategicMatches().length}</div>
                <div className="stat-label">Major Opportunities</div>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Recommendations */}
        <div className="priority-recommendations">
          <h3>Priority Grant Recommendations</h3>
          <p className="section-description">
            These opportunities represent the strongest matches based on mission alignment, 
            funding amount, and application timeline.
          </p>
          
          <div className="priority-grid">
            {getPriorityMatches().map((match, index) => (
              <div key={match.grant.id} className="priority-card">
                <div className="priority-badge">#{index + 1} Priority</div>
                <div className="card-header">
                  <h4>{match.grant.title}</h4>
                  <div className="match-score">{match.matchScore}% Match</div>
                </div>
                <div className="card-details">
                  <div className="detail">
                    <i className="fas fa-building"></i>
                    <span>{match.source.name}</span>
                  </div>
                  <div className="detail">
                    <i className="fas fa-money-bill-wave"></i>
                    <span>{match.grant.amount}</span>
                  </div>
                  <div className="detail">
                    <i className="fas fa-calendar"></i>
                    <span>
                      {new Date(match.grant.deadline).toLocaleDateString()} 
                      ({Math.ceil((new Date(match.grant.deadline) - new Date()) / (1000 * 60 * 60 * 24))} days)
                    </span>
                  </div>
                </div>
                <div className="recommendation-reasons">
                  <h5>Why Prioritize This Grant:</h5>
                  <ul>
                    {match.matchReasons.slice(0, 3).map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
                <div className="action-plan">
                  <h5>Recommended Action Plan:</h5>
                  <ol>
                    {match.actionSteps.slice(0, 3).map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>
                <div className="card-actions">
                  <button className="btn btn-primary">
                    <i className="fas fa-rocket"></i>
                    Start Application
                  </button>
                  <button className="btn btn-outline">
                    <i className="fas fa-clock"></i>
                    Schedule Planning
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Strategy */}
        <div className="timeline-strategy">
          <h3>Application Timeline Strategy</h3>
          <div className="timeline-container">
            {getTimelineMatches().map((match, index) => (
              <div key={match.grant.id} className="timeline-item">
                <div className="timeline-marker">
                  <div className="marker-icon">{index + 1}</div>
                  <div className="timeline-connector"></div>
                </div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <h4>{match.grant.title}</h4>
                    <span className="timeline-deadline">
                      Due: {new Date(match.grant.deadline).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="timeline-details">
                    <span className="grant-amount">{match.grant.amount}</span>
                    <span className="grant-source">{match.source.name}</span>
                    <span className="match-score">{match.matchScore}% Match</span>
                  </div>
                  <div className="timeline-steps">
                    {match.timeline.map((step, stepIndex) => (
                      <div key={stepIndex} className="timeline-step">
                        <i className="fas fa-check-circle"></i>
                        <span>{step.step}</span>
                        <span className="step-due">{step.due}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Opportunities */}
        <div className="strategic-opportunities">
          <h3>Long-term Strategic Opportunities</h3>
          <div className="strategic-grid">
            {getStrategicMatches().map((match, index) => (
              <div key={match.grant.id} className="strategic-card">
                <div className="strategic-badge">Major Grant</div>
                <h4>{match.grant.title}</h4>
                <div className="strategic-details">
                  <div className="detail">
                    <strong>Funding:</strong> {match.grant.amount}
                  </div>
                  <div className="detail">
                    <strong>Deadline:</strong> {new Date(match.grant.deadline).toLocaleDateString()}
                  </div>
                  <div className="detail">
                    <strong>Match Score:</strong> {match.matchScore}%
                  </div>
                </div>
                <div className="strategic-analysis">
                  <h5>Strategic Value:</h5>
                  <p>
                    This represents a major funding opportunity that could significantly 
                    expand {client.name}'s capacity and impact in {client.category}. 
                    The large funding amount aligns well with organizational growth objectives.
                  </p>
                </div>
                <div className="preparation-timeline">
                  <h5>Preparation Timeline:</h5>
                  <div className="preparation-steps">
                    <div className="prep-step">
                      <span className="step-time">3-6 months before</span>
                      <span className="step-action">Capacity assessment</span>
                    </div>
                    <div className="prep-step">
                      <span className="step-time">2-3 months before</span>
                      <span className="step-action">Partnership development</span>
                    </div>
                    <div className="prep-step">
                      <span className="step-time">1-2 months before</span>
                      <span className="step-action">Proposal development</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Capacity Building Recommendations */}
        <div className="capacity-building">
          <h3>Capacity Building Recommendations</h3>
          <div className="capacity-grid">
            <div className="capacity-card">
              <i className="fas fa-chart-line"></i>
              <h4>Track Record Development</h4>
              <p>Focus on building demonstrable outcomes in key focus areas to strengthen future applications</p>
              <ul>
                <li>Develop impact measurement systems</li>
                <li>Document success stories and case studies</li>
                <li>Collect client testimonials and data</li>
              </ul>
            </div>
            <div className="capacity-card">
              <i className="fas fa-handshake"></i>
              <h4>Partnership Strategy</h4>
              <p>Build strategic partnerships to enhance application competitiveness</p>
              <ul>
                <li>Identify complementary organizations</li>
                <li>Develop memorandum of understanding templates</li>
                <li>Establish collaborative project frameworks</li>
              </ul>
            </div>
            <div className="capacity-card">
              <i className="fas fa-file-alt"></i>
              <h4>Grant Writing Capacity</h4>
              <p>Strengthen internal grant development processes and resources</p>
              <ul>
                <li>Develop proposal templates and boilerplates</li>
                <li>Create budget development tools</li>
                <li>Establish review and approval workflows</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrantRecommendations;