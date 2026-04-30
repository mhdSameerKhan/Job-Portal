import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import homeService from "../../services/homeService";
import "./FeaturedJobs.css";

const FeaturedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await homeService.getHomeData();
        if (response && response.success && response.data && response.data.featuredJobs) {
          setJobs(response.data.featuredJobs);
        } else {
          console.warn("Invalid response format or no featured jobs found");
          setJobs([]);
        }
      } catch (error) {
        console.error("Error fetching featured jobs:", error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleJobClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  if (loading) {
    return (
      <section className="featured-jobs">
        <h2 className="section-title">Featured Jobs</h2>
        <div className="jobs-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="job-card skeleton">
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
              <div className="skeleton-line"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (jobs.length === 0) {
    return (
      <section className="featured-jobs">
        <h2 className="section-title">Featured Jobs</h2>
        <p className="no-data">No featured jobs available at the moment.</p>
      </section>
    );
  }

  return (
    <section className="featured-jobs">
      <h2 className="section-title fade-in-up">Featured Jobs</h2>
      <div className="jobs-grid">
        {jobs.map((job, index) => (
          <div
            key={job.id}
            className="job-card fade-in-up"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => handleJobClick(job.id)}
          >
            <div className="job-header">
              <h3>{job.title}</h3>
              <p className="company-name">{job.company}</p>
            </div>
            <div className="job-details">
              <span className="job-tag location">
                <i className="icon">📍</i> {job.location}
              </span>
              <span className="job-tag salary">
                <i className="icon">💰</i> {job.salary}
              </span>
              <span className={`job-tag type ${job.type?.toLowerCase().replace('-', '')}`}>
                {job.is_remote && "🌐 "}
                {job.type}
              </span>
            </div>
            <button 
              className="apply-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleJobClick(job.id);
              }}
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedJobs;
