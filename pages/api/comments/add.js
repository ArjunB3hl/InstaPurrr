import connection from '../../../database/index';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId, postId, content } = req.body;

    // Validate input
    if (!userId || !postId || isNaN(parseInt(userId)) || isNaN(parseInt(postId))) {
      return res.status(400).json({ message: 'Invalid user ID or post ID' });
    }

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Comment content cannot be empty' });
    }

    // Check if the post exists
    const checkPostQuery = 'SELECT id FROM posts WHERE id = ?';
    const [posts] = await connection.promise().query(checkPostQuery, [postId]);
    
    if (posts.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user exists
    const checkUserQuery = 'SELECT id, username, profile_picture FROM users WHERE id = ?';
    const [users] = await connection.promise().query(checkUserQuery, [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add the comment
    const addCommentQuery = 'INSERT INTO comments (user_id, post_id, content, created_at) VALUES (?, ?, ?, NOW())';
    const [result] = await connection.promise().query(addCommentQuery, [userId, postId, content]);
    
    // Get the created comment with timestamp
    const getCommentQuery = 'SELECT id, content, created_at FROM comments WHERE id = ?';
    const [comments] = await connection.promise().query(getCommentQuery, [result.insertId]);
    
    if (comments.length === 0) {
      return res.status(500).json({ message: 'Failed to retrieve created comment' });
    }

    const comment = comments[0];
    const user = users[0];
    
    return res.status(201).json({
      id: comment.id,
      content: comment.content,
      createdAt: comment.created_at,
      userId: user.id,
      username: user.username,
      profilePicture: user.profile_picture
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
