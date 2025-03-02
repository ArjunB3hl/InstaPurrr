const mysql = require('mysql2');

if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}

const connection = mysql.createConnection({
    host: process.env.SQL_HOST,
    user: process.env.SQL_NAME,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE
});

connection.connect(err => {
    if (err) {
        return console.error('error: ' + err.message);
    }
    console.log('Connected to the MySQL server.');

    // Verify posts table exists
    connection.query(`
        SELECT COUNT(*) AS table_exists 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'posts'
    `, [process.env.SQL_DATABASE], (error, results) => {
        if (error) {
            console.error('Error checking schema:', error);
            return;
        }
        
        if (!results[0].table_exists) {
            console.error('Posts table is missing. Please run the schema initialization:');
            console.error('npm run db:init');
        } else {
            console.log('Database schema verified: posts table exists');
        }
    });
});

module.exports = connection;