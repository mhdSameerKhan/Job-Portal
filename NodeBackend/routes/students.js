const express = require('express');
const { Student, User, CV, Application, JobListing } = require('../models');
const { authenticate } = require('../middleware/auth');
const { studentProfileSchema: studentProfileValidation } = require('../validators/schemas');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/cvs';
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/msword' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'), false);
    }
  }
});

// Get student profile - matches Django's get_or_create behavior
router.get('/profile', authenticate, async (req, res) => {
  console.log('GET /api/student/profile - Route hit');
  try {
    const userId = req.user.id;
    console.log('User ID:', userId);
    
    // Check if user is a student
    if (req.user.user_type !== 1) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student profile only.'
      });
    }
    
    // Get or create student profile (matching Django's get_or_create)
    let student = await Student.findByUserId(userId);
    
    if (!student) {
      console.log('Student profile not found, creating new profile');
      // Create student profile with default values (matching Django defaults)
      student = await Student.create({
        user_id: userId,
        university: '',
        major: '',
        graduation_year: null,
        gpa: null,
        linkedin_url: '',
        github_url: '',
        portfolio_url: '',
        resume_headline: '',
        summary: ''
      });
    }
    
    // Get student with user details
    const studentWithUser = await Student.findByUserIdWithUser(userId);
    
    // Calculate profile completion (matching Django serializer)
    const fieldsToCheck = [
      'university', 'major', 'graduation_year', 'gpa',
      'linkedin_url', 'github_url', 'portfolio_url',
      'resume_headline', 'summary'
    ];
    const totalFields = 9;
    let completedFields = 0;
    
    for (const field of fieldsToCheck) {
      const value = studentWithUser[field];
      if (value !== null && value !== undefined && value !== '' && value !== 0) {
        completedFields++;
      }
    }
    
    const profileCompletion = Math.round((completedFields / totalFields) * 100);
    
    // Match Django StudentProfileSerializer format
    const response = {
      id: studentWithUser.id,
      user: studentWithUser.user,
      university: studentWithUser.university || '',
      major: studentWithUser.major || '',
      graduation_year: studentWithUser.graduation_year || null,
      gpa: studentWithUser.gpa || null,
      linkedin_url: studentWithUser.linkedin_url || '',
      github_url: studentWithUser.github_url || '',
      portfolio_url: studentWithUser.portfolio_url || '',
      resume_headline: studentWithUser.resume_headline || '',
      summary: studentWithUser.summary || '',
      profile_completion: profileCompletion
    };

    res.json(response);
  } catch (error) {
    console.error('Get student profile error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update student profile - matches Django's get_or_create behavior
router.put('/profile', authenticate, async (req, res) => {
  console.log('PUT /api/student/profile - Route hit');
  try {
    const userId = req.user.id;
    
    // Check if user is a student
    if (req.user.user_type !== 1) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student profile only.'
      });
    }
    
    const { error } = studentProfileValidation.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({ field: detail.path[0], message: detail.message }))
      });
    }

    const { university, major, graduation_year, gpa, linkedin_url, github_url, portfolio_url, resume_headline, summary } = req.body;

    // Get or create student profile (matching Django's get_or_create)
    let student = await Student.findByUserId(userId);
    
    if (!student) {
      // Create student profile if it doesn't exist
      student = await Student.create({
        user_id: userId,
        university: '',
        major: '',
        graduation_year: null,
        gpa: null,
        linkedin_url: '',
        github_url: '',
        portfolio_url: '',
        resume_headline: '',
        summary: ''
      });
    }

    await Student.update(student.id, {
      university,
      major,
      graduation_year,
      gpa,
      linkedin_url,
      github_url,
      portfolio_url,
      resume_headline,
      summary
    });

    const updatedStudent = await Student.findByUserIdWithUser(userId);
    
    // Calculate profile completion (matching Django serializer)
    const fieldsToCheck = [
      'university', 'major', 'graduation_year', 'gpa',
      'linkedin_url', 'github_url', 'portfolio_url',
      'resume_headline', 'summary'
    ];
    const totalFields = 9;
    let completedFields = 0;
    
    for (const field of fieldsToCheck) {
      const value = updatedStudent[field];
      if (value !== null && value !== undefined && value !== '' && value !== 0) {
        completedFields++;
      }
    }
    
    const profileCompletion = Math.round((completedFields / totalFields) * 100);
    
    // Match Django StudentProfileSerializer format (same as GET)
    const response = {
      id: updatedStudent.id,
      user: updatedStudent.user,
      university: updatedStudent.university || '',
      major: updatedStudent.major || '',
      graduation_year: updatedStudent.graduation_year || null,
      gpa: updatedStudent.gpa || null,
      linkedin_url: updatedStudent.linkedin_url || '',
      github_url: updatedStudent.github_url || '',
      portfolio_url: updatedStudent.portfolio_url || '',
      resume_headline: updatedStudent.resume_headline || '',
      summary: updatedStudent.summary || '',
      profile_completion: profileCompletion
    };

    res.json(response);
  } catch (error) {
    console.error('Update student profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get student CVs - matches Django format (returns array directly)
router.get('/cvs', authenticate, async (req, res) => {
  console.log('GET /api/student/cvs - Route hit');
  try {
    const userId = req.user.id;
    console.log('User ID:', userId);
    
    // Check if user is a student
    if (req.user.user_type !== 1) {
      return res.status(403).json({
        error: 'Access denied. Student profile only.'
      });
    }
    
    // Get or create student profile (matching Django's get_or_create in CVListView)
    let student = await Student.findByUserId(userId);
    console.log('Student found:', !!student);
    
    if (!student) {
      console.log('Student profile not found, creating new profile');
      // Create student profile with default values
      student = await Student.create({
        user_id: userId,
        university: '',
        major: '',
        graduation_year: null,
        gpa: null,
        linkedin_url: '',
        github_url: '',
        portfolio_url: '',
        resume_headline: '',
        summary: ''
      });
    }

    const cvs = await CV.findByStudentId(student.id);
    console.log('CVs found:', cvs.length);

    // Match Django CVSerializer format - return array directly
    // Format CVs to include file_url
    const formattedCVs = cvs.map(cv => ({
      id: cv.id,
      title: cv.title,
      file: cv.file,
      file_url: cv.file ? `${req.protocol}://${req.get('host')}/${cv.file}` : null,
      is_default: cv.is_default || false,
      created_at: cv.created_at
    }));

    console.log('Returning CVs:', formattedCVs.length);
    res.json(formattedCVs);
  } catch (error) {
    console.error('Get student CVs error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Upload CV
router.post('/cvs', authenticate, upload.single('file'), async (req, res) => {
  console.log('POST /api/student/cvs - Route hit');
  console.log('Request body:', req.body);
  console.log('Request file:', req.file ? {
    fieldname: req.file.fieldname,
    originalname: req.file.originalname,
    filename: req.file.filename,
    path: req.file.path,
    size: req.file.size,
    mimetype: req.file.mimetype
  } : 'No file');
  
  try {
    const userId = req.user.id;
    const { title, is_default } = req.body;

    // Check if user is a student
    if (req.user.user_type !== 1) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student profile only.'
      });
    }

    // Get or create student profile
    let student = await Student.findByUserId(userId);
    if (!student) {
      console.log('Student profile not found, creating new profile');
      student = await Student.create({
        user_id: userId,
        university: '',
        major: '',
        graduation_year: null,
        gpa: null,
        linkedin_url: '',
        github_url: '',
        portfolio_url: '',
        resume_headline: '',
        summary: ''
      });
    }

    if (!req.file) {
      console.error('No file received in request');
      return res.status(400).json({
        success: false,
        message: 'CV file is required'
      });
    }

    // Convert is_default to boolean
    let isDefault = false;
    if (is_default !== undefined) {
      if (typeof is_default === 'string') {
        isDefault = is_default.toLowerCase() === 'true' || is_default === '1';
      } else {
        isDefault = Boolean(is_default);
      }
    }

    // Use provided title or fallback to filename without extension
    const cvTitle = title || req.file.originalname.replace(/\.[^/.]+$/, '');

    console.log('Creating CV with:', {
      student_id: student.id,
      title: cvTitle,
      file: req.file.path,
      is_default: isDefault
    });

    const cv = await CV.create({
      student_id: student.id,
      title: cvTitle,
      file: req.file.path,
      is_default: isDefault
    });

    console.log('CV created successfully:', cv.id);

    // Format response to match Django CVSerializer format
    const formattedCV = {
      id: cv.id,
      title: cv.title,
      file: cv.file,
      file_url: cv.file ? `${req.protocol}://${req.get('host')}/${cv.file.replace(/\\/g, '/')}` : null,
      is_default: cv.is_default || false,
      created_at: cv.created_at
    };
    
    console.log('Formatted CV response:', formattedCV);

    // Return in format that matches frontend expectation: response.data.data || response.data
    res.status(201).json({
      success: true,
      message: 'CV uploaded successfully',
      data: formattedCV
    });
  } catch (error) {
    console.error('Upload CV error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Set default CV
router.put('/cvs/:id/default', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const cvId = req.params.id;

    const student = await Student.findByUserId(userId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    const cv = await CV.findById(cvId);

    if (!cv || cv.student_id !== student.id) {
      return res.status(404).json({
        success: false,
        message: 'CV not found'
      });
    }

    // Set this CV as default (will unset others)
    await CV.setDefault(cvId, student.id);
    const updatedCv = await CV.findById(cvId);

    res.json({
      success: true,
      message: 'CV set as default successfully',
      data: { cv }
    });
  } catch (error) {
    console.error('Set default CV error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete CV
router.delete('/cvs/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const cvId = req.params.id;

    const student = await Student.findByUserId(userId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    const cv = await CV.findById(cvId);

    if (!cv || cv.student_id !== student.id) {
      return res.status(404).json({
        success: false,
        message: 'CV not found'
      });
    }

    // Delete the file from filesystem
    if (cv.file && fs.existsSync(cv.file)) {
      fs.unlinkSync(cv.file);
    }

    await CV.delete(cvId);

    res.json({
      success: true,
      message: 'CV deleted successfully'
    });
  } catch (error) {
    console.error('Delete CV error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get student applications - matches Django format
router.get('/applications', authenticate, async (req, res) => {
  console.log('GET /api/student/applications - Route hit');
  try {
    const userId = req.user.id;
    console.log('User ID:', userId);
    
    // Check if user is a student
    if (req.user.user_type !== 1) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student profile only.'
      });
    }
    
    // Get or create student profile (matching Django's get_or_create in StudentApplicationsView)
    let student = await Student.findByUserId(userId);
    console.log('Student found:', !!student);
    
    if (!student) {
      console.log('Student profile not found, creating new profile');
      // Create student profile with default values
      student = await Student.create({
        user_id: userId,
        university: '',
        major: '',
        graduation_year: null,
        gpa: null,
        linkedin_url: '',
        github_url: '',
        portfolio_url: '',
        resume_headline: '',
        summary: ''
      });
    }

    const applications = await Application.findByStudentId(student.id);
    console.log('Applications found:', applications.length);
    
    // Populate job details efficiently using batch loading
    await Application.populateApplicationsBatch(applications);

    // Calculate counts (matching Django's aggregation)
    const counts = {
      total: applications.length,
      applied: applications.filter(a => a.status === 'applied').length,
      interview: applications.filter(a => a.status === 'interview').length,
      hired: applications.filter(a => a.status === 'hired').length,
      rejected: applications.filter(a => a.status === 'rejected').length
    };

    // Match Django response format: { applications: [...], counts: {...} }
    res.json({
      applications: applications,
      counts: counts
    });
  } catch (error) {
    console.error('Get student applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
