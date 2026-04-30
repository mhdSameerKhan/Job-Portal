import React from "react";
import "./InfoSection.css";

const InfoSection = ({ title, children }) => {
  return (
    <div className="info-section">
      <h2>{title}</h2>
      <div className="info-content">{children}</div>
    </div>
  );
};

export default InfoSection;
