const express = require('express');
const { User, Student, Employer, JobListing, Application } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// Get admin dashboard stats
router.get('/dashboard', authenticate, authorize('admin'), async (req, res) => {
  try {
    // Fetch all data efficiently
    const [allUsers, allJobs, allApplications, allEmployers] = await Promise.all([
      User.findAll({}),
      JobListing.findAll({}),
      Application.findAll({}),
      Employer.findAll({})
    ]);

    // Calculate counts in memory (more efficient than multiple queries)
    const totalUsers = allUsers.length;
    const totalStudents = allUsers.filter(u => u.user_type === 1).length;
    const totalEmployers = allUsers.filter(u => u.user_type === 2).length;
    const totalAdmins = allUsers.filter(u => u.user_type === 3).length;
    const totalJobs = allJobs.length;
    const activeJobs = allJobs.filter(j => j.is_active === true).length;
    const totalApplications = allApplications.length;
    const pendingApplications = allApplications.filter(a => a.status === 'applied' || a.status === 'pending').length;
    const pendingEmployers = allEmployers.filter(e => e.is_approved === false).length;
    const totalCompanies = allEmployers.length;

    res.json({
      success: true,
      data: {
        stats: {
          total_users: totalUsers,
          total_students: totalStudents,
          total_employers: totalEmployers,
          total_companies: totalCompanies,
          total_admins: totalAdmins,
          total_jobs: totalJobs,
          active_jobs: activeJobs,
          total_applications: totalApplications,
          pending_applications: pendingApplications,
          pending_companies: pendingEmployers,
          pending_employers: pendingEmployers
        }
      }
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all users
router.get('/users', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, user_type, search } = req.query;
    
    let users = await User.findAll({});
    
    // Filter by user_type
    if (user_type) {
      users = users.filter(u => u.user_type === parseInt(user_type));
    }
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(u => 
        (u.email && u.email.toLowerCase().includes(searchLower)) ||
        (u.first_name && u.first_name.toLowerCase().includes(searchLower)) ||
        (u.last_name && u.last_name.toLowerCase().includes(searchLower))
      );
    }

    // Sort by created_at descending
    users.sort((a, b) => {
      const dateA = a.created_at ? (a.created_at.toDate ? a.created_at.toDate().getTime() : new Date(a.created_at).getTime()) : 0;
      const dateB = b.created_at ? (b.created_at.toDate ? b.created_at.toDate().getTime() : new Date(b.created_at).getTime()) : 0;
      return dateB - dateA;
    });

    // Paginate
    const total = users.length;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedUsers = users.slice(offset, offset + parseInt(limit));

    // Collect user IDs for batch profile fetching
    const userIds = paginatedUsers.map(u => u.id);
    const studentUserIds = paginatedUsers.filter(u => u.user_type === 1).map(u => u.id);
    const employerUserIds = paginatedUsers.filter(u => u.user_type === 2).map(u => u.id);

    // Batch fetch all profiles in parallel
    const [allStudents, allEmployers] = await Promise.all([
      studentUserIds.length > 0 ? Promise.all(studentUserIds.map(id => Student.findByUserId(id).catch(() => null))) : [],
      employerUserIds.length > 0 ? Promise.all(employerUserIds.map(id => Employer.findByUserId(id).catch(() => null))) : []
    ]);

    // Create maps for quick lookup
    const studentMap = new Map();
    allStudents.filter(s => s).forEach(student => {
      if (student && student.user_id) {
        studentMap.set(student.user_id, student);
      }
    });

    const employerMap = new Map();
    allEmployers.filter(e => e).forEach(employer => {
      if (employer && employer.user_id) {
        employerMap.set(employer.user_id, employer);
      }
    });

    // Populate profiles from maps
    const usersWithProfiles = paginatedUsers.map(user => {
      const userObj = { ...user };
      if (user.user_type === 1) {
        userObj.student_profile = studentMap.get(user.id) || null;
      } else if (user.user_type === 2) {
        userObj.employer_profile = employerMap.get(user.id) || null;
      }
      return userObj;
    });

    res.json({
      success: true,
      data: {
        users: usersWithProfiles,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Approve company (employer)
router.patch('/companies/:id/approve', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the employer by ID
    const employer = await Employer.findById(id);
    
    if (!employer) {
      return res.status(404).json({
        success: false,
        message: 'Employer not found'
      });
    }

    // Update the employer's approval status
    await Employer.update(id, { is_approved: true });

    // Fetch the updated employer
    const updatedEmployer = await Employer.findById(id);

    res.json({
      success: true,
      message: 'Company approved successfully',
      data: { employer: updatedEmployer }
    });
  } catch (error) {
    console.error('Approve company error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;