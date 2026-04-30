import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import DashboardHeader from "../../../components/Student/DashboardHeader/DashboardHeader";
import DashboardNav from "../../../components/Student/DashboardNav/DashboardNav";
import StatsSection from "../../../components/Student/StatsSection/StatsSection";
import SkillsSection from "../../../components/Student/SkillsSection/SkillsSection";
import studentService from "../../../services/studentService";
import "./StudentDashboard.css";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    profileCompletion: 0,
    applications: 0,
    interviews: 0,
    offers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const profileRes = await studentService.getProfile();
        setProfile(profileRes);

        // Use profile_completion from backend if available, otherwise calculate
        const completion = profileRes?.profile_completion !== undefined 
          ? profileRes.profile_completion 
          : calculateProfileCompletion(profileRes);

        setStats((prev) => ({
          ...prev,
          profileCompletion: completion,
        }));
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // Set error state if needed
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const calculateProfileCompletion = (profileData) => {
    if (!profileData) return 0;

    const requiredFields = [
      "university",
      "major",
      "graduation_year",
      "gpa",
      "linkedin_url",
      "summary",
    ];

    let completedFields = 0;

    requiredFields.forEach((field) => {
      const value = profileData[field];
      if (value !== null && value !== undefined && value !== "") {
        completedFields += 1;
      }
    });

    return Math.round((completedFields / requiredFields.length) * 100);
  };

  if (loading) {
    return <div className="loading-spinner">Loading dashboard data...</div>;
  }

  return (
    <div className="student-dashboard">
      <DashboardHeader
        userName={user ? `${user.first_name} ${user.last_name}` : "Student"}
        profileCompletion={stats.profileCompletion}
      />
      <DashboardNav />
      <div className="dashboard-content">
        <StatsSection
          profileCompletion={stats.profileCompletion}
          applications={stats.applications}
          interviews={stats.interviews}
          offers={stats.offers}
        />
        {profile?.skills && profile.skills.length > 0 && (
          <SkillsSection skills={profile.skills} />
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
