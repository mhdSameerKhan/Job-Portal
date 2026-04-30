import React, { useState, useEffect } from "react";
import JobsHeader from "../../../components/Student/JobsScreen/JobsHeader/JobsHeader";
import JobCard from "../../../components/Student/JobsScreen/JobCard/JobCard";
import LoadMoreButton from "../../../components/Student/JobsScreen/LoadMoreButton/LoadMoreButton";
import "./JobsListing.css";
import jobService from "../../../services/jobService";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import { formatDistanceToNow } from "date-fns";

const JobsListing = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    job_type: "",
    location: "",
    experience_level: "",
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await jobService.getJobs({
          ...filters,
          page: 1,
        });

        // Handle different response formats
        let jobsArray = [];
        if (Array.isArray(response)) {
          jobsArray = response;
        } else if (response.results && Array.isArray(response.results)) {
          jobsArray = response.results;
        } else if (response.jobs && Array.isArray(response.jobs)) {
          jobsArray = response.jobs;
        } else if (response.data && Array.isArray(response.data)) {
          jobsArray = response.data;
        }

        setJobs(jobsArray);
        
        // Handle pagination
        if (response.pagination) {
          setHasMore(response.pagination.page < response.pagination.pages);
        } else {
          setHasMore(response.next ? true : false);
        }
        setPage(1); 
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Failed to load jobs. Please try again.");
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [filters]);

  const loadMoreJobs = async () => {
    try {
      setLoading(true);
      const nextPage = page + 1;
      const response = await jobService.getJobs({
        ...filters,
        page: nextPage,
      });

      // Handle different response formats
      let jobsArray = [];
      if (Array.isArray(response)) {
        jobsArray = response;
      } else if (response.results && Array.isArray(response.results)) {
        jobsArray = response.results;
      } else if (response.jobs && Array.isArray(response.jobs)) {
        jobsArray = response.jobs;
      } else if (response.data && Array.isArray(response.data)) {
        jobsArray = response.data;
      }

      setJobs((prev) => [...prev, ...jobsArray]);
      
      // Handle pagination
      if (response.pagination) {
        setHasMore(response.pagination.page < response.pagination.pages);
      } else {
        setHasMore(response.next ? true : false);
      }
      setPage(nextPage);
    } catch (err) {
      console.error("Error loading more jobs:", err);
      setError("Failed to load more jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatPostedDate = (dateString) => {
    try {
      if (!dateString) return "Recently posted";
      
      // Handle Firestore Timestamp format
      let date;
      if (dateString.toDate) {
        date = dateString.toDate();
      } else if (dateString.seconds) {
        date = new Date(dateString.seconds * 1000);
      } else if (typeof dateString === 'string' || typeof dateString === 'number') {
        date = new Date(dateString);
      } else {
        return "Recently posted";
      }
      
      if (isNaN(date.getTime())) {
        return "Recently posted";
      }
      
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "Recently posted";
    }
  };

  const handleSearch = (searchTerm) => {
    setFilters((prev) => ({ ...prev, search: searchTerm }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="jobs-listing">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="jobs-listing">
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
    <div className="jobs-listing">
      <JobsHeader
        count={jobs.length}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />

      <div className="jobs-list">
        {jobs.length === 0 ? (
          <div className="no-jobs">
            {loading ? "Loading..." : "No jobs found matching your criteria"}
          </div>
        ) : (
          jobs.map((job) => {
            if (!job || !job.id) {
              console.warn("Invalid job object:", job);
              return null;
            }
            
            return (
              <JobCard
                key={job.id}
                id={job.id}
                title={job.title || "Untitled Job"}
                company={job.employer?.company_name || job.company_name || "Unknown Company"}
                description={job.description || ""}
                type={job.job_type || "Not specified"}
                location={job.location || "Location not specified"}
                salary_min={job.salary_min}
                salary_max={job.salary_max}
                salary_currency={job.salary_currency}
                postedDate={formatPostedDate(job.posted_date || job.created_at)}
                is_remote={job.is_remote}
              />
            );
          }).filter(Boolean)
        )}
      </div>

      {hasMore && jobs.length > 0 && (
        <LoadMoreButton onClick={loadMoreJobs} loading={loading} />
      )}
    </div>
  );
};

export default JobsListing;
