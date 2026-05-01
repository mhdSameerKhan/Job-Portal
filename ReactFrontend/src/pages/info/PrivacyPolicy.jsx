import React from "react";
import "./InfoPages.css";

const PrivacyPolicy = () => {
  return (
    <div className="info-page-container">
      <div className="info-page-header">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last Updated: May 1, 2025</p>
      </div>

      <div className="info-content-section">
        <h2>1. Introduction</h2>
        <p>
          Welcome to StudentJobs. We are committed to protecting your personal information and your right to privacy. 
          If you have any questions or concerns about our policy, or our practices with regards to your personal information, 
          please contact us at privacy@studentjobs.com.
        </p>
      </div>

      <div className="info-content-section">
        <h2>2. Information We Collect</h2>
        <p>
          We collect personal information that you voluntarily provide to us when registering at the Services, 
          expressing an interest in obtaining information about us or our products and services, 
          when participating in activities on the Services or otherwise contacting us.
        </p>
        <ul>
          <li><strong>Personal Information:</strong> Name, address, email address, phone number, and similar contact data.</li>
          <li><strong>Credentials:</strong> Passwords, password hints, and similar security information used for authentication and account access.</li>
          <li><strong>Payment Data:</strong> Data necessary to process your payment if you make purchases.</li>
          <li><strong>Profile Data:</strong> Your CV, education history, skills, and work experience.</li>
        </ul>
      </div>

      <div className="info-content-section">
        <h2>3. How We Use Your Information</h2>
        <p>
          We use personal information collected via our Services for a variety of business purposes described below. 
          We process your personal information for these purposes in reliance on our legitimate business interests, 
          in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
        </p>
        <ul>
          <li>To facilitate account creation and logon process.</li>
          <li>To match students with relevant job opportunities.</li>
          <li>To enable employer-student communication.</li>
          <li>To send administrative information to you.</li>
          <li>To protect our Services.</li>
        </ul>
      </div>

      <div className="info-content-section">
        <h2>4. Sharing Your Information</h2>
        <p>
          We only share information with your consent, to comply with laws, to provide you with services, 
          to protect your rights, or to fulfill business obligations. 
          For students, your profile and CV will be visible to employers when you apply for a job.
        </p>
      </div>

      <div className="info-content-section">
        <h2>5. Contact Us</h2>
        <p>
          If you have questions or comments about this policy, you may email us at privacy@studentjobs.com or by post to:
        </p>
        <p>
          StudentJobs HQ<br />
          123 Career Lane<br />
          Innovation City, IC 54321
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
