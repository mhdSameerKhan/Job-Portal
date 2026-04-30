import React from "react";
import "./ApplicantHeader.css";

const ApplicantHeader = ({ onSearch, onStatusFilter, jobId }) => {
  const handleSearchChange = (e) => {
    onSearch(e.target.value);
  };

  const handleStatusChange = (e) => {
    onStatusFilter(e.target.value);
  };

  return (
    <div className="applicant-header">
      <h1>{jobId ? "Job Applicants" : "All Applicants"}</h1>
      <div className="applicant-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search applicants..."
            onChange={handleSearchChange}
          />
          <button>🔍</button>
        </div>
        <select className="filter-dropdown" onChange={handleStatusChange}>
          <option value="">All Statuses</option>
          <option value="applied">Applied</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
    </div>
  );
};

export default ApplicantHeader;
