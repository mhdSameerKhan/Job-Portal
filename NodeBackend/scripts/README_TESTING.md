# API Endpoint Testing Script

This script automatically tests all API endpoints in the Student Job Portal backend and generates comprehensive reports.

## Features

- ✅ Tests all API endpoints systematically
- ✅ Automatically handles authentication tokens
- ✅ Tests different user types (Student, Employer, Admin)
- ✅ Generates JSON and CSV reports
- ✅ Shows which APIs are failing
- ✅ Tracks response times
- ✅ Extracts IDs from responses for dependent tests

## Prerequisites

1. Make sure the server is running:
   ```bash
   npm start
   # or
   npm run dev
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

## Usage

### Run the test script:

```bash
npm run test:endpoints
```

Or directly:

```bash
node scripts/test-all-endpoints.js
```

### Custom Base URL:

You can set a custom base URL using environment variable:

```bash
API_BASE_URL=http://localhost:3001 node scripts/test-all-endpoints.js
```

## Test Coverage

The script tests the following endpoints:

### Health Check
- Health check endpoint

### Authentication
- Student registration
- Employer registration
- Admin registration
- Student login
- Employer login
- Admin login
- Get profile
- Token refresh

### Student Endpoints
- Get student profile
- Update student profile
- Get student CVs
- Get student applications

### Employer Endpoints
- Get employer profile
- Update employer profile
- Get employer dashboard
- Get employer jobs
- Get job applications

### Job Endpoints
- Get all jobs (public)
- Search jobs with filters
- Create job (employer)
- Get single job (public)
- Update job (employer)
- Apply to job (student)
- Get job applications (employer)
- Delete job (employer)

### Messaging Endpoints
- Get conversations
- Get or create conversation
- Get messages in conversation
- Send message
- Mark message as read
- Get unread message count

### Admin Endpoints
- Get admin dashboard
- Get all users
- Get filtered users

## Reports

The script generates two types of reports in the `test-reports/` directory:

### 1. JSON Report (`test-report-{timestamp}.json`)
Contains detailed information about each test:
- Test name and description
- Request details (method, URL, headers, data)
- Response details (status, data, response time)
- Success/failure status
- Error messages (if any)

### 2. CSV Report (`test-report-{timestamp}.csv`)
Contains a tabular view of all tests:
- Name, Description, Method, URL
- Status, Status Text, Success
- Response Time, Error, Timestamp

## Report Structure

### JSON Report Structure:
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "baseUrl": "http://localhost:3001",
  "summary": {
    "total": 30,
    "passed": 28,
    "failed": 2,
    "successRate": "93.33%",
    "averageResponseTime": 150
  },
  "results": [
    {
      "name": "Health Check",
      "description": "Check if server is running",
      "method": "GET",
      "url": "http://localhost:3001/health",
      "status": 200,
      "statusText": "OK",
      "responseTime": 45,
      "success": true,
      "error": null,
      "responseData": {...},
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Understanding the Results

### Success Indicators:
- ✅ Green checkmark: Test passed
- ❌ Red X: Test failed

### Failed Tests:
The script will list all failed tests at the end with:
- Test name
- URL and method
- Status code
- Error message

## Troubleshooting

### Common Issues:

1. **Connection Refused**
   - Make sure the server is running
   - Check if the port matches (default: 3001)

2. **Authentication Errors**
   - Tests automatically register and login users
   - If registration fails, check if email already exists
   - The script uses unique emails with timestamps

3. **Missing Dependencies**
   - Run `npm install` to install axios

4. **Timeout Errors**
   - Increase `TEST_TIMEOUT` in the script (default: 30 seconds)
   - Check server performance

## Customization

You can customize the test script by:

1. **Adding new test cases**: Edit the `testCases` array in `scripts/test-all-endpoints.js`

2. **Changing timeout**: Modify `TEST_TIMEOUT` constant

3. **Modifying test data**: Update the data objects in test cases

4. **Adding new endpoints**: Follow the existing pattern in the test cases array

## Example Output

```
🚀 Starting API Endpoint Tests...

Base URL: http://localhost:3001

================================================================================

[1/30] Testing: Health Check
   Check if server is running
   GET http://localhost:3001/health
   ✅ Status: 200 | Time: 45ms

[2/30] Testing: Student Register
   Register a new student user
   POST http://localhost:3001/api/auth/register
   ✅ Status: 201 | Time: 234ms

...

================================================================================

📊 Generating Reports...

✅ JSON Report: test-reports/test-report-2024-01-01T00-00-00-000Z.json
✅ CSV Report: test-reports/test-report-2024-01-01T00-00-00-000Z.csv

================================================================================
📈 TEST SUMMARY
================================================================================
Total Tests: 30
✅ Passed: 28
❌ Failed: 2
📊 Success Rate: 93.33%
⏱️  Average Response Time: 150ms
================================================================================
```

## Notes

- The script automatically extracts IDs from responses (user IDs, job IDs, etc.) for dependent tests
- Tokens are automatically stored and reused for authenticated endpoints
- Each test has a 100ms delay to avoid overwhelming the server
- Reports are saved with timestamps to avoid overwriting previous results

