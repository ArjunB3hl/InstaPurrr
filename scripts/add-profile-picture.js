const connection = require('../database/index');

// Check if profile_picture column exists
connection.query(`
  SELECT COUNT(*) AS column_exists 
  FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = ? 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'profile_picture'
`, [process.env.SQL_DATABASE], (error, results) => {
  if (error) {
    console.error('Error checking column:', error);
    process.exit(1);
  }
  
  if (!results[0].column_exists) {
    console.log('Adding profile_picture column to users table...');
    
    // Add the missing column
    connection.query(`
      ALTER TABLE users 
      ADD COLUMN profile_picture VARCHAR(255) DEFAULT NULL
    `, (error) => {
      if (error) {
        console.error('Error adding column:', error);
        process.exit(1);
      }
      console.log('profile_picture column added successfully!');
      process.exit(0);
    });
  } else {
    console.log('profile_picture column already exists.');
    process.exit(0);
  }
});
