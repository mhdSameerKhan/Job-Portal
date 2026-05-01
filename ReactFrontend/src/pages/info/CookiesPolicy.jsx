import React from "react";
import "./InfoPages.css";

const CookiesPolicy = () => {
  return (
    <div className="info-page-container">
      <div className="info-page-header">
        <h1>Cookies Policy</h1>
        <p className="last-updated">Last Updated: May 1, 2025</p>
      </div>

      <div className="info-content-section">
        <h2>1. What are Cookies?</h2>
        <p>
          Cookies are small text files that are placed on your computer by websites that you visit. They are widely used in order to make websites work, or work more efficiently, as well as to provide information to the owners of the site.
        </p>
      </div>

      <div className="info-content-section">
        <h2>2. How We Use Cookies</h2>
        <p>
          We use cookies for a variety of reasons detailed below. Unfortunately, in most cases, there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site.
        </p>
        <ul>
          <li><strong>Essential Cookies:</strong> These are necessary for the website to function and cannot be switched off. They are usually only set in response to actions made by you, such as logging in or filling in forms.</li>
          <li><strong>Performance Cookies:</strong> These allow us to count visits and traffic sources so we can measure and improve the performance of our site.</li>
          <li><strong>Functionality Cookies:</strong> These enable the website to provide enhanced functionality and personalization.</li>
        </ul>
      </div>

      <div className="info-content-section">
        <h2>3. Third Party Cookies</h2>
        <p>
          In some special cases, we also use cookies provided by trusted third parties. The following section details which third party cookies you might encounter through this site.
        </p>
        <ul>
          <li>This site uses Google Analytics for helping us to understand how you use the site and ways that we can improve your experience.</li>
        </ul>
      </div>

      <div className="info-content-section">
        <h2>4. Managing Cookies</h2>
        <p>
          You can prevent the setting of cookies by adjusting the settings on your browser. Be aware that disabling cookies will affect the functionality of this and many other websites that you visit.
        </p>
      </div>

      <div className="info-content-section">
        <h2>5. More Information</h2>
        <p>
          Hopefully that has clarified things for you. If there is something that you aren't sure whether you need or not, it's usually safer to leave cookies enabled in case it does interact with one of the features you use on our site.
        </p>
        <p>
          If you are still looking for more information, you can contact us through one of our preferred contact methods:
        </p>
        <ul>
          <li>Email: cookies@studentjobs.com</li>
        </ul>
      </div>
    </div>
  );
};

export default CookiesPolicy;
