import React from "react";
import "./FormStyles.css";

const ExperienceForm = ({ formData, onChange }) => {
  return (
    <div className="form-container">
      <div className="form-group">
        <label>Position Title</label>
        <input
          type="text"
          name="title"
          value={formData.title || ""}
          onChange={onChange}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Company</label>
          <input
            type="text"
            name="company"
            value={formData.company || ""}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location || ""}
            onChange={onChange}
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
          id="is_current_exp"
        />
        <label htmlFor="is_current_exp">I currently work here</label>
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description || ""}
          onChange={onChange}
          rows="6"
          placeholder="Describe your responsibilities, achievements, and technologies used..."
        />
      </div>
    </div>
  );
};

export default ExperienceForm;
