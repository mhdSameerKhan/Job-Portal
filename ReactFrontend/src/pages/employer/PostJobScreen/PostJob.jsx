import React, { useState, useEffect } from "react";
import JobFormSection from "../../../components/Employer/PostJob/JobFormSection/JobFormSection";
import FormInput from "../../../components/Employer/PostJob/FormInput/FormInput";
import FormActions from "../../../components/Employer/PostJob/FormActions/FormActions";
import "./PostJobScreen.css";
import jobService from "../../../services/jobService";
import { useNavigate } from "react-router-dom";
import { validateJobForm } from "../../../utils/validation";
import { useAuth } from "../../../context/AuthContext";

const PostJobScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    responsibilities: "",
    location: "",
    job_type: "full-time",
    salary_min: "",
    salary_max: "",
    salary_currency: "USD",
    is_remote: false,
    deadline: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobTypes, setJobTypes] = useState([]);

  useEffect(() => {
    const fetchJobTypes = async () => {
      try {
        const types = await jobService.getJobTypes();
        setJobTypes(types || []);
      } catch (error) {
        console.error("Failed to fetch job types:", error);
        setJobTypes([]);
      }
    };

    fetchJobTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const validationErrors = validateJobForm(formData);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        is_active: !isDraft,
        employer: user.employerId,
      };

      if (dataToSend.deadline) {
        const date = new Date(dataToSend.deadline);
        const formattedDate = date.toISOString().split("T")[0];
        dataToSend.deadline = formattedDate;
      }

      const response = await jobService.createJob(dataToSend);
      navigate(`/employer/jobs/${response.id}`, {
        state: {
          successMessage: `Job ${
            isDraft ? "saved as draft" : "published"
          } successfully!`,
        },
      });
    } catch (error) {
      console.error("Job creation error:", error);
      if (error.response?.data) {
        const backendErrors = error.response.data;
        if (typeof backendErrors === "object") {
          setErrors(backendErrors);
        } else {
          setErrors({ non_field_errors: [backendErrors] });
        }
      } else {
        setErrors({
          non_field_errors: ["Failed to create job. Please try again."],
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="post-job-screen">
      <div className="post-job-container">
        <h1>Post a New Job</h1>
        <form onSubmit={(e) => handleSubmit(e, false)}>
          <JobFormSection title="Job Details">
            <FormInput
              label="Job Title*"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              placeholder="e.g. Senior React Developer"
              required
            />
            <FormInput
              label="Job Description*"
              name="description"
              value={formData.description}
              onChange={handleChange}
              type="textarea"
              error={errors.description}
              placeholder="Describe the role and what makes your company great"
              required
              rows={5}
            />
            <FormInput
              label="Requirements*"
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              type="textarea"
              error={errors.requirements}
              placeholder="List the required skills and qualifications"
              required
              rows={5}
            />
            <FormInput
              label="Responsibilities*"
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleChange}
              type="textarea"
              error={errors.responsibilities}
              placeholder="Describe the day-to-day responsibilities"
              required
              rows={5}
            />
          </JobFormSection>

          <JobFormSection title="Job Location & Compensation">
            <FormInput
              label="Location*"
              name="location"
              value={formData.location}
              onChange={handleChange}
              error={errors.location}
              placeholder="e.g. New York, NY or Remote"
              required
            />

            <div className="remote-checkbox">
              <label>
                <input
                  type="checkbox"
                  name="is_remote"
                  checked={formData.is_remote}
                  onChange={handleChange}
                />
                This is a remote position
              </label>
            </div>

            <div className="salary-range">
              <FormInput
                label="Minimum Salary"
                name="salary_min"
                type="number"
                value={formData.salary_min}
                onChange={handleChange}
                error={errors.salary_min}
                placeholder="e.g. 80000"
                min="0"
              />
              <FormInput
                label="Maximum Salary"
                name="salary_max"
                type="number"
                value={formData.salary_max}
                onChange={handleChange}
                error={errors.salary_max}
                placeholder="e.g. 120000"
                min="0"
              />
              <div className="form-input">
                <label>Currency*</label>
                <select
                  name="salary_currency"
                  value={formData.salary_currency}
                  onChange={handleChange}
                  required
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="PKR">PKR (Rs.)</option>
                </select>
              </div>
            </div>

            <div className="form-input">
              <label>Job Type*</label>
              <div className="form-input">
                <label>Job Type*</label>
                <select
                  name="job_type"
                  value={formData.job_type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select job type</option>
                  {jobTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>{" "}
                {errors.job_type && (
                  <span className="error">{errors.job_type}</span>
                )}
              </div>
              {errors.job_type && (
                <span className="error">{errors.job_type}</span>
              )}
            </div>

            <FormInput
              label="Application Deadline*"
              name="deadline"
              type="date"
              value={formData.deadline}
              onChange={handleChange}
              error={errors.deadline}
              required
              min={new Date().toISOString().split("T")[0]}
            />
          </JobFormSection>

          {errors.non_field_errors && (
            <div className="error-message">
              {errors.non_field_errors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}

          <FormActions
            onSaveDraft={(e) => {
              e.preventDefault();
              handleSubmit(e, true);
            }}
            onPublish={(e) => {
              e.preventDefault();
              handleSubmit(e, false);
            }}
            isSubmitting={isSubmitting}
          />
        </form>
      </div>
    </div>
  );
};

export default PostJobScreen;
