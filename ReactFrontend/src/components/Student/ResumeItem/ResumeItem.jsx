import React from "react";
import "./ResumeItem.css";

const ResumeItem = ({ cv, onDelete, onSetDefault }) => {
  const handleDownload = () => {
    window.open(cv.file, "_blank");
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this CV?")) {
      try {
        await onDelete(cv.id);
      } catch (error) {
        console.error("Failed to delete CV:", error);
      }
    }
  };

  const handleSetDefault = async () => {
    try {
      await onSetDefault(cv.id);
    } catch (error) {
      console.error("Failed to set default CV:", error);
    }
  };

  return (
    <div className="resume-item">
      <div className="resume-info">
        <h3>{cv.title}</h3>
        <p className="upload-date">
          Uploaded on {new Date(cv.created_at).toLocaleDateString()}
          {cv.is_default && <span className="default-badge">Default</span>}
        </p>
      </div>
      <div className="resume-actions">
        <button onClick={handleDownload} className="download-btn">
          Download
        </button>
        {!cv.is_default && (
          <button onClick={handleSetDefault} className="default-btn">
            Set as Default
          </button>
        )}
        <button onClick={handleDelete} className="delete-btn">
          Delete
        </button>
      </div>
    </div>
  );
};

export default ResumeItem;
