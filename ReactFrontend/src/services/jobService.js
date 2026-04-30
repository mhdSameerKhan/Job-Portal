import api from "./axiosconfig";

const getSkills = () => {
  // Note: Skills endpoint may not exist in Node.js backend
  // Return empty array or implement if needed
  return Promise.resolve({ data: [] });
};

const searchJobs = (filters) => {
  return api.get("/jobs", { params: filters });
};

const saveJob = (jobId) => {
  // Note: Saved jobs endpoint may not exist in Node.js backend
  // Return success for now or implement if needed
  return Promise.resolve({ data: { success: true } });
};

const getSavedJobs = () => {
  // Note: Saved jobs endpoint may not exist in Node.js backend
  return Promise.resolve({ data: [] });
};
const getApplicants = async (endpoint) => {
  try {
    const response = await api.get(endpoint);
    // Handle different response formats from backend
    // Could be { success: true, data: { applications: [...] } } or just array
    if (response.data.data && response.data.data.applications) {
      return response.data.data.applications;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return response.data.data || response.data || [];
  } catch (error) {
    console.error("Error fetching applicants:", error);
    throw error;
  }
};

const updateApplicantStatus = async (applicationId, statusData) => {
  try {
    // Note: This endpoint might need to be implemented in Node.js backend
    // For now, using a generic update endpoint
    const response = await api.patch(
      `/applications/${applicationId}`,
      statusData
    );
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error updating applicant status:", error);
    throw error;
  }
};

const getStudentApplications = async () => {
  try {
    const response = await api.get("/student/applications");
    // Node.js returns { success: true, data: { applications: [...] } }
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error fetching applications:", error);
    throw error;
  }
};

const withdrawApplication = async (applicationId) => {
  try {
    // Note: Withdraw endpoint might need to be implemented
    // For now, using delete endpoint
    await api.delete(`/applications/${applicationId}`);
  } catch (error) {
    console.error("Error withdrawing application:", error);
    throw error;
  }
};

const getJobs = async (filters = {}) => {
  try {
    const response = await api.get("/jobs", {
      params: {
        search: filters.search,
        job_type: filters.job_type,
        location: filters.location,
        salary_min: filters.salary_min,
        salary_max: filters.salary_max,
        company_name: filters.company_name,
        page: filters.page || 1,
        limit: filters.limit || 10, 
      },
    });
    
    // Node.js returns { jobs: [...], pagination: {...} }
    // Handle both direct response and nested data
    const data = response.data.data || response.data;
    
    // Return in Django-compatible format for frontend
    if (data.jobs) {
      return {
        results: data.jobs || [],
        pagination: data.pagination || {},
        next: data.pagination && data.pagination.page < data.pagination.pages ? true : null
      };
    }
    
    // Fallback to array format if jobs is directly an array
    if (Array.isArray(data)) {
      return {
        results: data,
        pagination: {},
        next: null
      };
    }
    
    // Return as-is if already in expected format
    return data;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
};

const getJobDetails = async (id) => {
  try {
    const response = await api.get(`/jobs/${id}`);
    // Node.js returns { success: true, data: { job: {...} } }
    // Handle different response formats
    if (response.data.data && response.data.data.job) {
      return response.data.data.job;
    }
    if (response.data.job) {
      return response.data.job;
    }
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error fetching job details:", error);
    throw error;
  }
};

const createJob = async (jobData) => {
  try {
    // Node.js backend expects JSON, not FormData
    // Remove employer field if present (backend gets it from auth token)
    const { employer, ...requestData } = jobData;
    
    // Format deadline consistently
    if (requestData.deadline) {
      if (requestData.deadline instanceof Date) {
        requestData.deadline = requestData.deadline.toISOString().split("T")[0];
      } else if (typeof requestData.deadline === 'string' && requestData.deadline.includes('T')) {
        requestData.deadline = requestData.deadline.split("T")[0];
      }
    }

    const response = await api.post("/jobs", requestData);
    
    // Handle response format: { success: true, data: { job: {...} } } or just { job: {...} }
    if (response.data.data && response.data.data.job) {
      return response.data.data.job;
    } else if (response.data.job) {
      return response.data.job;
    } else {
      return response.data.data || response.data;
    }
  } catch (error) {
    console.error("Error creating job:", error.response?.data || error.message);
    
    // Format error for easier handling in components
    if (error.response?.data) {
      const errorData = error.response.data;
      const formattedError = new Error(errorData.message || 'Failed to create job');
      formattedError.fieldErrors = errorData;
      throw formattedError;
    }
    
    throw error;
  }
};

const getJobTypes = () => {
  return Promise.resolve([
    { value: "full-time", label: "Full-time" },
    { value: "part-time", label: "Part-time" },
    { value: "internship", label: "Internship" },
  ]);
};

export default {
  withdrawApplication,
  getJobs,
  getJobTypes,
  updateApplicantStatus,
  getApplicants,
  getStudentApplications,
  getSkills,
  searchJobs,
  createJob,
  getJobDetails,
  saveJob,
  getSavedJobs,
};
