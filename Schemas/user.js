

const connection = require('../database/index.js');

connection.query('USE user', (error) => {
    if (error) {
        console.error('Failed to switch to database user: ' + error.message);
        return;
    }
    console.log('Switched to user database.');

    const createUserTable = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
    )`;

    connection.query(createUserTable, (error, results, fields) => {
        if (error) {
            console.error('Failed to create users table: ' + error.message);
            return;
        }
        console.log('Users table created or already exists.');

        const createImagesTable = `
        CREATE TABLE IF NOT EXISTS images (
            id INT AUTO_INCREMENT PRIMARY KEY,
            image VARCHAR(250) NOT NULL UNIQUE,
            user_id INT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`;

        connection.query(createImagesTable, (error, results, fields) => {
            if (error) {
                console.error('Failed to create images table: ' + error.message);
                return;
            }
            console.log('Images table created or already exists.');

            const createLikesTable = `
                CREATE TABLE IF NOT EXISTS likes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )`;

            connection.query(createLikesTable, (error, results, fields) => {
                if (error) {
                    console.error('Failed to create images table: ' + error.message);
                    return;
                }
                console.log('Likes table created or already exists.');


                const deleteFromImagesTable = `DELETE FROM images`;

                connection.query(deleteFromImagesTable, (error, results, fields) => {
                    if (error) {
                        console.error('Failed to delete data from images table: ' + error.message);
                        return;
                    }
                    console.log('All data deleted from images table.');

                    const addColumnToImagesTable = `
                    ALTER TABLE  images
                    ADD COLUMN user_username VARCHAR(250) NOT NULL`;
                    connection.query(addColumnToImagesTable, (error, results, fields) => {
                        if (error) {
                            console.error('Failed to add image_id column to images table: ' + error.message);
                            return;
                        }
                        console.log('image_id column added to images table.');

                        const addForeignKeyToImagesTable = `
                    ALTER TABLE images
                    ADD FOREIGN KEY (user_username) REFERENCES users(username)`;

                        connection.query(addForeignKeyToImagesTable, (error, results, fields) => {
                            if (error) {
                                console.error('Failed to add foreign key to images table: ' + error.message);
                                return;
                            }
                            console.log('Foreign key added to images table.');
                            connection.end();
                        });
                    });


                });

            })
        });
    });


});

