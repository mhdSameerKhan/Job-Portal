const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const TEST_TIMEOUT = 30000; // 30 seconds per request

// Test results storage
const testResults = [];
let studentToken = null;
let employerToken = null;
let adminToken = null;
let studentId = null;
let employerId = null;
let adminId = null;
let studentEmail = null;
let employerEmail = null;
let adminEmail = null;
let jobId = null;
let conversationId = null;
let messageId = null;
let cvId = null;

// Helper function to make API requests
async function makeRequest(testCase) {
  const {
    name,
    method,
    url,
    headers = {},
    data = null,
    params = null,
    expectedStatus = 200,
    description
  } = testCase;

  const startTime = Date.now();
  let result = {
    name,
    description: description || name,
    method,
    url: `${BASE_URL}${url}`,
    status: null,
    statusText: null,
    responseTime: null,
    success: false,
    error: null,
    responseData: null,
    timestamp: new Date().toISOString()
  };

  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      data,
      params,
      timeout: TEST_TIMEOUT,
      validateStatus: () => true // Don't throw on any status
    };

    const response = await axios(config);
    const endTime = Date.now();
    
    result.status = response.status;
    result.statusText = response.statusText;
    result.responseTime = endTime - startTime;
    result.success = response.status === expectedStatus;
    result.responseData = response.data;

    // Extract IDs from responses for dependent tests
    const responseBody = response.data.data || response.data;
    
    if (responseBody) {
      // Extract user IDs and emails
      if (responseBody.user && responseBody.user.id) {
        if (name.includes('Student') && name.includes('Register')) {
          studentId = responseBody.user.id;
          studentEmail = responseBody.user.email;
        } else if (name.includes('Employer') && name.includes('Register')) {
          employerId = responseBody.user.id;
          employerEmail = responseBody.user.email;
        } else if (name.includes('Admin') && name.includes('Register')) {
          adminId = responseBody.user.id;
          adminEmail = responseBody.user.email;
        }
      }
      
      // Extract job ID
      if (responseBody.job && responseBody.job.id) {
        jobId = responseBody.job.id;
      }
      
      // Extract conversation ID
      if (responseBody.conversation && responseBody.conversation.id) {
        conversationId = responseBody.conversation.id;
      }
      
      // Extract message ID
      if (responseBody.message && responseBody.message.id) {
        messageId = responseBody.message.id;
      }
      
      // Extract CV ID
      if (responseBody.cv && responseBody.cv.id) {
        cvId = responseBody.cv.id;
      }
      
      // Extract tokens
      const tokens = responseBody.tokens || { access: responseBody.access, refresh: responseBody.refresh };
      if (tokens && tokens.access) {
        if (name.includes('Student') && name.includes('Login')) {
          studentToken = tokens.access;
        } else if (name.includes('Employer') && name.includes('Login')) {
          employerToken = tokens.access;
        } else if (name.includes('Admin') && name.includes('Login')) {
          adminToken = tokens.access;
        }
      }
      
      // Handle job list response
      if (responseBody.jobs && Array.isArray(responseBody.jobs) && responseBody.jobs.length > 0 && !jobId) {
        jobId = responseBody.jobs[0].id;
      }
      
      // Handle application response (might contain job_id)
      if (responseBody.application && responseBody.application.job_id && !jobId) {
        jobId = responseBody.application.job_id;
      }
    }

  } catch (error) {
    const endTime = Date.now();
    result.status = error.response?.status || 0;
    result.statusText = error.response?.statusText || 'Request Failed';
    result.responseTime = endTime - startTime;
    result.success = false;
    result.error = error.message;
    result.responseData = error.response?.data || { error: error.message };
  }

  testResults.push(result);
  return result;
}

