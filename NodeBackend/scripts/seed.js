const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');
const User = require('../models/User');
const Student = require('../models/Student');
const Employer = require('../models/Employer');

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Sync all models
    await sequelize.sync({ force: true });
    console.log('Database synchronized with force: true');

    // Create test users with hashed passwords
    const hashedPassword = await bcrypt.hash('testpass123', 10);

    // Create Admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@jobportal.com',
      password: hashedPassword,
      user_type: 3, // Admin
      is_active: true
    });

    // Create test student
    const studentUser = await User.create({
      username: 'teststudent',
      email: 'student@university.edu',
      password: hashedPassword,
      user_type: 1, // Student
      is_active: true
    });

    // Create test employer
    const employerUser = await User.create({
      username: 'testemployer',
      email: 'hr@company.com',
      password: hashedPassword,
      user_type: 2, // Employer
      is_active: true
    });

    // Create student profile
    const student = await Student.create({
      user_id: studentUser.id,
      university: 'State University',
      major: 'Computer Science',
      graduation_year: 2025,
      gpa: 3.8,
      skills: 'JavaScript, Python, React, Node.js',
      experience: 'Intern at Tech Startup',
      bio: 'Passionate computer science student looking for software engineering opportunities.'
    });

    // Create employer profile
    const employer = await Employer.create({
      user_id: employerUser.id,
      company_name: 'TechCorp Solutions',
      company_description: 'Leading technology solutions provider',
      industry: 'Technology',
      website: 'https://techcorp.com',
      location: 'San Francisco, CA',
      company_size: '100-500',
      is_approved: true
    });

    console.log('Database seeding completed successfully!');
    console.log('Created test users:');
    console.log('- Admin: admin@jobportal.com (password: testpass123)');
    console.log('- Student: student@university.edu (password: testpass123)');
    console.log('- Employer: hr@company.com (password: testpass123)');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the seeding if this script is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };