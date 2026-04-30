import React from "react";
import "./FormStyles.css";

const EducationForm = ({ formData, onChange }) => {
  const degreeOptions = [
    { value: "hs", label: "High School" },
    { value: "associate", label: "Associate Degree" },
    { value: "bachelor", label: "Bachelor Degree" },
    { value: "master", label: "Master Degree" },
    { value: "phd", label: "PhD" },
  ];

  return (
    <div className="form-container">
      <div className="form-group">
        <label>Institution</label>
        <input
          type="text"
          name="institution"
          value={formData.institution || ""}
          onChange={onChange}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Degree</label>
          <select
            name="degree"
            value={formData.degree || ""}
            onChange={onChange}
            required
          >
            <option value="">Select Degree</option>
            {degreeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Field of Study</label>
          <input
            type="text"
            name="field_of_study"
            value={formData.field_of_study || ""}
            onChange={onChange}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Start Date</label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date || ""}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label>End Date</label>
          <input
            type="date"
            name="end_date"
            value={formData.end_date || ""}
            onChange={onChange}
            disabled={formData.is_current}
          />
        </div>
      </div>

      <div className="form-group checkbox-group">
        <input
          type="checkbox"
          name="is_current"
          checked={formData.is_current || false}
          onChange={onChange}
          id="is_current"
        />
        <label htmlFor="is_current">I currently attend here</label>
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description || ""}
          onChange={onChange}
          rows="4"
          placeholder="Notable achievements, coursework, or activities..."
        />
      </div>
    </div>
  );
};

export default EducationForm;
