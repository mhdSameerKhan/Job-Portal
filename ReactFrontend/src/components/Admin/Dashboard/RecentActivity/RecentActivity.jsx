import React from "react";
import "./RecentActivity.css";
import { formatDistanceToNow } from "date-fns";

const RecentActivity = ({ activities }) => {
  return (
    <div className="activity-card">
      <h2>Recent Activity</h2>

      {activities.length === 0 ? (
        <p className="no-activity">No recent activity</p>
      ) : (
        <div className="activity-list">
          {activities.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className="activity-details">
                <p>
                  <strong>{activity.user}</strong> {activity.action} -
                  <span className="target"> {activity.target}</span>
                </p>
                <div className="activity-time">
                  {formatDistanceToNow(new Date(activity.timestamp))} ago
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
