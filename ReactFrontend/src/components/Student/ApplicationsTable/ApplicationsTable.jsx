import React from "react";
import "./ApplicationsTable.css";
import { useNavigate } from "react-router-dom";

const ApplicationsTable = ({ applications }) => {
  const navigate = useNavigate();

  if (!applications || applications.length === 0) {
    return (
      <div className="applications-table">
        <h2>Recent Applications</h2>
        <p className="no-applications-message">
          You haven't applied to any jobs yet. Start applying to see them here.
        </p>
      </div>
    );
  }

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "status-badge pending";
      case "interview scheduled":
        return "status-badge interview-scheduled";
      case "selected":
        return "status-badge selected";
      case "rejected":
        return "status-badge rejected";
      default:
        return "status-badge";
    }
  };

  return (
    <div className="applications-table">
      <h2>Recent Applications</h2>
      <table>
        <thead>
          <tr>
            <th>COMPANY</th>
            <th>POSITION</th>
            <th>APPLIED DATE</th>
            <th>STATUS</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {applications.slice(0, 3).map((app) => (
            <tr key={app.id}>
              <td>{app.job.company.name}</td>
              <td>{app.job.title}</td>
              <td>{new Date(app.applied_date).toLocaleDateString()}</td>
              <td>
                <span className={getStatusBadgeClass(app.status)}>
                  {app.status}
                </span>
              </td>
              <td>
                <button
                  className="view-details"
                  onClick={() => navigate(`/student/applications/${app.id}`)}
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApplicationsTable;
