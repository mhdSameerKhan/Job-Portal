const express = require('express');
const { Application, Employer, Student, JobListing, User } = require('../models');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Get applications - matches Django ApplicationListCreateView
// For employers: returns applications for their jobs
// For students: returns their applications
router.get('/', authenticate, async (req, res) => {
  console.log('GET /api/applications - Route hit');
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const { status } = req.query; // Support status filtering

    let applications = [];

    if (user.user_type === 1) {
      // Student: get their applications
      const student = await Student.findByUserId(userId);
      if (!student) {
        return res.json([]); // Return empty array if student doesn't exist
      }
      applications = await Application.findByStudentId(student.id);
    } else if (user.user_type === 2) {
      // Employer: get applications for their jobs
      const employer = await Employer.findByUserId(userId);
      if (!employer) {
        return res.json([]); // Return empty array if employer doesn't exist
      }
      
      // Get all jobs for this employer
      const jobs = await JobListing.findByEmployerId(employer.id);
      const jobIds = Array.isArray(jobs) ? jobs.map(job => job.id) : [];
      
      // Get all applications for these jobs using efficient query
      if (jobIds.length > 0) {
        applications = await Application.findByJobIds(jobIds);
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Filter by status if provided
    if (status) {
      applications = applications.filter(app => app.status === status);
    }

    // Populate related data efficiently using batch loading
    applications = await Application.populateApplicationsBatch(applications);

    // Sort by application_date descending (most recent first)
    applications.sort((a, b) => {
      let dateA, dateB;
      
      // Handle Firestore Timestamp
      if (a.application_date?.toDate) {
        dateA = a.application_date.toDate();
      } else if (a.application_date?.seconds) {
        const { Timestamp } = require('firebase-admin/firestore');
        dateA = Timestamp.fromMillis(a.application_date.seconds * 1000).toDate();
      } else {
        dateA = new Date(a.application_date || a.created_at || 0);
      }
      
      if (b.application_date?.toDate) {
        dateB = b.application_date.toDate();
      } else if (b.application_date?.seconds) {
        const { Timestamp } = require('firebase-admin/firestore');
        dateB = Timestamp.fromMillis(b.application_date.seconds * 1000).toDate();
      } else {
        dateB = new Date(b.application_date || b.created_at || 0);
      }
      
      return dateB - dateA;
    });

    // Format response to match Django ApplicationSerializer
    const formattedApplications = applications.map(app => {
      // Format application_date
      let applicationDate = app.application_date;
      if (applicationDate?.toDate) {
        applicationDate = applicationDate.toDate().toISOString();
      } else if (applicationDate?.seconds) {
        const { Timestamp } = require('firebase-admin/firestore');
        applicationDate = Timestamp.fromMillis(applicationDate.seconds * 1000).toDate().toISOString();
      } else if (typeof applicationDate === 'string') {
        // Already ISO string
      } else if (applicationDate) {
        applicationDate = new Date(applicationDate).toISOString();
      }
      
      // Format job data
      const jobData = app.job ? {
        id: app.job.id,
        title: app.job.title,
        description: app.job.description,
        location: app.job.location,
        job_type: app.job.job_type,
        employer: app.job.employer
      } : null;
      
      // Format student details (matching Django ApplicationSerializer.get_student_details)
      const studentDetails = app.student && app.student.user ? {
        id: app.student.id,
        user_id: app.student.user.id,
        name: `${app.student.user.first_name || ''} ${app.student.user.last_name || ''}`.trim(),
        university: app.student.university || '',
        major: app.student.major || ''
      } : null;
      
      // Format CV data
      const cvData = app.cv ? {
        id: app.cv.id,
        title: app.cv.title,
        file: app.cv.file,
        file_url: app.cv.file_url || (app.cv.file ? `${req.protocol}://${req.get('host')}/${app.cv.file}` : null)
      } : null;
      
      return {
        id: app.id,
        job: jobData,
        student_details: studentDetails,
        cv: cvData,
        status: app.status || 'applied',
        cover_letter: app.cover_letter || '',
        application_date: applicationDate
      };
    });

    res.json(formattedApplications);
  } catch (error) {
    console.error('Get applications error:', error);
    console.error('Error stack:', error.stack);
    
    // Handle quota exceeded errors gracefully
    if (error.code === 8 || error.message?.includes('Quota exceeded')) {
      console.warn('Firebase quota exceeded for applications endpoint');
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

// Update application status (for employers to shortlist/reject applicants)
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Only employers can update application status
    if (user.user_type !== 2) {
      return res.status(403).json({
        success: false,
        message: 'Only employers can update application status'
      });
    }

    // Validate status
    const validStatuses = ['applied', 'shortlisted', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: applied, shortlisted, rejected'
      });
    }

    // Find the application
    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Verify the employer owns the job this application is for
    const employer = await Employer.findByUserId(userId);
    if (!employer) {
      return res.status(404).json({
        success: false,
        message: 'Employer profile not found'
      });
    }

    // Get the job for this application
    const job = await JobListing.findById(application.job_id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found for this application'
      });
    }

    // Verify the employer owns this job
    if (job.employer_id !== employer.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this application'
      });
    }

    // Update the application status
    await Application.update(id, { status });

    // Create notification for student
    const NotificationService = require('../services/NotificationService');
    const StudentService = require('../services/StudentService');
    const student = await StudentService.findById(application.student_id);
    if (student && student.user_id) {
      await NotificationService.notify(
        student.user_id,
        status === 'shortlisted' ? 'shortlisted' : 'application',
        `Your application for "${job.title}" has been ${status}`,
        application.id
      );
    }

    // Get the updated application
    const updatedApplication = await Application.findById(id);

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: { application: updatedApplication }
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

