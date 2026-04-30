import api from "./axiosconfig";

const getDashboardStats = async () => {
  try {
    const response = await api.get("/admin/dashboard");
    // Node.js returns { success: true, data: { stats: {...} } }
    if (response.data.data && response.data.data.stats) {
      return response.data.data.stats;
    }
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};
const getPendingCompanies = async () => {
  try {
    // Filter from users endpoint to get pending employers
    const response = await api.get("/admin/users", {
      params: { user_type: 2 }
    });
    const users = response.data.data?.users || response.data.users || [];
    // Filter employers that are not approved
    const pending = users
      .filter(user => user && user.employer_profile && user.employer_profile.is_approved === false)
      .map(user => ({
        id: user.employer_profile?.id || user.id,
        company_name: user.employer_profile?.company_name || "Unknown Company",
        user__email: user.email,
        created_at: user.created_at,
        company_website: user.employer_profile?.company_website,
        is_approved: false
      }));
    return pending;
  } catch (error) {
    console.error("Error fetching pending companies:", error);
    return []; // Return empty array on error instead of throwing
  }
};

const approveCompany = async (companyId) => {
  try {
    // Use admin endpoint to approve company
    const response = await api.patch(`/admin/companies/${companyId}/approve`);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error approving company:", error);
    throw error;
  }
};

const getVerifiedCompanies = async () => {
  try {
    // Get all users with type 2 (employers)
    const response = await api.get("/admin/users", {
      params: { user_type: 2 }
    });
    const users = response.data.data?.users || response.data.users || [];
    
    // Map to company format
    return users
      .filter(user => user.employer_profile && user.employer_profile.is_approved)
      .map((user) => ({
        id: user.employer_profile.id,
        company_name: user.employer_profile.company_name,
        user__email: user.email,
        created_at: user.created_at, 
        company_website: user.employer_profile.company_website,
        is_approved: user.employer_profile.is_approved,
      }));
  } catch (error) {
    console.error("Error fetching verified companies:", error);
    return []; 
  }
};

const getUsers = async (filters = {}) => {
  try {
    const response = await api.get("/admin/users", {
      params: filters
    });
    // Node.js returns { success: true, data: { users: [...], pagination: {...} } }
    if (response.data.data && response.data.data.users) {
      return response.data.data.users; // Return just the users array
    }
    if (Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return response.data.data?.users || response.data.users || [];
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

const updateUserStatus = async (userId, isActive) => {
  try {
    // Note: This endpoint might need to be implemented in Node.js backend
    // For now, update user directly
    const response = await api.patch(`/users/${userId}`, {
      is_active: isActive,
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error updating user status:", error);
    throw error;
  }
};

export default {
  getUsers,
  updateUserStatus,
  getDashboardStats,
  getPendingCompanies,
  getVerifiedCompanies,
  approveCompany,
};
