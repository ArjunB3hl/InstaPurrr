

const connection = require('../../database/index.js');

export default function handler(req, res) {
    if (req.method === 'POST') {
        const { image, userId, username } = req.body;

        const sql = 'INSERT INTO images (image, user_id, user_username) VALUES (?, ?, ?)';
        connection.query(sql, [image, userId, username], (error, results) => {
            if (error) {
                console.error('Failed to insert into images table:', error);
                res.status(500).json({ message: 'Error inserting data into database' });
                return;
            }
            res.status(200).json({ message: 'Data inserted successfully', id: results.insertId });
        });
    } else {

        res.status(405).end();
    }
}