const BaseService = require('./BaseService');

class ApplicationService extends BaseService {
  constructor() {
    super('applications');
  }

  // Find applications by job_id
  async findByJobId(jobId, options = {}) {
    const { status, page, limit } = options;
    const all = await this.findAll({ job_id: jobId });
    const filtered = status ? all.filter(a => a.status === status) : all;
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

  // Find applications by student_id
  async findByStudentId(studentId, options = {}) {
    const { page, limit } = options;
    const query = { student_id: studentId };
    const all = await this.findAll(query);
    const sorted = all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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

  // Check if student already applied to job
  async hasApplied(jobId, studentId) {
    const application = await this.findOne({ job_id: jobId, student_id: studentId });
    return application !== null;
  }

  // Create application (with duplicate check)
  async create(data) {
    // Check for duplicate
    const existing = await this.hasApplied(data.job_id, data.student_id);
    if (existing) {
      throw new Error('Application already exists for this job');
    }

    return super.create(data);
  }

  // Get application with related data
  async findByIdWithDetails(id) {
    const application = await this.findById(id);
    if (!application) return null;

    // Populate job
    const JobListingService = require('./JobListingService');
    application.job = await JobListingService.findById(application.job_id);

    // Populate student
    const StudentService = require('./StudentService');
    application.student = await StudentService.findByIdWithUser(application.student_id);

    // Populate CV if exists
    if (application.cv_id) {
      const CVService = require('./CVService');
      application.cv = await CVService.findById(application.cv_id);
    }

    return application;
  }

  // Get applications with details for a job
  async findByJobIdWithDetails(jobId, options = {}) {
    const result = await this.findByJobId(jobId, options);
    
    if (result.items) {
      // Paginated result
      for (const app of result.items) {
        await this.populateApplicationDetails(app);
      }
    } else {
      // Array result
      for (const app of result) {
        await this.populateApplicationDetails(app);
      }
    }

    return result;
  }

  // Find applications by multiple job_ids efficiently
  // Firestore 'in' operator supports up to 10 values, so we batch if needed
  async findByJobIds(jobIds, options = {}) {
    const { status } = options;
    
    if (!jobIds || jobIds.length === 0) {
      return [];
    }

    try {
      // Firestore 'in' operator supports up to 10 values
      const BATCH_SIZE = 10;
      let allApplications = [];

      // Process in batches of 10
      for (let i = 0; i < jobIds.length; i += BATCH_SIZE) {
        const batch = jobIds.slice(i, i + BATCH_SIZE);
        
        // Query applications where job_id is in this batch
        const snapshot = await this.collection
          .where('job_id', 'in', batch)
          .get();
        
        const batchApplications = snapshot.docs.map(doc => this.docToObject(doc));
        allApplications = allApplications.concat(batchApplications);
      }

      // Filter by status if provided
      if (status) {
        allApplications = allApplications.filter(app => app.status === status);
      }

      // Sort by application_date descending (most recent first)
      allApplications.sort((a, b) => {
        let dateA = a.application_date?.toDate ? a.application_date.toDate() : new Date(a.application_date || a.created_at || 0);
        let dateB = b.application_date?.toDate ? b.application_date.toDate() : new Date(b.application_date || b.created_at || 0);
        return dateB - dateA;
      });

      return allApplications;
    } catch (error) {
      console.error('Error finding applications by job IDs:', error);
      // If quota exceeded, return empty array to prevent further errors
      if (error.code === 8 || error.message?.includes('Quota exceeded')) {
        console.warn('Firebase quota exceeded, returning empty array');
        return [];
      }
      throw error;
    }
  }

  // Batch populate applications with related data (efficient - reduces queries)
  async populateApplicationsBatch(applications) {
    if (!applications || applications.length === 0) {
      return applications;
    }

    const JobListingService = require('./JobListingService');
    const EmployerService = require('./EmployerService');
    const StudentService = require('./StudentService');
    const CVService = require('./CVService');
    const UserService = require('./UserService');

    // Collect all unique IDs
    const jobIds = [...new Set(applications.map(app => app.job_id).filter(Boolean))];
    const studentIds = [...new Set(applications.map(app => app.student_id).filter(Boolean))];
    const cvIds = [...new Set(applications.map(app => app.cv_id).filter(Boolean))];

    // Batch fetch all related entities
    const jobsMap = new Map();
    const studentsMap = new Map();
    const usersMap = new Map();
    const cvsMap = new Map();

    // Fetch all jobs in parallel
    const employerIdsSet = new Set();
    const jobPromises = jobIds.map(async (jobId) => {
      try {
        const job = await JobListingService.findById(jobId);
        if (job) {
          jobsMap.set(jobId, job);
          // Collect employer IDs for batch fetching
          if (job.employer_id) {
            employerIdsSet.add(job.employer_id);
          }
        }
      } catch (error) {
        console.error(`Error fetching job ${jobId}:`, error);
      }
    });
    await Promise.all(jobPromises);

    // Fetch all employers in parallel
    const employersMap = new Map();
    const employerUserIdsSet = new Set();
    const employerPromises = Array.from(employerIdsSet).map(async (employerId) => {
      try {
        const employer = await EmployerService.findById(employerId);
        if (employer) {
          employersMap.set(employerId, employer);
          if (employer.user_id) {
            employerUserIdsSet.add(employer.user_id);
          }
        }
      } catch (error) {
        console.error(`Error fetching employer ${employerId}:`, error);
      }
    });
    await Promise.all(employerPromises);

    // Fetch all employer users in parallel
    const employerUserPromises = Array.from(employerUserIdsSet).map(async (userId) => {
      try {
        if (!usersMap.has(userId)) {
          const user = await UserService.findById(userId);
          if (user) usersMap.set(userId, user);
        }
      } catch (error) {
        console.error(`Error fetching employer user ${userId}:`, error);
      }
    });
    await Promise.all(employerUserPromises);

    // Attach employers to jobs
    jobsMap.forEach((job) => {
      if (job.employer_id && employersMap.has(job.employer_id)) {
        const employer = employersMap.get(job.employer_id);
        job.employer = {
          ...employer,
          user: employer.user_id ? usersMap.get(employer.user_id) : null
        };
      }
    });

    // Fetch all students in parallel first
    const studentUserIdsSet = new Set();
    const studentPromises = studentIds.map(async (studentId) => {
      try {
        const student = await StudentService.findById(studentId);
        if (student) {
          studentsMap.set(studentId, student);
          if (student.user_id) {
            studentUserIdsSet.add(student.user_id);
          }
        }
      } catch (error) {
        console.error(`Error fetching student ${studentId}:`, error);
      }
    });
    await Promise.all(studentPromises);

    // Fetch all student users in parallel
    const studentUserPromises = Array.from(studentUserIdsSet).map(async (userId) => {
      try {
        if (!usersMap.has(userId)) {
          const user = await UserService.findById(userId);
          if (user) usersMap.set(userId, user);
        }
      } catch (error) {
        console.error(`Error fetching student user ${userId}:`, error);
      }
    });
    await Promise.all(studentUserPromises);

    // Attach users to students
    studentsMap.forEach((student, studentId) => {
      if (student.user_id && usersMap.has(student.user_id)) {
        studentsMap.set(studentId, {
          ...student,
          user: usersMap.get(student.user_id)
        });
      }
    });

    // Fetch all CVs in parallel
    const cvPromises = cvIds.map(async (cvId) => {
      try {
        const cv = await CVService.findById(cvId);
        if (cv) cvsMap.set(cvId, cv);
      } catch (error) {
        console.error(`Error fetching CV ${cvId}:`, error);
      }
    });
    await Promise.all(cvPromises);

    // Map related data back to applications
    applications.forEach(app => {
      if (app.job_id && jobsMap.has(app.job_id)) {
        app.job = jobsMap.get(app.job_id);
      }
      if (app.student_id && studentsMap.has(app.student_id)) {
        app.student = studentsMap.get(app.student_id);
      }
      if (app.cv_id && cvsMap.has(app.cv_id)) {
        app.cv = cvsMap.get(app.cv_id);
      }
    });

    return applications;
  }

  // Populate application details (instance method) - kept for backward compatibility
  async populateApplicationDetails(application) {
    const StudentService = require('./StudentService');
    const CVService = require('./CVService');

    application.student = await StudentService.findByIdWithUser(application.student_id);
    
    if (application.cv_id) {
      application.cv = await CVService.findById(application.cv_id);
    }
  }
}

module.exports = new ApplicationService();

