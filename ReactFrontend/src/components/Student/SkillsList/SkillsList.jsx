import React, { useState } from "react";
import "./SkillsList.css";
import studentService from "../../../services/studentService";

const SkillsList = ({ skills, editMode, onUpdate }) => {
  const [newSkill, setNewSkill] = useState("");
  const [proficiency, setProficiency] = useState(3);
  const [years, setYears] = useState(1);

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;

    try {
      const skillRes = await studentService.addSkill({ name: newSkill });

      const studentSkill = {
        skill: skillRes.data.id,
        proficiency,
        years_of_experience: years,
      };

      await studentService.addStudentSkill(studentSkill);
      onUpdate(); 
      setNewSkill("");
    } catch (error) {
      console.error("Failed to add skill:", error);
    }
  };

  const handleRemoveSkill = async (skillId) => {
    try {
      await studentService.removeStudentSkill(skillId);
      onUpdate(); 
    } catch (error) {
      console.error("Failed to remove skill:", error);
    }
  };

  return (
    <div className="skills-list">
      {skills.map((skill) => (
        <div key={skill.id} className="skill-item">
          <span className="skill-name">{skill.skill.name}</span>
          <span className="skill-proficiency">
            Proficiency: {skill.proficiency}/5
          </span>
          <span className="skill-experience">
            {skill.years_of_experience}{" "}
            {skill.years_of_experience === 1 ? "year" : "years"}
          </span>
          {editMode && (
            <span
              className="remove-icon"
              onClick={() => handleRemoveSkill(skill.id)}
            >
              X
            </span>
          )}
        </div>
      ))}

      {editMode && (
        <div className="add-skill-form">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add new skill"
          />
          <div className="skill-meta">
            <label>
              Proficiency:
              <select
                value={proficiency}
                onChange={(e) => setProficiency(parseInt(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Years:
              <input
                type="number"
                min="0"
                value={years}
                onChange={(e) => setYears(parseInt(e.target.value))}
              />
            </label>
          </div>
          <button onClick={handleAddSkill}>Add Skill</button>
        </div>
      )}
    </div>
  );
};

export default SkillsList;
