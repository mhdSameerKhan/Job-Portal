import React from "react";
import { useAuth } from "../../../../context/AuthContext";
import "./EmployerHeader.css";

const EmployerHeader = ({ companyName }) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const { user } = useAuth();
  const displayName = companyName || user?.first_name || 'Employer';

  return (
    <div className="employer-header">
      <h1>Welcome, {displayName}!</h1>
      <p>{currentDate}</p>
    </div>
  );
};

export default EmployerHeader;
