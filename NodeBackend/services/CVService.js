const BaseService = require('./BaseService');

class CVService extends BaseService {
  constructor() {
    super('students_cv');
  }

  // Find CVs by student_id
  async findByStudentId(studentId) {
    const items = await this.findAll({ student_id: studentId });
    return items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // Get default CV for student
  async getDefaultByStudentId(studentId) {
    return this.findOne({ student_id: studentId, is_default: true });
  }

  // Set CV as default (unset others)
  async setDefault(cvId, studentId) {
    // Unset all other default CVs for this student
    const allCVs = await this.findByStudentId(studentId);
    for (const cv of allCVs) {
      if (cv.id !== cvId && cv.is_default) {
        await this.update(cv.id, { is_default: false });
      }
    }

    // Set this CV as default
    return this.update(cvId, { is_default: true });
  }

  // Create CV (optionally set as default)
  async create(data) {
    // If setting as default, unset other defaults first
    if (data.is_default && data.student_id) {
      const defaultCV = await this.getDefaultByStudentId(data.student_id);
      if (defaultCV) {
        await this.update(defaultCV.id, { is_default: false });
      }
    }

    return super.create(data);
  }
}

module.exports = new CVService();

