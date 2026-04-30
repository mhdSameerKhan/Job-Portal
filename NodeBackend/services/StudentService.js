const BaseService = require('./BaseService');

class StudentService extends BaseService {
  constructor() {
    super('students');
  }

  // Find student by user_id
  async findByUserId(userId) {
    return this.findOne({ user_id: userId });
  }

  // Get student with user details (manual join)
  async findByIdWithUser(id) {
    const student = await this.findById(id);
    if (!student) return null;

    const UserService = require('./UserService');
    const user = await UserService.findById(student.user_id);
    
    return {
      ...student,
      user
    };
  }

  // Get student by user_id with user details
  async findByUserIdWithUser(userId) {
    const student = await this.findByUserId(userId);
    if (!student) return null;

    const UserService = require('./UserService');
    const user = await UserService.findById(userId);
    
    return {
      ...student,
      user
    };
  }
}

module.exports = new StudentService();

