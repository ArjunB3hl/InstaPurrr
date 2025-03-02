import connection from '../../database/index';
import withApiLogger from '../../middleware/apiLogger';

async function likesHandler(req, res) {
  // Handle POST request to toggle like status
  if (req.method === 'POST') {
    try {
      const { userId, postId, like } = req.body;

      // Validate input
      if (!userId || !postId) {
        return res.status(400).json({ message: 'User ID and Post ID are required' });
      }

      if (like === true) {
        // Add like
        try {
          await connection.promise().query(
            'INSERT INTO likes (user_id, post_id, created_at) VALUES (?, ?, NOW())',
            [userId, postId]
          );
        } catch (error) {
          // Ignore duplicate key errors (user already liked the post)
          if (error.code !== 'ER_DUP_ENTRY') {
            throw error;
          }
        }
      } else {
        // Remove like
        await connection.promise().query(
          'DELETE FROM likes WHERE user_id = ? AND post_id = ?',
          [userId, postId]
        );
      }

      // Get updated likes count
      const [countResult] = await connection.promise().query(
        'SELECT COUNT(*) AS count FROM likes WHERE post_id = ?',
        [postId]
      );

      return res.status(200).json({
        liked: like,
        likesCount: countResult[0].count
      });
    } catch (error) {
      console.error('Error toggling like:', error);
      return res.status(500).json({ message: 'Error toggling like' });
    }
  }
  
  // Handle GET request to check if user liked a post
  else if (req.method === 'GET') {
    try {
      const { userId, postId } = req.query;

      if (!userId || !postId) {
        return res.status(400).json({ message: 'User ID and Post ID are required' });
      }

      // Check if the user liked the post
      const [likes] = await connection.promise().query(
        'SELECT * FROM likes WHERE user_id = ? AND post_id = ?',
        [userId, postId]
      );

      // Get total likes count for the post
      const [countResult] = await connection.promise().query(
        'SELECT COUNT(*) AS count FROM likes WHERE post_id = ?',
        [postId]
      );

      return res.status(200).json({
        liked: likes.length > 0,
        likesCount: countResult[0].count
      });
    } catch (error) {
      console.error('Error checking like status:', error);
      return res.status(500).json({ message: 'Error checking like status' });
    }
  }
  
  // Method not allowed
  else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

export default withApiLogger(likesHandler);
