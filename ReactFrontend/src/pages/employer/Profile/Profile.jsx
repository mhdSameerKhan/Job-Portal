import React, { useState, useEffect } from "react";
import CompanyInfo from "../../../components/Employer/Profile/CompanyInfo/CompanyInfo";
import VerificationStatus from "../../../components/Employer/Profile/VerificationStatus/VerificationStatus";
import "./Profile.css";
import employerService from "../../../services/employerService";
import { useAuth } from "../../../context/AuthContext";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import { toast } from "react-toastify";

const EmployerProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const data = await employerService.getEmployerProfile();
        setProfileData(data);
      } catch (err) {
        setError("Failed to load profile data. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleSave = async (updatedData) => {
    try {
      setLoading(true); // Add loading state during save
      setError(null); // Clear any previous errors
      
      // Clean up the data - remove null/undefined values and handle empty strings
      const cleanedData = {};
      Object.keys(updatedData).forEach(key => {
        if (updatedData[key] !== null && updatedData[key] !== undefined) {
          if (key === 'company_logo' && updatedData[key] instanceof File) {
            // Keep file objects
            cleanedData[key] = updatedData[key];
          } else if (typeof updatedData[key] === 'string' && updatedData[key].trim() !== '') {
            // Keep non-empty strings
            cleanedData[key] = updatedData[key].trim();
          } else if (typeof updatedData[key] !== 'string') {
            // Keep non-string values (numbers, booleans, etc.)
            cleanedData[key] = updatedData[key];
          }
          // Skip empty strings for other fields
        }
      });
      
      const data = await employerService.updateEmployerProfile(cleanedData);
      setProfileData(data);
      setEditMode(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Update profile error:", err);
      console.error("Error response:", err.response);
      console.error("Error data:", err.response?.data);
      
      // Handle validation errors with field-specific messages
      if (err.response?.status === 400) {
        const responseData = err.response.data;
        
        // Check if errors object exists
        if (responseData.errors && typeof responseData.errors === 'object') {
          const errors = responseData.errors;
          let hasShownError = false;
          
          // Show each field error as a separate toast
          Object.keys(errors).forEach(field => {
            const fieldErrors = Array.isArray(errors[field]) ? errors[field] : [errors[field]];
            fieldErrors.forEach(msg => {
              // Format field name for display
              const fieldName = field.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ');
              toast.error(`${fieldName}: ${msg}`, {
                position: "top-right",
                autoClose: 5000,
              });
              hasShownError = true;
            });
          });
          
          if (!hasShownError) {
            toast.error(responseData.message || "Validation error. Please check your inputs.", {
              position: "top-right",
              autoClose: 5000,
            });
          }
        } else {
          // Single error message
          const errorMsg = responseData.message || 
                          responseData.detail || 
                          "Validation error. Please check your inputs.";
          toast.error(errorMsg, {
            position: "top-right",
            autoClose: 5000,
          });
        }
      } else {
        // General error
        const errorMsg =
          err.response?.data?.message ||
          err.response?.data?.detail ||
          "Failed to update profile. Please try again.";
        toast.error(errorMsg, {
          position: "top-right",
          autoClose: 5000,
        });
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="employer-profile">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="employer-profile">
        <div className="profile-container">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="employer-profile">
      {profileData && (
        <div className="profile-container">
          <div className="profile-header">
            <h1>Company Profile</h1>
            <button
              className={`edit-btn ${editMode ? "cancel" : ""}`}
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          <div className="profile-sections">
            <CompanyInfo
              data={profileData}
              editMode={editMode}
              onSave={handleSave}
            />
            <VerificationStatus isApproved={profileData.is_approved} />
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerProfile;
