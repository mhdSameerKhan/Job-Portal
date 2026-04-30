const express = require('express');
const jwt = require('jsonwebtoken');
const { User, Student, Employer } = require('../models');
const { generateTokens, verifyRefreshToken, authenticate } = require('../middleware/auth');
const { loginSchema: authValidation, registerSchema: registerValidation } = require('../validators/schemas');
const router = express.Router();

// Register endpoint - matches Django backend format exactly
router.post('/register', async (req, res) => {
  let createdUser = null;
  
  try {
    // Log incoming request for debugging
    console.log('Registration request received:', {
      body: req.body,
      email: req.body.email,
      user_type: req.body.user_type,
      has_password: !!req.body.password,
      has_password2: !!req.body.password2,
      has_first_name: !!req.body.first_name,
      has_last_name: !!req.body.last_name,
      first_name_value: req.body.first_name,
      last_name_value: req.body.last_name,
      password_match: req.body.password === req.body.password2
    });

    const { error, value } = registerValidation.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      console.error('Validation error details:', JSON.stringify(error.details, null, 2));
      // Match Django's validation error format
      const errorDetails = {};
      error.details.forEach(detail => {
        const field = detail.path && detail.path.length > 0 ? detail.path[0] : 'non_field_errors';
        if (!errorDetails[field]) {
          errorDetails[field] = [detail.message];
        } else {
          errorDetails[field].push(detail.message);
        }
      });
      console.error('Returning validation errors:', errorDetails);
      return res.status(400).json(errorDetails);
    }

    // Use validated and cleaned values
    const validatedData = value;

    // Extract fields from validated data (Joi has already validated and trimmed them)
    // The validatedData already contains trimmed and normalized values
    const email = validatedData.email; // Already trimmed and lowercased by Joi
    const password = validatedData.password;
    const user_type = Number(validatedData.user_type); // Already validated as 1, 2, or 3
    const first_name = validatedData.first_name; // Already trimmed by Joi
    const last_name = validatedData.last_name; // Already trimmed by Joi

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        email: ['User with this email already exists']
      });
    }

    // Create user (password will be hashed in UserService.create)
    createdUser = await User.create({
      email: email,
      password: password,
      user_type: user_type,
      first_name: first_name,
      last_name: last_name,
      is_active: true,
      is_staff: false,
      is_superuser: false
    });

    if (!createdUser || !createdUser.id) {
      throw new Error('Failed to create user - user object is invalid');
    }

    // Create profile based on user type (matching Django behavior)
    // Only create Employer profile during registration, not Student profile
    if (user_type === 2) { // Employer - create profile immediately
      try {
        const employerProfile = await Employer.create({
          user_id: createdUser.id,
          company_name: '',
          company_description: '',
          company_website: '',
          company_logo: null,
          is_approved: false
        });
        
        if (!employerProfile) {
          throw new Error('Failed to create employer profile');
        }
      } catch (profileError) {
        // If profile creation fails, delete the user to prevent orphaned records
        if (createdUser && createdUser.id) {
          try {
            await User.delete(createdUser.id);
          } catch (deleteError) {
            console.error('Failed to delete user after profile creation failure:', deleteError);
          }
        }
        throw new Error(`Failed to create employer profile: ${profileError.message}`);
      }
    }
    // For students (user_type === 1), profile is created later when they access their profile
    // This matches Django's behavior where Student.objects.get_or_create() is used later

    // Generate tokens (matching Django format)
    const tokens = generateTokens(createdUser);

    // Format response to match Django exactly
    // Django returns: { "user": {...}, "refresh": "...", "access": "..." }
    const userResponse = {
      id: createdUser.id,
      email: createdUser.email,
      first_name: createdUser.first_name,
      last_name: createdUser.last_name,
      user_type: createdUser.user_type,
      is_active: createdUser.is_active,
      created_at: createdUser.created_at
    };

    res.status(201).json({
      user: userResponse,
      refresh: tokens.refresh,
      access: tokens.access
    });
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error stack:', error.stack);
    
    // Try to clean up if user was created but profile creation failed
    if (createdUser && createdUser.id) {
      try {
        const userType = req.body.user_type || (createdUser.user_type ? Number(createdUser.user_type) : null);
        
        // Check if profile exists before deleting user
        if (userType === 2) {
          const employer = await Employer.findByUserId(createdUser.id);
          if (!employer) {
            await User.delete(createdUser.id);
            console.log('Cleaned up orphaned user:', createdUser.id);
          }
        }
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }
    
    // Return error in Django format for validation errors, or generic for server errors
    if (error.name === 'ValidationError' || error.isJoi) {
      return res.status(400).json({
        detail: error.message || 'Validation error'
      });
    }
    
    res.status(500).json({
      detail: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred during registration. Please try again.'
    });
  }
});

// Login endpoint - matches Django backend format exactly
router.post('/login', async (req, res) => {
  try {
    const { error } = authValidation.validate(req.body);
    if (error) {
      // Match Django's validation error format
      const errorDetails = {};
      error.details.forEach(detail => {
        const field = detail.path[0];
        if (!errorDetails[field]) {
          errorDetails[field] = [detail.message];
        } else {
          errorDetails[field].push(detail.message);
        }
      });
      return res.status(400).json(errorDetails);
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findByEmail(email);
    
    if (!user) {
      return res.status(401).json({
        detail: 'Invalid email or password'
      });
    }

    // Validate password
    const isValidPassword = await User.validatePassword(user, password);
    if (!isValidPassword) {
      return res.status(401).json({
        detail: 'Invalid email or password'
      });
    }

    if (!user.is_active) {
      return res.status(400).json({
        non_field_errors: ['User account is disabled.']
      });
    }

    // Update last login
    await User.updateLastLogin(user.id);

    // Generate tokens (matching Django format)
    const tokens = generateTokens(user);

    // Format user response (matching Django UserSerializer)
    const userResponse = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      user_type: user.user_type,
      is_active: user.is_active,
      created_at: user.created_at
    };

    // Match Django's login response format
    // Django returns: { "user": {...}, "refresh": "...", "access": "..." }
    res.json({
      user: userResponse,
      refresh: tokens.refresh,
      access: tokens.access
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      detail: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Profile endpoint
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get student or employer profile
    let studentProfile = null;
    let employerProfile = null;
    
    if (user.user_type === 1) {
      studentProfile = await Student.findByUserId(user.id);
    } else if (user.user_type === 2) {
      employerProfile = await Employer.findByUserId(user.id);
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          user_type: user.user_type,
          first_name: user.first_name,
          last_name: user.last_name,
          is_active: user.is_active,
          created_at: user.created_at,
          student_profile: studentProfile,
          employer_profile: employerProfile
        }
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    // In a production app, you might want to blacklist the refresh token
    // For now, we'll just return success
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Token refresh endpoint
router.post('/token/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    const decoded = verifyRefreshToken(refresh_token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const tokens = generateTokens(user);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: { tokens }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
