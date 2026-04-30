import React from "react";
import "./FormStyles.css";

const PersonalInfoForm = ({ formData, onChange }) => {
  return (
    <div className="form-container">
      <div className="form-row">
        <div className="form-group">
          <label>First Name</label>
          <input
            type="text"
            name="first_name"
            value={formData.user?.first_name || ""}
            onChange={(e) =>
              onChange({
                target: {
                  name: "user",
                  value: {
                    ...formData.user,
                    first_name: e.target.value,
                  },
                },
              })
            }
            required
          />
        </div>
        <div className="form-group">
          <label>Last Name</label>
          <input
            type="text"
            name="last_name"
            value={formData.user?.last_name || ""}
            onChange={(e) =>
              onChange({
                target: {
                  name: "user",
                  value: {
                    ...formData.user,
                    last_name: e.target.value,
                  },
                },
              })
            }
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>University</label>
        <input
          type="text"
          name="university"
          value={formData.university || ""}
          onChange={onChange}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Major</label>
          <input
            type="text"
            name="major"
            value={formData.major || ""}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Graduation Year</label>
          <input
            type="number"
            name="graduation_year"
            min="2000"
            max="2030"
            value={formData.graduation_year || ""}
            onChange={onChange}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>GPA</label>
          <input
            type="number"
            name="gpa"
            step="0.01"
            min="0"
            max="4"
            value={formData.gpa || ""}
            onChange={onChange}
          />
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            name="phone_number"
            value={formData.phone_number || ""}
            onChange={onChange}
          />
        </div>
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

      <div className="form-group">
        <label>LinkedIn URL</label>
        <input
          type="url"
          name="linkedin_url"
          value={formData.linkedin_url || ""}
          onChange={onChange}
          placeholder="https://linkedin.com/in/yourprofile"
        />
      </div>

      <div className="form-group">
        <label>GitHub URL</label>
        <input
          type="url"
          name="github_url"
          value={formData.github_url || ""}
          onChange={onChange}
          placeholder="https://github.com/yourusername"
        />
      </div>

      <div className="form-group">
        <label>Portfolio URL</label>
        <input
          type="url"
          name="portfolio_url"
          value={formData.portfolio_url || ""}
          onChange={onChange}
          placeholder="https://yourportfolio.com"
        />
      </div>

      <div className="form-group">
        <label>Resume Headline</label>
        <input
          type="text"
          name="resume_headline"
          value={formData.resume_headline || ""}
          onChange={onChange}
          placeholder="e.g. Computer Science Student | Full Stack Developer"
        />
      </div>

      <div className="form-group">
        <label>Summary</label>
        <textarea
          name="summary"
          value={formData.summary || ""}
          onChange={onChange}
          rows="5"
          placeholder="Brief summary of your skills, experience, and career goals..."
        />
      </div>
    </div>
  );
};

export default PersonalInfoForm;
