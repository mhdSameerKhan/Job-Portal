import React, { useState } from "react";
import "./CompanyInfo.css";

const CompanyInfo = ({ data, editMode, onSave }) => {
  const [formData, setFormData] = useState({
    company_name: data.company_name,
    company_description: data.company_description,
    company_website: data.company_website,
    company_logo: null,
  });

  const [logoPreview, setLogoPreview] = useState(data.company_logo);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, company_logo: file }));
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ensure all fields are sent, even if empty
    const submitData = {
      company_name: formData.company_name || '',
      company_description: formData.company_description || '',
      company_website: formData.company_website || '',
      company_logo: formData.company_logo || null
    };
    onSave(submitData);
  };

  return (
    <div className="company-info-card">
      {editMode ? (
        <form onSubmit={handleSubmit}>
          <div className="company-header">
            <div className="company-logo-edit">
              <img
                src={logoPreview || "https://via.placeholder.com/100"}
                alt="Company Logo"
                className="logo-img"
              />
              <input
                type="file"
                id="logo-upload"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <label htmlFor="logo-upload" className="upload-label">
                Change Logo
              </label>
            </div>
            <div className="company-details">
              <input
                type="text"
                name="company_name"
                value={formData.company_name || ''}
                onChange={handleChange}
                className="edit-input"
                placeholder="Company Name"
              />
              <div className="edit-website">
                <span>Website: </span>
                <input
                  type="url"
                  name="company_website"
                  value={formData.company_website || ''}
                  onChange={handleChange}
                  className="edit-input"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>

          <div className="company-description">
            <h3>About Us</h3>
            <textarea
              name="company_description"
              value={formData.company_description || ''}
              onChange={handleChange}
              className="edit-textarea"
              rows="5"
              placeholder="Company description..."
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="save-btn">
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="company-header">
            <div className="company-logo">
              <img
                src={data.company_logo || "https://via.placeholder.com/100"}
                alt="Company Logo"
                className="logo-img"
              />
            </div>
            <div className="company-details">
              <h2>{data.company_name}</h2>
              {data.company_website && (
                <a
                  href={data.company_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="website-link"
                >
                  {data.company_website}
                </a>
              )}
            </div>
          </div>

          <div className="company-description">
            <h3>About Us</h3>
            <p>{data.company_description || "No description provided"}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default CompanyInfo;
