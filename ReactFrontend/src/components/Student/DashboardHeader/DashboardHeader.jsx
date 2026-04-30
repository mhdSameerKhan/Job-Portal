import React from "react";
import "./DashboardHeader.css";

const DashboardHeader = ({ userName, profileCompletion }) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="dashboard-header">
      <div className="welcome-section">
        <h1>Welcome Back, {userName}!</h1>
        <p>
          {currentDate} |{" "}
          {profileCompletion >= 80
            ? "Your profile looks great!"
            : "Complete your profile to get more opportunities"}
        </p>
      </div>
    </div>
  );
};

export default DashboardHeader;
