

const connection = require('../../database/index.js');

export default function handler(req, res) {
    if (req.method === 'GET') {
        const { username } = req.query;


        if (!username) {
            res.status(400).json({ message: 'Username is required' });
            return;
        }

        const sql = 'SELECT * FROM users WHERE username = ?';
        connection.query(sql, [username], (error, results) => {
            if (error) {
                console.error('Failed to retrieve user:', error);
                res.status(500).json({ message: 'Error retrieving data from database' });
                return;
            }
            res.status(200).json(results);
        });
    } else {
        res.status(405).end();
    }
}