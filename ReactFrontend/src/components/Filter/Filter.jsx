import React from "react";
import "./Filter.css";

const Filter = () => {
  return (
    <div className="filter-container">
      <div className="filter-section">
        <h3>What Jobs</h3>
        <div className="filter-options">
          <label>
            <input type="checkbox" /> Start the Impacts on company
          </label>
          <label>
            <input type="checkbox" /> Learned play in control
          </label>
        </div>
      </div>
      <div className="filter-tags">
        <span>Results</span>
        <span>Results</span>
        <span>Running</span>
        <span>Planning</span>
        <span>Performance</span>
      </div>
    </div>
  );
};

export default Filter;
