import { hashPassword } from '../../../utils/auth';
import connection from '../../../database/index';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    if (username.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters long' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if username already exists
    const checkUserQuery = 'SELECT * FROM users WHERE username = ?';
    
    const [existingUsers] = await connection.promise().query(checkUserQuery, [username]);
    
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Username already taken' });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Insert the new user
    const insertUserQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
    
    const [result] = await connection.promise().query(insertUserQuery, [username, hashedPassword]);
    
    // Return success with user ID
    return res.status(201).json({
      message: 'User registered successfully',
      id: result.insertId,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
