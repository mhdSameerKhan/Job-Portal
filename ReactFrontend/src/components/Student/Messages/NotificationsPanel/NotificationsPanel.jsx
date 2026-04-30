import React from "react";
import "./NotificationsPanel.css";

const NotificationsPanel = () => {
  const notifications = [
    {
      id: 1,
      type: "message",
      text: "New message from TechStart Solutions",
      time: "Just now",
      read: false,
    },
    {
      id: 2,
      type: "application",
      text: "Your application to GrowthLabs was viewed",
      time: "1h ago",
      read: true,
    },
    {
      id: 3,
      type: "message",
      text: "AnalyticsPro sent you a meeting invite",
      time: "3h ago",
      read: true,
    },
  ];

  return (
    <div className="notifications-panel">
      <h2>Notifications</h2>
      <div className="notifications-list">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`notification-item ${notif.read ? "" : "unread"}`}
          >
            <div className={`notification-icon ${notif.type}`}>
              {notif.type === "message" ? "💬" : "📄"}
            </div>
            <div className="notification-content">
              <p className="notification-text">{notif.text}</p>
              <p className="notification-time">{notif.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPanel;
