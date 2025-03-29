const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  // Create a new user
  static async create(userData) {
    const { 
      first_name, 
      last_name, 
      email, 
      password,
      company,
      position,
      company_size,
      industry
    } = userData;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
    const id = require('crypto').randomUUID();
    const username = email.split('@')[0]; // Generate username from email
    const result = await db.query(
      `INSERT INTO users (
          id,
          username,
          first_name, 
          last_name, 
          email, 
          password,
          password_hash, 
          company, 
          position, 
          company_size, 
          industry,
          created_at
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        RETURNING id, first_name, last_name, email, company, position, company_size, industry`,
      [id, username, first_name, last_name, email, password, hashedPassword, company, position, company_size, industry]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const result = await db.query(
        'SELECT id, first_name, last_name, email, password_hash as password, company, position, company_size, industry FROM users WHERE email = $1',
        [email]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const result = await db.query(
        'SELECT id, first_name, last_name, email, company, position, company_size, industry, company_description, target_roles, recruiting_goals, outreach_preferences FROM users WHERE id = $1',
        [id]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  // Update user
  static async update(id, updatedData) {
    try {
      const columns = Object.keys(updatedData)
        .filter(key => updatedData[key] !== undefined && key !== 'id')
        .map((key, index) => `${key} = $${index + 2}`);

      if (columns.length === 0) return await this.findById(id);

      const values = Object.values(updatedData)
        .filter((_, index) => updatedData[Object.keys(updatedData)[index]] !== undefined && Object.keys(updatedData)[index] !== 'id');

      const query = `
        UPDATE users 
        SET ${columns.join(', ')}, updated_at = NOW()
        WHERE id = $1
        RETURNING id, first_name, last_name, email, company, position, company_size, industry, company_description, target_roles, recruiting_goals, outreach_preferences
      `;

      const result = await db.query(query, [id, ...values]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Change password
  static async changePassword(id, currentPassword, newPassword) {
    try {
      // Get current user with password
      const userResult = await db.query('SELECT * FROM users WHERE id = $1', [id]);
      const user = userResult.rows[0];

      if (!user) {
        throw new Error('User not found');
      }

      // Check if current password matches
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      await db.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [hashedPassword, id]
      );

      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
}

module.exports = User;
