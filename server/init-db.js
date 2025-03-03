const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  // Create a connection to PostgreSQL
  console.log('Connecting to database with URL:', process.env.DATABASE_URL);
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('Database connection successful!');
    
    console.log('Checking database setup...');
    
    // Check if tables exist
    const tableCheckResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'puzzles'
      );
    `);
    
    const tablesExist = tableCheckResult.rows[0].exists;
    
    if (!tablesExist) {
      console.log('Tables do not exist. Creating database schema...');
      
      // Read schema file
      const schemaPath = path.join(__dirname, 'db', 'schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      
      // Execute schema creation
      await pool.query(schemaSql);
      console.log('Database schema created successfully');
      
      // Create first puzzle after schema creation
      const { createDailyPuzzle } = require('./services/puzzleGenerator');
      await createDailyPuzzle();
      console.log('Initial puzzle created successfully');
    } else {
      console.log('Database schema already exists');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

module.exports = { initializeDatabase };