const mysql = require('mysql');

if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}

const connection = mysql.createConnection({
    host: 'localhost',
    user: process.env.SQL_NAME,
    password: process.env.SQL_PASSWORD,
    database: 'user'
});

connection.connect(err => {
    if (err) {
        return console.error('error: ' + err.message);
    }
    console.log('Connected to the MySQL server.');
});


module.exports = connection;