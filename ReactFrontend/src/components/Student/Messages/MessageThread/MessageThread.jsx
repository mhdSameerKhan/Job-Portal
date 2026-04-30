import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

const MessageThread = ({
  messages = [], 
  onSendMessage,
  formatTime,
  currentUser,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };

  const renderMessages = () => {
    if (!messages || messages.length === 0) {
      return (
        <div className="no-messages">
          No messages yet. Start the conversation!
        </div>
      );
    }

    return messages.map((message) => {
      // Handle different message formats
      const senderId = message?.sender?.id || message?.sender_id;
      const currentUserId = currentUser?.id || currentUser?.user?.id;
      const isSent = senderId === currentUserId;
      const timestamp = message?.timestamp || message?.created_at || message?.createdAt;
      
      return (
        <div
          key={message?.id || Math.random()}
          className={`message ${isSent ? "sent" : "received"}`}
        >
          <div className="message-content">
            <p>{message?.content || ""}</p>
            <span className="message-time">
              {timestamp ? formatTime(timestamp) : ""}
            </span>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="message-thread">
      <div className="messages-container">
        {renderMessages()}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={!currentUser} 
        />
        <button type="submit" disabled={!newMessage.trim() || !currentUser}>
          Send
        </button>
      </form>
    </div>
  );
};

MessageThread.propTypes = {
  messages: PropTypes.array,
  onSendMessage: PropTypes.func.isRequired,
  formatTime: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
};

MessageThread.defaultProps = {
  messages: [],
  currentUser: null,
};

export default MessageThread;
