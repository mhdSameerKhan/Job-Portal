import React from "react";
import "./RecentApplicant.css";

const RecentApplicant = ({ name, position, education, date, status }) => {
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "applied":
        return "applied";
      case "shortlisted":
        return "shortlisted";
      case "rejected":
        return "rejected";
      default:
        return "";
    }
  };

  return (
    <div className="recent-applicant">
      <div className="applicant-info">
        <div className="applicant-header">
          <h3>{name}</h3>
          <span className={`status-badge ${getStatusClass(status)}`}>
            {status}
          </span>
        </div>
        <p className="position">{position}</p>
        <p className="education">{education}</p>
        <p className="date">Applied on {date}</p>
      </div>
      <div className="divider"></div>
    </div>
  );
};

export default RecentApplicant;
