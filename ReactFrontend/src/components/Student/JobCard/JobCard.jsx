import React from "react";
import "./JobCard.css";

const JobCard = ({ title, company, salary, type, posted, featured }) => {
  return (
    <div className={`job-card ${featured ? "featured" : ""}`}>
      {featured && <div className="featured-badge">Featured</div>}
      <h3>{title}</h3>
      <p className="company">{company}</p>
      <div className="job-meta">
        <span className="salary">{salary}</span>
        <span className="type">{type}</span>
      </div>
      <p className="posted">Posted {posted}</p>
      <button className="apply-btn">Apply Now</button>
    </div>
  );
};

export default JobCard;
