import connection from '../../../database/index';
import withApiLogger from '../../../middleware/apiLogger';

async function addLikeHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId, postId } = req.body;
    
    // Validate input
    if (!userId || !postId) {
      return res.status(400).json({ message: 'User ID and Post ID are required' });
    }
    
    // Check if already liked
    const [existingLikes] = await connection.promise().query(
      'SELECT * FROM likes WHERE user_id = ? AND post_id = ?',
      [userId, postId]
    );
    
    if (existingLikes.length > 0) {
      // Already liked, return success without creating duplicate
      return res.status(200).json({ 
        liked: true,
        message: 'Post already liked'
      });
    }
    
    // Add like
    await connection.promise().query(
      'INSERT INTO likes (user_id, post_id, created_at) VALUES (?, ?, NOW())',
      [userId, postId]
    );
    
    // Get updated like count
    const [countResult] = await connection.promise().query(
      'SELECT COUNT(*) AS count FROM likes WHERE post_id = ?',
      [postId]
    );
    
    return res.status(201).json({
      success: true,
      liked: true,
      likesCount: countResult[0].count
    });
  } catch (error) {
    console.error('Error adding like:', error);
    return res.status(500).json({ message: 'Error adding like', error: error.message });
  }
}

export default withApiLogger(addLikeHandler);
