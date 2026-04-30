import React from "react";
import StatsCard from "../StatsCard/StatsCard";
import "./StatsSection.css";

const StatsSection = ({ profileCompletion }) => {
  return (
    <div className="stats-section">
      <div className="stats-grid">
        <StatsCard
          title="Profile Completion"
          value={`${profileCompletion}%`}
          icon="user-check"
        />
      </div>
      {profileCompletion < 100 && (
        <div className="profile-completion-note">
          <span>Complete your profile to get more opportunities</span>
        </div>
      )}
    </div>
  );
};

export default StatsSection;
