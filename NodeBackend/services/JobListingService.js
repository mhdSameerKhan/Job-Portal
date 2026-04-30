const BaseService = require('./BaseService');

class JobListingService extends BaseService {
  constructor() {
    super('job_listings');
  }

  // Find jobs by employer_id
  async findByEmployerId(employerId, options = {}) {
    const { status, page, limit } = options;
    const all = await this.findAll({ employer_id: employerId });
    const filtered = status ? all.filter(j => j.is_active === (status === 'active')) : all;
    const sorted = filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (page && limit) {
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
    return sorted;
  }

  // Search jobs with filters
  async search(filters = {}, page = 1, limit = 10) {
    const { search, location, job_type, salary_min, salary_max, company_name, is_active = true } = filters;
    
    // Start with base query
    let query = {}; // avoid composite index requirements
    
    if (location) {
      // Note: Firestore doesn't support LIKE queries
      // For production, consider using Algolia or Elasticsearch for full-text search
      // For now, we'll do exact match or client-side filtering
      query.location = location;
    }

    if (job_type) {
      query.job_type = job_type;
    }

    // Get all results and sort by posted_date
    const all = await this.findAll(query);
    let items = all.sort((a, b) => new Date(b.posted_date || 0) - new Date(a.posted_date || 0));
    // Apply client-side filtering for search, salary, and company_name

    // Apply client-side filtering for search, salary, and company_name
    // Note: This is not ideal for large datasets. Consider using a search service.
    // Compute total after filtering
    let total = items.length;
    const EmployerService = require('./EmployerService');
    let employerIds = null;

    if (company_name) {
      const employers = await EmployerService.findAll({});
      employerIds = employers
        .filter(e => e.company_name && e.company_name.toLowerCase().includes(company_name.toLowerCase()))
        .map(e => e.id);
    }

    items = items.filter(job => {
      // is_active filter (previously in query to avoid composite index)
      if (is_active && job.is_active !== true) return false;
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch = 
          (job.title && job.title.toLowerCase().includes(searchLower)) ||
          (job.description && job.description.toLowerCase().includes(searchLower)) ||
          (job.requirements && job.requirements.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Salary filter
      if (salary_min && job.salary_max && job.salary_max < salary_min) return false;
      if (salary_max && job.salary_min && job.salary_min > salary_max) return false;

      // Company name filter
      if (company_name && employerIds && !employerIds.includes(job.employer_id)) return false;

      return true;
    });

    // Recalculate pagination after filtering
    total = items.length;

    // Manual pagination
    const start = (page - 1) * limit;
    const pagedItems = items.slice(start, start + limit);
    const result = {
      items: pagedItems,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    };
    // Populate employer details
    for (const job of result.items) {
      const employer = await EmployerService.findById(job.employer_id);
      if (employer) {
        const UserService = require('./UserService');
        const user = await UserService.findById(employer.user_id);
        job.employer = {
          ...employer,
          user
        };
      }
    }

    return result;
  }

  // Get job with employer details
  async findByIdWithEmployer(id) {
    const job = await this.findById(id);
    if (!job) return null;

    const EmployerService = require('./EmployerService');
    const employer = await EmployerService.findById(job.employer_id);
    
    if (employer) {
      const UserService = require('./UserService');
      const user = await UserService.findById(employer.user_id);
      job.employer = {
        ...employer,
        user
      };
    }

    return job;
  }
}

module.exports = new JobListingService();

