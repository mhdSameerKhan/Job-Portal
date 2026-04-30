import React, { useState, useEffect } from "react";
import ApplicationsHeader from "../../../components/Student/Applications/ApplicationsHeader/ApplicationsHeader";
import ApplicationCard from "../../../components/Student/Applications/ApplicationCard/ApplicationCard";
import ApplicationsStats from "../../../components/Student/Applications/ApplicationsStats/ApplicationsStats";
import "./Applications.css";
import studentService from "../../../services/studentService";
import { useAuth } from "../../../context/AuthContext";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import { format } from "date-fns";
import { useLocation } from "react-router-dom";

const ApplicationsScreen = () => {
  const [data, setData] = useState({
    applications: [],
    counts: {
      applied: 0,
      interview: 0,
      hired: 0,
      rejected: 0,
      total: 0,
    },
  });
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);

        const messageFromState = location.state?.successMessage;

        if (messageFromState) {
          window.history.replaceState({}, document.title);
        }

        const response = await studentService.getStudentApplications();

        setData({
          applications: response.applications || [],
          counts: response.counts || {
            applied: 0,
            interview: 0,
            hired: 0,
            rejected: 0,
            total: 0,
          },
        });
        setFilteredApplications(response.applications || []);

        if (messageFromState) {
          alert(messageFromState);
        }
      } catch (err) {
        setError(
          err.message || "Failed to load applications. Please try again."
        );
        console.error("Error fetching applications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [location.state]);

  useEffect(() => {
    let filtered = data.applications;

    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.job?.title?.toLowerCase().includes(query) ||
          app.job?.employer?.company_name?.toLowerCase().includes(query)
      );
    }

    setFilteredApplications(filtered);
  }, [statusFilter, searchQuery, data.applications]);

  const handleWithdraw = async (applicationId) => {
    if (window.confirm("Are you sure you want to withdraw this application?")) {
      try {
        await studentService.withdrawApplication(applicationId);

        const withdrawnApp = data.applications.find(
          (app) => app.id === applicationId
        );

        if (withdrawnApp) {
          setData((prev) => ({
            ...prev,
            applications: prev.applications.filter(
              (app) => app.id !== applicationId
            ),
            counts: {
              ...prev.counts,
              total: prev.counts.total - 1,
              [withdrawnApp.status]: prev.counts[withdrawnApp.status] - 1,
            },
          }));
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to withdraw application. Please try again."
        );
        console.error("Error withdrawing application:", err);
      }
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="applications-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="applications-screen">
        <div className="error-message">
          {error}
          <button
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="applications-screen">
      <ApplicationsHeader
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="applications-container">
        <ApplicationsStats counts={data.counts} />

        <div className="applications-list">
          {filteredApplications.length === 0 ? (
            <div className="no-applications">
              {statusFilter === "all"
                ? "You haven't applied to any jobs yet"
                : `No ${statusFilter} applications found`}
              <br />
              <a href="/student/jobs" className="browse-jobs-link">
                Browse available jobs
              </a>
            </div>
          ) : (
            filteredApplications.map((application) => (
              <ApplicationCard
                key={application.id}
                id={application.id}
                jobTitle={application.job?.title || "Unknown Job"}
                company={
                  application.job?.employer?.company_name || "Unknown Company"
                }
                status={application.status}
                date={`Applied on ${formatDate(application.application_date)}`}
                employerAction={
                  application.status === "interview"
                    ? "Schedule Interview"
                    : application.status === "hired"
                    ? "View Offer"
                    : application.status === "rejected"
                    ? "View Feedback"
                    : "View Details"
                }
                canWithdraw={["applied", "interview"].includes(
                  application.status
                )}
                onWithdraw={() => handleWithdraw(application.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationsScreen;
