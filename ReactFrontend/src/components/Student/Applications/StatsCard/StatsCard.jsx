import React from "react";
import "./StatsCard.css";

const StatsCard = ({ title, count }) => {
  return (
    <div className="stats-card">
      <h3>{title}</h3>
      <div className="count">{count}</div>
    </div>
  );
};

export default StatsCard;
