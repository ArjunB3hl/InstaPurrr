

const connection = require('../../database/index.js');

export default function handler(req, res) {
    if (req.method === 'GET') {
        const sql = 'SELECT * FROM likes';
        connection.query(sql, (error, results) => {
            if (error) {
                console.error('Failed to retrieve likes:', error);
                res.status(500).json({ message: 'Error retrieving data from database' });
                return;
            }
            res.status(200).json(results);
        });
    } else {
        res.status(405).end();
    }
}