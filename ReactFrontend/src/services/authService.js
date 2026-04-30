import api from "./axiosconfig";

const register = async (email, password, userType, firstName, lastName, additionalData = {}) => {
  try {
    // Validate required parameters
    if (!email || !password || !userType || !firstName || !lastName) {
      throw new Error('All fields are required');
    }

    const requestData = {
      email: String(email).trim().toLowerCase(),
      password: String(password),
      password2: String(password), // password2 must match password
      user_type: Number(userType),
      first_name: String(firstName).trim(),
      last_name: String(lastName).trim(),
      ...additionalData
    };

    console.log('Sending registration request:', {
      email: requestData.email,
      user_type: requestData.user_type,
      has_first_name: !!requestData.first_name && requestData.first_name.length > 0,
      has_last_name: !!requestData.last_name && requestData.last_name.length > 0,
      has_password: !!requestData.password,
      has_password2: !!requestData.password2,
      passwords_match: requestData.password === requestData.password2
    });

    const response = await api.post("/auth/register", requestData);

    // Django-compatible format: { user: {...}, refresh: "...", access: "..." }
    if (response.data.user && response.data.access) {
      const { user, access, refresh } = response.data;
      const userData = {
        user: {
          ...user,
          user_type: user.user_type || userType,          
        },
        access: access,
        refresh: refresh,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      return userData;
    }
    throw new Error("Registration failed - invalid response format");
  } catch (error) {
    console.error("Registration error:", error.response?.data || error.message);
    
    // Map backend field names to frontend field names
    const fieldNameMap = {
      'email': 'email',
      'first_name': 'firstName',
      'last_name': 'lastName',
      'password': 'password',
      'password2': 'confirmPassword',
      'user_type': 'userType',
      'non_field_errors': 'general'
    };

    // Create error object with field-specific errors
    const fieldErrors = {};
    let generalError = null;

    if (error.response?.data) {
      const errorData = error.response.data;
      
      // Handle Django-style validation errors (object with field names as keys)
      if (typeof errorData === 'object' && !Array.isArray(errorData)) {
        for (const [backendField, messages] of Object.entries(errorData)) {
          const frontendField = fieldNameMap[backendField] || backendField;
          
          if (Array.isArray(messages) && messages.length > 0) {
            // Use first error message for the field
            fieldErrors[frontendField] = messages[0];
          } else if (typeof messages === 'string') {
            fieldErrors[frontendField] = messages;
          }
        }
        
        // Check for detail field (general error)
        if (errorData.detail && Object.keys(fieldErrors).length === 0) {
          generalError = errorData.detail;
        }
      } else if (typeof errorData === 'string') {
        generalError = errorData;
      } else if (errorData.message) {
        generalError = errorData.message;
      } else if (errorData.error) {
        generalError = errorData.error;
      }
    }

    // If we have field-specific errors, include them in the error object
    if (Object.keys(fieldErrors).length > 0) {
      const errorWithFields = new Error(generalError || "Please fix the errors below");
      errorWithFields.fieldErrors = fieldErrors;
      throw errorWithFields;
    }

    // Otherwise, throw general error
    throw new Error(generalError || "Registration failed. Please try again.");
  }
};

const login = async (email, password) => {
  try {
    const response = await api.post("/auth/login", {
      email: email.trim().toLowerCase(),
      password: password,
    });

    // Django-compatible format: { user: {...}, refresh: "...", access: "..." }
    if (response.data.user && response.data.access) {
      const { user, access, refresh } = response.data;
      const userData = {
        user: {
          ...user,
          user_type: user.user_type || 1,          
        },
        access: access,
        refresh: refresh,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      return userData;
    }
    throw new Error("Authentication failed - invalid response format");
  } catch (error) {
    console.error("Login Error Details:", {
      status: error.response?.status,
      data: error.response?.data,
    });

    let errorMessage = "Login failed. Please try again.";

    if (error.response?.data) {
      const errorData = error.response.data;
      
      // Handle Django-style error responses
      if (error.response.status === 401) {
        errorMessage = errorData.detail || errorData.message || "Invalid email or password";
      } else if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
        errorMessage = errorData.non_field_errors[0];
      } else if (errorData.detail) {
        errorMessage = errorData.detail;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
    }

    throw new Error(errorMessage);
  }
};

const logout = async () => {
  localStorage.removeItem("user");
};

const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      return null;
    }
    
    const user = JSON.parse(userStr);
    if (user && user.access) {
      // Ensure user object has proper structure
      if (user.user && !user.user.user_type) {
        // Fallback if user_type is missing
        user.user.user_type = 1;
      }
      return user;
    }
    return null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    // Clear corrupted data
    localStorage.removeItem("user");
    return null;
  }
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
};

export default authService;

