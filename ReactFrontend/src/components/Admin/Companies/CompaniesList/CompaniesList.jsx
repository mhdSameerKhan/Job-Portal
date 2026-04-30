import React from "react";
import "./CompaniesList.css";
import { format } from "date-fns";

const CompaniesList = ({ companies = [], activeTab, onApprove }) => {
  const safeCompanies = Array.isArray(companies) ? companies : [];

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return "N/A";
    }
  };

  const getInitial = (name) => {
    return name?.charAt?.(0)?.toUpperCase() || "C";
  };

  const transformCompanyData = (company) => {
    return {
      id: company?.id,
      company_name: company?.company_name || "Unknown Company",
      user__email: company?.user__email || company?.user?.email || "N/A",
      created_at: company?.created_at || company?.user__created_at,
      company_website: company?.company_website || "#",
      is_approved: company?.is_approved || false,
    };
  };

  return (
    <div className="companies-list">
      {safeCompanies.length === 0 ? (
        <div className="no-companies">
          No {activeTab === "pending" ? "pending" : "verified"} companies found
        </div>
      ) : (
        <table className="companies-table">
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Registered By</th>
              <th>Date Registered</th>
              <th>Status</th>
              {activeTab === "pending" && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {safeCompanies.map((company) => {
              const {
                id,
                company_name,
                user__email,
                created_at,
                company_website,
              } = transformCompanyData(company);

              return (
                <tr key={id || Math.random()}>
                  <td>
                    <div className="company-name">
                      <div className="company-logo">
                        <img
                          src={`https://via.placeholder.com/40?text=${getInitial(
                            company_name
                          )}`}
                          alt={company_name}
                        />
                      </div>
                      <a
                        href={company_website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {company_name}
                      </a>
                    </div>
                  </td>
                  <td>{user__email}</td>
                  <td>{formatDate(created_at)}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        activeTab === "pending" ? "pending" : "verified"
                      }`}
                    >
                      {activeTab === "pending" ? "Pending" : "Verified"}
                    </span>
                  </td>
                  {activeTab === "pending" && (
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn approve"
                          onClick={() => id && onApprove(id)}
                          disabled={!id}
                        >
                          <i className="fas fa-check"></i> Approve
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CompaniesList;
