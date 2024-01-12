

const connection = require('../../database/index.js');

export default function handler(req, res) {
    if (req.method === 'POST') {
        const { username, password } = req.body;




        const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
        connection.query(sql, [username, password], (error, results) => {
            if (error) {
                console.error('Failed to insert into users table:', error);
                res.status(500).json({ message: 'Error inserting data into database' });
                return;
            }
            res.status(200).json({ message: 'Data inserted successfully', id: results.insertId });
        });
    } else {

        res.status(405).end();
    }
}



