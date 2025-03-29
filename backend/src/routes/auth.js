const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token.' });
  }
};

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const { 
      email, 
      password, 
      first_name, 
      last_name, 
      company, 
      position, 
      company_size, 
      industry 
    } = req.body;

    // Validation
    const errors = {};
    
    // Email validation
    if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      errors.email = 'Please provide a valid email address';
    }
    
    // Password validation
    if (!password || password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    // Required fields validation
    if (!first_name) errors.firstName = 'First name is required';
    if (!last_name) errors.lastName = 'Last name is required';
    if (!company) errors.company = 'Company is required';
    if (!position) errors.position = 'Job title is required';
    if (!industry) errors.industry = 'Industry is required';
    if (!company_size) errors.companySize = 'Company size is required';
    
    // Return validation errors if any
    if (Object.keys(errors).length > 0) {
      console.log('Validation errors:', errors);
      return res.status(400).json({ 
        error: 'Validation failed', 
        errors 
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email already exists',
        errors: { email: 'User with this email already exists' }
      });
    }

    // Create user
    const userData = {
      email,
      password,
      first_name,
      last_name,
      company,
      position,
      company_size,
      industry
    };

    console.log('Attempting to create user with data:', {
      ...userData,
      password: '[REDACTED]' // Don't log password
    });

    const user = await User.create(userData);

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user
    });
  } catch (error) {
    console.error('Signup error details:', error);
    
    // Check for specific database errors
    if (error.code === '23505') { // Unique violation in PostgreSQL
      return res.status(400).json({ 
        error: 'User with this email already exists',
        errors: { email: 'This email is already registered' }
      });
    }
    
    if (error.message && error.message.includes('pattern')) {
      return res.status(400).json({ 
        error: 'Validation error: ' + error.message,
        errorDetails: error.toString()
      });
    }
    
    res.status(500).json({ 
      error: 'Server error during registration',
      errorDetails: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user and return JWT
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Create user object without password
    const userWithoutPassword = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      company: user.company,
      position: user.position,
      company_size: user.company_size,
      industry: user.industry,
      company_description: user.company_description,
      target_roles: user.target_roles,
      recruiting_goals: user.recruiting_goals,
      outreach_preferences: user.outreach_preferences
    };

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      company,
      position,
      company_size,
      industry,
      company_description,
      target_roles,
      recruiting_goals,
      outreach_preferences,
      current_password,
      new_password
    } = req.body;

    // If changing password
    if (new_password && current_password) {
      const passwordChanged = await User.changePassword(
        req.user.id,
        current_password,
        new_password
      );

      if (!passwordChanged) {
        return res.status(400).json({ error: 'Failed to update password' });
      }
    }

    // Update user profile (excluding password fields)
    const updatedData = {
      first_name,
      last_name,
      email,
      company,
      position,
      company_size,
      industry,
      company_description,
      target_roles,
      recruiting_goals,
      outreach_preferences
    };

    // Filter out undefined values
    Object.keys(updatedData).forEach(key => {
      if (updatedData[key] === undefined) {
        delete updatedData[key];
      }
    });

    const updatedUser = await User.update(req.user.id, updatedData);

    res.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    if (error.message === 'Current password is incorrect') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

module.exports = router; 