// Test cases
const testCases = [
  // Health Check
  {
    name: 'Health Check',
    method: 'GET',
    url: '/health',
    expectedStatus: 200,
    description: 'Check if server is running'
  },

  // ========== AUTH ENDPOINTS ==========
  {
    name: 'Student Register',
    method: 'POST',
    url: '/api/auth/register',
    data: {
      email: `student${Date.now()}@test.com`,
      password: 'TestPass123!',
      password2: 'TestPass123!',
      user_type: 1,
      first_name: 'Test',
      last_name: 'Student',
      university: 'Test University',
      major: 'Computer Science',
      graduation_year: 2025,
      gpa: 3.5
    },
    expectedStatus: 201,
    description: 'Register a new student user'
  },
  {
    name: 'Employer Register',
    method: 'POST',
    url: '/api/auth/register',
    data: {
      email: `employer${Date.now()}@test.com`,
      password: 'TestPass123!',
      password2: 'TestPass123!',
      user_type: 2,
      first_name: 'Test',
      last_name: 'Employer',
      company_name: 'Test Company',
      company_description: 'A test company',
      company_website: 'https://test.com'
    },
    expectedStatus: 201,
    description: 'Register a new employer user'
  },
  {
    name: 'Admin Register',
    method: 'POST',
    url: '/api/auth/register',
    data: {
      email: `admin${Date.now()}@test.com`,
      password: 'TestPass123!',
      password2: 'TestPass123!',
      user_type: 3,
      first_name: 'Test',
      last_name: 'Admin'
    },
    expectedStatus: 201,
    description: 'Register a new admin user'
  },
  {
    name: 'Student Login',
    method: 'POST',
    url: '/api/auth/login',
    data: () => ({
      email: studentEmail || `student${Date.now()}@test.com`,
      password: 'TestPass123!'
    }),
    expectedStatus: 200,
    description: 'Login as student and get access token'
  },
  {
    name: 'Employer Login',
    method: 'POST',
    url: '/api/auth/login',
    data: () => ({
      email: employerEmail || `employer${Date.now()}@test.com`,
      password: 'TestPass123!'
    }),
    expectedStatus: 200,
    description: 'Login as employer and get access token'
  },
  {
    name: 'Admin Login',
    method: 'POST',
    url: '/api/auth/login',
    data: () => ({
      email: adminEmail || `admin${Date.now()}@test.com`,
      password: 'TestPass123!'
    }),
    expectedStatus: 200,
    description: 'Login as admin and get access token'
  },
  {
    name: 'Get Profile (Student)',
    method: 'GET',
    url: '/api/auth/profile',
    headers: () => ({ Authorization: `Bearer ${studentToken}` }),
    expectedStatus: 200,
    description: 'Get authenticated student profile'
  },
  {
    name: 'Token Refresh',
    method: 'POST',
    url: '/api/auth/token/refresh',
    data: () => {
      const loginResult = testResults.find(r => r.name === 'Student Login');
      const refreshToken = loginResult?.responseData?.refresh;
      if (!refreshToken) {
        throw new Error('Refresh token not available from Student Login');
      }
      return { refresh_token: refreshToken };
    },
    expectedStatus: 200,
    description: 'Refresh access token using refresh token'
  },

  // ========== STUDENT ENDPOINTS ==========
  {
    name: 'Get Student Profile',
    method: 'GET',
    url: '/api/student/profile',
    headers: () => ({ Authorization: `Bearer ${studentToken}` }),
    expectedStatus: 200,
    description: 'Get student profile details'
  },
  {
    name: 'Update Student Profile',
    method: 'PUT',
    url: '/api/student/profile',
    headers: () => ({ Authorization: `Bearer ${studentToken}` }),
    data: {
      university: 'Updated University',
      major: 'Software Engineering',
      graduation_year: 2026,
      gpa: 3.8,
      linkedin_url: 'https://linkedin.com/in/test',
      github_url: 'https://github.com/test',
      portfolio_url: 'https://portfolio.test.com',
      resume_headline: 'Experienced Developer',
      summary: 'A passionate developer'
    },
    expectedStatus: 200,
    description: 'Update student profile information'
  },
  {
    name: 'Get Student CVs',
    method: 'GET',
    url: '/api/student/cvs',
    headers: () => ({ Authorization: `Bearer ${studentToken}` }),
    expectedStatus: 200,
    description: 'Get list of student CVs'
  },
  {
    name: 'Get Student Applications',
    method: 'GET',
    url: '/api/student/applications',
    headers: () => ({ Authorization: `Bearer ${studentToken}` }),
    expectedStatus: 200,
    description: 'Get student job applications'
  },

  // ========== EMPLOYER ENDPOINTS ==========
  {
    name: 'Get Employer Profile',
    method: 'GET',
    url: '/api/employer/profile',
    headers: () => ({ Authorization: `Bearer ${employerToken}` }),
    expectedStatus: 200,
    description: 'Get employer profile details'
  },
  {
    name: 'Update Employer Profile',
    method: 'PUT',
    url: '/api/employer/profile',
    headers: () => ({ Authorization: `Bearer ${employerToken}` }),
    data: {
      company_name: 'Updated Company Name',
      company_description: 'Updated description',
      company_website: 'https://updated.com'
    },
    expectedStatus: 200,
    description: 'Update employer profile information'
  },
  {
    name: 'Get Employer Dashboard',
    method: 'GET',
    url: '/api/employer/dashboard',
    headers: () => ({ Authorization: `Bearer ${employerToken}` }),
    expectedStatus: 200,
    description: 'Get employer dashboard statistics'
  },
  {
    name: 'Get Employer Jobs',
    method: 'GET',
    url: '/api/employer/jobs',
    headers: () => ({ Authorization: `Bearer ${employerToken}` }),
    expectedStatus: 200,
    description: 'Get list of employer job listings'
  },

  // ========== JOB ENDPOINTS ==========
  {
    name: 'Get All Jobs (Public)',
    method: 'GET',
    url: '/api/jobs',
    params: { page: 1, limit: 10 },
    expectedStatus: 200,
    description: 'Get public job listings'
  },
  {
    name: 'Get All Jobs with Search',
    method: 'GET',
    url: '/api/jobs',
    params: { page: 1, limit: 10, search: 'developer', location: 'Remote' },
    expectedStatus: 200,
    description: 'Search jobs with filters'
  },
  {
    name: 'Create Job (Employer)',
    method: 'POST',
    url: '/api/jobs',
    headers: () => ({ Authorization: `Bearer ${employerToken}` }),
    data: {
      title: 'Senior Software Engineer',
      description: 'We are looking for an experienced software engineer',
      requirements: '5+ years experience, Node.js, React',
      location: 'Remote',
      job_type: 'full-time',
      salary_min: 80000,
      salary_max: 120000,
      salary_currency: 'USD',
      is_remote: true,
      deadline: '2027-12-31'
    },
    expectedStatus: 201,
    description: 'Create a new job listing'
  },
  {
    name: 'Get Single Job (Public)',
    method: 'GET',
    url: () => `/api/jobs/${jobId || '1'}`,
    expectedStatus: 200,
    description: 'Get single job listing details'
  },
  {
    name: 'Update Job (Employer)',
    method: 'PUT',
    url: () => `/api/jobs/${jobId || '1'}`,
    headers: () => ({ Authorization: `Bearer ${employerToken}` }),
    data: {
      title: 'Updated Job Title',
      description: 'Updated description',
      requirements: 'Updated requirements',
      location: 'Hybrid',
      job_type: 'full-time',
      salary_min: 90000,
      salary_max: 130000,
      is_remote: false
    },
    expectedStatus: 200,
    description: 'Update job listing'
  },
  {
    name: 'Apply to Job (Student)',
    method: 'POST',
    url: () => `/api/jobs/${jobId || '1'}/apply`,
    headers: () => ({ Authorization: `Bearer ${studentToken}` }),
    data: {
      cover_letter: 'I am very interested in this position'
    },
    expectedStatus: 201,
    description: 'Student applies to a job'
  },
  {
    name: 'Get Job Applications (Employer)',
    method: 'GET',
    url: () => `/api/employer/jobs/${jobId || '1'}/applications`,
    headers: () => ({ Authorization: `Bearer ${employerToken}` }),
    expectedStatus: 200,
    description: 'Get applications for a specific job'
  },
  {
    name: 'Delete Job (Employer)',
    method: 'DELETE',
    url: () => `/api/jobs/${jobId || '1'}`,
    headers: () => ({ Authorization: `Bearer ${employerToken}` }),
    expectedStatus: 200,
    description: 'Delete a job listing'
  },

  // ========== MESSAGING ENDPOINTS ==========
  {
    name: 'Get Conversations (Student)',
    method: 'GET',
    url: '/api/messaging/conversations',
    headers: () => ({ Authorization: `Bearer ${studentToken}` }),
    expectedStatus: 200,
    description: 'Get student conversations'
  },
  {
    name: 'Get or Create Conversation',
    method: 'GET',
    url: () => `/api/messaging/conversations/with/${employerId || '1'}`,
    headers: () => ({ Authorization: `Bearer ${studentToken}` }),
    expectedStatus: 200,
    description: 'Get or create conversation with another user'
  },
  {
    name: 'Get Messages in Conversation',
    method: 'GET',
    url: () => `/api/messaging/conversations/${conversationId || '1'}/messages`,
    headers: () => ({ Authorization: `Bearer ${studentToken}` }),
    params: { page: 1, limit: 50 },
    expectedStatus: 200,
    description: 'Get messages in a conversation'
  },
  {
    name: 'Send Message',
    method: 'POST',
    url: '/api/messaging/messages',
    headers: () => ({ Authorization: `Bearer ${studentToken}` }),
    data: () => ({
      conversation_id: conversationId || '1',
      content: 'Hello, this is a test message'
    }),
    expectedStatus: 201,
    description: 'Send a message in a conversation'
  },
  {
    name: 'Mark Message as Read',
    method: 'PUT',
    url: () => `/api/messaging/messages/${messageId || '1'}/read`,
    headers: () => ({ Authorization: `Bearer ${employerToken || studentToken}` }),
    expectedStatus: 200,
    description: 'Mark a message as read'
  },
  {
    name: 'Get Unread Message Count',
    method: 'GET',
    url: '/api/messaging/messages/unread-count',
    headers: () => ({ Authorization: `Bearer ${studentToken}` }),
    expectedStatus: 200,
    description: 'Get count of unread messages'
  },

  // ========== ADMIN ENDPOINTS ==========
  {
    name: 'Get Admin Dashboard',
    method: 'GET',
    url: '/api/admin/dashboard',
    headers: () => ({ Authorization: `Bearer ${adminToken}` }),
    expectedStatus: 200,
    description: 'Get admin dashboard statistics'
  },
  {
    name: 'Get All Users (Admin)',
    method: 'GET',
    url: '/api/admin/users',
    headers: () => ({ Authorization: `Bearer ${adminToken}` }),
    params: { page: 1, limit: 20 },
    expectedStatus: 200,
    description: 'Get list of all users (admin only)'
  },
  {
    name: 'Get All Users with Filters (Admin)',
    method: 'GET',
    url: '/api/admin/users',
    headers: () => ({ Authorization: `Bearer ${adminToken}` }),
    params: { page: 1, limit: 20, user_type: 1, search: 'test' },
    expectedStatus: 200,
    description: 'Get filtered list of users'
  }
];

