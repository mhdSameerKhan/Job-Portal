import React from "react";
import "./CandidateFilters.css";

const CandidateFilters = ({ jobs = [], onJobFilterChange, onSearch }) => {
  const handleSearchChange = (e) => {
    onSearch(e.target.value);
  };

  const handleJobChange = (e) => {
    onJobFilterChange(e.target.value);
  };

  return (
    <div className="filters-card">
      <h2>Shortlisted Candidates</h2>

      <div className="filter-options">
        <div className="filter-group">
          <label>Filter By Job:</label>
          <select 
            className="filter-select"
            onChange={handleJobChange}
          >
            <option value="">All Jobs</option>
            {Array.isArray(jobs) && jobs.map(job => (
              <option key={job.id || job._id} value={job.id || job._id}>
                {job.title || 'Unknown Job'}
              </option>
            ))}
          </select>
        </div>

        <div className="search-group">
          <input
            type="text"
            placeholder="Search candidates..."
            className="search-input"
            onChange={handleSearchChange}
          />
          <button className="search-btn">
            <i className="fas fa-search"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateFilters;