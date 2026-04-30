import React from "react";
import "./JobFormSection.css";

const JobFormSection = ({ title, children }) => {
  return (
    <div className="job-form-section">
      <h2>{title}</h2>
      <div className="form-fields">{children}</div>
    </div>
  );
};

export default JobFormSection;