// Process dynamic values in test cases
function processTestCase(testCase) {
  const processed = { ...testCase };
  
  try {
    if (typeof processed.url === 'function') {
      processed.url = processed.url();
    }
    
    if (typeof processed.headers === 'function') {
      processed.headers = processed.headers();
    }
    
    if (typeof processed.data === 'function') {
      processed.data = processed.data();
    }
    
    if (typeof processed.params === 'function') {
      processed.params = processed.params();
    }
  } catch (error) {
    console.log(`   ⚠️  Warning: Error processing dynamic values: ${error.message}`);
    // Use fallback values
    if (typeof processed.url === 'function') {
      processed.url = processed.url.toString().includes('jobId') ? '/api/jobs/1' : processed.url;
    }
  }
  
  return processed;
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting API Endpoint Tests...\n');
  console.log(`Base URL: ${BASE_URL}\n`);
  console.log('='.repeat(80));

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const processed = processTestCase(testCase);
    
    console.log(`\n[${i + 1}/${testCases.length}] Testing: ${testCase.name}`);
    console.log(`   ${testCase.description || ''}`);
    console.log(`   ${processed.method} ${processed.url}`);
    
    const result = await makeRequest(processed);
    
    const statusIcon = result.success ? '✅' : '❌';
    console.log(`   ${statusIcon} Status: ${result.status} | Time: ${result.responseTime}ms`);
    
    if (!result.success) {
      console.log(`   ⚠️  Error: ${result.error || result.responseData?.message || 'Unknown error'}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📊 Generating Reports...\n');

  // Generate reports
  generateReports();
}

// Generate JSON and CSV reports
function generateReports() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportsDir = path.join(__dirname, '..', 'test-reports');
  
  // Create reports directory if it doesn't exist
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Generate JSON report
  const jsonReport = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: {
      total: testResults.length,
      passed: testResults.filter(r => r.success).length,
      failed: testResults.filter(r => !r.success).length,
      successRate: ((testResults.filter(r => r.success).length / testResults.length) * 100).toFixed(2) + '%',
      averageResponseTime: Math.round(testResults.reduce((sum, r) => sum + r.responseTime, 0) / testResults.length)
    },
    results: testResults
  };

  const jsonPath = path.join(reportsDir, `test-report-${timestamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2));
  console.log(`✅ JSON Report: ${jsonPath}`);

  // Generate CSV report
  const csvHeaders = ['Name', 'Description', 'Method', 'URL', 'Status', 'Status Text', 'Success', 'Response Time (ms)', 'Error', 'Timestamp'];
  const csvRows = testResults.map(result => [
    result.name,
    result.description,
    result.method,
    result.url,
    result.status,
    result.statusText,
    result.success ? 'PASS' : 'FAIL',
    result.responseTime,
    result.error || '',
    result.timestamp
  ]);

  const csvContent = [
    csvHeaders.join(','),
    ...csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const csvPath = path.join(reportsDir, `test-report-${timestamp}.csv`);
  fs.writeFileSync(csvPath, csvContent);
  console.log(`✅ CSV Report: ${csvPath}`);

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('📈 TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Tests: ${jsonReport.summary.total}`);
  console.log(`✅ Passed: ${jsonReport.summary.passed}`);
  console.log(`❌ Failed: ${jsonReport.summary.failed}`);
  console.log(`📊 Success Rate: ${jsonReport.summary.successRate}`);
  console.log(`⏱️  Average Response Time: ${jsonReport.summary.averageResponseTime}ms`);
  console.log('='.repeat(80));

  // List failed tests
  const failedTests = testResults.filter(r => !r.success);
  if (failedTests.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    console.log('='.repeat(80));
    failedTests.forEach((test, index) => {
      console.log(`\n${index + 1}. ${test.name}`);
      console.log(`   URL: ${test.method} ${test.url}`);
      console.log(`   Status: ${test.status} ${test.statusText}`);
      console.log(`   Error: ${test.error || test.responseData?.message || 'Unknown error'}`);
    });
    console.log('\n' + '='.repeat(80));
  }

  console.log(`\n📁 Reports saved to: ${reportsDir}`);
}

// Run the tests
if (require.main === module) {
  runTests().catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests, testCases };

