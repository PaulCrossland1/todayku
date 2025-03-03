const nodemailer = require('nodemailer');
const schedule = require('node-schedule');
const db = require('../config/database');
const { createDailyPuzzle } = require('./puzzleGenerator');

// Configure email provider
let transporter;

if (process.env.NODE_ENV === 'production') {
  // Use actual email service in production
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'SendGrid',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
} else {
  // Use ethereal for development
  nodemailer.createTestAccount().then(account => {
    transporter = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: {
        user: account.user,
        pass: account.pass
      }
    });
    
    console.log('Ethereal email account created for testing');
  });
}

// Schedule all recurring jobs
function scheduleJobs() {
  // Generate new puzzle every day at midnight
  schedule.scheduleJob('0 0 * * *', async function() {
    try {
      console.log('Scheduled job: Creating new daily puzzle');
      await createDailyPuzzle();
      console.log('New daily puzzle created successfully');
    } catch (error) {
      console.error('Error in scheduled puzzle creation:', error);
      // Retry after 15 minutes if failed
      setTimeout(async () => {
        try {
          console.log('Retrying puzzle creation');
          await createDailyPuzzle();
          console.log('Retry successful');
        } catch (retryError) {
          console.error('Retry also failed:', retryError);
        }
      }, 15 * 60 * 1000);
    }
  });
  
  // Send leaderboard emails every day at 23:30
  schedule.scheduleJob('30 23 * * *', async function() {
    try {
      await sendLeaderboardEmails();
      console.log('Leaderboard emails sent');
    } catch (error) {
      console.error('Error sending leaderboard emails:', error);
    }
  });
  
  console.log('All scheduled jobs have been set up');
  
  // Run createDailyPuzzle immediately to ensure we have today's puzzle
  setTimeout(async () => {
    try {
      console.log('Checking for today\'s puzzle');
      const today = new Date().toISOString().split('T')[0];
      
      // Check if puzzle exists for today
      const existingResult = await db.query(
        'SELECT * FROM puzzles WHERE date = $1',
        [today]
      );
      
      if (existingResult.rows.length === 0) {
        console.log('No puzzle for today, creating one now');
        await createDailyPuzzle();
        console.log('Created today\'s puzzle successfully');
      } else {
        console.log('Today\'s puzzle already exists');
      }
    } catch (error) {
      console.error('Error checking/creating today\'s puzzle:', error);
    }
  }, 10000); // Wait 10 seconds after server start
}

// Send leaderboard emails
async function sendLeaderboardEmails() {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get top 10 times for today
    const leaderboardResult = await db.query(
      `SELECT u.name, ct.completion_time
       FROM completion_times ct
       JOIN users u ON ct.user_id = u.id
       JOIN puzzles p ON ct.puzzle_id = p.id
       WHERE p.date = $1
       ORDER BY ct.completion_time ASC
       LIMIT 10`,
      [today]
    );
    
    if (leaderboardResult.rows.length === 0) {
      console.log('No completions today, skipping leaderboard email');
      return;
    }
    
    // Get users who want email notifications
    const usersResult = await db.query(
      `SELECT email FROM users WHERE email_notifications = TRUE AND email_verified = TRUE`
    );
    
    if (usersResult.rows.length === 0) {
      console.log('No users subscribed to email notifications');
      return;
    }
    
    // Format leaderboard for email
    const emailContent = generateLeaderboardHtml(today, leaderboardResult.rows);
    
    // Send emails
    for (const user of usersResult.rows) {
      await transporter.sendMail({
        from: `"Todayku" <${process.env.EMAIL_FROM || 'noreply@todayku.com'}>`,
        to: user.email,
        subject: `Todayku Leaderboard for ${today}`,
        html: emailContent
      });
    }
    
    console.log(`Sent ${usersResult.rows.length} leaderboard emails`);
  } catch (error) {
    console.error('Error in sendLeaderboardEmails:', error);
    throw error;
  }
}

// Generate HTML for leaderboard email
function generateLeaderboardHtml(date, leaderboard) {
  let tableRows = '';
  
  // Format time function
  const formatTime = (milliseconds) => {
    const seconds = Math.floor((milliseconds / 1000) % 60);
    const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    
    return `${minutes}m ${seconds}s`;
  };
  
  // Generate table rows
  leaderboard.forEach((entry, index) => {
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
    
    tableRows += `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${index + 1} ${medal}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${entry.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${formatTime(entry.completion_time)}</td>
      </tr>
    `;
  });
  
  // Full email HTML
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Todayku Leaderboard</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #91818A; }
        .date { margin-top: 10px; color: #666; }
        .leaderboard { width: 100%; border-collapse: collapse; }
        .footer { margin-top: 30px; text-align: center; font-size: 14px; color: #666; }
        .button { display: inline-block; padding: 10px 20px; background-color: #91818A; color: white; text-decoration: none; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">todayku</div>
          <div class="date">Leaderboard for ${date}</div>
        </div>
        
        <p>Here are today's top solvers:</p>
        
        <table class="leaderboard">
          <thead>
            <tr>
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #91818A;">Rank</th>
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #91818A;">Player</th>
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #91818A;">Time</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://todayku.com" class="button">Play Today's Puzzle</a>
        </div>
        
        <div class="footer">
          <p>A new puzzle will be available tomorrow at midnight.</p>
          <p>You're receiving this email because you subscribed to Todayku leaderboard updates.</p>
          <p>To unsubscribe, <a href="https://todayku.com/profile">update your profile settings</a>.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = {
  scheduleJobs,
  sendLeaderboardEmails
};