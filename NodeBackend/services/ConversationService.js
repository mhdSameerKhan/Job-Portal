const BaseService = require('./BaseService');

class ConversationService extends BaseService {
  constructor() {
    super('messaging_conversation');
  }

  // Find conversation by participants
  async findByParticipants(studentId, employerId) {
    // Try finding by student_id first
    const byStudent = await this.findAll({ student_id: studentId });
    let conversation = byStudent.find(c => c.employer_id === employerId);
    if (conversation) return conversation;
    
    // Try finding by employer_id as fallback
    const byEmployer = await this.findAll({ employer_id: employerId });
    conversation = byEmployer.find(c => c.student_id === studentId);
    return conversation || null;
  }

  // Find conversations for a user (student or employer)
  async findByUserId(userId, userType) {
    const query = userType === 1 
      ? { student_id: userId }
      : { employer_id: userId };
    const results = await this.findAll(query);
    return results.sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
  }

  // Get or create conversation
  async getOrCreate(studentId, employerId, jobId = null) {
    let conversation = await this.findByParticipants(studentId, employerId);
    
    if (!conversation) {
      conversation = await this.create({
        student_id: studentId,
        employer_id: employerId,
        job_id: jobId
      });
    }

    // Populate participants
    await this.populateConversationDetails(conversation);
    
    return conversation;
  }

  // Populate conversation with related data
  async populateConversationDetails(conversation) {
    const StudentService = require('./StudentService');
    const EmployerService = require('./EmployerService');
    const UserService = require('./UserService');

    if (conversation.student_id) {
      const student = await StudentService.findById(conversation.student_id);
      if (student) {
        const user = await UserService.findById(student.user_id);
        conversation.student = { ...student, user };
      }
    }

    if (conversation.employer_id) {
      const employer = await EmployerService.findById(conversation.employer_id);
      if (employer) {
        const user = await UserService.findById(employer.user_id);
        conversation.employer = { ...employer, user };
      }
    }
  }

  // Batch populate conversations with related data (optimized)
  async populateConversationsBatch(conversations) {
    if (!conversations || conversations.length === 0) return conversations;

    const StudentService = require('./StudentService');
    const EmployerService = require('./EmployerService');
    const UserService = require('./UserService');
    const JobListingService = require('./JobListingService');
    const MessageService = require('./MessageService');

    // Collect all unique IDs
    const studentIds = [...new Set(conversations.map(c => c.student_id).filter(Boolean))];
    const employerIds = [...new Set(conversations.map(c => c.employer_id).filter(Boolean))];
    const jobIds = [...new Set(conversations.map(c => c.job_id).filter(Boolean))];
    const conversationIds = conversations.map(c => c.id);

    // Batch fetch all related data in parallel
    const [students, employers, jobs, lastMessages] = await Promise.all([
      Promise.all(studentIds.map(id => StudentService.findById(id))),
      Promise.all(employerIds.map(id => EmployerService.findById(id))),
      Promise.all(jobIds.map(id => JobListingService.findById(id))),
      Promise.all(conversationIds.map(id => MessageService.getLastMessage(id)))
    ]);

    // Create lookup maps
    const studentMap = new Map();
    const employerMap = new Map();
    const jobMap = new Map();
    const lastMessageMap = new Map();

    // Collect all user IDs for batch fetching
    const userIds = [
      ...students.filter(Boolean).map(s => s.user_id).filter(Boolean),
      ...employers.filter(Boolean).map(e => e.user_id).filter(Boolean)
    ];
    const uniqueUserIds = [...new Set(userIds)];
    
    // Batch fetch all users
    const users = await Promise.all(uniqueUserIds.map(id => UserService.findById(id)));
    const userMap = new Map();
    users.filter(Boolean).forEach(user => userMap.set(user.id, user));

    // Populate student map with user data
    students.filter(Boolean).forEach(student => {
      if (student.user_id && userMap.has(student.user_id)) {
        studentMap.set(student.id, { ...student, user: userMap.get(student.user_id) });
      } else {
        studentMap.set(student.id, student);
      }
    });

    // Populate employer map with user data
    employers.filter(Boolean).forEach(employer => {
      if (employer.user_id && userMap.has(employer.user_id)) {
        employerMap.set(employer.id, { ...employer, user: userMap.get(employer.user_id) });
      } else {
        employerMap.set(employer.id, employer);
      }
    });

    // Populate job map
    jobs.filter(Boolean).forEach(job => jobMap.set(job.id, job));

    // Populate last message map
    lastMessages.forEach((msg, idx) => {
      if (msg) {
        lastMessageMap.set(conversationIds[idx], msg);
      }
    });

    // Attach related data to conversations
    return conversations.map(conversation => {
      if (conversation.student_id && studentMap.has(conversation.student_id)) {
        conversation.student = studentMap.get(conversation.student_id);
      }
      if (conversation.employer_id && employerMap.has(conversation.employer_id)) {
        conversation.employer = employerMap.get(conversation.employer_id);
      }
      if (conversation.job_id && jobMap.has(conversation.job_id)) {
        conversation.job = jobMap.get(conversation.job_id);
      }
      if (lastMessageMap.has(conversation.id)) {
        conversation.last_message = lastMessageMap.get(conversation.id);
      }
      return conversation;
    });
  }

  // Get conversations with details (optimized batch version)
  async findByUserIdWithDetails(userId, userType) {
    const conversations = await this.findByUserId(userId, userType);
    return await this.populateConversationsBatch(conversations);
  }
}

module.exports = new ConversationService();

