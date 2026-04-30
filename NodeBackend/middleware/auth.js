const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_ACCESS_EXPIRE = process.env.JWT_ACCESS_EXPIRE || '60m';
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '7d';

// Generate access token
const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      user_type: user.user_type,
      first_name: user.first_name,
      last_name: user.last_name
    },
    JWT_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRE }
  );
};

// Generate refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    JWT_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRE }
  );
};

// Verify token
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

const generateTokens = (user) => {
  return {
    access: generateAccessToken(user),
    refresh: generateRefreshToken(user)
  };
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        error: 'No token provided',
        message: 'Authentication required' 
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token',
        message: 'User not found' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        error: 'Token expired',
        message: 'Please login again' 
      });
    }
    return res.status(401).json({ 
      success: false,
      error: 'Invalid token',
      message: error.message || 'Authentication failed' 
    });
  }
};

// Role-based authorization middleware
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (typeof roles === 'string') {
      roles = [roles];
    }

    const userRole = req.user.user_type === 1 ? 'student' : 
                    req.user.user_type === 2 ? 'employer' : 'admin';

    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  generateTokens,
  verifyRefreshToken,
  authenticate,
  authorize
};
