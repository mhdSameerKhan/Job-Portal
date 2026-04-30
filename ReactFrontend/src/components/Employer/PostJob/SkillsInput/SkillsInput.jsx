import React, { useState } from "react";
import "./SkillsInput.css";

const SkillsInput = () => {
  const [skills, setSkills] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const handleAddSkill = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      setSkills([...skills, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  return (
    <div className="skills-input">
      <label>Skills Needed</label>
      <div className="skills-container">
        {skills.map((skill, index) => (
          <div key={index} className="skill-tag">
            {skill}
            <button onClick={() => removeSkill(index)}>×</button>
          </div>
        ))}
        <input
          type="text"
          placeholder="Type skill and press Enter"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleAddSkill}
        />
      </div>
    </div>
  );
};

export default SkillsInput;
