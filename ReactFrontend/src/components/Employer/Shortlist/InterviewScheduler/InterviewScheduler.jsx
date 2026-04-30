import React from "react";
import "./InterviewScheduler.css";

const InterviewScheduler = () => {
  return (
    <div className="scheduler-card">
      <h2>Interview Scheduling</h2>

      <div className="scheduler-content">
        <div className="calendar-section">
          <h3>Select Available Slots</h3>
          <div className="calendar-placeholder">
            {/* Calendar component would go here */}
            <p>Calendar UI will be displayed here</p>
          </div>
        </div>

        <div className="video-links">
          <h3>Video Call Links</h3>
          <div className="video-platforms">
            <div className="platform-option">
              <input
                type="radio"
                id="zoom"
                name="video-platform"
                defaultChecked
              />
              <label htmlFor="zoom">Zoom Meeting</label>
            </div>
            <div className="platform-option">
              <input type="radio" id="meet" name="video-platform" />
              <label htmlFor="meet">Google Meet</label>
            </div>
            <div className="platform-option">
              <input type="radio" id="teams" name="video-platform" />
              <label htmlFor="teams">Microsoft Teams</label>
            </div>
          </div>

          <div className="link-generator">
            <button className="generate-btn">Generate Meeting Link</button>
            <div className="generated-link">
              <input
                type="text"
                placeholder="Meeting link will appear here"
                readOnly
              />
              <button className="copy-btn">
                <i className="fas fa-copy"></i> Copy
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="scheduler-actions">
        <button className="cancel-btn">Cancel</button>
        <button className="send-btn">Send Invitation</button>
      </div>
    </div>
  );
};

export default InterviewScheduler;
