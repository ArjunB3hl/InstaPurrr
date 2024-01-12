
const connection = require('../../database/index.js');



export default function handler(req, res) {
    if (req.method === 'GET') {
        const { username, password } = req.query;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const sql = 'SELECT * FROM users WHERE username = ?';
        connection.query(sql, [username], async (error, results) => {
            if (error) {
                console.error('Failed to retrieve user:', error);
                return res.status(500).json({ message: 'Error retrieving data from database' });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }
            console.log(results[0].password);
            console.log(password);
            const user = results[0];
            const passwordMatch = password == results[0].password;
            if (!passwordMatch) {
                return res.status(401).json({ message: 'Incorrect password' });
            }
            res.status(200).json({ id: user.id, username: user.username });
        });
    } else {
        res.status(405).end();
    }
}