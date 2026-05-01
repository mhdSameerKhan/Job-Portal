import React, { useState, useEffect, useRef } from "react";
import notificationService from "../../../services/notificationService";
import "./NotificationBell.css";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    const data = await notificationService.getNotifications();
    setNotifications(data || []);
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications([]);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button className="bell-button" onClick={() => setIsOpen(!isOpen)}>
        <span className="bell-icon">🔔</span>
        {notifications.length > 0 && (
          <span className="bell-badge">{notifications.length}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>Notifications</h3>
            {notifications.length > 0 && (
              <button onClick={handleMarkAllRead}>Mark all read</button>
            )}
          </div>
          <div className="dropdown-content">
            {notifications.length === 0 ? (
              <p className="no-notifications">No new notifications</p>
            ) : (
              <ul>
                {notifications.map((notif) => (
                  <li key={notif.id} className="notification-item">
                    <div className="notif-message">{notif.message}</div>
                    <div className="notif-time">
                      {new Date(notif.created_at).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
