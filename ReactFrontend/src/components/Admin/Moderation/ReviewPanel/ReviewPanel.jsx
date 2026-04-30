import React from "react";
import "./ReviewPanel.css";

const ReviewPanel = () => {
  const [decision, setDecision] = useState(null);
  const [banUser, setBanUser] = useState(false);
  const [banDuration, setBanDuration] = useState("7");

  return (
    <div className="review-panel">
      <h3>Review Panel</h3>

      <div className="content-preview">
        <div className="preview-header">
          <div className="user-info">
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="User"
              className="user-avatar"
            />
            <div>
              <div className="user-name">John Doe</div>
              <div className="content-type">
                Job Posting: "Senior Developer"
              </div>
            </div>
          </div>
          <div className="flag-reason">
            <span className="flag-badge">Flagged: Inappropriate Content</span>
          </div>
        </div>

        <div className="content-body">
          <p>
            We're looking for a senior developer to join our team. Must have 5+
            years experience with React and Node.js. Competitive salary and
            benefits package.
            <span className="flagged-text">
              {" "}
              Includes adult content and inappropriate language.
            </span>
          </p>
        </div>
      </div>

      <div className="moderation-actions">
        <div className="action-buttons">
          <button
            className={`action-btn approve ${
              decision === "approve" ? "active" : ""
            }`}
            onClick={() => setDecision("approve")}
          >
            <i className="fas fa-check"></i> Approve
          </button>
          <button
            className={`action-btn reject ${
              decision === "reject" ? "active" : ""
            }`}
            onClick={() => setDecision("reject")}
          >
            <i className="fas fa-times"></i> Reject
          </button>
          <button
            className={`action-btn edit ${decision === "edit" ? "active" : ""}`}
            onClick={() => setDecision("edit")}
          >
            <i className="fas fa-edit"></i> Edit
          </button>
        </div>

        <div className="ban-section">
          <label className="ban-toggle">
            <input
              type="checkbox"
              checked={banUser}
              onChange={() => setBanUser(!banUser)}
            />
            <span>Ban User</span>
          </label>

          {banUser && (
            <div className="ban-options">
              <select
                value={banDuration}
                onChange={(e) => setBanDuration(e.target.value)}
                className="ban-select"
              >
                <option value="1">1 day</option>
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="permanent">Permanent</option>
              </select>
              <button className="ban-confirm">Confirm Ban</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewPanel;
