import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import messagingService from "../../../services/messagingService";
import employerService from "../../../services/employerService";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import "./Messages.css";

// No polling - user requested no realtime updates

import { mockContacts } from "./mockData";

const MessagesScreen = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStartingConversation, setIsStartingConversation] = useState(false);
  const messagesEndRef = useRef(null);

  const { candidateId, jobId, candidateName } = location.state || {};

  // Check if selected is a mock conversation
  const isMock = String(selectedConversation).startsWith("mock-");
  const mockConv = mockContacts.find(c => c.id === selectedConversation);

  const currentConversation = isMock 
    ? mockConv 
    : conversations.find((conv) => conv.id === selectedConversation);

  const recipientName = isMock
    ? mockConv.name
    : user.user_type === 2 
      ? currentConversation?.student?.user?.name || candidateName || "Student"
      : currentConversation?.employer?.company_name || "Employer";

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await messagingService.getConversations();
      const conversationData = response.data || [];
      
      // Combine real and mock conversations
      setConversations([...conversationData, ...mockContacts]);
      return conversationData;
    } catch (err) {
      setError("Failed to load conversations. Please try again.");
      console.error("Error fetching conversations:", err);
      // Even if fetch fails, show mock contacts
      setConversations(mockContacts);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    if (!conversationId) return;
    
    if (String(conversationId).startsWith("mock-")) {
      const mock = mockContacts.find(c => c.id === conversationId);
      // Adapt mock messages to the app's expected format
      const adaptedMessages = mock.messages.map(m => ({
        id: m.id,
        content: m.text,
        sender_id: m.sender === "me" ? user?.id : "other",
        sender: m.sender === "me" ? (user?.user || user) : { id: "other", name: mock.name },
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString()
      }));
      setMessages(adaptedMessages);
      scrollToBottom();
      return;
    }

    try {
      const response = await messagingService.getMessages(conversationId);
      const messagesData = response?.data?.messages || response?.messages || [];
      setMessages(Array.isArray(messagesData) ? messagesData : []);
      scrollToBottom();
    } catch (err) {
      setError("Failed to load messages. Please try again.");
      console.error("Error fetching messages:", err);
      setMessages([]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startNewConversation = async (studentId, jobId) => {
  try {
    setIsStartingConversation(true);
    setError(null);
    
    const response = await employerService.startConversation(
      studentId,
      jobId
    );

    // Handle different response formats
    // Backend returns: { success: true, data: { conversation: {...} } }
    // Service returns: response.data.data || response.data (which is { conversation: {...} })
    const conversationData = response.conversation || response.data?.conversation || response.data;
    
    if (!conversationData || !conversationData.id) {
      throw new Error('Invalid response from server - conversation not found');
    }

    const newConversation = conversationData;
    setConversations((prev) => [newConversation, ...prev]);
    setSelectedConversation(newConversation.id);
    await fetchMessages(newConversation.id);

    navigate(location.pathname, { replace: true });
  } catch (err) {
    setError(err.message || "Failed to start conversation");
    console.error("Error details:", err.response?.data || err.message);
  } finally {
    setIsStartingConversation(false);
  }
};



  useEffect(() => {
    const initializeConversations = async () => {
      const conversationData = await fetchConversations();

      if (candidateId && jobId) {
        const existingConversation = conversationData.find(
          (conv) => conv.student?.id == candidateId && conv.job?.id == jobId
        );

        if (existingConversation) {
          setSelectedConversation(existingConversation.id);
          await fetchMessages(existingConversation.id);
        } else {
          await startNewConversation(candidateId, jobId);
        }
      } else if (conversationData.length > 0 && !selectedConversation) {
        setSelectedConversation(conversationData[0].id);
        await fetchMessages(conversationData[0].id);
      }
    };

    initializeConversations();
  }, [candidateId, jobId]);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const messageContent = newMessage.trim();
    const tempMessageId = Date.now();
    const tempMessage = {
      id: tempMessageId,
      content: messageContent,
      sender: user?.user || user,
      sender_id: user?.user?.id || user?.id,
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString(),
      is_read: false,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");
    scrollToBottom();

    if (String(selectedConversation).startsWith("mock-")) {
      // Fake reply logic
      setTimeout(() => {
        const reply = {
          id: Date.now() + 1,
          content: "Thank you for your message! I'm a bot replying to your test message. We will get back to you soon.",
          sender: { id: "other", name: recipientName },
          sender_id: "other",
          timestamp: new Date().toISOString(),
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, reply]);
        scrollToBottom();
      }, 1000);
      return;
    }

    try {
      const response = await messagingService.sendMessage(
        selectedConversation,
        messageContent
      );

      const messageData = response?.data?.message || response?.message || response?.data;
      
      if (messageData && messageData.id) {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempMessageId ? messageData : msg))
        );
      } else {
        await fetchMessages(selectedConversation);
      }

      setConversations((prev) =>
        prev
          .map((conv) =>
            conv.id === selectedConversation
              ? {
                  ...conv,
                  last_message: {
                    content: messageContent,
                    timestamp: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                    sender: user?.user || user,
                  },
                  updated_at: new Date().toISOString(),
                }
              : conv
          )
          .sort((a, b) => {
            const dateA = new Date(a.updated_at || a.created_at || 0);
            const dateB = new Date(b.updated_at || b.created_at || 0);
            return dateB - dateA;
          })
      );
    } catch (err) {
      setError("Failed to send message. Please try again.");
      console.error("Error sending message:", err);
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessageId));
    }
  };

  const formatTime = (dateString) => {
    try {
      if (!dateString) return "";
      // Handle Firestore Timestamp format
      const date = dateString.toDate ? dateString.toDate() : new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return dateString || "";
    }
  };

  if (loading || isStartingConversation) {
    return (
      <div className="messages-screen">
        <LoadingSpinner />
        {isStartingConversation && (
          <div className="starting-conversation">
            Starting conversation with {candidateName}...
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="messages-screen">
        <div className="error-message">
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchConversations();
            }}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-screen">
      <div className="conversations-column">
        <div className="conversations-header">
          <h2>{user.user_type === 2 ? "Your Conversations" : "Messages"}</h2>
        </div>

        <div className="conversation-list">
          {conversations.map((conversation) => {
            const isMock = String(conversation.id).startsWith("mock-");
            const name = isMock
              ? conversation.name
              : user.user_type === 2
                ? conversation.student?.user?.name || "Student"
                : conversation.employer?.company_name || "Employer";

            return (
              <div
                key={conversation.id}
                className={`conversation-item ${
                  selectedConversation === conversation.id ? "active" : ""
                }`}
                onClick={() => setSelectedConversation(conversation.id)}
              >
                <div className="conversation-info">
                  <h4>
                    <span>
                      {name}
                      {isMock && (
                        <span className={`status-dot ${conversation.isOnline ? "online" : "offline"}`}></span>
                      )}
                    </span>
                    {isMock && conversation.unread && <span className="unread-badge">New</span>}
                  </h4>
                  <p className="last-message">
                    {isMock ? conversation.lastMessage : (conversation.last_message?.content || "No messages yet")}
                  </p>
                </div>
                <span className="conversation-time">
                  {isMock ? conversation.time : formatTime(conversation.updated_at)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="message-column">
        {selectedConversation ? (
          <>
            <div className="message-header">
              <h3>Chat with {recipientName}</h3>
            </div>

            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="no-messages">No messages yet. Start the conversation!</div>
              ) : (
                messages.map((message) => {
                  const senderId = message?.sender?.id || message?.sender_id;
                  const currentUserId = user?.user?.id || user?.id;
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
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="message-form">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={!selectedConversation}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || !selectedConversation}
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="no-conversation">
            {conversations.length === 0
              ? "You have no conversations yet"
              : "Select a conversation to view messages"}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesScreen;
