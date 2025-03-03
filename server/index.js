require('dotenv').config();
const app = require('./app');
const { initializeDatabase } = require('./init-db');
const { scheduleJobs } = require('./services/emailService');

const PORT = process.env.PORT || 8080;

// Initialize database and then start server
async function startServer() {
  try {
    console.log('Waiting for database to be ready...');
    // Increase wait time for database readiness
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    console.log('Initializing database...');
    // Initialize database
    await initializeDatabase();
    
    // Ensure daily jobs are scheduled
    scheduleJobs();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Ready to accept connections!');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    // Try again after a delay
    console.log('Retrying in 10 seconds...');
    setTimeout(startServer, 10000);
  }
}

startServer();