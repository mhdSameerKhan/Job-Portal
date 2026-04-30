import React from "react";
import "./SystemStats.css";

const SystemStats = ({ stats }) => {
  const formatNumber = (num) => {
    return num?.toLocaleString() ?? '0';
  };

  return (
    <div className="stats-card">
      <h2>System Overview</h2>
      <div className="stats-grid">
        <div className="stat-item">
          <h3>Total Users</h3>
          <div className="stat-value">{formatNumber(stats.totalUsers)}</div>
        </div>
        <div className="stat-item">
          <h3>Total Companies</h3>
          <div className="stat-value">{formatNumber(stats.totalCompanies)}</div>
        </div>
        <div className="stat-item">
          <h3>Pending Approvals</h3>
          <div className="stat-value">{formatNumber(stats.pendingCompanies)}</div>
        </div>
        <div className="stat-item">
          <h3>Active Jobs</h3>
          <div className="stat-value">{formatNumber(stats.activeJobs)}</div>
        </div>
      </div>
    </div>
  );
};

export default SystemStats;