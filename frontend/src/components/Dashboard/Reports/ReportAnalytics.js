import React from 'react';

const ReportAnalytics = ({ reports }) => {
  const analytics = {
    totalReports: reports.length,
    completedReports: reports.filter(r => r.status === 'completed').length,
    draftReports: reports.filter(r => r.status === 'draft').length,
    averageLength: reports.reduce((acc, report) => {
      const words = report.content ? report.content.split(/\s+/).length : 0;
      return acc + words;
    }, 0) / (reports.length || 1),
    recentActivity: reports
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
  };

  const reportTypes = reports.reduce((acc, report) => {
    const type = report.template?.category || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="report-analytics">
      <div className="analytics-header">
        <h2>Report Analytics</h2>
        <p>Insights and statistics about your reports</p>
      </div>

      <div className="analytics-overview">
        <div className="stat-card">
          <div className="stat-value">{analytics.totalReports}</div>
          <div className="stat-label">Total Reports</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{analytics.completedReports}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{analytics.draftReports}</div>
          <div className="stat-label">Drafts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{Math.round(analytics.averageLength)}</div>
          <div className="stat-label">Avg. Words</div>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Report Types Distribution</h3>
          <div className="type-distribution">
            {Object.entries(reportTypes).map(([type, count]) => (
              <div key={type} className="type-item">
                <div className="type-bar">
                  <div 
                    className="bar-fill"
                    style={{
                      width: `${(count / analytics.totalReports) * 100}%`
                    }}
                  ></div>
                </div>
                <span className="type-name">{type}</span>
                <span className="type-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {analytics.recentActivity.map(report => (
              <div key={report.id} className="activity-item">
                <div className="activity-info">
                  <strong>{report.title}</strong>
                  <span className="activity-date">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span className={`status-badge ${report.status}`}>
                  {report.status}
                </span>
              </div>
            ))}
            {analytics.recentActivity.length === 0 && (
              <p className="no-activity">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      <div className="productivity-tips">
        <h3>📈 Productivity Tips</h3>
        <ul>
          <li>Use templates to save time on report structure</li>
          <li>Set clear objectives before starting each report</li>
          <li>Review and update reports regularly</li>
          <li>Use the collaboration features for team reports</li>
        </ul>
      </div>
    </div>
  );
};

export default ReportAnalytics;