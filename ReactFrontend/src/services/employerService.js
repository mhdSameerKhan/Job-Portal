import api from "./axiosconfig";

const postJob = (jobData) => {
  return api.post("/jobs", jobData);
};

const getJobApplicants = (jobId) => {
  return api.get(`/employer/jobs/${jobId}/applications`);
};

const updateApplicationStatus = (applicationId, status) => {
  // Note: This endpoint might need to be implemented in Node.js backend
  return api.patch(`/applications/${applicationId}`, { status });
};

const getMessages = () => {
  return api.get("/messaging/conversations");
};

const sendMessage = (recipientId, content) => {
  return api.post("/messaging/messages", { conversation_id: recipientId, content });
};

const getDashboardData = async () => {
  try {
    const response = await api.get("/employer/dashboard");
    // Node.js returns { success: true, data: { stats: {...}, recent_applications: [...] } }
    if (response.data && response.data.data) {
      return response.data.data;
    }
    // Fallback to default structure if response format is different
    return response.data || {
      stats: {
        total_jobs: 0,
        active_jobs: 0,
        total_applications: 0,
        pending_applications: 0
      },
      recent_applications: [],
      recent_applicants: [],
      company_name: "",
      job_postings: []
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    // Return default structure on error to prevent crashes
    return {
      stats: {
        total_jobs: 0,
        active_jobs: 0,
        total_applications: 0,
        pending_applications: 0
      },
      recent_applications: [],
      recent_applicants: [],
      company_name: "",
      job_postings: []
    };
  }
};
const getEmployerProfile = async () => {
  try {
    const response = await api.get("/employer/profile");
    // Node.js returns { success: true, data: { employer: {...} } }
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error fetching employer profile:", error);
    throw error;
  }
};

const updateEmployerProfile = async (profileData) => {
  try {
    // Node.js backend expects JSON, not FormData (unless uploading logo)
    // If logo is being uploaded, use FormData, otherwise use JSON
    const hasFile = profileData.company_logo instanceof File || profileData.logo instanceof File;
    
    let response;
    if (hasFile) {
      const formData = new FormData();
      for (const key in profileData) {
        if (profileData[key] !== null && profileData[key] !== undefined) {
          formData.append(key, profileData[key]);
        }
      }
      response = await api.put("/employer/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } else {
      // Send as JSON - allow empty objects
      response = await api.put("/employer/profile", profileData || {});
    }

    // Node.js returns { success: true, data: { employer: {...} } }
    return response.data.data?.employer || response.data.data || response.data;
  } catch (error) {
    console.error("Error updating employer profile:", error);
    console.error("Error response:", error.response);
    throw error;
  }
};


const getShortlistedCandidates = async (jobId = null) => {
  try {
    if (jobId) {
      const response = await api.get(`/employer/jobs/${jobId}/applications`, {
        params: { status: "shortlisted" }
      });
      // Handle response format - could be { success: true, data: { applications: [...] } } or array
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
    } else {
      // Get all shortlisted across all jobs
      const params = { status: "shortlisted" };
      const response = await api.get("/applications", { params });
      // Handle array response directly (matching backend format from /api/applications)
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return response.data.data || response.data || [];
    }
  } catch (error) {
    console.error("Error fetching shortlisted candidates:", error);
    // Return empty array on error to prevent crashes
    return [];
  }
};

const getPostedJobs = async () => {
  try {
    const response = await api.get("/employer/jobs");
    // Node.js returns { success: true, data: { jobs: [...], pagination: {...} } }
    if (response.data.data && response.data.data.jobs) {
      return response.data.data.jobs;
    }
    if (Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.data || response.data || [];
  } catch (error) {
    console.error("Error fetching posted jobs:", error);
    // Return empty array on error to prevent crashes
    return [];
  }
};

const startConversation = async (studentId, jobId) => {
  try {
    // Node.js uses GET /api/messaging/conversations/with/:userId
    // Backend returns { success: true, data: { conversation: {...} } }
    const response = await api.get(`/messaging/conversations/with/${studentId}`);
    
    // Extract conversation from nested response structure
    if (response.data.success && response.data.data && response.data.data.conversation) {
      return { conversation: response.data.data.conversation };
    }
    
    // Fallback for different response formats
    if (response.data.data && response.data.data.conversation) {
      return { conversation: response.data.data.conversation };
    }
    
    if (response.data.conversation) {
      return { conversation: response.data.conversation };
    }
    
    return response.data.data || response.data;
  } catch (error) {
    console.error(
      "Error starting conversation:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export default {
  startConversation,
  getDashboardData,
  getEmployerProfile,
  updateEmployerProfile,
  postJob,
  getPostedJobs,
  getJobApplicants,
  updateApplicationStatus,
  getShortlistedCandidates,
  getMessages,
  sendMessage,
};
