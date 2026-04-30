import api from "./axiosconfig";

const getHomeData = async () => {
  try {
    const response = await api.get("/home/data");
    return response.data;
  } catch (error) {
    console.error("Error fetching home data:", error);
    // Return a fallback response structure to prevent crashes
    return {
      success: false,
      data: {
        featuredJobs: [],
        stats: {
          verifiedEmployers: 0,
          studentFriendlyPositions: 0,
          totalApplications: 0,
          activeStudents: 0
        },
        categories: []
      },
      error: error.message || 'Failed to fetch home data'
    };
  }
};

export default {
  getHomeData,
};

