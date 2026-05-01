const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const { createClient } = require('redis');

require('dotenv').config();

const { initializeFirebase } = require('./config/firebase');
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const employerRoutes = require('./routes/employers');
const jobRoutes = require('./routes/jobs');
const messagingRoutes = require('./routes/messaging');
const adminRoutes = require('./routes/admin');
const homeRoutes = require('./routes/home');
const notificationRoutes = require('./routes/notifications');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true
  }
});

// Redis client for WebSocket (optional - only if Redis is available)
let redisClient = null;
try {
  redisClient = createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  });
  
  redisClient.on('error', (err) => {
    console.warn('Redis client error (continuing without Redis):', err.message);
    redisClient = null;
  });
  
  redisClient.on('connect', () => {
    console.log('Redis client connected');
  });
} catch (error) {
  console.warn('Redis not available (continuing without Redis):', error.message);
  redisClient = null;
}

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 1000,
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true
}));
app.use(morgan('combined'));
app.use(limiter);

// Add cache control middleware for API endpoints
app.use('/api', (req, res, next) => {
  // Prevent caching for all API requests - always return fresh data
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Last-Modified', new Date().toUTCString());
  // Prevent 304 responses by setting ETag to current timestamp
  res.setHeader('ETag', `"${Date.now()}"`);
  next();
});
// Avoid JSON parse errors on GET/DELETE requests with 'application/json' and empty/null body
app.use((req, res, next) => {
  const ct = req.headers['content-type'] || '';
  if ((req.method === 'GET' || req.method === 'DELETE') && ct.includes('application/json')) {
    delete req.headers['content-type'];
  }
  next();
});
app.use(express.json({ limit: '10mb', strict: false }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
console.log('Registering routes...');
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
console.log('Student routes registered at /api/student');
app.use('/api/employer', employerRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', require('./routes/applications'));
app.use('/api/messaging', messagingRoutes);
app.use('/api/notifications', notificationRoutes);
console.log('Messaging routes registered at /api/messaging');
app.use('/api/admin', adminRoutes);
app.use('/api/home', homeRoutes);
console.log('All routes registered');

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('404 - Route not found:', req.method, req.originalUrl);
  res.status(404).json({ error: 'Route not found', path: req.originalUrl, method: req.method });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  console.error('Stack:', err.stack);
  
  // Ensure we always send valid JSON
  const errorResponse = {
    success: false,
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  };
  
  res.status(err.status || 500).json(errorResponse);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room`);
  });
  
  socket.on('send_message', async (data) => {
    try {
      // Handle message sending logic
      const { conversation_id, content, sender_id } = data;
      
      // Broadcast to conversation participants
      socket.to(`conversation_${conversation_id}`).emit('new_message', {
        conversation_id,
        message: {
          content,
          sender_id,
          timestamp: new Date().toISOString()
        }
      });
      
      socket.emit('message_sent', { success: true });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Database connection and server start
const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Initialize Firebase/Firestore
    initializeFirebase();
    console.log('Firebase Firestore initialized successfully.');
    
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = { app, io };
