import React, { useState } from "react";
import "./EducationItem.css";

const EducationItem = ({ education, editMode, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...education });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await studentService.updateEducation(education.id, formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update education:", error);
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm("Are you sure you want to delete this education entry?")
    ) {
      try {
        await onDelete(education.id);
      } catch (error) {
        console.error("Failed to delete education:", error);
      }
    }
  };

  return (
    <div className="education-item">
      {isEditing ? (
        <div className="edit-form">
          <input
            type="text"
            name="institution"
            value={formData.institution}
            onChange={handleChange}
            placeholder="Institution"
          />
          <input
            type="text"
            name="degree"
            value={formData.degree}
            onChange={handleChange}
            placeholder="Degree"
          />
          <div className="date-inputs">
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
            />
            <input
              type="date"
              name="end_date"
              value={formData.end_date || ""}
              onChange={handleChange}
              disabled={formData.is_current}
            />
            <label>
              <input
                type="checkbox"
                name="is_current"
                checked={formData.is_current}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_current: e.target.checked,
                  }))
                }
              />
              Currently studying here
            </label>
          </div>
          <textarea
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            placeholder="Description"
          />
          <div className="form-actions">
            <button type="button" onClick={handleSave}>
              Save
            </button>
            <button type="button" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="education-header">
            <h3>{education.degree}</h3>
            <p className="institution">{education.institution}</p>
            <p className="date-range">
              {new Date(education.start_date).toLocaleDateString()} -{" "}
              {education.is_current
                ? "Present"
                : education.end_date
                ? new Date(education.end_date).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          {education.description && (
            <p className="description">{education.description}</p>
          )}
          {editMode && (
            <div className="item-actions">
              <button onClick={() => setIsEditing(true)}>Edit</button>
              <button onClick={handleDelete} className="delete-btn">
                Delete
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EducationItem;
