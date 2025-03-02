import { comparePassword } from '../../../utils/auth';
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

    // Find user by username
    const findUserQuery = 'SELECT * FROM users WHERE username = ?';
    
    const [users] = await connection.promise().query(findUserQuery, [username]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = users[0];

    // Compare passwords
    const passwordMatch = await comparePassword(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Return user data (excluding password)
    const { password: _, ...userData } = user;
    
    return res.status(200).json(userData);
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
