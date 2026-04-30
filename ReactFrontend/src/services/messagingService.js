import api from "./axiosconfig";

const getConversations = async () => {
  try {
    const response = await api.get("/messaging/conversations");
    
    // Backend returns: { success: true, status: 'success', data: [...] }
    if (response.data && response.data.data) {
      return {
        data: Array.isArray(response.data.data) ? response.data.data : []
      };
    }
    
    // Fallback for different response formats
    if (Array.isArray(response.data)) {
      return { data: response.data };
    }
    
    return { data: [] };
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return { data: [] };
  }
};


const getMessages = async (conversationId) => {
  try {
    const response = await api.get(`/messaging/conversations/${conversationId}/messages`);
    // Node.js returns { success: true, data: { messages: [...], pagination: {...} } }
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

const sendMessage = async (conversationId, content) => {
  try {
    const response = await api.post("/messaging/messages", {
      conversation_id: conversationId,
      content,
    });
    // Backend returns: { success: true, message: '...', data: { message: {...} } }
    // Extract the message object from nested structure
    const messageData = response.data?.data?.message || response.data?.message || response.data;
    return {
      ...response.data,
      data: { message: messageData }
    };
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

const startConversation = async (userId) => {
  try {
    // Node.js uses GET /api/messaging/conversations/with/:userId
    const response = await api.get(`/messaging/conversations/with/${userId}`);
    // Node.js returns { success: true, data: { conversation: {...} } }
    return response.data.data || response.data;
  } catch (error) {
    console.error(
      "Error starting conversation:",
      error.response?.data || error.message
    );
    throw error;
  }
};

const markAsRead = (messageId) => {
  return api.put(`/messaging/messages/${messageId}/read`);
};

export default {
  getConversations,
  getMessages,
  sendMessage,
  startConversation,
  markAsRead,
};
