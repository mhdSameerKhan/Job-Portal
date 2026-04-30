const BaseService = require('./BaseService');

class MessageService extends BaseService {
  constructor() {
    super('messages');
  }

  // Find messages by conversation_id
  async findByConversationId(conversationId, page = 1, limit = 50) {
    const all = await this.findAll({ conversation_id: conversationId });
    const sorted = all.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const start = (page - 1) * limit;
    const items = sorted.slice(start, start + limit);
    return {
      items,
      pagination: {
        total: sorted.length,
        page,
        pages: Math.ceil(sorted.length / limit),
        limit
      }
    };
  }

  // Get last message in conversation
  async getLastMessage(conversationId) {
    const messages = await this.findAll({ conversation_id: conversationId });
    const sorted = messages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return sorted.length > 0 ? sorted[0] : null;
  }

  // Create message and update conversation timestamp
  async create(data) {
    const message = await super.create(data);
    
    // Update conversation updated_at
    const ConversationService = require('./ConversationService');
    const conversation = await ConversationService.findById(data.conversation_id);
    if (conversation) {
      const { Timestamp } = require('firebase-admin/firestore');
      await ConversationService.update(conversation.id, { updated_at: Timestamp.now() });
    }

    // Populate sender details
    await this.populateMessageDetails(message);
    
    return message;
  }

  // Populate message with sender details
  async populateMessageDetails(message) {
    const UserService = require('./UserService');
    const sender = await UserService.findById(message.sender_id);
    message.sender = sender;
  }

  // Batch populate messages with sender details (optimized)
  async populateMessagesBatch(messages) {
    if (!messages || messages.length === 0) return messages;

    const UserService = require('./UserService');
    
    // Collect all unique sender IDs
    const senderIds = [...new Set(messages.map(m => m.sender_id).filter(Boolean))];
    
    // Batch fetch all senders in parallel
    const senders = await Promise.all(senderIds.map(id => UserService.findById(id)));
    
    // Create lookup map
    const senderMap = new Map();
    senders.filter(Boolean).forEach(sender => senderMap.set(sender.id, sender));
    
    // Attach sender data to messages
    return messages.map(message => {
      if (message.sender_id && senderMap.has(message.sender_id)) {
        message.sender = senderMap.get(message.sender_id);
      }
      return message;
    });
  }

  // Get messages with sender details (optimized batch version)
  async findByConversationIdWithDetails(conversationId, page = 1, limit = 50) {
    const result = await this.findByConversationId(conversationId, page, limit);
    result.items = await this.populateMessagesBatch(result.items);
    return result;
  }

  // Mark message as read
  async markAsRead(messageId) {
    return this.update(messageId, { is_read: true });
  }

  // Get unread count for user (optimized)
  async getUnreadCount(userId) {
    const ConversationService = require('./ConversationService');
    const UserService = require('./UserService');
    const StudentService = require('./StudentService');
    const EmployerService = require('./EmployerService');
    
    const user = await UserService.findById(userId);
    if (!user) return 0;

    const userType = user.user_type;
    let participantId = null;
    if (userType === 1) {
      const student = await StudentService.findByUserId(userId);
      participantId = student?.id || null;
    } else if (userType === 2) {
      const employer = await EmployerService.findByUserId(userId);
      participantId = employer?.id || null;
    }
    if (!participantId) return 0;

    const conversations = await ConversationService.findByUserId(participantId, userType);
    const conversationIds = conversations.map(c => c.id);

    if (conversationIds.length === 0) return 0;

    // Batch fetch all messages for all conversations at once
    // Firestore 'in' operator supports up to 10 values, so batch if needed
    let allMessages = [];
    for (let i = 0; i < conversationIds.length; i += 10) {
      const batch = conversationIds.slice(i, i + 10);
      const batchMessages = await Promise.all(
        batch.map(convId => this.findAll({ conversation_id: convId }))
      );
      allMessages = allMessages.concat(...batchMessages);
    }

    // Count unread messages where sender is not the user
    return allMessages.filter(m => m.is_read === false && m.sender_id !== userId).length;
  }
}

module.exports = new MessageService();

