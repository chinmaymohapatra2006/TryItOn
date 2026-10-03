const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const config = require('../config');

// Helper to validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && emailRegex.test(email.trim());
}

// Helper to generate JWT token
function generateToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
}

const authController = {
  // Register a new user
  register: async (req, res) => {
    try {
      const { email, password, name } = req.body;

      // 1. Validation
      if (!email || !password) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Email and password are required fields',
        });
      }

      const cleanEmail = email.trim().toLowerCase();
      if (!isValidEmail(cleanEmail)) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Please provide a valid email address',
        });
      }

      if (typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Password must be at least 6 characters long',
        });
      }

      const cleanName = name && typeof name === 'string' ? name.trim() : cleanEmail.split('@')[0];

      // 2. Check if email already exists
      const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
      if (existingUser) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'An account with this email address already exists',
        });
      }

      // 3. Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // 4. Insert user into SQLite
      const insertStmt = db.prepare(`
        INSERT INTO users (email, password_hash, name)
        VALUES (?, ?, ?)
      `);
      const result = insertStmt.run(cleanEmail, passwordHash, cleanName);
      const newUserId = Number(result.lastInsertRowid);

      // 5. Fetch created user profile
      const user = db.prepare('SELECT id, email, name, avatar_url, created_at FROM users WHERE id = ?').get(newUserId);

      // 6. Sign JWT
      const token = generateToken(user);

      console.log(`[Auth] User registered successfully: ${user.email} (ID: ${user.id})`);

      return res.status(201).json({
        message: 'Registration successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatar_url,
          createdAt: user.created_at,
        },
        token,
      });
    } catch (error) {
      console.error('[Auth Register Error]:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to complete user registration',
      });
    }
  },

  // Login existing user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // 1. Validation
      if (!email || !password) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Email and password are required',
        });
      }

      const cleanEmail = email.trim().toLowerCase();

      // 2. Query user by email
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);
      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid email or password',
        });
      }

      // 3. Verify password
      const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordMatch) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid email or password',
        });
      }

      // 4. Sign JWT
      const token = generateToken(user);

      console.log(`[Auth] User logged in successfully: ${user.email} (ID: ${user.id})`);

      return res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatar_url,
          createdAt: user.created_at,
        },
        token,
      });
    } catch (error) {
      console.error('[Auth Login Error]:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to process login request',
      });
    }
  },

  // Get current authenticated user profile
  getMe: (req, res) => {
    return res.status(200).json({
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        avatarUrl: req.user.avatar_url,
        createdAt: req.user.created_at,
      },
    });
  },

  // Logout
  logout: (req, res) => {
    // JWT is stateless; client removes token. Server responds with 200.
    return res.status(200).json({
      message: 'Logged out successfully',
    });
  },
};

module.exports = authController;
