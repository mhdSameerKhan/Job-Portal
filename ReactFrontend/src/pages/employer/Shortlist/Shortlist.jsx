import React, { useState, useEffect } from "react";
import CandidateFilters from "../../../components/Employer/Shortlist/CandidateFilters/CandidateFilters";
import CandidateCard from "../../../components/Employer/Shortlist/CandidateCard/CandidateCard";
import "./Shortlist.css";
import employerService from "../../../services/employerService";
import { useAuth } from "../../../context/AuthContext";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import { useNavigate } from "react-router-dom";

const ShortlistPage = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobFilter, setJobFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [jobs, setJobs] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [candidatesData, jobsData] = await Promise.all([
          employerService.getShortlistedCandidates(),
          employerService.getPostedJobs(),
        ]);

        // Ensure candidatesData is an array
        const candidatesArray = Array.isArray(candidatesData) ? candidatesData : [];
        
        // Handle jobsData - could be { jobs: [...] } or array
        const jobsArray = Array.isArray(jobsData?.jobs) ? jobsData.jobs : Array.isArray(jobsData) ? jobsData : [];

        const formattedCandidates = candidatesArray.map((candidate) => {
          try {
            // Handle student name from different possible structures
            let studentName = 'Unknown Student';
            let studentId = null;
            
            if (candidate.student_details?.name) {
              studentName = candidate.student_details.name;
              studentId = candidate.student_details.id || candidate.student_id;
            } else if (candidate.student?.user) {
              const firstName = candidate.student.user.first_name || '';
              const lastName = candidate.student.user.last_name || '';
              studentName = `${firstName} ${lastName}`.trim() || 'Unknown Student';
              studentId = candidate.student.id || candidate.student_id;
            } else if (candidate.student_id) {
              studentId = candidate.student_id;
            }

            // Handle job data
            const jobTitle = candidate.job?.title || 'Unknown Job';
            const jobId = candidate.job?.id || candidate.job_id || null;

            // Handle application date
            let applicationDate = 'Unknown Date';
            try {
              if (candidate.application_date) {
                const date = candidate.application_date?.toDate 
                  ? candidate.application_date.toDate() 
                  : new Date(candidate.application_date);
                if (!isNaN(date.getTime())) {
                  applicationDate = date.toLocaleDateString();
                }
              }
            } catch (e) {
              console.warn('Error parsing application date:', e);
            }

            // Handle CV URL - try multiple possible formats
            let cvUrl = null;
            if (candidate.cv) {
              // Try file_url first (most reliable)
              cvUrl = candidate.cv.file_url || candidate.cv.file || null;
              
              // If file is a Firebase Storage path (starts with gs:// or contains /o/), construct URL
              if (cvUrl && typeof cvUrl === 'string') {
                // If it's a Firebase Storage path, we might need to construct a download URL
                // For now, use as-is if it's already a URL
                if (!cvUrl.startsWith('http://') && !cvUrl.startsWith('https://')) {
                  // If it's a relative path, try to construct full URL
                  if (cvUrl.startsWith('/')) {
                    cvUrl = `${window.location.origin}${cvUrl}`;
                  } else if (!cvUrl.startsWith('gs://')) {
                    // Assume it's a relative path
                    cvUrl = `${window.location.origin}/${cvUrl}`;
                  }
                }
              }
            }

            return {
              ...candidate,
              id: candidate.id,
              student_name: studentName,
              job_title: jobTitle,
              job_id: jobId,
              status: candidate.status || 'applied',
              application_date: applicationDate,
              cv_url: cvUrl,
              cv_id: candidate.cv?.id || null,
              cover_letter: candidate.cover_letter || '',
              student_id: studentId,
            };
          } catch (error) {
            console.error('Error formatting candidate:', error, candidate);
            // Return a safe fallback object
            return {
              id: candidate.id || `error-${Math.random()}`,
              student_name: 'Unknown Student',
              job_title: 'Unknown Job',
              job_id: null,
              status: candidate.status || 'applied',
              application_date: 'Unknown Date',
              cv_url: null,
              cv_id: null,
              cover_letter: '',
              student_id: null,
            };
          }
        });

        setCandidates(formattedCandidates);
        setFilteredCandidates(formattedCandidates);
        setJobs(jobsArray);
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || "Failed to load shortlisted candidates. Please try again.";
        setError(errorMessage);
        console.error("Fetch error:", err);
        console.error("Error details:", err.response?.data);
        // Set empty arrays to prevent further errors
        setCandidates([]);
        setFilteredCandidates([]);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    let results = [...candidates];

    if (jobFilter) {
      results = results.filter((candidate) => {
        const candidateJobId = candidate.job_id || candidate.job?.id;
        return candidateJobId == jobFilter || candidateJobId === jobFilter;
      });
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      if (term) {
        results = results.filter(
          (candidate) =>
            (candidate.student_name || '').toLowerCase().includes(term) ||
            (candidate.job_title || '').toLowerCase().includes(term)
        );
      }
    }

    setFilteredCandidates(results);
  }, [jobFilter, searchTerm, candidates]);

  const handleJobFilterChange = (jobId) => {
    setJobFilter(jobId);
  };

  const handleMessageClick = (candidate) => {
    navigate("/employer/messages", {
      state: {
        candidateId: candidate.student_id,
        jobId: candidate.job_id,
        candidateName: candidate.student_name,
      },
    });
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  if (loading) {
    return (
      <div className="shortlist-page">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="shortlist-page">
        <div className="shortlist-container">
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
      </div>
    );
  }

  return (
    <div className="shortlist-page">
      <div className="shortlist-container">
        <h1>Shortlisted Candidates</h1>

        <div className="shortlist-content">
          <CandidateFilters
            jobs={jobs}
            selectedJob={jobFilter}
            onJobFilterChange={handleJobFilterChange}
            onSearch={handleSearch}
          />

          <div className="candidates-list">
            {filteredCandidates.length === 0 ? (
              <div className="no-candidates">
                {candidates.length === 0
                  ? "You haven't shortlisted any candidates yet"
                  : "No candidates match your current filters"}
              </div>
            ) : (
              filteredCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onMessageClick={handleMessageClick}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortlistPage;
