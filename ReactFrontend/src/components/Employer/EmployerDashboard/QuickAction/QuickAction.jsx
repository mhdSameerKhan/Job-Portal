import React from "react";
import "./QuickAction.css";

const QuickAction = ({ icon, title, description }) => {
  return (
    <div className="quick-action">
      <div className="action-icon">{icon}</div>
      <div className="action-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default QuickAction;
