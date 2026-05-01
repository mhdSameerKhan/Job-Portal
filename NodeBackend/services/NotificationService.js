const BaseService = require('./BaseService');

class NotificationService extends BaseService {
  constructor() {
    super('notifications');
  }

  // Create a new notification for a user
  async notify(userId, type, message, relatedId = null) {
    return this.create({
      user_id: userId,
      type,
      message,
      related_id: relatedId,
      is_read: false
    });
  }

  // Get unread notifications for a user
  async getUnreadForUser(userId) {
    const results = await this.findAll({
      user_id: userId,
      is_read: false
    });
    return results.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId) {
    try {
      const unread = await this.getUnreadForUser(userId);
      const batch = this.db.batch();
      
      unread.forEach(notification => {
        const docRef = this.collection.doc(notification.id);
        batch.update(docRef, { is_read: true, updated_at: new Date() });
      });
      
      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
