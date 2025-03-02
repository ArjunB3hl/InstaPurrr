const connection = require('../database/index');
const readline = require('readline');

// Create readline interface for user confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get the command-line arguments
const args = process.argv.slice(2);
const forceDelete = args.includes('--force') || args.includes('-f');
const specificTable = args.find(arg => !arg.startsWith('-'));

console.log('Database truncate utility');
console.log('------------------------');

// Function to get all tables from the database
function getTables() {
  return new Promise((resolve, reject) => {
    const query = specificTable
      ? `
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      `
      : `
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = ?
      `;
      
    const params = specificTable
      ? [process.env.SQL_DATABASE || connection.config.database, specificTable]
      : [process.env.SQL_DATABASE || connection.config.database];
      
    connection.query(query, params, (error, results) => {
      if (error) {
        reject(error);
        return;
      }
      
      if (specificTable && results.length === 0) {
        reject(new Error(`Table '${specificTable}' not found in database`));
        return;
      }
      
      const tables = results.map(row => row.TABLE_NAME);
      resolve(tables);
    });
  });
}

// Function to disable foreign key checks
function disableForeignKeyChecks() {
  return new Promise((resolve, reject) => {
    connection.query('SET FOREIGN_KEY_CHECKS = 0', (error) => {
      if (error) {
        reject(error);
        return;
      }
      console.log('Foreign key checks disabled');
      resolve();
    });
  });
}

// Function to enable foreign key checks
function enableForeignKeyChecks() {
  return new Promise((resolve, reject) => {
    connection.query('SET FOREIGN_KEY_CHECKS = 1', (error) => {
      if (error) {
        reject(error);
        return;
      }
      console.log('Foreign key checks enabled');
      resolve();
    });
  });
}

// Function to truncate a table
function truncateTable(tableName) {
  return new Promise((resolve, reject) => {
    connection.query(`TRUNCATE TABLE ${tableName}`, (error) => {
      if (error) {
        reject(error);
        return;
      }
      
      console.log(`  ✅ Truncated table ${tableName}`);
      resolve();
    });
  });
}

// Main function to truncate tables
async function truncateTables() {
  try {
    // Get tables
    const tables = await getTables();
    
    if (tables.length === 0) {
      console.log('No tables to truncate.');
      return;
    }
    
    console.log(`Will truncate the following tables: ${tables.join(', ')}`);
    
    if (!forceDelete) {
      // Ask for confirmation
      await new Promise((resolve) => {
        const message = specificTable
          ? `⚠️ WARNING: This will delete ALL data from table '${specificTable}'. Are you sure? (yes/no): `
          : '⚠️ WARNING: This will delete ALL data from ALL tables. Are you sure? (yes/no): ';
        
        rl.question(`\n${message}`, (answer) => {
          if (answer.toLowerCase() !== 'yes') {
            console.log('Operation cancelled.');
            process.exit(0);
          }
          resolve();
        });
      });
    }
    
    // Disable foreign key checks to allow truncating tables with relationships
    await disableForeignKeyChecks();
    
    console.log('\nTruncating tables...');
    
    // Truncate all tables
    for (const table of tables) {
      try {
        await truncateTable(table);
      } catch (error) {
        console.error(`  ❌ Error truncating ${table}: ${error.message}`);
      }
    }
    
    // Re-enable foreign key checks
    await enableForeignKeyChecks();
    
    console.log('\n✅ Database truncate operation complete!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
    connection.end();
  }
}

// Run the truncate operation
truncateTables();
