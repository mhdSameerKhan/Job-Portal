import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const normalizeUser = (userData) => {
    if (!userData) return null;
    
    if (userData.user) {
      const normalized = {
        ...userData.user,
        access: userData.access,
        refresh: userData.refresh
      };
      if (normalized.user_type === undefined || normalized.user_type === null) {
        normalized.user_type = 1;
      }
      return normalized;
    }
    
    const normalized = userData;
    if (normalized.user_type === undefined || normalized.user_type === null) {
      normalized.user_type = 1;
    }
    return normalized;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const userData = authService.getCurrentUser();
        if (userData) {
          setUser(normalizeUser(userData));
        }
      } catch (err) {
        console.error("Session check failed:", err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await authService.login(email, password);
      const normalizedUser = normalizeUser(response);
      
      if (!normalizedUser) {
        throw new Error("Failed to normalize user data");
      }
      
      setUser(normalizedUser);
      // User is already stored in localStorage by authService.login

      const userType = normalizedUser.user_type || 1;
      const redirectPath = getDashboardPath(userType);
      navigate(redirectPath, { replace: true });

      return { success: true, message: "Login successful" };
    } catch (err) {
      const errorMessage = err.message || "Login failed";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const response = await authService.register(
        userData.email,
        userData.password,
        userData.userType,
        userData.firstName,
        userData.lastName
      );

      const normalizedUser = normalizeUser(response);
      
      if (!normalizedUser) {
        throw new Error("Failed to normalize user data");
      }
      
      setUser(normalizedUser);
      // User is already stored in localStorage by authService.register

      const userType = normalizedUser.user_type || userData.userType || 1;
      navigate(getDashboardPath(userType));
      return { success: true };
    } catch (err) {
      setError(err.message);
      // Return field-specific errors if available
      return { 
        success: false, 
        message: err.message,
        fieldErrors: err.fieldErrors || null
      };
    }
  };
  
  const logout = () => {
    authService.logout();
    setUser(null);
    navigate("/login");
  };

  const isAuthenticated = () => {
    return !!user || !!authService.getCurrentUser();
  };

  const getUserType = () => {
    const currentUser = user || authService.getCurrentUser();
    if (!currentUser) return null;
    // Handle both nested user object and direct user object
    return currentUser.user?.user_type || currentUser.user_type;
  };

  const getDashboardPath = (userType) => {
    switch (userType) {
      case 1: return "/student/dashboard";
      case 2: return "/employer/dashboard";
      case 3: return "/admin/dashboard";
      default: return "/";
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
    getUserType,
    setError,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);