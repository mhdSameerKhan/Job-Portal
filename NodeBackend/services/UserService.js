const BaseService = require('./BaseService');
const bcrypt = require('bcryptjs');

class UserService extends BaseService {
  constructor() {
    super('users');
  }

  // Create user with password hashing
  async create(data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return super.create(data);
  }

  // Find user by email
  async findByEmail(email) {
    return this.findOne({ email });
  }

  // Update user (with password hashing if password is being updated)
  async update(id, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return super.update(id, data);
  }

  // Validate password
  async validatePassword(user, password) {
    return bcrypt.compare(password, user.password);
  }

  // Update last login
  async updateLastLogin(id) {
    const { Timestamp } = require('firebase-admin/firestore');
    return this.update(id, { last_login: Timestamp.now() });
  }
}

module.exports = new UserService();

