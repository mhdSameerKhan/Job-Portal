const express = require('express');
const { Conversation, Message, User, Student, Employer } = require('../models');
const { authenticate } = require('../middleware/auth');
const { messageSchema: messageValidation } = require('../validators/schemas');
const router = express.Router();

// Get user's conversations - matches Django format
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found'
      });
    }

    let participantId = null;
    if (user.user_type === 1) {
      const student = await Student.findByUserId(userId);
      participantId = student?.id || null;
    } else if (user.user_type === 2) {
      const employer = await Employer.findByUserId(userId);
      participantId = employer?.id || null;
    }

    if (!participantId) {
      // Return empty array if profile doesn't exist (matching Django behavior)
      return res.json({
        status: 'success',
        data: []
      });
    }

    const conversations = await Conversation.findByUserIdWithDetails(participantId, user.user_type);

    // Format conversations to match expected format
    const formattedConversations = conversations.map(conv => ({
      id: conv.id,
      student: conv.student || null,
      employer: conv.employer || null,
      job: conv.job || null,
      created_at: conv.created_at,
      updated_at: conv.updated_at || conv.created_at,
      last_message: conv.last_message || null
    }));

    res.json({
      success: true,
      status: 'success',
      data: formattedConversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      status: 'error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get or create conversation with a specific user
// NOTE: This route must come before /conversations/:conversationId/messages to avoid route conflicts
router.get('/conversations/with/:userId', authenticate, async (req, res) => {
  console.log('GET /api/messaging/conversations/with/:userId - Route hit', req.params.userId);
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    console.log('Current user ID:', currentUserId, 'Other user ID:', otherUserId);


    // Get current user and profiles
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'Current user not found'
      });
    }

    const currentStudent = currentUser.user_type === 1 ? await Student.findByUserId(currentUserId) : null;
    const currentEmployer = currentUser.user_type === 2 ? await Employer.findByUserId(currentUserId) : null;

    // Try to find the other user - handle both user IDs and profile IDs (student/employer IDs)
    let otherUser = await User.findById(otherUserId);
    let otherStudent = null;
    let otherEmployer = null;
    let actualOtherUserId = otherUserId;

    // If not found as user ID, try as student ID
    if (!otherUser) {
      otherStudent = await Student.findById(otherUserId);
      if (otherStudent && otherStudent.user_id) {
        actualOtherUserId = otherStudent.user_id;
        otherUser = await User.findById(actualOtherUserId);
      }
    }

    // If still not found, try as employer ID
    if (!otherUser) {
      otherEmployer = await Employer.findById(otherUserId);
      if (otherEmployer && otherEmployer.user_id) {
        actualOtherUserId = otherEmployer.user_id;
        otherUser = await User.findById(actualOtherUserId);
      }
    }

    // If still not found, try finding by user_id in student/employer collections
    if (!otherUser) {
      // Try to find student with this as user_id
      const students = await Student.findAll({ user_id: otherUserId });
      if (students && students.length > 0) {
        otherStudent = students[0];
        actualOtherUserId = otherUserId; // This is already a user_id
        otherUser = await User.findById(actualOtherUserId);
      }
    }

    if (!otherUser) {
      // Try to find employer with this as user_id
      const employers = await Employer.findAll({ user_id: otherUserId });
      if (employers && employers.length > 0) {
        otherEmployer = employers[0];
        actualOtherUserId = otherUserId; // This is already a user_id
        otherUser = await User.findById(actualOtherUserId);
      }
    }

    if (!otherUser) {
      console.log('Other user not found with ID:', otherUserId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent messaging yourself
    if (currentUserId === actualOtherUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create conversation with yourself'
      });
    }

    // Now get the correct student/employer profiles based on user type if we don't have them yet
    if (!otherStudent && !otherEmployer) {
      if (otherUser.user_type === 1) {
        otherStudent = await Student.findByUserId(actualOtherUserId);
      } else if (otherUser.user_type === 2) {
        otherEmployer = await Employer.findByUserId(actualOtherUserId);
      }
    }

    console.log('Profiles - Current student:', !!currentStudent, 'Current employer:', !!currentEmployer);
    console.log('Profiles - Other student:', !!otherStudent, 'Other employer:', !!otherEmployer);

    // Determine student_id and employer_id
    const studentId = currentUser.user_type === 1 ? currentStudent?.id : otherStudent?.id;
    const employerId = currentUser.user_type === 2 ? currentEmployer?.id : otherEmployer?.id;

    if (!studentId || !employerId) {
      console.log('Missing profile - studentId:', studentId, 'employerId:', employerId);
      return res.status(400).json({
        success: false,
        message: 'Conversation must be between a student and an employer'
      });
    }

    console.log('Creating/finding conversation - studentId:', studentId, 'employerId:', employerId);

    // Get or create conversation
    const conversation = await Conversation.getOrCreate(studentId, employerId, null);

    console.log('Conversation found/created:', conversation.id);

    // Format conversation to match Django ConversationSerializer format
    const formattedConversation = {
      id: conversation.id,
      student: conversation.student || null,
      employer: conversation.employer || null,
      job: conversation.job || null,
      created_at: conversation.created_at,
      updated_at: conversation.updated_at || conversation.created_at,
      last_message: conversation.last_message || null
    };

    res.json({
      success: true,
      data: { conversation: formattedConversation }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get messages in a conversation
router.get('/conversations/:conversationId/messages', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const conversationId = req.params.conversationId;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is part of the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is part of conversation
    const user = await User.findById(userId);
    const student = user.user_type === 1 ? await Student.findByUserId(userId) : null;
    const employer = user.user_type === 2 ? await Employer.findByUserId(userId) : null;
    
    const isParticipant = (student && conversation.student_id === student.id) || 
                         (employer && conversation.employer_id === employer.id);
    
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const result = await Message.findByConversationIdWithDetails(conversationId, parseInt(page), parseInt(limit));

    res.json({
      success: true,
      data: {
        messages: result.items,
        pagination: result.pagination
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Send a message
router.post('/messages', authenticate, async (req, res) => {
  try {
    const senderId = req.user.id;
    const { error } = messageValidation.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({ field: detail.path[0], message: detail.message }))
      });
    }

    const { conversation_id, content } = req.body;

    // Verify user is part of the conversation
    const conversation = await Conversation.findById(conversation_id);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is part of conversation
    const user = await User.findById(senderId);
    const student = user.user_type === 1 ? await Student.findByUserId(senderId) : null;
    const employer = user.user_type === 2 ? await Employer.findByUserId(senderId) : null;
    
    const isParticipant = (student && conversation.student_id === student.id) || 
                         (employer && conversation.employer_id === employer.id);
    
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const message = await Message.create({
      conversation_id,
      sender_id: senderId,
      content,
      is_read: false
    });

    // Create notification for recipient
    const NotificationService = require('../services/NotificationService');
    const recipientProfileId = user.user_type === 1 ? conversation.employer_id : conversation.student_id;
    const recipientUserType = user.user_type === 1 ? 2 : 1;
    
    let recipientUserId;
    if (recipientUserType === 1) {
      const StudentService = require('../services/StudentService');
      const recipientStudent = await StudentService.findById(recipientProfileId);
      recipientUserId = recipientStudent?.user_id;
    } else {
      const EmployerService = require('../services/EmployerService');
      const recipientEmployer = await EmployerService.findById(recipientProfileId);
      recipientUserId = recipientEmployer?.user_id;
    }

    if (recipientUserId) {
      await NotificationService.notify(
        recipientUserId,
        'message',
        `New message from ${user.first_name || 'User'}`,
        conversation_id
      );
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Mark messages as read
router.put('/messages/:messageId/read', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const messageId = req.params.messageId;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Verify user is part of the conversation and not the sender
    const conversation = await Conversation.findById(message.conversation_id);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const user = await User.findById(userId);
    const student = user.user_type === 1 ? await Student.findByUserId(userId) : null;
    const employer = user.user_type === 2 ? await Employer.findByUserId(userId) : null;
    
    const isParticipant = (student && conversation.student_id === student.id) || 
                         (employer && conversation.employer_id === employer.id);
    
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (message.sender_id === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot mark your own message as read'
      });
    }

    await Message.markAsRead(messageId);

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get unread message count
router.get('/messages/unread-count', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await Message.getUnreadCount(userId);

    res.json({
      status: 'success',
      data: { unread_count: unreadCount }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
