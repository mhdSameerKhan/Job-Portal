const BaseService = require('./BaseService');

class EmployerService extends BaseService {
  constructor() {
    super('employers');
  }

  // Find employer by user_id
  async findByUserId(userId) {
    return this.findOne({ user_id: userId });
  }

  // Get employer with user details (manual join)
  async findByIdWithUser(id) {
    const employer = await this.findById(id);
    if (!employer) return null;

    const UserService = require('./UserService');
    const user = await UserService.findById(employer.user_id);
    
    return {
      ...employer,
      user
    };
  }

  // Get employer by user_id with user details
  async findByUserIdWithUser(userId) {
    const employer = await this.findByUserId(userId);
    if (!employer) return null;

    const UserService = require('./UserService');
    const user = await UserService.findById(userId);
    
    return {
      ...employer,
      user
    };
  }

  // Find employers by company name (for search)
  async findByCompanyName(companyName) {
    // Note: Firestore doesn't support LIKE queries directly
    // This is a simple equality check. For partial matching, 
    // you'd need to use a search service or implement client-side filtering
    return this.findAll({ company_name: companyName });
  }
}

module.exports = new EmployerService();

