import React from 'react';
import './SearchBar.css';

const SearchBar = () => {
  return (
    <div className="search-container">
      <div className="search-inputs">
        <div className="search-field">
          <label htmlFor="job-search">Job title, keywords, or company</label>
          <input 
            type="text" 
            id="job-search" 
            placeholder="Job title, keywords, or company"
          />
        </div>
        <div className="search-field">
          <label htmlFor="location">Location (city or remote)</label>
          <input 
            type="text" 
            id="location" 
            placeholder="Location (city or remote)"
          />
        </div>
        <button className="search-button">Search</button>
      </div>
      <div className="popular-searches">
        <span>Popular:</span>
        <ul className="popular-tags">
          <li>Remote</li>
          <li>Part-time</li>
          <li>Internship</li>
          <li>No Experience</li>
        </ul>
      </div>
    </div>
  );
};

export default SearchBar;