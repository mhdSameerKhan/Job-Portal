const express = require('express');
const { JobListing, Application, User, Employer, Student, Testimonial } = require('../models');
const router = express.Router();

// Get home page data (featured jobs, stats, categories)
router.get('/data', async (req, res) => {
  try {
    // Get featured jobs (latest 6 active jobs)
    let featuredJobsResult;
    try {
      featuredJobsResult = await JobListing.search(
        { is_active: true },
        1,
        6
      );
    } catch (error) {
      console.error('Error fetching featured jobs:', error);
      featuredJobsResult = { items: [] };
    }

    // Get statistics from Firestore
    let allJobs = [], allApplications = [], allEmployers = [], allStudents = [], activeUsers = [];
    
    try {
      allJobs = await JobListing.findAll({ is_active: true }) || [];
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
    
    try {
      allApplications = await Application.findAll({}) || [];
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
    
    try {
      allEmployers = await Employer.findAll({ is_approved: true }) || [];
    } catch (error) {
      console.error('Error fetching employers:', error);
    }
    
    try {
      allStudents = await Student.findAll({}) || [];
    } catch (error) {
      console.error('Error fetching students:', error);
    }
    
    try {
      activeUsers = await User.findAll({ is_active: true }) || [];
    } catch (error) {
      console.error('Error fetching users:', error);
    }

    // Calculate stats
    const stats = {
      verifiedEmployers: allEmployers.length || 0,
      studentFriendlyPositions: allJobs.length || 0,
      totalApplications: allApplications.length || 0,
      activeStudents: allStudents.length || 0
    };

    // Get categories (job types with counts)
    const categories = [
      {
        name: 'Technology',
        jobs: allJobs.filter(job => 
          job.title && (
            job.title.toLowerCase().includes('developer') ||
            job.title.toLowerCase().includes('engineer') ||
            job.title.toLowerCase().includes('programmer') ||
            job.title.toLowerCase().includes('software') ||
            job.title.toLowerCase().includes('tech')
          )
        ).length,
        icon: '💻'
      },
      {
        name: 'Marketing',
        jobs: allJobs.filter(job => 
          job.title && (
            job.title.toLowerCase().includes('marketing') ||
            job.title.toLowerCase().includes('social media') ||
            job.title.toLowerCase().includes('content') ||
            job.title.toLowerCase().includes('brand')
          )
        ).length,
        icon: '📢'
      },
      {
        name: 'Remote',
        jobs: allJobs.filter(job => job.is_remote === true).length,
        icon: '🌐'
      },
      {
        name: 'Healthcare',
        jobs: allJobs.filter(job => 
          job.title && (
            job.title.toLowerCase().includes('health') ||
            job.title.toLowerCase().includes('medical') ||
            job.title.toLowerCase().includes('nurse') ||
            job.title.toLowerCase().includes('care')
          )
        ).length,
        icon: '🏥'
      },
      {
        name: 'Design',
        jobs: allJobs.filter(job => 
          job.title && (
            job.title.toLowerCase().includes('design') ||
            job.title.toLowerCase().includes('ui') ||
            job.title.toLowerCase().includes('ux') ||
            job.title.toLowerCase().includes('graphic')
          )
        ).length,
        icon: '🎨'
      },
      {
        name: 'Business',
        jobs: allJobs.filter(job => 
          job.title && (
            job.title.toLowerCase().includes('business') ||
            job.title.toLowerCase().includes('analyst') ||
            job.title.toLowerCase().includes('consultant') ||
            job.title.toLowerCase().includes('finance')
          )
        ).length,
        icon: '💼'
      }
    ].filter(cat => cat.jobs > 0); // Only return categories with jobs

    // Get testimonials (latest 3 active testimonials)
    let testimonials = [];
    try {
      const allTestimonials = await Testimonial.findActive(3);
      testimonials = allTestimonials.map(testimonial => ({
        id: testimonial.id,
        text: testimonial.text || testimonial.content,
        author_name: testimonial.author_name || 'Anonymous',
        author_title: testimonial.author_title || 'Student',
        rating: testimonial.rating || 5,
        student_id: testimonial.student_id || null,
        created_at: testimonial.created_at
      }));
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      testimonials = [];
    }

    // Format featured jobs
    const featuredJobs = (featuredJobsResult.items || []).map(job => ({
      id: job.id,
      title: job.title || 'Untitled Job',
      company: job.company_name || 'Company',
      location: job.location || 'Location not specified',
      salary: formatSalary(job.salary_min, job.salary_max, job.salary_currency),
      type: formatJobType(job.job_type),
      is_remote: job.is_remote || false,
      posted_date: job.posted_date,
      deadline: job.deadline
    }));

    res.json({
      success: true,
      data: {
        featuredJobs,
        stats,
        categories,
        testimonials
      }
    });
  } catch (error) {
    console.error('Home data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to format salary
function formatSalary(min, max, currency = 'USD') {
  // Convert to numbers if they're strings
  const minNum = min ? (typeof min === 'string' ? parseFloat(min) : min) : null;
  const maxNum = max ? (typeof max === 'string' ? parseFloat(max) : max) : null;
  
  if (!minNum && !maxNum) return 'Not specified';
  
  const currencySymbol = currency === 'USD' ? '$' : currency === 'PKR' ? 'Rs.' : currency;
  
  // Format numbers with commas for thousands
  const formatNumber = (num) => {
    if (typeof num === 'number') {
      return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
    }
    return num;
  };
  
  if (minNum && maxNum) {
    return `${currencySymbol}${formatNumber(minNum)}-${currencySymbol}${formatNumber(maxNum)}`;
  } else if (minNum) {
    return `${currencySymbol}${formatNumber(minNum)}+`;
  } else if (maxNum) {
    return `Up to ${currencySymbol}${formatNumber(maxNum)}`;
  }
  
  return 'Not specified';
}

// Helper function to format job type
function formatJobType(type) {
  if (!type) return 'Full-time';
  
  const typeMap = {
    'full-time': 'Full-time',
    'part-time': 'Part-time',
    'internship': 'Internship'
  };
  
  return typeMap[type] || type;
}

module.exports = router;

