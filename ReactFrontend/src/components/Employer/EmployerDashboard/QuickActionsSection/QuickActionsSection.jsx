import React from "react";
import QuickAction from "../QuickAction/QuickAction";
import "./QuickActionsSection.css";
import { Link } from "react-router-dom";

const QuickActionsSection = () => {
  return (
    <div className="quick-actions-section">
      <h2>Quick Actions</h2>
      <div className="actions-grid">
        <Link to="/employer/post-job" className="action-link">
          <QuickAction
            icon="➕"
            title="Post New Job"
            description="Create a new job listing"
          />
        </Link>
        <Link to="/employer/applicants" className="action-link">
          <QuickAction
            icon="📋"
            title="View Applications"
            description="Review all candidate applications"
          />
        </Link>
        <Link to="/employer/profile" className="action-link">
          <QuickAction
            icon="⚙️"
            title="Company Profile"
            description="Manage your company profile"
          />
        </Link>
      </div>
    </div>
  );
};

export default QuickActionsSection;
