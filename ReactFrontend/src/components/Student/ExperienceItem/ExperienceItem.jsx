import React from "react";
import "./ExperienceItem.css";

const ExperienceItem = ({ position, company, dateRange, description }) => {
  return (
    <div className="experience-item">
      <div className="experience-header">
        <h3>{position}</h3>
        <p className="company">{company}</p>
        <p className="date-range">{dateRange}</p>
      </div>
      <p className="description">{description}</p>
    </div>
  );
};

export default ExperienceItem;
