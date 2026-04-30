const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required().messages({
    'string.email': 'Enter a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters',
    'any.required': 'Password is required'
  }),
  password2: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Password fields must match',
    'any.required': 'Password confirmation is required'
  }),
  first_name: Joi.string().trim().min(1).required().messages({
    'string.empty': 'First name is required',
    'any.required': 'First name is required'
  }),
  last_name: Joi.string().trim().min(1).required().messages({
    'string.empty': 'Last name is required',
    'any.required': 'Last name is required'
  }),
  user_type: Joi.number().integer().valid(1, 2, 3).required().messages({
    'any.only': 'User type must be 1 (Student), 2 (Employer), or 3 (Admin)',
    'any.required': 'User type is required'
  })
}).unknown(true);

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const studentProfileSchema = Joi.object({
  university: Joi.string().allow(''),
  major: Joi.string().allow(''),
  graduation_year: Joi.number().integer().min(1900).max(2100).allow(null),
  gpa: Joi.number().min(0).max(4).allow(null),
  linkedin_url: Joi.string().uri().allow(''),
  github_url: Joi.string().uri().allow(''),
  portfolio_url: Joi.string().uri().allow(''),
  resume_headline: Joi.string().allow(''),
  summary: Joi.string().allow('')
});

const employerProfileSchema = Joi.object({
  company_name: Joi.string().trim().allow('', null).optional(),
  company_description: Joi.string().trim().allow('', null).optional(),
  company_website: Joi.alternatives().try(
    Joi.string().allow('', null), // Allow empty string first
    Joi.string().uri().messages({
      'string.uri': 'Company website must be a valid URL (e.g., https://example.com)'
    })
  ).optional(),
  company_size: Joi.string().trim().allow('', null).optional(),
  industry: Joi.string().trim().allow('', null).optional(),
  location: Joi.string().trim().allow('', null).optional(),
  company_logo: Joi.any().optional() // Allow file uploads
}).unknown(true).min(0); // Allow unknown fields and empty objects

const jobListingSchema = Joi.object({
  title: Joi.string().trim().min(1).required().messages({
    'string.empty': 'Title is required',
    'any.required': 'Title is required'
  }),
  description: Joi.string().trim().min(1).required().messages({
    'string.empty': 'Description is required',
    'any.required': 'Description is required'
  }),
  requirements: Joi.string().trim().min(1).required().messages({
    'string.empty': 'Requirements are required',
    'any.required': 'Requirements are required'
  }),
  responsibilities: Joi.string().allow('', null).optional(),
  location: Joi.string().trim().min(1).required().messages({
    'string.empty': 'Location is required',
    'any.required': 'Location is required'
  }),
  job_type: Joi.string().valid('full-time', 'part-time', 'internship').required().messages({
    'any.only': 'Job type must be full-time, part-time, or internship',
    'any.required': 'Job type is required'
  }),
  salary_min: Joi.number().min(0).allow(null, '').optional(),
  salary_max: Joi.number().min(0).allow(null, '').optional(),
  salary_currency: Joi.string().length(3).default('USD').optional(),
  is_remote: Joi.boolean().default(false).optional(),
  is_active: Joi.boolean().optional(),
  deadline: Joi.alternatives().try(
    Joi.date(),
    Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).messages({
      'string.pattern.base': 'Deadline must be in YYYY-MM-DD format'
    })
  ).required().messages({
    'any.required': 'Deadline is required'
  })
});

const applicationSchema = Joi.object({
  job_id: Joi.number().integer().required(),
  cv_id: Joi.number().integer().required(),
  cover_letter: Joi.string().allow('')
});

const messageSchema = Joi.object({
  conversation_id: Joi.string().required(),
  content: Joi.string().required()
});

const conversationSchema = Joi.object({
  student_id: Joi.number().integer().required(),
  job_id: Joi.number().integer().required()
});

const jobUpdateSchema = Joi.object({
  title: Joi.string(),
  description: Joi.string(),
  requirements: Joi.string(),
  responsibilities: Joi.string().allow(''),
  location: Joi.string(),
  job_type: Joi.string().valid('full-time', 'part-time', 'internship'),
  salary_min: Joi.number().min(0).allow(null),
  salary_max: Joi.number().min(0).allow(null),
  salary_currency: Joi.string().length(3),
  is_remote: Joi.boolean(),
  deadline: Joi.date().min('now'),
  is_active: Joi.boolean()
});

module.exports = {
  registerSchema,
  loginSchema,
  studentProfileSchema,
  employerProfileSchema,
  jobListingSchema,
  jobUpdateSchema,
  applicationSchema,
  messageSchema,
  conversationSchema
};
