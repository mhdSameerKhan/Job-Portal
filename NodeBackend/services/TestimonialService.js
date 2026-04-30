const BaseService = require('./BaseService');

class TestimonialService extends BaseService {
  constructor() {
    super('testimonials');
  }

  // Find active testimonials (for display on home page)
  async findActive(limit = null) {
    try {
      const query = { is_active: true };
      // Get all results first, then sort and limit in memory
      // (Firestore ordering requires an index, so we do client-side for simplicity)
      let results = await this.findAll(query);
      
      // Sort by created_at descending
      results = results.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
      
      // Apply limit if specified
      if (limit && limit > 0) {
        results = results.slice(0, limit);
      }
      
      return results;
    } catch (error) {
      console.error('Error finding active testimonials:', error);
      throw error;
    }
  }

  // Find testimonials by student_id (if testimonials are linked to students)
  async findByStudentId(studentId) {
    return this.findAll({ student_id: studentId, is_active: true });
  }
}

module.exports = new TestimonialService();

