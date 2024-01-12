

const connection = require('../../database/index.js');

export default function handler(req, res) {
    if (req.method === 'POST') {
        const { userId, imageId } = req.body;

        const sql = 'INSERT INTO likes (user_id, image_id) VALUES (?, ?)';
        connection.query(sql, [userId, imageId], (error, results) => {
            if (error) {
                console.error('Failed to insert into likes table:', error);
                res.status(500).json({ message: 'Error inserting data into database' });
                return;
            }
            res.status(200).json({ message: 'Data inserted successfully', id: results.insertId });
        });
    } else {

        res.status(405).end();
    }
}