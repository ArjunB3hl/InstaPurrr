import connection from '../../../database/index';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username } = req.query;

    // Validate input
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    // Check if username exists
    const checkUserQuery = 'SELECT COUNT(*) as count FROM users WHERE username = ?';
    
    const [result] = await connection.promise().query(checkUserQuery, [username]);
    
    const exists = result[0].count > 0;
    
    return res.status(200).json({ exists });
  } catch (error) {
    console.error('Username check error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
