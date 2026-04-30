import React from "react";
import "./PendingItems.css";
import { format } from "date-fns";

const PendingItems = ({ pendingCompanies = [], onApprove }) => {
  const companies = Array.isArray(pendingCompanies) ? pendingCompanies : [];

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString || "Unknown date"; 
    }
  };

  return (
    <div className="pending-card">
      <h2>Company Approvals</h2>
      <div className="pending-sections">
        <div className="pending-section">
          <div className="section-header">
            <h3>Pending Company Verifications</h3>
            <span className="badge">{companies.length} pending</span>
          </div>

          {companies.length === 0 ? (
            <div className="no-pending">No companies pending approval</div>
          ) : (
            <ul className="item-list">
              {companies.map((company) => {
                const companyName = company?.company_name || "Unknown Company";
                const userEmail = company?.user__email || "Unknown Email";
                const createdDate =
                  company?.created_at || company?.user__created_at;

                return (
                  <li key={company.id || Math.random()}>
                    <div className="company-info">
                      <div className="company-name">{companyName}</div>
                      <div className="company-details">
                        <span>Registered by: {userEmail}</span>
                        <span>Registered on: {formatDate(createdDate)}</span>
                      </div>
                    </div>
                    <button
                      className="review-btn"
                      onClick={() => onApprove(company.id)}
                      disabled={!company.id} 
                    >
                      Approve
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingItems;
