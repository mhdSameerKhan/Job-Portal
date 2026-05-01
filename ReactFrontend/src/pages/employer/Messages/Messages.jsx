import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import messagingService from "../../../services/messagingService";
import employerService from "../../../services/employerService";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import ConversationsHeader from "../../../components/Student/Messages/ConversationsHeader/ConversationsHeader";
import ConversationList from "../../../components/Student/Messages/ConversationList/ConversationList";
import MessageThread from "../../../components/Student/Messages/MessageThread/MessageThread";
import NotificationsPanel from "../../../components/Student/Messages/NotificationsPanel/NotificationsPanel";
import "./Messages.css";

// No polling - user requested no realtime updates

import { employerMockContacts } from "../../student/Messages/mockData";

const MessagesScreen = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStartingConversation, setIsStartingConversation] = useState(false);
  const messagesEndRef = useRef(null);

  const { candidateId, jobId, candidateName } = location.state || {};

  const isMock = String(selectedConversation).startsWith("mock-");
  const mockConv = employerMockContacts.find(c => c.id === selectedConversation);

  const currentConversation = isMock
    ? mockConv
    : conversations.find((conv) => conv.id === selectedConversation);

  const recipientName = isMock
    ? mockConv.name
    : currentConversation?.student?.user
      ? `${currentConversation.student.user.first_name || ''} ${currentConversation.student.user.last_name || ''}`.trim() || candidateName || "Student"
      : candidateName || "Student";

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await messagingService.getConversations();
      const conversationData = response.data || [];
      
      // Combine real and mock conversations
      setConversations([...conversationData, ...employerMockContacts]);
      return conversationData;
    } catch (err) {
      setError("Failed to load conversations. Please try again.");
      console.error("Error fetching conversations:", err);
      // Even if fetch fails, show mock contacts
      setConversations(employerMockContacts);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    if (!conversationId) return;

    if (String(conversationId).startsWith("mock-")) {
      const mock = employerMockContacts.find(c => c.id === conversationId);
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

  const handleSendMessage = async (messageContent) => {
    if (!messageContent.trim() || !selectedConversation) return;

    const tempMessageId = Date.now();
    const tempMessage = {
      id: tempMessageId,
      content: messageContent,
      sender: user?.user || user,
      timestamp: new Date().toISOString(),
      is_read: false,
    };

    setMessages((prev) => [...prev, tempMessage]);
    scrollToBottom();

    if (String(selectedConversation).startsWith("mock-")) {
      // Fake reply logic
      setTimeout(() => {
        const reply = {
          id: Date.now() + 1,
          content: "Hello! I am a student candidate test bot. I've received your message and will respond as soon as I can. This is a great opportunity!",
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

      // Handle response format
      const messageData = response.data?.data?.message || response.data?.message || response.data;
      
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempMessageId ? messageData : msg))
      );

      setConversations((prev) =>
        prev
          .map((conv) =>
            conv.id === selectedConversation
              ? {
                  ...conv,
                  last_message: {
                    content: messageContent,
                    timestamp: new Date().toISOString(),
                    sender: user?.user || user,
                  },
                  updated_at: new Date().toISOString(),
                }
              : conv
          )
          .sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0))
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
            Starting conversation with {candidateName || "student"}...
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

  // Get user type safely
  const userType = user?.user?.user_type || user?.user_type || 2;

  return (
    <div className="messages-screen">
      <div className="conversations-column">
        <ConversationsHeader unreadCount={0} />
        <ConversationList
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={async (conversationId) => {
            setSelectedConversation(conversationId);
            await fetchMessages(conversationId);
          }}
          formatTime={formatTime}
          currentUserType={userType}
        />
        <NotificationsPanel />
      </div>

      <div className="message-column">
        <MessageThread
          messages={messages}
          onSendMessage={handleSendMessage}
          formatTime={formatTime}
          currentUser={user?.user || user}
        />
      </div>
    </div>
  );
};

export default MessagesScreen;
