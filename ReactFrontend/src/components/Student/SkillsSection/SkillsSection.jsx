import React from "react";
import SkillCard from "../SkillCard/SkillCard";
import "./SkillsSection.css";

const SkillsSection = ({ skills }) => {
  if (!skills || skills.length === 0) {
    return (
      <div className="skills-section">
        <h2>Add Skills to Your Profile</h2>
        <p className="no-skills-message">
          Add skills to your profile to get better job recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="skills-section">
      <h2>Skills to Improve</h2>
      <div className="skills-grid">
        {skills
          .sort((a, b) => a.proficiency - b.proficiency)
          .slice(0, 3)
          .map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill.name}
              level={getProficiencyLevel(skill.proficiency)}
              progress={skill.proficiency}
            />
          ))}
      </div>
    </div>
  );
};

const getProficiencyLevel = (proficiency) => {
  if (proficiency >= 75) return "(advanced)";
  if (proficiency >= 50) return "(intermediate)";
  return "(beginner)";
};

export default SkillsSection;
