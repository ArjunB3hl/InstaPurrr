/**
 * Fetches user profile data with retry mechanism
 * 
 * @param {number|string} userId - The user ID to fetch
 * @param {Object} options - Options for the fetch
 * @param {number} options.retries - Number of retries (default: 2)
 * @param {number} options.retryDelay - Delay between retries in ms (default: 1000)
 * @returns {Promise<Object>} - The user profile data
 */
export async function fetchUserProfile(userId, options = {}) {
  const { retries = 2, retryDelay = 1000 } = options;
  
  if (!userId) {
    console.error('fetchUserProfile called without userId');
    throw new Error('User ID is required');
  }

  let lastError = null;
  
  // Try the initial request plus any retries
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`Fetching profile for user ${userId} (attempt ${attempt + 1}/${retries + 1})`);
      
      const response = await fetch(`/api/users/${userId}`);
      
      if (response.ok) {
        const userData = await response.json();
        
        // Ensure consistent profile data structure
        return {
          id: userData.id,
          username: userData.username || 'Unknown User',
          profile_picture: userData.profile_picture || '/static/images/avatar/default.jpg',
          bio: userData.bio || '',
          created_at: userData.created_at || new Date().toISOString()
        };
      }
      
      // Error responses
      if (response.status === 404) {
        throw new Error('User not found');
      }
      
      let errorMessage = `Failed to fetch profile (${response.status})`;
      
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
        if (errorData.error) {
          console.error('Server error details:', errorData.error);
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
      
      lastError = new Error(errorMessage);
      
      // Don't retry for certain status codes
      if (response.status === 400 || response.status === 401 || response.status === 403) {
        throw lastError;
      }
      
    } catch (error) {
      console.error(`Error fetching profile (attempt ${attempt + 1}):`, error);
      lastError = error;
      
      // Don't wait on the last attempt
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  
  // If we get here, all attempts failed
  throw lastError || new Error('Failed to fetch user profile after multiple attempts');
}

/**
 * Updates a user profile
 * 
 * @param {number|string} userId - The user ID to update
 * @param {Object} profileData - The profile data to update
 * @returns {Promise<Object>} - The updated user profile
 */
export async function updateUserProfile(userId, profileData) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    
    if (!response.ok) {
      let errorMessage = `Failed to update profile (${response.status})`;
      
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
      
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    return result.user || result;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw new Error(`Failed to update user profile: ${error.message}`);
  }
}
