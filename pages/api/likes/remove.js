import connection from '../../../database/index';
import withApiLogger from '../../../middleware/apiLogger';

async function removeLikeHandler(req, res) {
  if (req.method !== 'DELETE' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId, postId } = req.method === 'DELETE' 
      ? req.query 
      : req.body;
    
    // Validate input
    if (!userId || !postId) {
      return res.status(400).json({ message: 'User ID and Post ID are required' });
    }
    
    // Remove like
    await connection.promise().query(
      'DELETE FROM likes WHERE user_id = ? AND post_id = ?',
      [userId, postId]
    );
    
    // Get updated like count
    const [countResult] = await connection.promise().query(
      'SELECT COUNT(*) AS count FROM likes WHERE post_id = ?',
      [postId]
    );
    
    return res.status(200).json({
      success: true,
      liked: false,
      likesCount: countResult[0].count
    });
  } catch (error) {
    console.error('Error removing like:', error);
    return res.status(500).json({ message: 'Error removing like', error: error.message });
  }
}

export default withApiLogger(removeLikeHandler);
