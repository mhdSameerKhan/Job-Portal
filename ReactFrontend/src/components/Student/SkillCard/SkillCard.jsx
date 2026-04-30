import React from "react";
import "./SkillCard.css";

const SkillCard = ({ skill, level, progress }) => {
  return (
    <div className="skill-card">
      <div className="skill-header">
        <h3>{skill}</h3>
        <span className="level">{level}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="progress-text">{progress}%</div>
      <button className="practice-btn">Practice Now</button>
    </div>
  );
};

export default SkillCard;
