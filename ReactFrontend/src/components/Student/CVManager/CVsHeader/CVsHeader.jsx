import React, { useRef, useEffect } from "react";
import "./CVsHeader.css";

const CVsHeader = ({ onUpload }) => {
  const fileInputRef = useRef(null);

  useEffect(() => {
    console.log("CVsHeader mounted");
    console.log("onUpload prop received:", onUpload);
    console.log("onUpload type:", typeof onUpload);
    console.log("fileInputRef.current:", fileInputRef.current);
  }, [onUpload]);

  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Upload button clicked");
    console.log("fileInputRef.current:", fileInputRef.current);
    console.log("onUpload function:", onUpload);
    console.log("onUpload type:", typeof onUpload);
    
    if (!onUpload) {
      console.error("onUpload prop is not provided!");
      alert("Upload handler is not available. Please refresh the page.");
      return;
    }
    
    if (typeof onUpload !== 'function') {
      console.error("onUpload is not a function! Type:", typeof onUpload);
      alert("Upload handler is not a function. Please refresh the page.");
      return;
    }
    
    if (fileInputRef.current) {
      console.log("Triggering file input click");
      try {
        fileInputRef.current.click();
      } catch (error) {
        console.error("Error clicking file input:", error);
      }
    } else {
      console.error("File input ref is null!");
    }
  };

  const handleFileChange = (e) => {
    console.log("File input changed");
    const file = e.target.files[0];
    console.log("Selected file:", file ? { name: file.name, type: file.type, size: file.size } : "No file");
    
    if (file) {
      const defaultTitle = file.name.split(".")[0];
      console.log("Prompting for title with default:", defaultTitle);
      
      const title = prompt(
        "Enter a title for your CV:",
        defaultTitle
      );
      
      console.log("User entered title:", title);
      
      if (title) {
        console.log("Calling onUpload with file and title");
        if (onUpload && typeof onUpload === 'function') {
          onUpload(file, title);
        } else {
          console.error("onUpload is not a function or is undefined!");
        }
      } else {
        console.log("User cancelled title prompt");
      }
      // Reset the input so the same file can be selected again if needed
      e.target.value = '';
    } else {
      console.log("No file selected");
    }
  };

  return (
    <div className="cvs-header">
      <h1>My CVs</h1>
      <div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx"
          style={{ display: "none" }}
          id="cv-file-input"
        />
        <button
          className="upload-btn"
          onClick={handleButtonClick}
          type="button"
        >
          Upload New CV
        </button>
      </div>
    </div>
  );
};

export default CVsHeader;
