import React, { useState, useEffect } from "react";
import CVsHeader from "../../../components/Student/CVManager/CVsHeader/CVsHeader";
import CVCard from "../../../components/Student/CVManager/CVCard/CVCard";
import "./CVManager.css";
import studentService from "../../../services/studentService";
import { useAuth } from "../../../context/AuthContext";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import { format } from "date-fns";

const CVsScreen = () => {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCVs = async () => {
      try {
        const data = await studentService.getCVs();
        setCvs(data);
      } catch (err) {
        setError("Failed to load CVs. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCVs();
  }, []);

  const handleUploadCV = async (file, title) => {
    console.log("handleUploadCV called with:", { file: file?.name, title });
    
    if (!file) {
      setError("Please select a file to upload");
      return;
    }
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      setError("Only PDF and Word documents (.pdf, .doc, .docx) are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size cannot exceed 5MB");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const cvTitle = title || file.name.replace(/\.[^/.]+$/, "");
      console.log("Calling studentService.uploadCV with:", { 
        fileName: file.name, 
        title: cvTitle, 
        isDefault: cvs.length === 0 
      });
      
      const newCV = await studentService.uploadCV(
        file,
        cvTitle, 
        cvs.length === 0 
      );

      console.log("Upload response received:", newCV);

      // Ensure title is set even if response doesn't include it
      if (!newCV.title) {
        newCV.title = cvTitle;
      }

      setCvs((prev) => [newCV, ...prev]);
      console.log("CV added to state successfully");
    } catch (err) {
      console.error("Upload CV error:", err);
      console.error("Error response:", err.response);
      const errorMessage = err.message || 
                          err.response?.data?.message || 
                          err.response?.data?.error ||
                          err.response?.data?.detail || 
                          "Failed to upload CV. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (cvId) => {
    try {
      await studentService.setDefaultCV(cvId);
      setCvs(
        cvs.map((cv) => ({
          ...cv,
          is_default: cv.id === cvId,
        }))
      );
    } catch (error) {
      setError("Failed to set default CV. Please try again.");
      console.error(error);
    }
  };

const handleDeleteCV = async (cvId) => {
  try {
    if (window.confirm("Are you sure you want to delete this CV?")) {
      await studentService.deleteCV(cvId);
      setCvs(cvs.filter(cv => cv.id !== cvId));
    }
  } catch (error) {
    setError(error.message || "Failed to delete CV");
    console.error(error);
  }
};

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString; 
    }
  };
  // Debug: Log when component renders
  console.log("CVsScreen rendered, handleUploadCV:", typeof handleUploadCV);

  return (
    <div className="cvs-screen">
      <CVsHeader onUpload={handleUploadCV} />

      <div className="cvs-container">
        <div className="cvs-list">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : cvs.length === 0 ? (
            <div className="no-cvs">You haven't uploaded any CVs yet</div>
          ) : (
            cvs.map((cv) => (
              <CVCard
                key={cv.id}
                id={cv.id}
                title={cv.title}
                date={`Uploaded on ${formatDate(cv.created_at)}`}
                isDefault={cv.is_default}
                fileUrl={cv.file_url || cv.file}
                onSetDefault={() => handleSetDefault(cv.id)}
                onDelete={() => handleDeleteCV(cv.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CVsScreen;
