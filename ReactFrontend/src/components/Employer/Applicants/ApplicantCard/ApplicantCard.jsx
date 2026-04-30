import React, { useState } from "react";
import "./ApplicantCard.css";
import { format } from "date-fns";
import { handleCVView } from "../../../../utils/cvUtils";

const ApplicantCard = ({
  id,
  name,
  jobTitle,
  status,
  date,
  cvUrl,
  isSelected,
  onSelect,
  onStatusUpdate,
}) => {
  const [isLoadingCV, setIsLoadingCV] = useState(false);

  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case "applied":
        return "#3b82f6";
      case "shortlisted":
        return "#10b981";
      case "rejected":
        return "#ef4444";
      case "interview":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const handleStatusChange = (newStatus) => {
    onStatusUpdate(id, newStatus);
  };

  const handleViewCV = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!cvUrl) {
      alert("CV is not available");
      return;
    }

    try {
      setIsLoadingCV(true);
      await handleCVView(cvUrl);
    } catch (error) {
      console.error("Error viewing CV:", error);
    } finally {
      setIsLoadingCV(false);
    }
  };

  return (
    <div className={`applicant-card ${isSelected ? "selected" : ""}`}>
      <div className="applicant-select">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(id, e.target.checked)}
        />
      </div>

      <div className="applicant-profile">
        <div className="avatar">{name.charAt(0)}</div>
        <div className="profile-info">
          <h3>{name}</h3>
          <p className="job-title">{jobTitle}</p>
          <p className="application-date">Applied: {formatDate(date)}</p>
        </div>
      </div>

      <div className="applicant-cv">
        {cvUrl && (
          <button
            onClick={handleViewCV}
            disabled={isLoadingCV}
            className="view-cv"
            type="button"
          >
            {isLoadingCV ? "Loading..." : "View CV"}
          </button>
        )}
      </div>

      <div className="applicant-status">
        <span
          className="status-badge"
          style={{ backgroundColor: getStatusColor() }}
        >
          {status}
        </span>
      </div>

      <div className="applicant-actions">
        {status.toLowerCase() !== "shortlisted" && (
          <button
            className="action-btn shortlist"
            onClick={() => handleStatusChange("shortlisted")}
          >
            ✓ Shortlist
          </button>
        )}
        {status.toLowerCase() !== "rejected" && (
          <button
            className="action-btn reject"
            onClick={() => handleStatusChange("rejected")}
          >
            ✕ Reject
          </button>
        )}
      </div>
    </div>
  );
};

export default ApplicantCard;
