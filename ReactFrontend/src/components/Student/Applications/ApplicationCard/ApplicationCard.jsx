import React from "react";
import "./ApplicationCard.css";

const ApplicationCard = ({
  id,
  jobTitle,
  company,
  status,
  date,
  employerAction,
  canWithdraw,
  onWithdraw,
}) => {
  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case "applied":
        return "#3b82f6";
      case "interview":
        return "#f59e0b";
      case "hired":
        return "#10b981";
      case "rejected":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className="application-card">
      <div className="job-info">
        <h3>{jobTitle}</h3>
        <p className="company">{company}</p>
      </div>
      <div className="status" style={{ color: getStatusColor() }}>
        {status}
      </div>
      <div className="date">{date}</div>
      <div className="employer-action">{employerAction}</div>
      {canWithdraw && (
        <button className="withdraw-btn" onClick={() => onWithdraw(id)}>
          Withdraw
        </button>
      )}
    </div>
  );
};

export default ApplicationCard;
