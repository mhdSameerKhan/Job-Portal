const { initializeFirebase } = require('../config/firebase');
const { User, Employer, Student, JobListing, Application, Testimonial } = require('../models');
const { Timestamp } = require('firebase-admin/firestore');

// Sample data arrays
const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'James', 'Emma', 'Robert', 'Olivia', 'William', 'Sophia'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const companies = [
  { name: 'TechCorp Solutions', industry: 'Technology' },
  { name: 'Digital Innovations', industry: 'Software' },
  { name: 'Creative Marketing Co', industry: 'Marketing' },
  { name: 'Healthcare Plus', industry: 'Healthcare' },
  { name: 'Finance Masters', industry: 'Finance' },
  { name: 'Design Studio Pro', industry: 'Design' },
  { name: 'EduTech Solutions', industry: 'Education' },
  { name: 'Green Energy Inc', industry: 'Energy' }
];
const universities = ['State University', 'Tech Institute', 'Business School', 'Medical College', 'Arts University', 'Engineering College'];
const majors = ['Computer Science', 'Business Administration', 'Marketing', 'Engineering', 'Healthcare', 'Design', 'Finance', 'Education'];
const jobTitles = [
  'Software Developer Intern',
  'Marketing Assistant',
  'Data Analyst',
  'Graphic Designer',
  'Customer Service Rep',
  'Web Developer',
  'Social Media Manager',
  'Business Analyst',
  'UI/UX Designer',
  'Content Writer',
  'Research Assistant',
  'Sales Representative'
];
const locations = ['New York, NY', 'San Francisco, CA', 'Los Angeles, CA', 'Chicago, IL', 'Boston, MA', 'Seattle, WA', 'Remote'];
const jobTypes = ['full-time', 'part-time', 'internship'];

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomItems(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seedFirestore() {
  try {
    console.log('Starting Firestore seeding...');
    
    // Initialize Firebase
    let firestore;
    try {
      firestore = initializeFirebase();
      if (!firestore) {
        throw new Error('Firestore instance is null');
      }
      // Test the connection by trying to access Firestore (use a simple operation)
      const testCollection = firestore.collection('_test_connection');
      await testCollection.limit(0).get(); // This just tests the connection without reading data
      console.log('✅ Firebase initialized and connected');
    } catch (error) {
      console.error('\n❌ Firebase authentication failed!');
      console.error('═══════════════════════════════════════════════════════════');
      console.error('To fix this, you need to configure Firebase credentials.');
      console.error('\nOption 1: Add service account key file');
      console.error('  1. Download your Firebase service account key from:');
      console.error('     https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk');
      console.error('  2. Save it as: NodeBackend/serviceAccountKey.json');
      console.error('\nOption 2: Set environment variables');
      console.error('  Set FIREBASE_SERVICE_ACCOUNT_JSON with your full JSON key');
      console.error('  OR set: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
      console.error('\nOption 3: Create .env file');
      console.error('  Create NodeBackend/.env with:');
      console.error('  FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}');
      console.error('═══════════════════════════════════════════════════════════\n');
      process.exit(1);
    }

    // Check if data already exists
    const existingJobs = await JobListing.findAll({});
    if (existingJobs.length > 0) {
      console.log(`Found ${existingJobs.length} existing jobs. Skipping seed to avoid duplicates.`);
      console.log('To re-seed, first run: npm run wipe:firestore');
      return;
    }

    // Create Admin User
    console.log('Creating admin user...');
    const adminUser = await User.create({
      email: 'admin@jobportal.com',
      password: 'admin123', // Will be hashed automatically
      first_name: 'Admin',
      last_name: 'User',
      user_type: 3, // Admin
      is_active: true,
      is_staff: true,
      is_superuser: true
    });
    console.log(`Created admin user: ${adminUser.email} (Password: admin123)`);

    // Create Users and Employers (1-2 employers)
    console.log('Creating employers...');
    const employerIds = [];
    const employerCount = 2; // Create 2 employers
    for (let i = 0; i < employerCount; i++) {
      const company = companies[i];
      const firstName = getRandomItem(firstNames);
      const lastName = getRandomItem(lastNames);
      const email = `employer${i + 1}@${company.name.toLowerCase().replace(/\s+/g, '')}.com`;
      
      const user = await User.create({
        email: email,
        password: 'password123', // Will be hashed automatically
        first_name: firstName,
        last_name: lastName,
        user_type: 2, // Employer
        is_active: true,
        is_staff: false,
        is_superuser: false
      });

      const employer = await Employer.create({
        user_id: user.id,
        company_name: company.name,
        company_description: `Leading ${company.industry.toLowerCase()} company providing innovative solutions.`,
        industry: company.industry,
        website: `https://${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
        location: getRandomItem(locations),
        company_size: getRandomItem(['1-10', '11-50', '51-200', '201-500', '500+']),
        is_approved: true
      });

      employerIds.push(employer.id);
      console.log(`Created employer: ${company.name}`);
    }

    // Create Users and Students (2-3 students)
    console.log('Creating students...');
    const studentIds = [];
    const studentCount = 3; // Create 3 students
    for (let i = 0; i < studentCount; i++) {
      const firstName = getRandomItem(firstNames);
      const lastName = getRandomItem(lastNames);
      const email = `student${i + 1}@university.edu`;
      
      const user = await User.create({
        email: email,
        password: 'password123',
        first_name: firstName,
        last_name: lastName,
        user_type: 1, // Student
        is_active: true,
        is_staff: false,
        is_superuser: false
      });

      const studentMajor = getRandomItem(majors);
      const student = await Student.create({
        user_id: user.id,
        university: getRandomItem(universities),
        major: studentMajor,
        graduation_year: 2024 + Math.floor(Math.random() * 3),
        gpa: (3.0 + Math.random() * 1.0).toFixed(2),
        linkedin_url: `https://linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
        github_url: `https://github.com/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
        portfolio_url: `https://${firstName.toLowerCase()}${lastName.toLowerCase()}.com`,
        resume_headline: `${studentMajor} student seeking opportunities`,
        summary: `Passionate ${studentMajor.toLowerCase()} student with interest in ${getRandomItem(companies).industry.toLowerCase()}.`
      });

      studentIds.push(student.id);
    }
    console.log(`Created ${studentIds.length} students`);

    // Create Job Listings (5-6 jobs)
    console.log('Creating job listings...');
    const jobIds = [];
    const jobCount = 6; // Create 6 jobs
    for (let i = 0; i < jobCount; i++) {
      const employerId = getRandomItem(employerIds);
      const employer = await Employer.findById(employerId);
      const title = getRandomItem(jobTitles);
      const jobType = getRandomItem(jobTypes);
      const location = getRandomItem(locations);
      const isRemote = location === 'Remote' || Math.random() > 0.7;
      
      // Salary ranges
      const salaryRanges = {
        'internship': { min: 15, max: 25 },
        'part-time': { min: 20, max: 40 },
        'full-time': { min: 50, max: 120 }
      };
      const range = salaryRanges[jobType];
      const salaryMin = range.min + Math.floor(Math.random() * (range.max - range.min));
      const salaryMax = salaryMin + Math.floor(Math.random() * 30);

      const postedDate = getRandomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date());
      const deadline = new Date(postedDate);
      deadline.setDate(deadline.getDate() + 30 + Math.floor(Math.random() * 30));

      const job = await JobListing.create({
        employer_id: employerId,
        title: title,
        description: `We are looking for a talented ${title.toLowerCase()} to join our team. This position offers great opportunities for growth and learning. You will work on exciting projects and collaborate with experienced professionals.`,
        company_name: employer.company_name,
        requirements: `- Currently enrolled in or recently graduated from university\n- Strong communication skills\n- Ability to work in a team environment\n- ${getRandomItem(['Basic', 'Intermediate', 'Advanced'])} knowledge in relevant field\n- Passion for learning and growth`,
        responsibilities: `- Assist with daily operations\n- Collaborate with team members\n- Complete assigned projects\n- Attend team meetings and training sessions\n- Contribute innovative ideas`,
        location: location,
        job_type: jobType,
        salary_min: salaryMin * 1000,
        salary_max: salaryMax * 1000,
        salary_currency: 'USD',
        is_remote: isRemote,
        posted_date: postedDate, // BaseService will convert to Timestamp
        deadline: deadline.toISOString().split('T')[0], // Date string format YYYY-MM-DD
        is_active: true // All jobs are active
      });

      jobIds.push(job.id);
      console.log(`Created job: ${title} at ${employer.company_name}`);
    }

    // Create Applications with some shortlisted
    console.log('Creating applications...');
    let applicationCount = 0;
    let shortlistedCount = 0;
    const totalApplications = 8; // Create 8 total applications
    
    // Track which applications to shortlist (we want 2-3 shortlisted)
    const applicationsToShortlist = 3;
    const shortlistIndices = new Set();
    while (shortlistIndices.size < applicationsToShortlist && shortlistIndices.size < totalApplications) {
      shortlistIndices.add(Math.floor(Math.random() * totalApplications));
    }
    
    for (let i = 0; i < totalApplications; i++) {
      const jobId = getRandomItem(jobIds);
      const studentId = getRandomItem(studentIds);
      
      // Check if already applied
      const existing = await Application.findOne({ job_id: jobId, student_id: studentId });
      if (existing) continue;

      // Determine status - shortlist 2-3 applications
      let status = 'applied'; // Default status
      if (shortlistIndices.has(i) && shortlistedCount < applicationsToShortlist) {
        status = 'shortlisted';
        shortlistedCount++;
      } else {
        // For non-shortlisted, use other statuses
        const otherStatuses = ['applied', 'interview', 'rejected'];
        status = getRandomItem(otherStatuses);
      }

      const applicationDate = getRandomDate(new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), new Date());

      await Application.create({
        job_id: jobId,
        student_id: studentId,
        status: status,
        cover_letter: `I am very interested in this position and believe my skills and experience make me a great fit for your team. I am excited about the opportunity to contribute to your organization.`,
        application_date: Timestamp.fromDate(applicationDate)
      });

      applicationCount++;
      console.log(`Created application #${applicationCount} - Status: ${status}`);
    }
    console.log(`Created ${applicationCount} applications (${shortlistedCount} shortlisted)`);

    // Create Testimonials
    console.log('Creating testimonials...');
    const testimonialTexts = [
      {
        text: "This platform helped me find my dream internship at a tech startup. The process was smooth and the employers were respectful!",
        author: "John B.",
        title: "Computer Science Student",
        rating: 5
      },
      {
        text: "I landed my first part-time job through this portal. The interface is user-friendly and I found multiple opportunities that matched my schedule perfectly.",
        author: "Sarah M.",
        title: "Business Administration Student",
        rating: 5
      },
      {
        text: "Great experience! The job listings are detailed and I appreciate how the platform connects students with flexible opportunities. Highly recommend!",
        author: "Michael R.",
        title: "Marketing Student",
        rating: 5
      },
      {
        text: "As a design student, I found several creative positions that aligned with my interests. The application process was straightforward and efficient.",
        author: "Emma L.",
        title: "Design Student",
        rating: 5
      },
      {
        text: "The platform made it easy to find remote work opportunities that fit around my classes. I've already applied to multiple positions!",
        author: "David K.",
        title: "Engineering Student",
        rating: 5
      },
      {
        text: "Excellent platform for students! The employers here genuinely understand student schedules and offer great opportunities for growth.",
        author: "Olivia T.",
        title: "Healthcare Student",
        rating: 5
      },
      {
        text: "I appreciate how the platform verifies employers. It gave me confidence when applying and I found a wonderful internship opportunity.",
        author: "James W.",
        title: "Finance Student",
        rating: 5
      },
      {
        text: "The best student job portal I've used! Fast responses, clear job descriptions, and opportunities that actually work with my academic schedule.",
        author: "Sophia H.",
        title: "Education Student",
        rating: 5
      }
    ];

    let testimonialCount = 0;
    for (let i = 0; i < testimonialTexts.length && i < studentIds.length; i++) {
      const testimonialData = testimonialTexts[i];
      const studentId = studentIds[i];
      
      try {
        await Testimonial.create({
          student_id: studentId,
          text: testimonialData.text,
          author_name: testimonialData.author,
          author_title: testimonialData.title,
          rating: testimonialData.rating,
          is_active: true
        });
        testimonialCount++;
      } catch (error) {
        console.error(`Error creating testimonial ${i + 1}:`, error.message);
      }
    }
    console.log(`Created ${testimonialCount} testimonials`);

    console.log('\n✅ Firestore seeding completed successfully!');
    console.log(`\nSummary:`);
    console.log(`- Employers: ${employerIds.length}`);
    console.log(`- Students: ${studentIds.length}`);
    console.log(`- Jobs: ${jobIds.length}`);
    console.log(`- Applications: ${applicationCount} (${shortlistedCount} shortlisted)`);
    console.log(`- Testimonials: ${testimonialCount}`);
    console.log(`\nTest credentials:`);
    console.log(`- Admin: admin@jobportal.com, Password: admin123`);
    console.log(`- Employer 1: employer1@techcorpsolutions.com, Password: password123`);
    console.log(`- Employer 2: employer2@digitalinnovations.com, Password: password123`);
    console.log(`- Student 1: student1@university.edu, Password: password123`);
    console.log(`- Student 2: student2@university.edu, Password: password123`);
    console.log(`- Student 3: student3@university.edu, Password: password123`);

  } catch (error) {
    console.error('Error seeding Firestore:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  seedFirestore()
    .then(() => {
      console.log('Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedFirestore };

