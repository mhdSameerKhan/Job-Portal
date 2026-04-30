import React, { useState } from "react";
import "./FormStyles.css";

const SkillsForm = ({ formData,  setFormData }) => {
  const [newSkill, setNewSkill] = useState("");
  const [newProficiency, setNewProficiency] = useState(50);

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills?.some((s) => s.name === newSkill)) {
      const updatedSkills = [
        ...(formData.skills || []),
        { name: newSkill, proficiency: newProficiency },
      ];
      setFormData((prev) => ({ ...prev, skills: updatedSkills }));
      setNewSkill("");
      setNewProficiency(50);
    }
  };

  const handleRemoveSkill = (skillName) => {
    const updatedSkills =
      formData.skills?.filter((s) => s.name !== skillName) || [];
    setFormData((prev) => ({ ...prev, skills: updatedSkills }));
  };

  const handleProficiencyChange = (skillName, newValue) => {
    const updatedSkills =
      formData.skills?.map((skill) =>
        skill.name === skillName ? { ...skill, proficiency: newValue } : skill
      ) || [];
    setFormData((prev) => ({ ...prev, skills: updatedSkills }));
  };

  return (
    <div className="form-container">
      <div className="form-group">
        <label>Current Skills</label>
        <div className="skills-list">
          {formData.skills?.length > 0 ? (
            formData.skills.map((skill, index) => (
              <div key={index} className="skill-item">
                <span className="skill-name">{skill.name}</span>
                <div className="skill-controls">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={skill.proficiency}
                    onChange={(e) =>
                      handleProficiencyChange(
                        skill.name,
                        parseInt(e.target.value)
                      )
                    }
                  />
                  <span className="proficiency-value">
                    {skill.proficiency}%
                  </span>
                  <button
                    type="button"
                    className="remove-skill"
                    onClick={() => handleRemoveSkill(skill.name)}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="no-skills">No skills added yet</p>
          )}
        </div>
      </div>

      <div className="form-group">
        <label>Add New Skill</label>
        <div className="add-skill-row">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Enter skill name"
          />
          <div className="proficiency-selector">
            <span>Proficiency:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={newProficiency}
              onChange={(e) => setNewProficiency(parseInt(e.target.value))}
            />
            <span>{newProficiency}%</span>
          </div>
          <button
            type="button"
            className="add-skill-button"
            onClick={handleAddSkill}
          >
            Add Skill
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillsForm;
