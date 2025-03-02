const connection = require('../database/index');

console.log('Checking for created_at column in users table...');

// Check if created_at column exists
connection.query(`
  SELECT COUNT(*) AS column_exists 
  FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = ? 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'created_at'
`, [process.env.SQL_DATABASE || connection.config.database], (error, results) => {
  if (error) {
    console.error('Error checking created_at column:', error);
    process.exit(1);
  }
  
  if (!results[0].column_exists) {
    console.log('Adding created_at column to users table...');
    
    // Add the missing column
    connection.query(`
      ALTER TABLE users 
      ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `, (error) => {
      if (error) {
        console.error('Error adding created_at column:', error);
        process.exit(1);
      }
      console.log('created_at column added successfully!');
      process.exit(0);
    });
  } else {
    console.log('created_at column already exists.');
    process.exit(0);
  }
});
