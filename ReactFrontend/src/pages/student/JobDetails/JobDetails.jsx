import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import jobService from "../../../services/jobService";
import studentService from "../../../services/studentService";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import "./JobDetails.css";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cvs, setCvs] = useState([]);
  const [selectedCv, setSelectedCv] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [applicationError, setApplicationError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch job and CVs in parallel, but handle errors separately
        const [jobData, cvsData] = await Promise.all([
          jobService.getJobDetails(id).catch(err => {
            console.error("Error fetching job:", err);
            if (err.response?.status === 404) {
              throw new Error("Job not found");
            }
            throw err;
          }),
          studentService.getCVs().catch(err => {
            console.error("Error fetching CVs:", err);
            // Don't fail the whole page if CVs fail, just return empty array
            return [];
          }),
        ]);
        
        // Validate job data
        if (!jobData || !jobData.id) {
          throw new Error("Invalid job data received");
        }
        
        setJob(jobData);
        setCvs(Array.isArray(cvsData) ? cvsData : []);

        if (cvsData && Array.isArray(cvsData) && cvsData.length > 0) {
          const defaultCv = cvsData.find((cv) => cv.is_default) || cvsData[0];
          if (defaultCv && defaultCv.id) {
            setSelectedCv(defaultCv.id);
          }
        }
      } catch (err) {
        console.error("Error in fetchData:", err);
        setError(err.message || "Failed to load job details. Please try again.");
        setJob(null);
        setCvs([]);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    } else {
      setError("Invalid job ID");
      setLoading(false);
    }
  }, [id]);

  const handleApply = async () => {
    if (!selectedCv) {
      setApplicationError("Please select a CV");
      return;
    }

    try {
      setIsApplying(true);
      setApplicationError(null);

      await studentService.applyForJob(id, selectedCv, coverLetter);

      navigate("/student/applications", {
        state: {
          successMessage: "Application submitted successfully!",
          appliedJob: job, 
        },
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to submit application. Please try again.";

      setApplicationError(errorMessage);
    } finally {
      setIsApplying(false);
    }
  };
  const formatDate = (dateInput) => {
    try {
      if (!dateInput) return "Not specified";
      
      let date;
      // Handle Firestore Timestamp format
      if (dateInput.toDate) {
        date = dateInput.toDate();
      } else if (dateInput.seconds) {
        date = new Date(dateInput.seconds * 1000);
      } else if (typeof dateInput === 'string') {
        // Handle date strings (ISO format or YYYY-MM-DD)
        date = new Date(dateInput);
      } else if (typeof dateInput === 'number') {
        date = new Date(dateInput);
      } else {
        return "Not specified";
      }
      
      if (isNaN(date.getTime())) {
        return "Not specified";
      }
      
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Not specified";
    }
  };

  const formatSalary = () => {
    if (!job) return "Not specified";
    if (!job.salary_min && !job.salary_max) return "Not specified";

    const currencySymbol =
      {
        USD: "$",
        EUR: "€",
        GBP: "£",
        PKR: "Rs.",
      }[job.salary_currency] ||
      job.salary_currency ||
      "$";

    const min = job.salary_min ? Number(job.salary_min).toLocaleString() : null;
    const max = job.salary_max ? Number(job.salary_max).toLocaleString() : null;

    if (min && max) {
      return `${currencySymbol}${min} - ${currencySymbol}${max}`;
    }
    return min
      ? `From ${currencySymbol}${min}`
      : max ? `Up to ${currencySymbol}${max}` : "Not specified";
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="job-details-container">
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

  if (!job) {
    return (
      <div className="job-details-container">
        <div className="not-found">
          Job not found
          <Link to="/student/jobs" className="back-link">
            Back to jobs
          </Link>
        </div>
      </div>
    );
  }

  // Helper function to check if deadline is valid and not expired
  const isDeadlineValid = () => {
    try {
      if (!job || !job.deadline) return false;
      
      let deadlineDate;
      if (job.deadline.toDate) {
        deadlineDate = job.deadline.toDate();
      } else if (job.deadline.seconds) {
        deadlineDate = new Date(job.deadline.seconds * 1000);
      } else if (typeof job.deadline === 'string') {
        deadlineDate = new Date(job.deadline);
      } else {
        return true; // Assume valid if we can't parse
      }
      
      if (isNaN(deadlineDate.getTime())) return true; // Assume valid if invalid date
      
      return deadlineDate > new Date();
    } catch {
      return true; // Assume valid on error
    }
  };

  // Get company name safely
  const getCompanyName = () => {
    if (job.employer?.company_name) return job.employer.company_name;
    if (job.company_name) return job.company_name;
    if (job.employer?.user?.first_name || job.employer?.user?.last_name) {
      return `${job.employer.user.first_name || ''} ${job.employer.user.last_name || ''}`.trim();
    }
    return "Unknown Company";
  };

  return (
    <div className="job-details-container">
      <div className="job-details-header">
        <h1>{job.title || "Untitled Job"}</h1>
        <h2>{getCompanyName()}</h2>

        <div className="job-meta">
          <span className="location">{job.location || "Location not specified"}</span>
          {job.is_remote && <span className="remote-badge">Remote</span>}
          <span className="job-type">{job.job_type ? job.job_type.replace('-', ' ') : "Not specified"}</span>
          <span className="salary">{formatSalary()}</span>
          <span className="posted-date">
            Posted {formatDate(job.posted_date || job.created_at)}
          </span>
          {job.deadline && (
            <span className="deadline">Apply by {formatDate(job.deadline)}</span>
          )}
        </div>
      </div>

      <div className="job-details-content">
        <div className="job-section">
          <h3>Job Description</h3>
          <p>{job.description || "No description available"}</p>
        </div>

        <div className="job-section">
          <h3>Requirements</h3>
          <p>{job.requirements || "No requirements specified"}</p>
        </div>

        {job.responsibilities && (
          <div className="job-section">
            <h3>Responsibilities</h3>
            <p>{job.responsibilities}</p>
          </div>
        )}

        <div className="job-actions">
          <Link to="/student/jobs" className="back-button">
            Back to Jobs
          </Link>

          {isDeadlineValid() ? (
            <div className="apply-section">
              <h3>Apply for this position</h3>

              {cvs.length > 0 ? (
                <>
                  <div className="form-group">
                    <label>Select CV:</label>
                    <select
                      value={selectedCv}
                      onChange={(e) => setSelectedCv(e.target.value)}
                    >
                      {cvs.map((cv) => (
                        <option key={cv.id} value={cv.id}>
                          {cv.title || cv.file_name || "Untitled CV"} {cv.is_default && "(Default)"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Cover Letter (Optional):</label>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Explain why you're a good fit for this position..."
                      rows={5}
                    />
                  </div>

                  {applicationError && (
                    <div className="error-message">{applicationError}</div>
                  )}

                  <button
                    onClick={handleApply}
                    disabled={isApplying}
                    className="apply-button"
                  >
                    {isApplying ? "Submitting..." : "Submit Application"}
                  </button>
                </>
              ) : (
                <div className="no-cv-warning">
                  <p>You need to upload a CV before applying</p>
                  <Link to="/student/cv" className="upload-cv-link">
                    Upload CV
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="expired-notice">
              This job posting has expired and is no longer accepting
              applications
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
