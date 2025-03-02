import connection from '../../../database/index';
import withApiLogger from '../../../middleware/apiLogger';

async function userHandler(req, res) {
  const { id } = req.query;

  console.log(`Processing request for user ID: ${id}`);
  
  // GET user by ID
  if (req.method === 'GET') {
    try {
      // First check if the user exists
      const [usersExist] = await connection.promise().query(
        'SELECT COUNT(*) as count FROM users WHERE id = ?', 
        [id]
      );
      
      if (!usersExist[0].count) {
        return res.status(404).json({ message: `User not found with ID: ${id}` });
      }
      
      // Check available columns in users table
      const [columns] = await connection.promise().query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
      `, [process.env.SQL_DATABASE || connection.config.database]);

      // Build a dynamic query based on available columns
      const columnNames = columns.map(col => col.COLUMN_NAME);
      const selectFields = [];
      
      // Always select these basic fields if they exist
      if (columnNames.includes('id')) selectFields.push('id');
      if (columnNames.includes('username')) selectFields.push('username');
      
      // Handle optional fields with IFNULL for safety
      if (columnNames.includes('profile_picture')) {
        selectFields.push("IFNULL(profile_picture, '') as profile_picture");
      } else {
        selectFields.push("'' as profile_picture");
      }
      
      if (columnNames.includes('bio')) {
        selectFields.push("IFNULL(bio, '') as bio");
      } else {
        selectFields.push("'' as bio");
      }
      
      // ONLY include created_at if it exists
      const hasCreatedAt = columnNames.includes('created_at');
      if (hasCreatedAt) {
        selectFields.push('created_at');
      }
      
      // Safe SQL query
      const query = `
        SELECT ${selectFields.join(', ')} 
        FROM users 
        WHERE id = ?
      `;
      
      console.log(`Executing user query: ${query}`);
      
      const [users] = await connection.promise().query(query, [id]);
      
      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const user = users[0];
      
      // Set default avatar if none exists
      if (!user.profile_picture) {
        user.profile_picture = '/static/images/avatar/default.jpg';
      }
      
      // Add a default created_at if it doesn't exist in the database
      if (!hasCreatedAt) {
        user.created_at = new Date().toISOString();
      }
      
      console.log(`Successfully fetched user: ${user.username}`);
      
      return res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({ 
        message: 'Error fetching user data',
        error: error.message
      });
    }
  }
  
  // PUT update user
  else if (req.method === 'PUT') {
    try {
      const { bio, profile_picture } = req.body;
      
      // Check if user exists before updating
      const [usersExist] = await connection.promise().query(
        'SELECT COUNT(*) as count FROM users WHERE id = ?',
        [id]
      );
      
      if (!usersExist[0].count) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Build update query dynamically
      const updateValues = [];
      const updateFields = [];
      
      // Check available columns
      const [columns] = await connection.promise().query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
      `, [process.env.SQL_DATABASE || connection.config.database]);
      
      const columnNames = columns.map(col => col.COLUMN_NAME);
      
      // Only add bio if column exists and bio provided in request
      if (bio !== undefined && columnNames.includes('bio')) {
        updateFields.push('bio = ?');
        updateValues.push(bio);
      }
      
      // Only add profile_picture if column exists and pic provided in request
      if (profile_picture !== undefined && columnNames.includes('profile_picture')) {
        updateFields.push('profile_picture = ?');
        updateValues.push(profile_picture);
      }
      
      // If nothing to update
      if (updateFields.length === 0) {
        return res.status(400).json({ message: 'No valid fields to update' });
      }
      
      // Complete the query
      const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
      updateValues.push(id);
      
      // Execute update
      await connection.promise().query(updateQuery, updateValues);
      
      // Get updated user without including created_at
      const selectQuery = `
        SELECT id, username 
        ${columnNames.includes('profile_picture') ? ", IFNULL(profile_picture, '') as profile_picture" : ""}
        ${columnNames.includes('bio') ? ", IFNULL(bio, '') as bio" : ""}
        FROM users 
        WHERE id = ?
      `;
      
      const [updatedUsers] = await connection.promise().query(selectQuery, [id]);
      
      if (updatedUsers.length === 0) {
        return res.status(404).json({ message: 'User not found after update' });
      }
      
      const user = updatedUsers[0];
      
      // Set default avatar if none exists
      if (!user.profile_picture) {
        user.profile_picture = '/static/images/avatar/default.jpg';
      }
      
      // Add a fake created_at timestamp for consistency
      user.created_at = new Date().toISOString();
      
      return res.status(200).json({
        message: 'User updated successfully',
        user
      });
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ 
        message: 'Error updating user data',
        error: error.message
      });
    }
  }
  
  // Method not allowed
  else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

export default withApiLogger(userHandler);
