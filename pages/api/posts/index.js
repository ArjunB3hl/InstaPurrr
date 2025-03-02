import connection from '../../../database/index';
import withApiLogger from '../../../middleware/apiLogger';

async function postsHandler(req, res) {
  // GET posts with pagination
  if (req.method === 'GET') {
    try {
      // Get pagination parameters with defaults
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      
      // Get current user ID if provided
      const userId = req.query.userId || null;
      
      // Build the query to get posts with additional data
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
      
      // Convert isLikedByUser from 0/1 to boolean for each post
      const postsWithBooleanLikes = posts.map(post => ({
        ...post,
        isLikedByUser: post.isLikedByUser === 1
      }));
      
      // Get comments for each post
      for (const post of postsWithBooleanLikes) {
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
          LIMIT 5
        `, [post.id]);
        
        post.comments = comments;
      }
      
      // Get total count for pagination
      const [countResult] = await connection.promise().query('SELECT COUNT(*) as total FROM posts');
      const totalPosts = countResult[0].total;
      const totalPages = Math.ceil(totalPosts / limit);
      
      return res.status(200).json({
        posts: postsWithBooleanLikes,
        pagination: {
          current: page,
          limit,
          total: totalPosts,
          totalPages
        },
        hasMore: page < totalPages
      });
      
    } catch (error) {
      console.error('Error fetching posts:', error);
      return res.status(500).json({ message: 'Error fetching posts', error: error.message });
    }
  } 
  
  // POST to create a new post
  else if (req.method === 'POST') {
    try {
      const { userId, imagePath, caption } = req.body;
      
      // Validation
      if (!userId || !imagePath) {
        return res.status(400).json({ message: 'User ID and image are required' });
      }
      
      // Create the post
      const [result] = await connection.promise().query(
        'INSERT INTO posts (user_id, image_path, caption, created_at) VALUES (?, ?, ?, NOW())',
        [userId, imagePath, caption || null]
      );
      
      const postId = result.insertId;
      
      // Get the created post with user data
      const [posts] = await connection.promise().query(`
        SELECT 
          p.id, 
          p.image_path, 
          p.caption, 
          p.user_id, 
          p.created_at,
          u.username,
          u.profile_picture
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
      `, [postId]);
      
      if (posts.length === 0) {
        return res.status(404).json({ message: 'Post not found after creation' });
      }
      
      return res.status(201).json(posts[0]);
    } catch (error) {
      console.error('Error creating post:', error);
      return res.status(500).json({ message: 'Error creating post', error: error.message });
    }
  } 
  
  // Method not allowed
  else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

export default withApiLogger(postsHandler);
