export const mockContacts = [
  {
    id: "mock-1",
    name: "TechCorp Recruitment",
    avatar: "https://ui-avatars.com/api/?name=Tech+Corp&background=6c5ce7&color=fff",
    lastMessage: "We'd like to invite you for an interview next Tuesday.",
    time: "2 hours ago",
    unread: true,
    isOnline: true,
    company: "TechCorp",
    messages: [
      { id: 1, text: "Hello! We saw your application for the Junior Developer position.", sender: "them", time: "10:00 AM" },
      { id: 2, text: "Thank you for reaching out! I'm very interested.", sender: "me", time: "10:05 AM" },
      { id: 3, text: "We'd like to invite you for an interview next Tuesday.", sender: "them", time: "11:30 AM" }
    ]
  },
  {
    id: "mock-2",
    name: "Sarah from GreenRetail",
    avatar: "https://ui-avatars.com/api/?name=Sarah+Green&background=00b894&color=fff",
    lastMessage: "Thanks for sending your updated CV!",
    time: "Yesterday",
    unread: false,
    isOnline: false,
    company: "GreenRetail",
    messages: [
      { id: 1, text: "Hi there, could you send over your updated CV?", sender: "them", time: "Yesterday" },
      { id: 2, text: "Sure, just sent it to your email.", sender: "me", time: "Yesterday" },
      { id: 3, text: "Thanks for sending your updated CV!", sender: "them", time: "Yesterday" }
    ]
  },
  {
    id: "mock-3",
    name: "James Wilson",
    avatar: "https://ui-avatars.com/api/?name=James+Wilson&background=fab1a0&color=fff",
    lastMessage: "The position has been filled, but we'll keep your details.",
    time: "3 days ago",
    unread: false,
    isOnline: false,
    company: "EduGrow",
    messages: [
      { id: 1, text: "Hello James, following up on my application.", sender: "me", time: "Monday" },
      { id: 2, text: "The position has been filled, but we'll keep your details.", sender: "them", time: "Tuesday" }
    ]
  }
];

export const employerMockContacts = [
  {
    id: "mock-e1",
    name: "Alex Johnson",
    avatar: "https://ui-avatars.com/api/?name=Alex+Johnson&background=0984e3&color=fff",
    lastMessage: "I have 2 years of experience with React.",
    time: "5 mins ago",
    unread: true,
    isOnline: true,
    studentId: "student-1",
    messages: [
      { id: 1, text: "Hi Alex, we're interested in your profile.", sender: "me", time: "9:00 AM" },
      { id: 2, text: "Thanks! I'd love to discuss the role.", sender: "them", time: "9:15 AM" },
      { id: 3, text: "Can you tell me more about your React experience?", sender: "me", time: "9:30 AM" },
      { id: 4, text: "I have 2 years of experience with React.", sender: "them", time: "9:45 AM" }
    ]
  },
  {
    id: "mock-e2",
    name: "Emily Davis",
    avatar: "https://ui-avatars.com/api/?name=Emily+Davis&background=e84393&color=fff",
    lastMessage: "When can we schedule the technical test?",
    time: "1 hour ago",
    unread: true,
    isOnline: true,
    studentId: "student-2",
    messages: [
      { id: 1, text: "Hello Emily, your portfolio looks great.", sender: "me", time: "Yesterday" },
      { id: 2, text: "Thank you so much!", sender: "them", time: "Yesterday" },
      { id: 3, text: "When can we schedule the technical test?", sender: "them", time: "10:00 AM" }
    ]
  }
];
