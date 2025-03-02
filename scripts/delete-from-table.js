const connection = require('../database/index');
const readline = require('readline');

// Create readline interface for user confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get the command-line arguments
const args = process.argv.slice(2);
const tableName = args[0];
const whereClause = args[1];

if (!tableName) {
  console.error('Error: Table name is required');
  console.log('Usage: node delete-from-table.js <table_name> "<where_clause>"');
  console.log('Example: node delete-from-table.js users "id > 10"');
  process.exit(1);
}

console.log('Database specific delete utility');
console.log('-------------------------------');

// Function to check if table exists
function checkTableExists(table) {
  return new Promise((resolve, reject) => {
    connection.query(`
      SELECT COUNT(*) as count
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
    `, [process.env.SQL_DATABASE || connection.config.database, table], (error, results) => {
      if (error) {
        reject(error);
        return;
      }
      
      resolve(results[0].count > 0);
    });
  });
}

// Function to delete data from a table with optional where clause
function deleteFromTable(table, where = null) {
  return new Promise((resolve, reject) => {
    let query = `DELETE FROM ${table}`;
    if (where) {
      query += ` WHERE ${where}`;
    }
    
    // First count how many rows will be affected
    const countQuery = `SELECT COUNT(*) as count FROM ${table}${where ? ` WHERE ${where}` : ''}`;
    
    connection.query(countQuery, (countError, countResults) => {
      if (countError) {
        reject(countError);
        return;
      }
      
      const rowCount = countResults[0].count;
      
      // Ask for confirmation if no where clause or might affect many rows
      if (!where || rowCount > 5) {
        rl.question(`\n⚠️ This will delete ${rowCount} rows from '${table}'${where ? ` where ${where}` : ''}. Are you sure? (yes/no): `, (answer) => {
          if (answer.toLowerCase() !== 'yes') {
            console.log('Operation cancelled.');
            resolve(0);
            return;
          }
          
          executeDelete();
        });
      } else {
        executeDelete();
      }
      
      function executeDelete() {
        connection.query(query, (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          
          console.log(`✅ Deleted ${result.affectedRows} rows from ${table}`);
          resolve(result.affectedRows);
        });
      }
    });
  });
}

// Main function
async function main() {
  try {
    // Check if table exists
    const tableExists = await checkTableExists(tableName);
    
    if (!tableExists) {
      console.error(`Error: Table '${tableName}' does not exist in the database`);
      return;
    }
    
    // Delete from the table
    await deleteFromTable(tableName, whereClause);
    
    console.log('\n✅ Operation complete!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
    connection.end();
  }
}

// Run the main function
main();
