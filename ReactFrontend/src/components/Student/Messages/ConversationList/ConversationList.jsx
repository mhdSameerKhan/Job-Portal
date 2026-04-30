import React from "react";

const ConversationList = ({
  conversations = [], 
  selectedConversation,
  onSelectConversation,
  formatTime,
  currentUserType,
}) => {
  
  const getParticipantName = (conversation) => {
    if (!conversation) return "Unknown";

    try {
      if (currentUserType === 1) {
        return conversation.employer?.company_name || "Employer";
      } else {
        const student = conversation.student;
        return student
          ? `${student.user?.first_name || ""} ${
              student.user?.last_name || ""
            }`.trim() || "Student"
          : "Student";
      }
    } catch (e) {
      return "Participant";
    }
  };
const getLastMessage = (conversation) => {
    if (!conversation?.last_message) return "No messages yet";
    return conversation.last_message.content.length > 30
      ? `${conversation.last_message.content.substring(0, 30)}...`
      : conversation.last_message.content;
  };

  return (
    <div className="conversation-list">
      {conversations.map((conversation) => (
        <div
          key={conversation?.id || Math.random()}
          className={`conversation-item ${
            selectedConversation === conversation?.id ? "active" : ""
          }`}
          onClick={() =>
            conversation?.id && onSelectConversation(conversation.id)
          }
        >
          <div className="conversation-header">
            <h4>{getParticipantName(conversation)}</h4>
            <span className="time">
              {conversation?.updated_at
                ? formatTime(conversation.updated_at)
                : ""}
            </span>
          </div>
          <p className="last-message">{getLastMessage(conversation)}</p>
          {conversation?.unread_count > 0 && (
            <span className="unread-badge">{conversation.unread_count}</span>
          )}
        </div>
      ))}

      {conversations.length === 0 && (
        <div className="no-conversations">No conversations found</div>
      )}
    </div>
  );
};

export default ConversationList;
