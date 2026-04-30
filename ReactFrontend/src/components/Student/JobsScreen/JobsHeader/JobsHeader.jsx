import React, { useState } from "react";
import "./JobsHeader.css";

const JobsHeader = ({ count, onSearch, onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    job_type: "",
    location: "",
    experience_level: "",
  });

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="jobs-header">
      <h1>{count} Jobs Found</h1>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit">🔍</button>
      </form>

      <div className="filters">
        <select
          name="job_type"
          value={filters.job_type}
          onChange={handleFilterChange}
        >
          <option value="">All Job Types</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="internship">Internship</option>
          <option value="remote">Remote</option>
        </select>

        <select
          name="location"
          value={filters.location}
          onChange={handleFilterChange}
        >
          <option value="">All Locations</option>
          <option value="remote">Remote</option>
          <option value="boston">Boston</option>
          <option value="new york">New York</option>
          <option value="san francisco">San Francisco</option>
        </select>

        <select
          name="experience_level"
          value={filters.experience_level}
          onChange={handleFilterChange}
        >
          <option value="">All Experience Levels</option>
          <option value="internship">Internship</option>
          <option value="entry">Entry Level</option>
          <option value="mid">Mid Level</option>
        </select>
      </div>
    </div>
  );
};

export default JobsHeader;
