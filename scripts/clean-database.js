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

console.log('Database cleaning utility');
console.log('------------------------');

// Function to get all tables from the database
function getTables() {
  return new Promise((resolve, reject) => {
    connection.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME
    `, [process.env.SQL_DATABASE || connection.config.database], (error, results) => {
      if (error) {
        reject(error);
        return;
      }
      
      const tables = results.map(row => row.TABLE_NAME);
      resolve(tables);
    });
  });
}

// Function to delete data from a table
function clearTable(tableName) {
  return new Promise((resolve, reject) => {
    connection.query(`DELETE FROM ${tableName}`, (error) => {
      if (error) {
        // If error is due to foreign key constraints, log it but don't fail
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
          console.log(`  ⚠️ Could not clear ${tableName} due to foreign key constraints. Will be cleared later.`);
          resolve(false);
          return;
        }
        reject(error);
        return;
      }
      
      console.log(`  ✅ Cleared data from ${tableName}`);
      resolve(true);
    });
  });
}

// Function to reset auto-increment counters
function resetAutoIncrement(tableName) {
  return new Promise((resolve, reject) => {
    connection.query(`ALTER TABLE ${tableName} AUTO_INCREMENT = 1`, (error) => {
      if (error) {
        // Non-critical error, just log it
        console.log(`  ⚠️ Could not reset AUTO_INCREMENT for ${tableName}: ${error.message}`);
        resolve();
        return;
      }
      
      console.log(`  ✅ Reset AUTO_INCREMENT for ${tableName}`);
      resolve();
    });
  });
}

// Main function to clean the database
async function cleanDatabase() {
  try {
    // Get all tables
    const tables = await getTables();
    
    console.log(`Found ${tables.length} tables in database: ${tables.join(', ')}`);
    
    if (!forceDelete) {
      // Ask for confirmation
      await new Promise((resolve) => {
        rl.question('\n⚠️ WARNING: This will delete ALL data from ALL tables. Are you sure? (yes/no): ', (answer) => {
          if (answer.toLowerCase() !== 'yes') {
            console.log('Operation cancelled.');
            process.exit(0);
          }
          resolve();
        });
      });
    }
    
    console.log('\nDeleting data from tables...');
    
    // First try to delete from all tables (some might fail due to constraints)
    const results = await Promise.all(
      tables.map(table => clearTable(table).catch(error => {
        console.error(`  ❌ Error clearing ${table}: ${error.message}`);
        return false;
      }))
    );
    
    // For tables that failed, retry in reverse order (to handle foreign key constraints)
    if (results.includes(false)) {
      console.log('\nRetrying tables with constraints in reverse order...');
      
      // Process tables in reverse order to handle foreign key dependencies
      for (let i = tables.length - 1; i >= 0; i--) {
        try {
          await clearTable(tables[i]);
        } catch (error) {
          console.error(`  ❌ Error clearing ${tables[i]}: ${error.message}`);
        }
      }
    }
    
    // Reset auto-increment counters
    console.log('\nResetting AUTO_INCREMENT values...');
    for (const table of tables) {
      await resetAutoIncrement(table);
    }
    
    console.log('\n✅ Database cleaning complete!');
    
  } catch (error) {
    console.error('\n❌ Error cleaning database:', error);
  } finally {
    rl.close();
    connection.end();
  }
}

// Run the clean operation
cleanDatabase();
