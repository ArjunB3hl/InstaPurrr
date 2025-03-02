import connection from '../../database/index';
import withApiLogger from '../../middleware/apiLogger';

async function feedHandler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  
  // Get current user ID if available
  const userId = req.query.userId || null;

  try {
    // Get posts with user information, likes count, and check if current user liked each post
    const [posts] = await connection.promise().query(`
      SELECT 
        p.id, 
        p.image_path, 
        p.caption, 
        p.user_id, 
        p.created_at,
        u.username,
        u.profile_picture,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS likes_count,
        ${userId ? `(SELECT COUNT(*) > 0 FROM likes WHERE post_id = p.id AND user_id = ?) AS isLikedByUser` : 'FALSE AS isLikedByUser'}
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, userId ? [userId, limit, offset] : [limit, offset]);
    
    // Get comments for each post if needed
    for (const post of posts) {
      const [comments] = await connection.promise().query(`
        SELECT 
          c.id,
          c.content,
          c.created_at as createdAt,
          c.user_id as userId,
          u.username,
          u.profile_picture as profilePicture
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.post_id = ?
        ORDER BY c.created_at ASC
        LIMIT 10
      `, [post.id]);
      
      post.comments = comments;
    }
    
    // Get total count for pagination
    const [countResult] = await connection.promise().query('SELECT COUNT(*) as total FROM posts');
    const totalPosts = countResult[0].total;
    
    return res.status(200).json({
      posts,
      pagination: {
        total: totalPosts,
        page,
        limit,
        totalPages: Math.ceil(totalPosts / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    return res.status(500).json({ message: 'Error fetching feed' });
  }
}

export default withApiLogger(feedHandler);
