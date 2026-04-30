import React, { useState, useEffect } from "react";
import ApplicantHeader from "../../../components/Employer/Applicants/ApplicantHeader/ApplicantHeader";
import ApplicantCard from "../../../components/Employer/Applicants/ApplicantCard/ApplicantCard";
import BulkActions from "../../../components/Employer/Applicants/BulkActions/BulkActions";
import "./Applicants.css";
import jobService from "../../../services/jobService";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import { useParams } from "react-router-dom";

const ApplicantManagementScreen = () => {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use correct endpoint format for Node.js backend
        const endpoint = jobId
          ? `/employer/jobs/${jobId}/applications`
          : "/applications";
        const response = await jobService.getApplicants(endpoint);

        // Handle different response formats - getApplicants already handles this, but ensure array
        const applicationsData = Array.isArray(response) ? response : [];

        const formattedApplicants = applicationsData.map((applicant) => ({
          id: applicant.id,
          student_name: applicant.student?.user 
            ? `${applicant.student.user.first_name || ''} ${applicant.student.user.last_name || ''}`.trim()
            : applicant.student_details?.name || 'Unknown Student',
          job_title: applicant.job?.title || 'Unknown Job',
          status: applicant.status || 'applied',
          application_date: applicant.application_date 
            ? new Date(applicant.application_date).toLocaleDateString()
            : 'Unknown Date',
          cv_url: applicant.cv?.file || applicant.cv?.file_url || null,
          cover_letter: applicant.cover_letter || '',
          student_id: applicant.student_id || applicant.student?.id || null,
        }));

        setApplicants(formattedApplicants);
        setFilteredApplicants(formattedApplicants);
      } catch (err) {
        setError("Failed to load applicants. Please try again.");
        console.error("Error fetching applicants:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [jobId]);

  useEffect(() => {
    let results = applicants;

    if (searchTerm) {
      results = results.filter(
        (applicant) =>
          applicant.student_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          applicant.job_title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      results = results.filter(
        (applicant) =>
          applicant.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredApplicants(results);
  }, [searchTerm, statusFilter, applicants]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  const handleJobFilter = () => {
  };

  const handleApplicantSelect = (applicantId, isSelected) => {
    setSelectedApplicants((prev) =>
      isSelected
        ? [...prev, applicantId]
        : prev.filter((id) => id !== applicantId)
    );
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await jobService.updateApplicantStatus(applicationId, {
        status: newStatus,
      });

      setApplicants((prev) =>
        prev.map((applicant) =>
          applicant.id === applicationId
            ? { ...applicant, status: newStatus }
            : applicant
        )
      );

      setFilteredApplicants((prev) =>
        prev.map((applicant) =>
          applicant.id === applicationId
            ? { ...applicant, status: newStatus }
            : applicant
        )
      );
    } catch (err) {
      setError("Failed to update applicant status. Please try again.");
      console.error("Status update error:", err);
    }
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    try {
      await Promise.all(
        selectedApplicants.map((id) =>
          jobService.updateApplicantStatus(id, { status: newStatus })
        )
      );

      const updatedApplicants = applicants.map((applicant) =>
        selectedApplicants.includes(applicant.id)
          ? { ...applicant, status: newStatus }
          : applicant
      );

      setApplicants(updatedApplicants);
      setFilteredApplicants(updatedApplicants);
      setSelectedApplicants([]);
    } catch (err) {
      setError("Failed to update applicants. Please try again.");
      console.error("Bulk update error:", err);
    }
  };

  if (loading) {
    return (
      <div className="applicant-management-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="applicant-management-screen">
        <div className="error-message">
          {error}
          <button
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="applicant-management-screen">
      <ApplicantHeader
        onSearch={handleSearch}
        onStatusFilter={handleStatusFilter}
        onJobFilter={handleJobFilter}
        jobId={jobId}
      />

      {filteredApplicants.length === 0 ? (
        <div className="no-applicants">
          {applicants.length === 0
            ? "No applicants found"
            : "No applicants match your filters"}
        </div>
      ) : (
        <>
          <div className="applicants-list">
            {filteredApplicants.map((applicant) => {
              const applicationDate = new Date(applicant.application_date);
              const formattedDate = applicationDate.toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }
              );

              return (
                <ApplicantCard
                  key={applicant.id}
                  id={applicant.id}
                  name={applicant.student_name}
                  jobTitle={applicant.job_title}
                  status={applicant.status}
                  date={formattedDate}
                  cvUrl={applicant.cv_url}
                  coverLetter={applicant.cover_letter}
                  isSelected={selectedApplicants.includes(applicant.id)}
                  onSelect={handleApplicantSelect}
                  onStatusUpdate={handleStatusUpdate}
                />
              );
            })}
          </div>

          {selectedApplicants.length > 0 && (
            <BulkActions
              selectedCount={selectedApplicants.length}
              onBulkShortlist={() => handleBulkStatusUpdate("shortlisted")}
              onBulkReject={() => handleBulkStatusUpdate("rejected")}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ApplicantManagementScreen;
