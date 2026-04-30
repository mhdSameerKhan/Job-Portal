const BaseService = require('./BaseService');

class UserProfileService extends BaseService {
  constructor() {
    super('user_profiles');
  }

  // Find profile by user_id
  async findByUserId(userId) {
    return this.findOne({ user_id: userId });
  }

  // Create or update profile
  async upsertByUserId(userId, data) {
    const existing = await this.findByUserId(userId);
    if (existing) {
      return this.update(existing.id, { ...data, user_id: userId });
    } else {
      return this.create({ ...data, user_id: userId });
    }
  }
}

module.exports = new UserProfileService();

