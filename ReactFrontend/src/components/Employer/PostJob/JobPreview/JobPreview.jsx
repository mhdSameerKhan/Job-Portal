import React from "react";
import "./JobPreview.css";

const JobPreview = () => {
  return (
    <div className="job-preview">
      <h2>Preview</h2>
      <div className="preview-card">
        <h3>Frontend Developer</h3>
        <p className="company">TechStart Solutions</p>
        <p className="description">
          We're looking for a skilled frontend developer to join our team and
          help build amazing user experiences.
        </p>
        <div className="job-meta">
          <span>Boston, MA</span>
          <span>$25-30/hr</span>
          <span>Part-time</span>
        </div>
      </div>
    </div>
  );
};

export default JobPreview;
