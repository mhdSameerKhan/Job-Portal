import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./Footer.css";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      // Here you would typically send the email to your backend
      console.log("Subscribing email:", email);
      setIsSubscribed(true);
      setEmail("");
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const { isAuthenticated } = useAuth();

  return (
    <footer className="footer-container" ref={footerRef}>
      {!isAuthenticated() && (
        <div className={`footer-top ${isVisible ? "fade-in-up" : ""}`}>
          <div className="footer-cta">
            <h2>Ready to Find Your Perfect Student Job?</h2>
            <p>
              Join thousands of students who have found valuable work experience
              while studying. Create your profile in minutes.
            </p>
            <Link to="/register" className="cta-button">
              <span>Sign Up Now!</span>
              <span className="button-arrow">→</span>
            </Link>
            <p className="login-text">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      )}

      <div className={`footer-main ${isVisible ? "fade-in-up" : ""}`} style={{ animationDelay: "0.1s" }}>
        <div className="footer-about">
          <h3 className="footer-logo">
            <span>Student</span>
            <span className="logo-accent">Jobs</span>
          </h3>
          <p className="footer-description">
            Connecting students with meaningful employment opportunities that
            complement their academic journey.
          </p>
          <div className="social-links">
            <a href="#" className="social-link" aria-label="Facebook">
              <span>📘</span>
            </a>
            <a href="#" className="social-link" aria-label="Twitter">
              <span>🐦</span>
            </a>
            <a href="#" className="social-link" aria-label="LinkedIn">
              <span>💼</span>
            </a>
            <a href="#" className="social-link" aria-label="Instagram">
              <span>📷</span>
            </a>
          </div>
        </div>

        <div className="footer-links">
          <div className="links-column">
            <h4>For Students</h4>
            <ul>
              <li>
                <Link to="/student/jobs">
                  <span>Browse Jobs</span>
                </Link>
              </li>
              <li>
                <Link to="/companies">
                  <span>Companies</span>
                </Link>
              </li>
              <li>
                <Link to="/career-advice">
                  <span>Career Advice</span>
                </Link>
              </li>
              <li>
                <Link to="/student/cv">
                  <span>Resume Builder</span>
                </Link>
              </li>
              <li>
                <Link to="/salary-guide">
                  <span>Salary Guide</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="links-column">
            <h4>For Employers</h4>
            <ul>
              <li>
                <Link to="/employer/post-job">
                  <span>Post a Job</span>
                </Link>
              </li>
              <li>
                <Link to="/employer/applicants">
                  <span>Browse Candidates</span>
                </Link>
              </li>
              <li>
                <Link to="/pricing">
                  <span>Pricing Plans</span>
                </Link>
              </li>
              <li>
                <Link to="/recruitment-solutions">
                  <span>Recruitment Solutions</span>
                </Link>
              </li>
              <li>
                <Link to="/partner-with-us">
                  <span>Partner With Us</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-newsletter">
          <h4>Subscribe to Our Newsletter</h4>
          <p>
            Get the latest job opportunities and career tips delivered to your
            inbox.
          </p>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className={isSubscribed ? "subscribed" : ""}>
              {isSubscribed ? "✓ Subscribed!" : "Subscribe"}
            </button>
          </form>
        </div>
      </div>

      <div className={`footer-bottom ${isVisible ? "fade-in-up" : ""}`} style={{ animationDelay: "0.2s" }}>
        <p>© 2025 StudentJobs. All rights reserved.</p>
        <div className="footer-legal">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms-of-service">Terms of Service</Link>
          <Link to="/cookies-policy">Cookies Policy</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
