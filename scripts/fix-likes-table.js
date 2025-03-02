const connection = require('../database/index');

console.log('Fixing likes table structure...');

// Check if likes table exists
connection.query(`
  SELECT COUNT(*) AS table_exists 
  FROM information_schema.TABLES 
  WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'likes'
`, [process.env.SQL_DATABASE], (error, results) => {
  if (error) {
    console.error('Error checking table existence:', error);
    process.exit(1);
  }
  
  if (!results[0].table_exists) {
    console.log('Likes table does not exist. Creating it...');
    createLikesTable();
  } else {
    // Table exists, check if it has the right columns
    connection.query(`DESCRIBE likes`, (error, columns) => {
      if (error) {
        console.error('Error describing likes table:', error);
        process.exit(1);
      }
      
      const columnNames = columns.map(col => col.Field);
      
      if (!columnNames.includes('post_id')) {
        console.log('Fixing likes table: post_id column is missing');
        
        // Drop and recreate the table since altering foreign keys is complex
        connection.query('DROP TABLE likes', (error) => {
          if (error) {
            console.error('Error dropping likes table:', error);
            process.exit(1);
          }
          createLikesTable();
        });
      } else {
        console.log('Likes table structure is correct.');
        process.exit(0);
      }
    });
  }
});

function createLikesTable() {
  const createLikesTable = `
  CREATE TABLE IF NOT EXISTS likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
  )`;

  connection.query(createLikesTable, (error) => {
    if (error) {
      console.error('Failed to create likes table:', error);
      process.exit(1);
    }
    console.log('Likes table created successfully with post_id column.');
    process.exit(0);
  });
}
