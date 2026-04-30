import React from "react";
import "./VerificationStatus.css";

const VerificationStatus = ({ isApproved }) => {
  return (
    <div className="verification-card">
      <h2>Verification Status</h2>

      <div className="status-section">
        <div className={`status-badge ${isApproved ? "approved" : "pending"}`}>
          <span>{isApproved ? "Approved" : "Pending Approval"}</span>
        </div>
        <p className="status-description">
          {isApproved
            ? "Your company profile has been verified and is visible to job seekers."
            : "Your company profile is under review. You can still post jobs, but they won't be visible until verification is complete."}
        </p>
      </div>
    </div>
  );
};

export default VerificationStatus;
