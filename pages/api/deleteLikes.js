

const connection = require('../../database/index.js');

export default function handler(req, res) {
    if (req.method === 'DELETE') {
        const { userId, imageId } = req.body;

        const sql = 'DELETE FROM likes WHERE user_id = ? AND image_id = ?';
        connection.query(sql, [userId, imageId], (error, results) => {
            if (error) {
                console.error('Failed to delete from likes table:', error);
                res.status(500).json({ message: 'Error deleting data from database' });
                return;
            }
            res.status(200).json({ message: 'Like deleted successfully' });
        });
    } else {
        res.status(405).end();
    }
}