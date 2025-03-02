const connection = require('../database/index');

console.log('Checking for bio column in users table...');

// Check if bio column exists
connection.query(`
  SELECT COUNT(*) AS column_exists 
  FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = ? 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'bio'
`, [process.env.SQL_DATABASE], (error, results) => {
  if (error) {
    console.error('Error checking bio column:', error);
    process.exit(1);
  }
  
  if (!results[0].column_exists) {
    console.log('Adding bio column to users table...');
    
    // Add the missing column
    connection.query(`
      ALTER TABLE users 
      ADD COLUMN bio TEXT DEFAULT NULL
    `, (error) => {
      if (error) {
        console.error('Error adding bio column:', error);
        process.exit(1);
      }
      console.log('bio column added successfully!');
      process.exit(0);
    });
  } else {
    console.log('bio column already exists.');
    process.exit(0);
  }
});
