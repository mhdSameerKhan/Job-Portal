import React from "react";
import "./StatsCard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const StatsCard = ({ title, value, icon }) => {
  return (
    <div className="stats-card">
      <div className="stats-icon">
        <FontAwesomeIcon icon={icon} />
      </div>
      <div className="stats-content">
        <h3>{title}</h3>
        <div className="stats-value">{value}</div>
      </div>
    </div>
  );
};

export default StatsCard;
