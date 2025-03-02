import connection from '../../../../database/index';
import withApiLogger from '../../../../middleware/apiLogger';

async function likedPostsHandler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query; // ID of the user whose liked posts we're fetching
    
    // Get pagination parameters with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Get posts liked by the user
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
        TRUE AS isLikedByUser
      FROM posts p
      JOIN users u ON p.user_id = u.id
      JOIN likes l ON p.id = l.post_id
      WHERE l.user_id = ?
      ORDER BY l.created_at DESC
      LIMIT ? OFFSET ?
    `, [id, limit, offset]);
    
    // Get comments for each post
    for (const post of posts) {
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
        LIMIT 3
      `, [post.id]);
      
      post.comments = comments;
    }
    
    // Get total count for pagination
    const [countResult] = await connection.promise().query(`
      SELECT COUNT(*) as total 
      FROM likes 
      WHERE user_id = ?
    `, [id]);
    
    const totalPosts = countResult[0].total;
    
    return res.status(200).json({
      posts,
      pagination: {
        total: totalPosts,
        page,
        limit,
        totalPages: Math.ceil(totalPosts / limit),
        hasMore: page < Math.ceil(totalPosts / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching liked posts:', error);
    return res.status(500).json({ message: 'Error fetching liked posts', error: error.message });
  }
}

export default withApiLogger(likedPostsHandler);
