import React, { useState } from "react";
import "./ModerationTabs.css";

const ModerationTabs = () => {
  const [activeTab, setActiveTab] = useState("jobs");

  return (
    <div className="moderation-tabs">
      <h2>Content Moderation</h2>

      <div className="tab-buttons">
        <button
          className={`tab-btn ${activeTab === "jobs" ? "active" : ""}`}
          onClick={() => setActiveTab("jobs")}
        >
          <i className="fas fa-briefcase"></i> Flagged Jobs
        </button>
        <button
          className={`tab-btn ${activeTab === "profiles" ? "active" : ""}`}
          onClick={() => setActiveTab("profiles")}
        >
          <i className="fas fa-user"></i> Profiles
        </button>
        <button
          className={`tab-btn ${activeTab === "messages" ? "active" : ""}`}
          onClick={() => setActiveTab("messages")}
        >
          <i className="fas fa-comments"></i> Messages
        </button>
      </div>
    </div>
  );
};

export default ModerationTabs;
