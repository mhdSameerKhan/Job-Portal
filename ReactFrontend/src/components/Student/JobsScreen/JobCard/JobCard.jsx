import React from "react";
import "./JobCard.css";
import { Link } from "react-router-dom";

const JobCard = ({
  id,
  title,
  company,
  description,
  type,
  location,
  salary_currency,
  salary_min,
  salary_max,
  postedDate,
  is_remote,
}) => {
  const formatSalary = () => {
    if (!salary_min && !salary_max) return "Salary not specified";

    const currencySymbol =
      {
        USD: "$",
        EUR: "€",
        GBP: "£",
        PKR: "Rs.",
      }[salary_currency] ||
      salary_currency ||
      "$";

    if (salary_min && salary_max) {
      return `${currencySymbol}${salary_min} - ${currencySymbol}${salary_max}`;
    }
    return salary_min
      ? `From ${currencySymbol}${salary_min}`
      : `Up to ${currencySymbol}${salary_max}`;
  };

  const formatJobType = () => {
    const typeMap = {
      "full-time": "Full-time",
      "part-time": "Part-time",
      contract: "Contract",
      internship: "Internship",
      temporary: "Temporary",
    };
    return typeMap[type] || type;
  };

  return (
    <div className="job-card">
      <div className="job-content">
        <h2 className="job-title">{title}</h2>
        <p className="company-name">{company || "Company not specified"}</p>

        <p className="job-description">
          {description && description.length > 150
            ? `${description.substring(0, 150)}...`
            : description || "No description available"}
        </p>

        <div className="job-details">
          <div className="job-meta">
            <span className={`job-type ${type}`}>{formatJobType()}</span>
            {is_remote && <span className="remote-badge">Remote</span>}
            <span className="job-location">
              {location || "Location not specified"}
            </span>
            <span className="job-salary">{formatSalary()}</span>
          </div>

          <div className="job-footer">
            <span className="posted-date">
              Posted {postedDate || "recently"}
            </span>
            <div className="action-buttons">
              <Link to={`/student/jobs/${id}`} className="view-details">
                View Details
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="divider"></div>
    </div>
  );
};

export default JobCard;
