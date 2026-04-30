import React, { useEffect, useState } from "react";
import ProfileHeader from "../../../components/Student/ProfileHeader/ProfileHeader";
import InfoSection from "../../../components/Student/InfoSection/InfoSection";
import PersonalInfo from "../../../components/Student/PersonalInfo/PersonalInfo";
import ResumeItem from "../../../components/Student/ResumeItem/ResumeItem";
import EditButton from "../../../components/Student/EditButton/EditButton";
import studentService from "../../../services/studentService";
import { useAuth } from "../../../context/AuthContext";
import "./Profile.css";

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [refetch, setRefetch] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const [profileRes, cvsRes] = await Promise.all([
          studentService.getProfile(),
          studentService.getCVs(),
        ]);
        setProfile(profileRes);
        setCvs(cvsRes);
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [refetch]);


  const handleProfileUpdate = async (updatedData) => {
    try {
      const response = await studentService.updateProfile(updatedData);
      setProfile(response);
      setEditMode(false);
      return response;
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  };

  const handleChange = (e) => {
  const { name, value } = e.target;
  
  let processedValue = value;
  if (name === 'graduation_year' || name === 'gpa') {
    processedValue = value === '' ? '' : Number(value);
  }
  
  setFormData((prev) => ({ ...prev, [name]: processedValue }));
};

  const handleDeleteCV = async (id) => {
    try {
      await studentService.deleteCV(id);
      setCvs(cvs.filter((cv) => cv.id !== id));
    } catch (error) {
      console.error("Failed to delete CV:", error);
    }
  };

  const handleSetDefaultCV = async (id) => {
    try {
      await studentService.setDefaultCV(id);
      setCvs(
        cvs.map((cv) => ({
          ...cv,
          is_default: cv.id === id,
        }))
      );
    } catch (error) {
      console.error("Failed to set default CV:", error);
    }
  };

  const handleEditToggle = () => {
    setEditMode((prevMode) => {
      const newMode = !prevMode;
      console.log("Toggling edit mode to:", newMode);
      return newMode;
    });

    if (editMode) {
      setRefetch((prev) => !prev);
    }
  };

  const handleCVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const cvTitle = file.name.replace(/\.[^/.]+$/, "");
      const response = await studentService.uploadCV(
        file,
        cvTitle,
        cvs.length === 0
      );
      // Ensure title is set even if response doesn't include it
      if (!response.title) {
        response.title = cvTitle;
      }
      setCvs([...cvs, response]);
      e.target.value = "";
    } catch (error) {
      console.error("Failed to upload CV:", error);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading profile data...</div>;
  }

  if (!profile) {
    return <div className="no-profile">No profile data found</div>;
  }
  return (
    <div className="student-profile">
      <ProfileHeader user={user} profile={profile} />

      <InfoSection title="Personal Information">
        <PersonalInfo
          profile={profile}
          editMode={editMode}
          onSave={handleProfileUpdate}
        />
      </InfoSection>

      <InfoSection title="CVs & Resumes">
        {cvs.map((cv) => (
          <ResumeItem
            key={cv.id}
            cv={cv}
            onDelete={handleDeleteCV}
            onSetDefault={handleSetDefaultCV}
          />
        ))}
        {editMode && (
          <div className="upload-cv-section">
            <input
              type="file"
              id="cv-upload"
              accept=".pdf,.doc,.docx"
              onChange={handleCVUpload}
              disabled={loading}
            />
            <label htmlFor="cv-upload" className="upload-button">
              {loading ? "Uploading..." : "Upload New CV"}
            </label>
          </div>
        )}
      </InfoSection>

      <EditButton editMode={editMode} onClick={handleEditToggle} />
    </div>
  );
};

export default Profile;
