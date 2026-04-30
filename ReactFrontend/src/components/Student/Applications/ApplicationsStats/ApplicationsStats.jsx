import React from "react";
import StatsCard from "../StatsCard/StatsCard";
import "./ApplicationsStats.css";

const ApplicationsStats = ({ counts }) => {
  return (
    <div className="applications-stats">
      <StatsCard title="Applied" count={counts.applied} />
      <StatsCard title="Interview" count={counts.interview} />
      <StatsCard title="Hired" count={counts.hired} />
      <StatsCard title="Rejected" count={counts.rejected} />
      <StatsCard title="Total" count={counts.total} />
    </div>
  );
};

export default ApplicationsStats;
