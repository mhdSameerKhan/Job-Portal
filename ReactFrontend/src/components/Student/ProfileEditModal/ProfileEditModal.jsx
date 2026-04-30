import React, { useState, useEffect } from "react";
import PersonalInfoForm from "./PersonalInfoForm";
import EducationForm from "./EducationForm";
import ExperienceForm from "./ExperienceForm";
import SkillsForm from "./SkillsForm";
import CVUploadForm from "./CVUploadForm";

const ProfileEditModal = ({ section, data, onSave, onClose }) => {
  const [formData, setFormData] = useState(data || {});

  useEffect(() => {
    setFormData(data || {});
  }, [data]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(section, formData);
  };

  const renderForm = () => {
    switch (section) {
      case "profile":
        return <PersonalInfoForm formData={formData} onChange={handleChange} />;
      case "education":
        return <EducationForm formData={formData} onChange={handleChange} />;
      case "experience":
        return <ExperienceForm formData={formData} onChange={handleChange} />;
      case "skills":
        return (
          <SkillsForm
            formData={formData}
            onChange={handleChange}
            setFormData={setFormData}
          />
        );
      case "cv":
        return <CVUploadForm formData={formData} onChange={handleChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>
            {section === "profile" && "Edit Personal Information"}
            {section === "education" &&
              (data ? "Edit Education" : "Add Education")}
            {section === "experience" &&
              (data ? "Edit Experience" : "Add Experience")}
            {section === "skills" && "Edit Skills"}
            {section === "cv" && "Upload CV"}
          </h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {renderForm()}
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-button">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;
