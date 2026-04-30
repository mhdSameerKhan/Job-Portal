const express = require('express');
const { Employer, User, JobListing, Application, Student } = require('../models');
const { authenticate } = require('../middleware/auth');
const { employerProfileSchema: employerProfileValidation } = require('../validators/schemas');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configure multer for company logo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/logos';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get employer profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const employer = await Employer.findByUserIdWithUser(userId);

    if (!employer) {
      return res.status(404).json({
        success: false,
        message: 'Employer profile not found'
      });
    }

    res.json({
      success: true,
      data: { employer }
    });
  } catch (error) {
    console.error('Get employer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update employer profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Handle FormData - extract text fields properly
    let bodyData = req.body;
    
    // If FormData, values might be strings even if empty
    // Convert empty strings to undefined for optional fields
    const cleanedBody = {};
    Object.keys(bodyData).forEach(key => {
      if (key === 'company_logo') {
        // Skip file objects for validation
        return;
      }
      const value = bodyData[key];
      // If it's an empty string, convert to undefined (optional fields)
      if (value === '' || value === null) {
        cleanedBody[key] = undefined;
      } else {
        cleanedBody[key] = value;
      }
    });
    
    const { error } = employerProfileValidation.validate(cleanedBody, { 
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: false
    });
    
    if (error) {
      const fieldErrors = {};
      error.details.forEach(detail => {
        const field = detail.path && detail.path.length > 0 ? detail.path[0] : 'unknown';
        if (!fieldErrors[field]) {
          fieldErrors[field] = [];
        }
        // Clean up error messages
        let errorMsg = detail.message;
        // Remove quotes around field names
        errorMsg = errorMsg.replace(/"/g, "'");
        fieldErrors[field].push(errorMsg);
      });
      
      console.log('Validation errors:', fieldErrors);
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: fieldErrors
      });
    }

    const { company_name, company_description, company_website, company_size, industry, location } = req.body;

    const employer = await Employer.findByUserId(userId);
    if (!employer) {
      return res.status(404).json({
        success: false,
        message: 'Employer profile not found'
      });
    }

    // Build update object, only including provided fields
    // Allow empty strings and handle them appropriately
    const updateData = {};
    if (company_name !== undefined) updateData.company_name = company_name || '';
    if (company_description !== undefined) updateData.company_description = company_description || '';
    if (company_website !== undefined) {
      // Support both field names (company_website for Django compatibility, website for Firestore)
      const websiteValue = company_website || '';
      updateData.company_website = websiteValue;
      updateData.website = websiteValue; // Also set website field for backward compatibility
    }
    if (company_size !== undefined) updateData.company_size = company_size || '';
    if (industry !== undefined) updateData.industry = industry || '';
    if (location !== undefined) updateData.location = location || '';

    // Allow saving even if updateData is empty (user might just want to save with current values)
    await Employer.update(employer.id, updateData);

    const updatedEmployer = await Employer.findByUserIdWithUser(userId);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { employer: updatedEmployer }
    });
  } catch (error) {
    console.error('Update employer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Upload company logo
router.post('/logo', authenticate, upload.single('logo'), async (req, res) => {
  try {
    const userId = req.user.id;

    const employer = await Employer.findByUserId(userId);
    if (!employer) {
      return res.status(404).json({
        success: false,
        message: 'Employer profile not found'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Logo file is required'
      });
    }

    // Delete old logo if exists
    if (employer.company_logo && fs.existsSync(employer.company_logo)) {
      fs.unlinkSync(employer.company_logo);
    }

    await Employer.update(employer.id, {
      company_logo: req.file.path
    });

    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      data: { logo_path: req.file.path }
    });
  } catch (error) {
    console.error('Upload logo error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get employer dashboard stats
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const employer = await Employer.findByUserId(userId);
    if (!employer) {
      return res.status(404).json({
        success: false,
        message: 'Employer profile not found'
      });
    }

    // Get job listings count
    const allJobs = await JobListing.findByEmployerId(employer.id);
    const totalJobs = Array.isArray(allJobs) ? allJobs.length : allJobs.pagination?.total || 0;

    // Get active job listings count
    const activeJobsList = await JobListing.findByEmployerId(employer.id, { status: 'active' });
    const activeJobs = Array.isArray(activeJobsList) ? activeJobsList.length : activeJobsList.pagination?.total || 0;

    // Get all applications for this employer's jobs using efficient query
    const employerJobIds = Array.isArray(allJobs) ? allJobs.map(j => j.id) : allJobs.items?.map(j => j.id) || [];
    const employerApplications = employerJobIds.length > 0 
      ? await Application.findByJobIds(employerJobIds)
      : [];
    
    const totalApplications = employerApplications.length;
    const pendingApplications = employerApplications.filter(app => app.status === 'applied' || app.status === 'pending').length;

    // Get recent applications (limit 5)
    const recentApplications = employerApplications
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    // Populate application details efficiently using batch loading
    await Application.populateApplicationsBatch(recentApplications);

    // Format recent applications to match frontend expectations
    const formattedRecentApplications = recentApplications.map(app => ({
      id: app.id,
      student_name: app.student?.user ? `${app.student.user.first_name || ''} ${app.student.user.last_name || ''}`.trim() : 'Unknown Student',
      position: app.job?.title || 'Unknown Position',
      education: app.student?.major || app.student?.university || '',
      application_date: app.application_date,
      status: app.status || 'applied',
      job_id: app.job_id,
      student_id: app.student_id
    }));

    // Get company name from employer
    const companyName = employer.company_name || '';

    res.json({
      success: true,
      data: {
        company_name: companyName,
        stats: {
          total_jobs: totalJobs,
          active_jobs: activeJobs,
          total_applications: totalApplications,
          pending_applications: pendingApplications
        },
        recent_applicants: formattedRecentApplications,
        recent_applications: formattedRecentApplications, // Support both field names
        job_postings: Array.isArray(allJobs) ? allJobs.map(job => ({
          ...job,
          application_count: employerApplications.filter(app => app.job_id === job.id).length
        })) : []
      }
    });
  } catch (error) {
    console.error('Get employer dashboard error:', error);
    
    // Handle quota exceeded errors gracefully
    if (error.code === 8 || error.message?.includes('Quota exceeded')) {
      console.warn('Firebase quota exceeded for dashboard endpoint');
      return res.status(503).json({
        success: false,
        message: 'Service temporarily unavailable due to high demand. Please try again later.',
        error: 'Quota exceeded'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get employer job listings
router.get('/jobs', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;
    
    const employer = await Employer.findByUserId(userId);
    if (!employer) {
      return res.status(404).json({
        success: false,
        message: 'Employer profile not found'
      });
    }

    const result = await JobListing.findByEmployerId(employer.id, { status, page: parseInt(page), limit: parseInt(limit) });

    if (result.items) {
      // Paginated result
      res.json({
        success: true,
        data: {
          jobs: result.items,
          pagination: result.pagination
        }
      });
    } else {
      // Array result (no pagination)
      res.json({
        success: true,
        data: {
          jobs: result,
          pagination: {
            total: result.length,
            page: parseInt(page),
            pages: Math.ceil(result.length / limit)
          }
        }
      });
    }
  } catch (error) {
    console.error('Get employer jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get applications for a specific job
router.get('/jobs/:jobId/applications', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const jobId = req.params.jobId;
    const { status, page = 1, limit = 10 } = req.query;
    
    const employer = await Employer.findByUserId(userId);
    if (!employer) {
      return res.status(404).json({
        success: false,
        message: 'Employer profile not found'
      });
    }

    // Verify the job belongs to this employer
    const job = await JobListing.findById(jobId);

    if (!job || job.employer_id !== employer.id) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const result = await Application.findByJobIdWithDetails(jobId, { status, page: parseInt(page), limit: parseInt(limit) });

    if (result.items) {
      res.json({
        success: true,
        data: {
          applications: result.items,
          pagination: result.pagination
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          applications: result,
          pagination: {
            total: result.length,
            page: parseInt(page),
            pages: Math.ceil(result.length / limit)
          }
        }
      });
    }
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
