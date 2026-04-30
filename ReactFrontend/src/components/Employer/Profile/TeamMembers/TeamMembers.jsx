import React from "react";
import "./TeamMembers.css";

const TeamMembers = () => {
  const members = [
    { name: "Sarah Johnson", role: "Admin", email: "sarah@company.com" },
    { name: "Michael Chen", role: "Recruiter", email: "michael@company.com" },
    { name: "Emma Wilson", role: "Recruiter", email: "emma@company.com" },
  ];

  return (
    <div className="team-card">
      <div className="team-header">
        <h2>Team Members</h2>
        <button className="add-member-btn">+ Add Team Member</button>
      </div>

      <div className="members-list">
        {members.map((member, index) => (
          <div key={index} className="member-item">
            <div className="member-info">
              <h3>{member.name}</h3>
              <p className="member-role">{member.role}</p>
              <p className="member-email">{member.email}</p>
            </div>
            <div className="member-actions">
              <button className="action-btn edit">Edit Permissions</button>
              <button className="action-btn remove">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamMembers;
