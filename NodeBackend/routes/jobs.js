const express = require('express');
const { JobListing, Employer, Application, Student, User, CV } = require('../models');
const { authenticate } = require('../middleware/auth');
const { jobListingSchema: jobListingValidation, jobUpdateSchema } = require('../validators/schemas');
const router = express.Router();

// Get all job listings (public)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      location, 
      job_type, 
      salary_min, 
      salary_max, 
      company_name 
    } = req.query;

    const result = await JobListing.search({
      search,
      location,
      job_type,
      salary_min,
      salary_max,
      company_name,
      is_active: true
    }, parseInt(page), parseInt(limit));

    res.json({
      jobs: result.items,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    if (error && error.stack) {
      console.error(error.stack);
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get single job listing (public)
router.get('/:id', async (req, res) => {
  try {
    const job = await JobListing.findByIdWithEmployer(req.params.id);

    if (!job || !job.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      data: { job }
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create job listing (employer only)
router.post('/', authenticate, async (req, res) => {
  try {
    // Check if user is an employer
    const user = await User.findById(req.user.id);
    if (user.user_type !== 2) {
      return res.status(403).json({
        success: false,
        message: 'Only employers can create job listings'
      });
    }

    const employer = await Employer.findByUserId(req.user.id);
    if (!employer) {
      return res.status(404).json({
        success: false,
        message: 'Employer profile not found'
      });
    }

    // Validate deadline format first
    if (!req.body.deadline) {
      return res.status(400).json({
        deadline: ['Deadline is required']
      });
    }

    // Validate deadline is not in the past
    let deadlineDate;
    try {
      deadlineDate = new Date(req.body.deadline);
      if (isNaN(deadlineDate.getTime())) {
        return res.status(400).json({
          deadline: ['Invalid date format. Use YYYY-MM-DD.']
        });
      }
      
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      deadlineDate.setHours(0, 0, 0, 0);
      
      if (deadlineDate < now) {
        return res.status(400).json({
          deadline: ['Deadline cannot be in the past']
        });
      }
    } catch (e) {
      return res.status(400).json({
        deadline: ['Invalid date format. Use YYYY-MM-DD.']
      });
    }

    // Prepare request body for validation
    const validationData = { ...req.body };
    if (validationData.deadline && typeof validationData.deadline === 'string') {
      validationData.deadline = deadlineDate;
    }

    const { error } = jobListingValidation.validate(validationData, { abortEarly: false });
    if (error) {
      // Format errors to match Django format
      const errorDetails = {};
      error.details.forEach(detail => {
        const field = detail.path && detail.path.length > 0 ? detail.path[0] : 'non_field_errors';
        if (!errorDetails[field]) {
          errorDetails[field] = [detail.message];
        } else if (Array.isArray(errorDetails[field])) {
          errorDetails[field].push(detail.message);
        } else {
          errorDetails[field] = [errorDetails[field], detail.message];
        }
      });
      
      return res.status(400).json(errorDetails);
    }

    const {
      title,
      description,
      requirements,
      responsibilities,
      location,
      job_type,
      salary_min,
      salary_max,
      salary_currency,
      is_remote,
      deadline,
      is_active
    } = req.body;

    const { Timestamp } = require('firebase-admin/firestore');
    const job = await JobListing.create({
      employer_id: employer.id,
      title,
      description,
      company_name: employer.company_name || '',
      requirements,
      responsibilities: responsibilities || '',
      location,
      job_type,
      salary_min: salary_min ? parseFloat(salary_min) : null,
      salary_max: salary_max ? parseFloat(salary_max) : null,
      salary_currency: salary_currency || 'USD',
      is_remote: is_remote || false,
      posted_date: Timestamp.now(),
      deadline: deadline ? Timestamp.fromDate(new Date(deadline)) : null,
      is_active: is_active !== undefined ? is_active : true
    });

    // Populate job with employer details for response (matching Django format)
    const JobListingService = require('../services/JobListingService');
    const populatedJob = await JobListingService.findByIdWithEmployer(job.id);

    res.status(201).json({
      success: true,
      message: 'Job listing created successfully',
      data: { job: populatedJob }
    });
  } catch (error) {
    console.error('Create job error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update job listing (employer only)
router.put('/:id', authenticate, async (req, res) => {
  try {
    // Check if user is an employer
    const user = await User.findById(req.user.id);
    if (user.user_type !== 2) {
      return res.status(403).json({
        success: false,
        message: 'Only employers can update job listings'
      });
    }

    const employer = await Employer.findByUserId(req.user.id);
    if (!employer) {
      return res.status(404).json({
        success: false,
        message: 'Employer profile not found'
      });
    }

    const job = await JobListing.findById(req.params.id);

    if (!job || job.employer_id !== employer.id) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const { error } = jobUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({ field: detail.path[0], message: detail.message }))
      });
    }

    const {
      title,
      description,
      requirements,
      responsibilities,
      location,
      job_type,
      salary_min,
      salary_max,
      salary_currency,
      is_remote,
      deadline,
      is_active
    } = req.body;

    const updateData = {
      title,
      description,
      requirements,
      responsibilities: responsibilities !== undefined ? responsibilities : job.responsibilities,
      location,
      job_type,
      salary_min: salary_min !== undefined ? (salary_min !== null && salary_min !== '' ? parseFloat(salary_min) : null) : job.salary_min,
      salary_max: salary_max !== undefined ? (salary_max !== null && salary_max !== '' ? parseFloat(salary_max) : null) : job.salary_max,
      salary_currency: salary_currency || job.salary_currency || 'USD',
      is_remote: is_remote !== undefined ? is_remote : job.is_remote,
      is_active: is_active !== undefined ? is_active : job.is_active
    };

    if (deadline) {
      const { Timestamp } = require('firebase-admin/firestore');
      updateData.deadline = Timestamp.fromDate(new Date(deadline));
    }

    const updatedJob = await JobListing.update(job.id, updateData);

    res.json({
      success: true,
      message: 'Job listing updated successfully',
      data: { job: updatedJob }
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete job listing (employer only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    // Check if user is an employer
    const user = await User.findById(req.user.id);
    if (user.user_type !== 2) {
      return res.status(403).json({
        success: false,
        message: 'Only employers can delete job listings'
      });
    }

    const employer = await Employer.findByUserId(req.user.id);
    if (!employer) {
      return res.status(404).json({
        success: false,
        message: 'Employer profile not found'
      });
    }

    const job = await JobListing.findById(req.params.id);

    if (!job || job.employer_id !== employer.id) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    await JobListing.delete(job.id);

    res.json({
      success: true,
      message: 'Job listing deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Apply for a job (student only)
router.post('/:id/apply', authenticate, async (req, res) => {
  try {
    // Check if user is a student
    const user = await User.findById(req.user.id);
    if (user.user_type !== 1) {
      return res.status(403).json({
        success: false,
        message: 'Only students can apply for jobs'
      });
    }

    const student = await Student.findByUserId(req.user.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    const job = await JobListing.findById(req.params.id);

    if (!job || !job.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if already applied
    const hasApplied = await Application.hasApplied(job.id, student.id);

    if (hasApplied) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    const { cover_letter, cv_id } = req.body;

    // Verify CV belongs to student
    if (cv_id) {
      const cv = await CV.findById(cv_id);
      if (!cv || cv.student_id !== student.id) {
        return res.status(404).json({
          success: false,
          message: 'CV not found'
        });
      }
    }

    const { Timestamp } = require('firebase-admin/firestore');
    const application = await Application.create({
      student_id: student.id,
      job_id: job.id,
      cv_id: cv_id || null,
      cover_letter: cover_letter || '',
      status: 'applied',
      application_date: Timestamp.now()
    });

    const populatedApplication = await Application.findByIdWithDetails(application.id);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: { application: populatedApplication }
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
