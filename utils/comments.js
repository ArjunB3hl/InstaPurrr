/**
 * Adds a comment to a post
 * 
 * @param {number|string} postId - The post ID to comment on
 * @param {string} content - The comment text
 * @param {Object} user - The current user object
 * @returns {Promise<Object>} - The created comment data
 */
export async function addComment(postId, content, user) {
  if (!postId || !content || !user) {
    throw new Error('Missing required parameters');
  }

  try {
    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postId,
        userId: user.id,
        content,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to add comment (${response.status})`);
    }

    const commentData = await response.json();
    return commentData;
  } catch (error) {
    console.error('Error adding comment:', error);
    // Return a fallback comment object that will work with our UI
    return {
      id: `temp_${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString(), // Add both naming conventions
      userId: user.id,
      user_id: user.id, // Add both naming conventions
      username: user.username,
      profilePicture: user.profile_picture || '/static/images/avatar/default.jpg',
      profile_picture: user.profile_picture || '/static/images/avatar/default.jpg', // Add both naming conventions
      temporary: true // Flag to indicate this is a fallback
    };
  }
}

/**
 * Fetches comments for a post
 * 
 * @param {number|string} postId - The post ID to get comments for
 * @param {number} limit - Max number of comments to fetch
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} - Array of comments
 */
export async function getComments(postId, limit = 10, offset = 0) {
  try {
    const response = await fetch(`/api/comments?postId=${postId}&limit=${limit}&offset=${offset}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch comments (${response.status})`);
    }
    
    const data = await response.json();
    return data.comments || [];
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}
