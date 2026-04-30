import React from "react";
import "./ConversationsHeader.css";

const ConversationsHeader = ({ unreadCount }) => {
  return (
    <div className="conversations-header">
      <h1>Conversations</h1>
      {unreadCount > 0 && (
        <div className="unread-badge">{unreadCount} unread</div>
      )}
    </div>
  );
};

export default ConversationsHeader;
