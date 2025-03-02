const connection = require('../database/index');

// Get user ID from command line argument or default to all users
const userId = process.argv[2] || null;

console.log(`Checking ${userId ? 'user with ID: ' + userId : 'all users'} in the database...`);

// Function to get table structure
async function getTableStructure() {
  return new Promise((resolve, reject) => {
    connection.query(`
      DESCRIBE users
    `, (error, columns) => {
      if (error) {
        console.error('Error getting table structure:', error);
        reject(error);
      } else {
        console.log('\nUsers table structure:');
        columns.forEach(col => {
          console.log(`${col.Field} - ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `(${col.Key})` : ''}`);
        });
        resolve(columns);
      }
    });
  });
}

// Function to query user data
async function queryUsers(id = null) {
  return new Promise((resolve, reject) => {
    const query = id 
      ? 'SELECT * FROM users WHERE id = ?'
      : 'SELECT * FROM users LIMIT 10';
      
    const params = id ? [id] : [];
    
    connection.query(query, params, (error, results) => {
      if (error) {
        console.error('Error querying users:', error);
        reject(error);
      } else {
        console.log(`\nFound ${results.length} user(s):`);
        results.forEach(user => {
          console.log(`ID: ${user.id}, Username: ${user.username}`);
          
          // Log all fields
          for (const field in user) {
            if (field !== 'id' && field !== 'username' && field !== 'password') {
              console.log(`  ${field}: ${user[field] !== null ? user[field] : '[NULL]'}`);
            }
          }
          console.log('-----------------------------------');
        });
        resolve(results);
      }
    });
  });
}

// Run the check
async function checkDatabase() {
  try {
    // Get table structure
    await getTableStructure();
    
    // Query users
    await queryUsers(userId);
    
    process.exit(0);
  } catch (error) {
    console.error('Database check failed:', error);
    process.exit(1);
  }
}

checkDatabase();
