const connection = require('../database/index.js');

// The issue might be that you're trying to USE a database that doesn't exist
// Let's remove this line or make sure the database exists first
connection.query('USE user', (error) => {
    if (error) {
        console.error('Failed to switch to database user: ' + error.message);
        // Instead of returning and stopping execution, let's try to continue
        console.log('Continuing with current database...');
    } else {
        console.log('Switched to user database.');
    }

    // Create users table with improved structure
    const createUserTable = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        profile_picture VARCHAR(255) DEFAULT NULL,
        bio TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    connection.query(createUserTable, (error) => {
        if (error) {
            console.error('Failed to create users table: ' + error.message);
            return;
        }
        console.log('Users table created or already exists.');

        // Create posts table (renamed from images for clarity)
        const createPostsTable = `
        CREATE TABLE IF NOT EXISTS posts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            image_path VARCHAR(255) NOT NULL,
            caption TEXT DEFAULT NULL,
            user_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`;

        connection.query(createPostsTable, (error) => {
            if (error) {
                console.error('Failed to create posts table: ' + error.message);
                return;
            }
            console.log('Posts table created or already exists.');

            // Create likes table with proper relationships
            const createLikesTable = `
            CREATE TABLE IF NOT EXISTS likes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                post_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_like (user_id, post_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
            )`;

            connection.query(createLikesTable, (error) => {
                if (error) {
                    console.error('Failed to create likes table: ' + error.message);
                    return;
                }
                console.log('Likes table created or already exists.');

                // Create comments table (new feature)
                const createCommentsTable = `
                CREATE TABLE IF NOT EXISTS comments (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    content TEXT NOT NULL,
                    user_id INT NOT NULL,
                    post_id INT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
                )`;

                connection.query(createCommentsTable, (error) => {
                    if (error) {
                        console.error('Failed to create comments table: ' + error.message);
                        return;
                    }
                    console.log('Comments table created or already exists.');
                    
                    console.log('Database schema setup complete.');
                });
            });
        });
    });
});
