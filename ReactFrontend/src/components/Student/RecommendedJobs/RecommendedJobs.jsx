import React from "react";
import JobCard from "../JobCard/JobCard";
import "./RecommendedJobs.css";
import { useNavigate } from "react-router-dom";

const RecommendedJobs = ({ jobs }) => {
  const navigate = useNavigate();

  if (!jobs || jobs.length === 0) {
    return (
      <div className="recommended-jobs">
        <div className="section-header">
          <h2>Recommended Jobs For You</h2>
        </div>
        <p className="no-jobs-message">
          No recommended jobs found. Complete your profile to get better
          recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="recommended-jobs">
      <div className="section-header">
        <h2>Recommended Jobs For You</h2>
        <button className="view-all" onClick={() => navigate("/student/jobs")}>
          View All →
        </button>
      </div>
      <div className="jobs-grid">
        {jobs.slice(0, 2).map((job) => (
          <JobCard
            key={job.id}
            id={job.id}
            title={job.title}
            company={job.company.name}
            salary={job.salary_range}
            type={job.job_type}
            posted={new Date(job.posted_date).toLocaleDateString()}
            featured={job.is_featured}
            skills={job.required_skills}
          />
        ))}
      </div>
    </div>
  );
};

export default RecommendedJobs;
