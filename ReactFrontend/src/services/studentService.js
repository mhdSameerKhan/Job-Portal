import api from "./axiosconfig";

const searchJobs = (filters) => {
  return api.get("/jobs", { params: filters });
};

const getJobDetails = (id) => {
  return api.get(`/jobs/${id}`);
};

const getApplications = () => {
  return api.get("/student/applications"); 
};

const getMessages = () => {
  return api.get("/messaging/conversations");
};

const sendMessage = (recipientId, content) => {
  // Note: This might need conversation_id instead of recipientId
  return api.post("/messaging/messages", { conversation_id: recipientId, content });
};

const getProfile = async () => {
  try {
    const response = await api.get("/student/profile");
    // Node.js returns { success: true, data: { student: {...} } }
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error fetching student profile:", error);
    throw error;
  }
};

const updateProfile = async (profileData) => {
  try {
    const processedData = {
      ...profileData,
      graduation_year: profileData.graduation_year || null,
      gpa: profileData.gpa || null,
    };

    const response = await api.put("/student/profile", processedData);
    // Node.js returns { success: true, data: { student: {...} } }
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

const getCVs = async () => {
  try {
    const response = await api.get("/student/cvs");
    // Node.js returns { success: true, data: { cvs: [...] } }
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error fetching CVs:", error);
    throw error;
  }
};

const uploadCV = async (file, title, isDefault) => {
  console.log("uploadCV service called - filename:", file?.name, "title:", title, "isDefault:", isDefault);
  
  if (!file) {
    throw new Error("No file provided");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title || file.name.replace(/\.[^/.]+$/, ""));
  formData.append("is_default", isDefault ? "true" : "false");

  console.log("FormData created, making API call to /student/cvs");

  try {
    // Don't set Content-Type header - let axios set it automatically with boundary
    const response = await api.post("/student/cvs", formData);
    console.log("API response received:", response.data);
    
    // Node.js backend returns { success: true, data: { cv object } }
    // Extract the CV object from response.data.data
    const cvData = response.data.data || response.data;
    console.log("Extracted CV data:", cvData);
    
    // If title is missing, use the provided title as fallback
    if (!cvData.title && title) {
      cvData.title = title;
    }
    
    return cvData;
  } catch (error) {
    console.error("uploadCV error:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    
    if (error.response?.data) {
      const errorData = error.response.data;
      if (errorData.message) {
        throw new Error(errorData.message);
      } else if (errorData.error) {
        throw new Error(errorData.error);
      }
    }
    throw error;
  }
};

const applyForJob = async (jobId, cvId, coverLetter) => {
  console.log(jobId);
  try {
    const response = await api.post(`/jobs/${jobId}/apply`, {
      cv_id: cvId || null,
      cover_letter: coverLetter || "",
    });
    // Node.js returns { success: true, data: { application: {...} } }
    return response.data.data || response.data;
  } catch (error) {
    console.error(
      "Error applying for job:",
      error.response?.data || error.message
    );
    throw error;
  }
};

const setDefaultCV = async (cvId) => {
  try {
    const response = await api.put(`/student/cvs/${cvId}/default`);
    // Node.js returns { success: true, data: { cv: {...} } }
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error setting default CV:", error);
    throw error;
  }
};

const deleteCV = async (cvId) => {
  try {
    await api.delete(`/student/cvs/${cvId}`);
    return true; 
  } catch (error) {
    console.error("Error deleting CV:", error);
    const errorMsg = error.response?.data?.message || error.response?.data?.error || "Failed to delete CV";
    throw new Error(errorMsg);
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
    // Note: Withdraw endpoint might need to be implemented in Node.js backend
    // For now, using delete endpoint
    await api.delete(`/applications/${applicationId}`);
  } catch (error) {
    console.error("Error withdrawing application:", error);
    throw error;
  }
};

export default {
  getProfile,
  withdrawApplication,
  setDefaultCV,
  updateProfile,
  getCVs,
  getStudentApplications,
  uploadCV,
  deleteCV,
  searchJobs,
  getJobDetails,
  applyForJob,
  getApplications,
  getMessages,
  sendMessage,
};
