// Export services instead of Sequelize models
const UserService = require('../services/UserService');
const UserProfileService = require('../services/UserProfileService');
const StudentService = require('../services/StudentService');
const EmployerService = require('../services/EmployerService');
const CVService = require('../services/CVService');
const JobListingService = require('../services/JobListingService');
const ApplicationService = require('../services/ApplicationService');
const ConversationService = require('../services/ConversationService');
const MessageService = require('../services/MessageService');
const AdminActivityLogService = require('../services/AdminActivityLogService');
const TestimonialService = require('../services/TestimonialService');
const NotificationService = require('../services/NotificationService');

// For backward compatibility, export as the old model names
const User = UserService;
const UserProfile = UserProfileService;
const Student = StudentService;
const Employer = EmployerService;
const CV = CVService;
const JobListing = JobListingService;
const Application = ApplicationService;
const Conversation = ConversationService;
const Message = MessageService;
const AdminActivityLog = AdminActivityLogService;
const Testimonial = TestimonialService;
const Notification = NotificationService;

module.exports = {
  User,
  UserProfile,
  Student,
  Employer,
  CV,
  JobListing,
  Application,
  Conversation,
  Message,
  AdminActivityLog,
  Testimonial,
  Notification,
  // Also export as services
  UserService,
  UserProfileService,
  StudentService,
  EmployerService,
  CVService,
  JobListingService,
  ApplicationService,
  ConversationService,
  MessageService,
  AdminActivityLogService,
  TestimonialService,
  NotificationService
};
