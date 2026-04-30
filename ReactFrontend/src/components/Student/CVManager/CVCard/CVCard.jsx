import React from "react";
import "./CVCard.css";

const CVCard = ({
  title,
  date,
  isDefault,
  fileUrl,
  onSetDefault,
  onDelete,
}) => {
  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!fileUrl) {
      console.error("No file URL provided");
      alert("File URL is not available");
      return;
    }

    console.log("Downloading CV from URL:", fileUrl);

    try {
      // Construct full URL if it's a relative path
      let downloadUrl = fileUrl;
      if (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
        // If it's a relative path, construct the full URL
        const baseUrl = 'http://localhost:3001';
        downloadUrl = `${baseUrl}/${fileUrl.replace(/^\//, '')}`;
      }

      console.log("Full download URL:", downloadUrl);

      // Get auth token from localStorage
      let authHeaders = {};
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user?.access) {
            authHeaders['Authorization'] = `Bearer ${user.access}`;
          }
        }
      } catch (error) {
        console.warn("Could not get auth token:", error);
      }

      // Fetch the file as a blob to avoid navigation issues
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: authHeaders
      });

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      // Determine file extension from blob type or URL
      let extension = 'pdf';
      if (blob.type.includes('pdf')) {
        extension = 'pdf';
      } else if (blob.type.includes('word') || blob.type.includes('document')) {
        extension = blob.type.includes('openxml') ? 'docx' : 'doc';
      } else if (downloadUrl.toLowerCase().endsWith('.docx')) {
        extension = 'docx';
      } else if (downloadUrl.toLowerCase().endsWith('.doc')) {
        extension = 'doc';
      }

      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${title || 'cv'}.${extension}`;
      link.style.display = 'none';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert(`Failed to download CV: ${error.message}`);
    }
  };

  const handleSetDefaultClick = (e) => {
    e.stopPropagation();
    onSetDefault();
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this CV?")) {
      onDelete();
    }
  };

  return (
    <div className={`cv-card ${isDefault ? "default" : ""}`}>
      <div className="cv-info">
        <h3>{title}</h3>
        <p>{date}</p>
      </div>
      <div className="cv-actions">
        <button
          type="button"
          onClick={handleDownload}
          className="download-btn"
          aria-label="Download CV"
        >
          Download
        </button>
        {!isDefault && (
          <>
            <button
              onClick={handleSetDefaultClick}
              className="default-btn"
              aria-label="Set as default CV"
            >
              Set as Default
            </button>
            <button
              onClick={handleDeleteClick}
              className="delete-btn"
              aria-label="Delete CV"
            >
              Delete
            </button>
          </>
        )}
        {isDefault && <span className="default-badge">Default</span>}
      </div>
    </div>
  );
};

export default CVCard;
