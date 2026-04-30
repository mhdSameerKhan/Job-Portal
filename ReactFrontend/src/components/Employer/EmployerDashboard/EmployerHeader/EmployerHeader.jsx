import React from "react";
import "./EmployerHeader.css";

const EmployerHeader = ({ companyName }) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="employer-header">
      <h1>Welcome, {companyName}!</h1>
      <p>{currentDate}</p>
    </div>
  );
};

export default EmployerHeader;
