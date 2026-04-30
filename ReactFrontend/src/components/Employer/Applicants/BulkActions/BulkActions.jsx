import React from "react";
import "./BulkActions.css";

const BulkActions = ({ selectedCount, onBulkShortlist, onBulkReject }) => {
  return (
    <div className="bulk-actions">
      <div className="selected-count">
        {selectedCount} applicant(s) selected
      </div>
      <div className="action-buttons">
        <button className="bulk-btn shortlist" onClick={onBulkShortlist}>
          <span>✓</span> Shortlist All
        </button>
        <button className="bulk-btn reject" onClick={onBulkReject}>
          <span>✕</span> Reject All
        </button>
      </div>
    </div>
  );
};

export default BulkActions;
