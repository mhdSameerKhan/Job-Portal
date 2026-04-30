const BaseService = require('./BaseService');

class AdminActivityLogService extends BaseService {
  constructor() {
    super('admin_activity_logs');
  }

  // Find logs by admin_id
  async findByAdminId(adminId, page = 1, limit = 20) {
    return this.paginate(
      { admin_id: adminId },
      { field: 'timestamp', direction: 'desc' },
      page,
      limit
    );
  }

  // Get all logs with pagination
  async findAllLogs(page = 1, limit = 20) {
    return this.paginate(
      {},
      { field: 'timestamp', direction: 'desc' },
      page,
      limit
    );
  }

  // Create log entry
  async createLog(adminId, action, details, ipAddress) {
    const { Timestamp } = require('firebase-admin/firestore');
    return this.create({
      admin_id: adminId,
      action,
      details,
      ip_address: ipAddress,
      timestamp: Timestamp.now()
    });
  }
}

module.exports = new AdminActivityLogService();

