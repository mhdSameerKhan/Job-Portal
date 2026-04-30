import React, { useState } from "react";
import PropTypes from "prop-types";
import "./CandidateCard.css";
import { handleCVView } from "../../../../utils/cvUtils";

const CandidateCard = ({ candidate, onMessageClick }) => {
  const [downloading, setDownloading] = useState(false);
  const [cvError, setCvError] = useState(null);

  const handleDownloadCV = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!candidate.cv_url) {
      setCvError("CV not available");
      return;
    }

    try {
      setDownloading(true);
      setCvError(null);
      await handleCVView(candidate.cv_url);
    } catch (error) {
      console.error("Error viewing CV:", error);
      setCvError("Failed to open CV. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="candidate-card">
      <div className="candidate-info">
        <h3>{candidate.student_name || "Unknown Student"}</h3>
        <p className="job-title">{candidate.job_title || "Unknown Job"}</p>
        <p className="application-date">
          Applied: {candidate.application_date || "Unknown Date"}
        </p>
        <p className="status">Status: {candidate.status || "applied"}</p>
        {cvError && (
          <p className="cv-error" style={{ color: "#ef4444", fontSize: "0.875rem", marginTop: "0.5rem" }}>
            {cvError}
          </p>
        )}
      </div>
      <div className="candidate-actions">
        {candidate.cv_url ? (
          <button
            onClick={handleDownloadCV}
            disabled={downloading}
            className="view-cv-btn"
            title="View CV"
          >
            {downloading ? "Loading..." : "View CV"}
          </button>
        ) : (
          <span className="no-cv" style={{ color: "#6b7280", fontSize: "0.875rem" }}>
            No CV available
          </span>
        )}
        <button
          onClick={() => onMessageClick(candidate)}
          className="message-btn"
        >
          Message
        </button>
      </div>
    </div>
  );
};

CandidateCard.propTypes = {
  candidate: PropTypes.object.isRequired,
  onMessageClick: PropTypes.func.isRequired,
};

export default CandidateCard;
