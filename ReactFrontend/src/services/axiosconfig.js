import axios from "axios";
const API_BASE_URL = "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  // Don't set default Content-Type - let axios set it based on request type
  // For JSON requests, axios will set it automatically
  // For FormData, we need to let axios set it with boundary in the interceptor
});

api.interceptors.request.use(
  (config) => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user?.access) {
          config.headers.Authorization = `Bearer ${user.access}`;
        }
      }
    } catch (error) {
      // Ignore localStorage parsing errors
      console.warn("Error parsing user from localStorage:", error);
    }
    
    // For FormData uploads, remove Content-Type to let axios set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else if (config.data && typeof config.data === 'object' && !config.headers['Content-Type']) {
      // For JSON requests, set Content-Type if not already set
      config.headers['Content-Type'] = 'application/json';
    }
    
    // Add cache-busting timestamp for GET requests to prevent 304 responses
    if (config.method === 'get') {
      config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      config.headers['Pragma'] = 'no-cache';
      config.headers['Expires'] = '0';
      // Add timestamp to prevent caching
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Handle 304 Not Modified responses - retry with cache-busting if no data
    if (response.status === 304 && !response.data) {
      const config = response.config;
      config.params = {
        ...config.params,
        _t: Date.now()
      };
      config.headers['Cache-Control'] = 'no-cache';
      return api.request(config);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) throw new Error("No user data");
        const user = JSON.parse(userStr);
        if (user?.refresh) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh`, {
            refresh_token: user.refresh,
          });

          // Node.js backend returns { success: true, data: { tokens: { access, refresh } } }
          const tokens = response.data.data?.tokens || response.data.tokens;
          const newAccess = tokens?.access;
          const newRefresh = tokens?.refresh;
          
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...user,
              access: newAccess,
              refresh: newRefresh || user.refresh,
            })
          );

          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        localStorage.removeItem("user");
        if (typeof globalThis.window !== "undefined") {
          globalThis.window.location.href = "/login";
        }
      }
    }

    throw error;
  }
);

export default api;
