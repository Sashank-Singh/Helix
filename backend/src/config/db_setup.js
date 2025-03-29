const db = require('./db');

async function setupDatabase() {
  try {
    console.log('Setting up database tables...');
    
    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        company VARCHAR(255),
        position VARCHAR(255),
        company_size VARCHAR(50),
        industry VARCHAR(255),
        company_description TEXT,
        target_roles TEXT,
        recruiting_goals TEXT,
        outreach_preferences TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    db.pool.end();
  }
}

// Run the setup
setupDatabase();

// Export the function for potential use in other files
module.exports = setupDatabase; 