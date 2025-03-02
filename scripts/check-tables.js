const connection = require('../database/index');

console.log('Checking database tables structure...');

// Function to describe a table
function describeTable(tableName) {
  return new Promise((resolve, reject) => {
    connection.query(`DESCRIBE ${tableName}`, (error, results) => {
      if (error) {
        console.error(`Error describing ${tableName}:`, error);
        reject(error);
      } else {
        console.log(`\n${tableName} table structure:`);
        results.forEach(column => {
          console.log(`${column.Field} - ${column.Type} ${column.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${column.Key ? `(${column.Key})` : ''}`);
        });
        resolve(results);
      }
    });
  });
}

// Check all tables
Promise.all([
  describeTable('users'),
  describeTable('posts'),
  describeTable('likes'),
  describeTable('comments')
])
.then(() => {
  console.log('\nAll tables checked successfully.');
  process.exit(0);
})
.catch(error => {
  console.error('Error checking tables:', error);
  process.exit(1);
});
