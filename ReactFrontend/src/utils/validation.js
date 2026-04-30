export const validateJobForm = (formData) => {
  const errors = {};

  if (!formData.title.trim()) {
    errors.title = "Job title is required";
  }

  if (!formData.description.trim()) {
    errors.description = "Job description is required";
  }

  if (!formData.requirements.trim()) {
    errors.requirements = "Requirements are required";
  }

  if (!formData.responsibilities.trim()) {
    errors.responsibilities = "Responsibilities are required";
  }

  if (!formData.location.trim()) {
    errors.location = "Location is required";
  }

  if (!formData.job_type) {
    errors.job_type = "Job type is required";
  }

  if (!formData.deadline) {
    errors.deadline = "Deadline is required";
  } else {
    const deadlineDate = new Date(formData.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (deadlineDate < today) {
      errors.deadline = "Deadline cannot be in the past";
    }
  }

  if (formData.salary_min && formData.salary_max) {
    const min = parseFloat(formData.salary_min);
    const max = parseFloat(formData.salary_max);

    if (min > max) {
      errors.salary_min = "Minimum salary cannot be higher than maximum";
      errors.salary_max = "Maximum salary cannot be lower than minimum";
    }
  }

  return errors;
};
