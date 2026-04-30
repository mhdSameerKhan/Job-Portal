import React from "react";
import "./CompanyApprovalTabs.css";

const CompanyApprovalTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="approval-tabs">
      <h2>Company Approvals</h2>

      <div className="tab-buttons">
        <button
          className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          Pending
        </button>
        <button
          className={`tab-btn ${activeTab === "verified" ? "active" : ""}`}
          onClick={() => setActiveTab("verified")}
        >
          Verified
        </button>
      </div>
    </div>
  );
};

export default CompanyApprovalTabs;
