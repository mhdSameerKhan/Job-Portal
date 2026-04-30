import React, { useState, useEffect } from "react";
import EmployerHeader from "../../../components/Employer/EmployerDashboard/EmployerHeader/EmployerHeader";
import RecentApplicant from "../../../components/Employer/EmployerDashboard/RecentApplicant/RecentApplicant";
import JobPostingTable from "../../../components/Employer/EmployerDashboard/JobPostingTable/JobPostingTable";
import QuickActionsSection from "../../../components/Employer/EmployerDashboard/QuickActionsSection/QuickActionsSection";
import "./EmployerDashboard.css";
import employerService from "../../../services/employerService";
import { useAuth } from "../../../context/AuthContext";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import { format, parseISO } from "date-fns";

const EmployerDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    company_name: "",
    recent_applicants: [],
    job_postings: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await employerService.getDashboardData();
        setDashboardData(data);
      } catch (err) {
        console.error("Dashboard error:", err.response?.data || err.message);
        setError(
          err.response?.data?.message ||
            "Failed to load dashboard data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const formatRelativeTime = (dateString) => {
    try {
      const date = parseISO(dateString);
      const now = new Date();
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      return format(date, "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="employer-dashboard">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="employer-dashboard">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="employer-dashboard">
      <EmployerHeader companyName={dashboardData.company_name} />

      <div className="dashboard-section">
        <h2>Recent Applicants</h2>
        {dashboardData.recent_applicants?.length > 0 ? (
          dashboardData.recent_applicants.map((applicant, index) => (
            <RecentApplicant
              key={`${applicant.id}-${index}`}
              name={applicant.student_name}
              position={applicant.position}
              education={applicant.education}
              date={formatDate(applicant.application_date)}
              status={applicant.status}
            />
          ))
        ) : (
          <p>No recent applicants</p>
        )}
      </div>

      <div className="dashboard-section">
        <h2>Your Job Postings</h2>
        <JobPostingTable
          jobs={
            dashboardData.job_postings?.map((job) => ({
              ...job,
              posted: formatRelativeTime(job.posted_date),
              applications: `${job.application_count} ${
                job.application_count === 1 ? "Application" : "Applications"
              }`,
              isActive: job.is_active,
            })) || []
          }
        />
      </div>

      <QuickActionsSection />
    </div>
  );
};

export default EmployerDashboard;
