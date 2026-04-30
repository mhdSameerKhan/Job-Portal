import React from "react";
import "./ApplicationsHeader.css";

const ApplicationsHeader = ({
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="applications-header">
      <h1>My Applications</h1>
      <div className="controls">
        <select
          className="status-filter"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
        >
          <option value="all">All Applications</option>
          <option value="applied">Applied</option>
          <option value="interview">Interview</option>
          <option value="hired">Hired</option>
          <option value="rejected">Rejected</option>
        </select>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <button>🔍</button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationsHeader;
