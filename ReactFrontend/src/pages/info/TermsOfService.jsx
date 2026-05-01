import React from "react";
import "./InfoPages.css";

const TermsOfService = () => {
  return (
    <div className="info-page-container">
      <div className="info-page-header">
        <h1>Terms of Service</h1>
        <p className="last-updated">Last Updated: May 1, 2025</p>
      </div>

      <div className="info-content-section">
        <h2>1. Agreement to Terms</h2>
        <p>
          These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and StudentJobs ("we," "us" or "our"), concerning your access to and use of our website.
        </p>
      </div>

      <div className="info-content-section">
        <h2>2. User Representations</h2>
        <p>
          By using the Services, you represent and warrant that:
        </p>
        <ul>
          <li>All registration information you submit will be true, accurate, current, and complete.</li>
          <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
          <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
          <li>You are not a minor in the jurisdiction in which you reside.</li>
        </ul>
      </div>

      <div className="info-content-section">
        <h2>3. User Registration</h2>
        <p>
          You may be required to register with the Services. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate.
        </p>
      </div>

      <div className="info-content-section">
        <h2>4. Prohibited Activities</h2>
        <p>
          You may not access or use the Services for any purpose other than that for which we make the Services available. The Services may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
        </p>
      </div>

      <div className="info-content-section">
        <h2>5. Job Postings</h2>
        <p>
          Employers are responsible for the content of the job postings they submit. We do not guarantee the accuracy of any job posting or the suitability of any candidate. We reserve the right to remove any job posting that violates our policies.
        </p>
      </div>

      <div className="info-content-section">
        <h2>6. Limitation of Liability</h2>
        <p>
          In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the services.
        </p>
      </div>
    </div>
  );
};

export default TermsOfService;
