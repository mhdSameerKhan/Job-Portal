import React from "react";
import "./BulkOperations.css";

const BulkOperations = ({ onBulkVerify, onBulkDisable }) => {
  return (
    <div className="bulk-ops-card">
      <h3>Bulk Operations ({selectedCount} selected)</h3>

      <div className="bulk-actions">
        <button className="bulk-btn verify" onClick={onBulkVerify}>
          <i className="fas fa-check-circle"></i> Activate Selected
        </button>
        <button className="bulk-btn disable" onClick={onBulkDisable}>
          <i className="fas fa-ban"></i> Disable Selected
        </button>
      </div>
    </div>
  );
};

export default BulkOperations;
