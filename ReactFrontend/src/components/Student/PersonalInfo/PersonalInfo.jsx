import React, { useState, useEffect } from "react";
import "./PersonalInfo.css";

const PersonalInfo = ({ profile, editMode, onSave }) => {
  const [formData, setFormData] = useState({
    university: "",
    major: "",
    graduation_year: "",
    gpa: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
    resume_headline: "",
    summary: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        university: profile.university || "",
        major: profile.major || "",
        graduation_year: profile.graduation_year || "",
        gpa: profile.gpa || "",
        linkedin_url: profile.linkedin_url || "",
        github_url: profile.github_url || "",
        portfolio_url: profile.portfolio_url || "",
        resume_headline: profile.resume_headline || "",
        summary: profile.summary || "",
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onSave(formData);
    } catch (err) {
      setError("Failed to save profile. Please try again.");
      console.error("Profile save error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="personal-info">
      {editMode ? (
        <form onSubmit={handleSubmit}>
          <div className="info-row">
            <div className="info-item">
              <label>University</label>
              <input
                type="text"
                name="university"
                value={formData.university}
                onChange={handleChange}
                placeholder="Enter your university"
              />
            </div>
            <div className="info-item">
              <label>Major</label>
              <input
                type="text"
                name="major"
                value={formData.major}
                onChange={handleChange}
                placeholder="Enter your major"
              />
            </div>
          </div>

          <div className="info-row">
            <div className="info-item">
              <label>Graduation Year</label>
              <input
                type="number"
                name="graduation_year"
                value={formData.graduation_year}
                onChange={handleChange}
                min="1900"
                max="2100"
                placeholder="YYYY"
              />
            </div>
            <div className="info-item">
              <label>GPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                name="gpa"
                value={formData.gpa}
                onChange={handleChange}
                placeholder="0.00 - 4.00"
              />
            </div>
          </div>

          <div className="info-row">
            <div className="info-item">
              <label>LinkedIn URL</label>
              <input
                type="url"
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
            <div className="info-item">
              <label>GitHub URL</label>
              <input
                type="url"
                name="github_url"
                value={formData.github_url}
                onChange={handleChange}
                placeholder="https://github.com/yourusername"
              />
            </div>
          </div>

          <div className="info-row">
            <div className="info-item">
              <label>Portfolio URL</label>
              <input
                type="url"
                name="portfolio_url"
                value={formData.portfolio_url}
                onChange={handleChange}
                placeholder="https://yourportfolio.com"
              />
            </div>
            <div className="info-item">
              <label>Resume Headline</label>
              <input
                type="text"
                name="resume_headline"
                value={formData.resume_headline}
                onChange={handleChange}
                placeholder="Brief professional headline"
              />
            </div>
          </div>

          <div className="info-row">
            <div className="info-item full-width">
              <label>Summary</label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                rows="4"
                placeholder="Describe your skills, experience, and career goals"
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="save-button" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      ) : (
        <>
          <div className="info-row">
            <div className="info-item">
              <label>University</label>
              <p>{profile.university || "Not specified"}</p>
            </div>
            <div className="info-item">
              <label>Major</label>
              <p>{profile.major || "Not specified"}</p>
            </div>
          </div>

          <div className="info-row">
            <div className="info-item">
              <label>Graduation Year</label>
              <p>{profile.graduation_year || "Not specified"}</p>
            </div>
            <div className="info-item">
              <label>GPA</label>
              <p>{profile.gpa || "Not specified"}</p>
            </div>
          </div>

          <div className="info-row">
            <div className="info-item">
              <label>LinkedIn</label>
              <p>
                {profile.linkedin_url ? (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Profile
                  </a>
                ) : (
                  "Not specified"
                )}
              </p>
            </div>
            <div className="info-item">
              <label>GitHub</label>
              <p>
                {profile.github_url ? (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Profile
                  </a>
                ) : (
                  "Not specified"
                )}
              </p>
            </div>
          </div>

          <div className="info-row">
            <div className="info-item">
              <label>Portfolio</label>
              <p>
                {profile.portfolio_url ? (
                  <a
                    href={profile.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Portfolio
                  </a>
                ) : (
                  "Not specified"
                )}
              </p>
            </div>
            <div className="info-item">
              <label>Resume Headline</label>
              <p>{profile.resume_headline || "Not specified"}</p>
            </div>
          </div>

          <div className="info-row">
            <div className="info-item full-width">
              <label>Summary</label>
              <p className="summary-text">
                {profile.summary || "No summary provided"}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PersonalInfo;
