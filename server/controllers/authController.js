const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
function generateToken() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Register a new user
async function register(req, res) {
  const { name, email, password } = req.body;
  
  try {
    // Check if user already exists
    const userResult = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (userResult.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Create verification token
    const verificationToken = generateToken();
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24); // 24 hours validity
    
    // Insert new user
    const newUserResult = await db.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, email_verified',
      [name, email, passwordHash]
    );
    
    const user = newUserResult.rows[0];
    
    // Store verification token
    await db.query(
      'INSERT INTO verification_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, verificationToken, tokenExpiry]
    );
    
    // Send verification email (in a real app)
    // await sendVerificationEmail(email, verificationToken);
    
    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        verified: user.email_verified
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Login user
async function login(req, res) {
  const { email, password } = req.body;
  
  try {
    // Check if user exists
    const userResult = await db.query(
      'SELECT id, name, email, password_hash, email_verified FROM users WHERE email = $1',
      [email]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const user = userResult.rows[0];
    
    // Validate password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Update last login
    await db.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );
    
    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        verified: user.email_verified
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Verify email
async function verifyEmail(req, res) {
  const { token } = req.params;
  
  try {
    // Find the token
    const tokenResult = await db.query(
      'SELECT user_id, expires_at FROM verification_tokens WHERE token = $1',
      [token]
    );
    
    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    
    const { user_id, expires_at } = tokenResult.rows[0];
    
    // Check if token is expired
    if (new Date(expires_at) < new Date()) {
      return res.status(400).json({ message: 'Token has expired' });
    }
    
    // Update user verification status
    await db.query(
      'UPDATE users SET email_verified = TRUE WHERE id = $1',
      [user_id]
    );
    
    // Delete used token
    await db.query(
      'DELETE FROM verification_tokens WHERE token = $1',
      [token]
    );
    
    // Return success
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error in verifyEmail:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Get current user
async function getCurrentUser(req, res) {
  try {
    const userResult = await db.query(
      'SELECT id, name, email, email_verified, email_notifications, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(userResult.rows[0]);
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  register,
  login,
  verifyEmail,
  getCurrentUser
};