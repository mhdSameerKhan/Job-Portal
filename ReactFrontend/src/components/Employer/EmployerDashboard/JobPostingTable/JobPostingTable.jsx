import React from "react";
import "./JobPostingTable.css";
import { Link } from "react-router-dom";

const JobPostingTable = ({ jobs }) => {
  return (
    <div className="job-posting-table">
      <h2>Job Postings</h2>
      {jobs.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Location</th>
              <th>Type</th>
              <th>Posted</th>
              <th>Applications</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>
                  <Link to={`/employer/jobs/${job.id}`}>{job.title}</Link>
                </td>
                <td>{job.location}</td>
                <td>{job.job_type}</td>
                <td>{job.posted}</td>
                <td>{job.applications}</td>
                <td>
                  <span
                    className={`status-badge ${
                      job.isActive ? "active" : "inactive"
                    }`}
                  >
                    {job.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No job postings found</p>
      )}
    </div>
  );
};

export default JobPostingTable;
