import api from "./axiosconfig";

const getNotifications = async () => {
  try {
    const response = await api.get("/notifications");
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

const markAllAsRead = async () => {
  try {
    const response = await api.post("/notifications/read-all");
    return response.data;
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    throw error;
  }
};

export default {
  getNotifications,
  markAllAsRead,
};
