import React from "react";
import "./ModerationLog.css";

const logEntries = [
  {
    id: 1,
    action: "Approved job posting",
    moderator: "admin@example.com",
    target: "Frontend Developer at TechCorp",
    timestamp: "10 minutes ago",
  },
  {
    id: 2,
    action: "Rejected profile",
    moderator: "moderator@example.com",
    target: "user123 (Inappropriate photo)",
    timestamp: "25 minutes ago",
  },
  {
    id: 3,
    action: "Banned user",
    moderator: "admin@example.com",
    target: "spammer@example.com (7 days)",
    timestamp: "1 hour ago",
  },
  {
    id: 4,
    action: "Edited job description",
    moderator: "moderator@example.com",
    target: "Senior UX Designer",
    timestamp: "2 hours ago",
  },
];

const ModerationLog = () => {
  return (
    <div className="moderation-log">
      <div className="log-header">
        <h3>Moderation Log</h3>
        <div className="log-filters">
          <select className="filter-select">
            <option>All Actions</option>
            <option>Approvals</option>
            <option>Rejections</option>
            <option>Bans</option>
            <option>Edits</option>
          </select>
          <input
            type="text"
            placeholder="Search log..."
            className="search-input"
          />
        </div>
      </div>

      <div className="log-entries">
        {logEntries.map((entry) => (
          <div key={entry.id} className="log-entry">
            <div className="entry-action">
              <span className="action-type">{entry.action}</span>
              <span className="action-target">"{entry.target}"</span>
            </div>
            <div className="entry-meta">
              <span className="moderator">{entry.moderator}</span>
              <span className="timestamp">{entry.timestamp}</span>
            </div>
          </div>
        ))}
      </div>

      <button className="view-all-btn">View Full Moderation Log</button>
    </div>
  );
};

export default ModerationLog;
