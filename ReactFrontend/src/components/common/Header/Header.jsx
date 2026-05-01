import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import NotificationBell from "../NotificationBell/NotificationBell";
import "./Header.css";

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsMobileMenuOpen(false);
  };

  const authenticated = isAuthenticated();
  const userType = authenticated ? (user?.user?.user_type || user?.user_type) : null;
  const isActive = (path) => location.pathname === path;

  return (
    <header className={`header-container ${isScrolled ? "scrolled" : ""}`}>
      <div
        className="header-logo"
        onClick={() => handleNavigation("/")}
        style={{ cursor: "pointer" }}
      >
        <span className="logo-text">Student</span>
        <span className="colorDiff">Jobs</span>
      </div>

      <nav className={`header-nav ${isMobileMenuOpen ? "mobile-open" : ""}`}>
        {authenticated ? (
          <ul className="nav-list">
            {/* Student-specific options */}
            {userType === 1 && (
              <>
                <li
                  className={`nav-item ${isActive("/student/dashboard") ? "active" : ""}`}
                  onClick={() => handleNavigation("/student/dashboard")}
                >
                  <span>Dashboard</span>
                </li>
                <li
                  className={`nav-item ${isActive("/student/jobs") ? "active" : ""}`}
                  onClick={() => handleNavigation("/student/jobs")}
                >
                  <span>Jobs</span>
                </li>
                <li
                  className={`nav-item ${isActive("/student/applications") ? "active" : ""}`}
                  onClick={() => handleNavigation("/student/applications")}
                >
                  <span>My Applications</span>
                </li>
                <li
                  className={`nav-item ${isActive("/student/cv") ? "active" : ""}`}
                  onClick={() => handleNavigation("/student/cv")}
                >
                  <span>CV Management</span>
                </li>
                <li
                  className={`nav-item ${isActive("/student/messages") ? "active" : ""}`}
                  onClick={() => handleNavigation("/student/messages")}
                >
                  <span>Messages</span>
                </li>
              </>
            )}

            {/* Employer-specific options */}
            {userType === 2 && (
              <>
                <li
                  className={`nav-item ${isActive("/employer/dashboard") ? "active" : ""}`}
                  onClick={() => handleNavigation("/employer/dashboard")}
                >
                  <span>Dashboard</span>
                </li>
                <li
                  className={`nav-item ${isActive("/employer/shortlist") ? "active" : ""}`}
                  onClick={() => handleNavigation("/employer/shortlist")}
                >
                  <span>Shortlist</span>
                </li>
                <li
                  className={`nav-item ${isActive("/employer/messages") ? "active" : ""}`}
                  onClick={() => handleNavigation("/employer/messages")}
                >
                  <span>Messages</span>
                </li>
              </>
            )}

            {/* Admin-specific options */}
            {userType === 3 && (
              <>
                <li
                  className={`nav-item ${isActive("/admin/dashboard") ? "active" : ""}`}
                  onClick={() => handleNavigation("/admin/dashboard")}
                >
                  <span>Dashboard</span>
                </li>
                <li
                  className={`nav-item ${isActive("/admin/users") ? "active" : ""}`}
                  onClick={() => handleNavigation("/admin/users")}
                >
                  <span>User Management</span>
                </li>
                <li
                  className={`nav-item ${isActive("/admin/companies") ? "active" : ""}`}
                  onClick={() => handleNavigation("/admin/companies")}
                >
                  <span>Companies</span>
                </li>
              </>
            )}
          </ul>
        ) : (
          <ul className="nav-list">
            {/* Public navigation for unauthenticated users */}
            <li
              className={`nav-item ${isActive("/") ? "active" : ""}`}
              onClick={() => handleNavigation("/")}
            >
              <span>Home</span>
            </li>
            <li
              className={`nav-item ${isActive("/jobs") ? "active" : ""}`}
              onClick={() => handleNavigation("/student/jobs")}
            >
              <span>Browse Jobs</span>
            </li>
          </ul>
        )}
      </nav>

      <div className="header-actions">
        {authenticated ? (
          <>
            <NotificationBell />
            {userType !== 3 && (
              <button
                className="profile-btn"
                onClick={() =>
                  handleNavigation(
                    userType === 1
                      ? "/student/profile"
                      : "/employer/profile"
                  )
                }
              >
                Profile
              </button>
            )}
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
            {userType === 2 && (
              <button
                className="post-job-btn"
                onClick={() => handleNavigation("/employer/post-job")}
              >
                Post a Job
              </button>
            )}
          </>
        ) : (
          <>
            <button
              className="sign-in-btn"
              onClick={() => handleNavigation("/login")}
            >
              Sign In
            </button>
            <button
              className="sign-up-btn"
              onClick={() => handleNavigation("/register")}
            >
              Sign Up
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <span className={`hamburger ${isMobileMenuOpen ? "open" : ""}`}>
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>
    </header>
  );
};

export default Header;
