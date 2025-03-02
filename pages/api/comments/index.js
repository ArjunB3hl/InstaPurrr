import connection from '../../../database/index';
import withApiLogger from '../../../middleware/apiLogger';

async function commentsHandler(req, res) {
  // Handle POST request to create a new comment
  if (req.method === 'POST') {
    try {
      console.log('Creating new comment with data:', req.body);
      const { userId, postId, content } = req.body;

      // Validate input
      if (!userId || !postId || !content || content.trim() === '') {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Check if the post exists
      const [posts] = await connection.promise().query('SELECT id FROM posts WHERE id = ?', [postId]);
      if (posts.length === 0) {
        return res.status(404).json({ message: 'Post not found' });
      }

      // Check if the user exists and get their info
      const [users] = await connection.promise().query('SELECT id, username, profile_picture FROM users WHERE id = ?', [userId]);
      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const user = users[0];
      
      // Create the comment
      const [result] = await connection.promise().query(
        'INSERT INTO comments (user_id, post_id, content, created_at) VALUES (?, ?, ?, NOW())',
        [userId, postId, content]
      );

      const commentId = result.insertId;

      // Return the created comment with consistent property names
      const commentData = {
        id: commentId,
        content,
        // Include both property variants for compatibility
        createdAt: new Date().toISOString(),
        created_at: new Date().toISOString(),
        userId: user.id,
        user_id: user.id,
        username: user.username,
        // Include both property variants for compatibility
        profilePicture: user.profile_picture || '/static/images/avatar/default.jpg',
        profile_picture: user.profile_picture || '/static/images/avatar/default.jpg'
      };

      console.log('Created comment:', commentData);
      
      return res.status(201).json(commentData);
    } catch (error) {
      console.error('Error creating comment:', error);
      return res.status(500).json({ message: 'Error creating comment' });
    }
  }
  
  // Handle GET request to get comments for a post
  else if (req.method === 'GET') {
    try {
      const { postId, limit = 10, offset = 0 } = req.query;

      if (!postId) {
        return res.status(400).json({ message: 'Post ID is required' });
      }

      // Get comments for the post with user info
      const [comments] = await connection.promise().query(`
        SELECT 
          c.id, 
          c.content, 
          c.created_at, 
          c.user_id,
          u.username,
          u.profile_picture
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.post_id = ?
        ORDER BY c.created_at DESC
        LIMIT ? OFFSET ?
      `, [postId, parseInt(limit), parseInt(offset)]);

      // Transform comments to include both property naming conventions
      const transformedComments = comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        // Include both property variants for compatibility
        createdAt: comment.created_at,
        created_at: comment.created_at,
        userId: comment.user_id,
        user_id: comment.user_id,
        username: comment.username,
        // Include both property variants for compatibility
        profilePicture: comment.profile_picture || '/static/images/avatar/default.jpg',
        profile_picture: comment.profile_picture || '/static/images/avatar/default.jpg'
      }));

      return res.status(200).json({ comments: transformedComments });
    } catch (error) {
      console.error('Error fetching comments:', error);
      return res.status(500).json({ message: 'Error fetching comments' });
    }
  }
  
  // Method not allowed
  else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

export default withApiLogger(commentsHandler);
