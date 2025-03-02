const connection = require('../database/index');

console.log('Checking users in database...');

// Query all users
connection.query(`
  SELECT id, username, 
         IFNULL(profile_picture, '[NULL]') as profile_picture, 
         IFNULL(bio, '[NULL]') as bio
    
  FROM users
  LIMIT 10
`, (error, results) => {
  if (error) {
    console.error('Error checking users:', error);
    process.exit(1);
  }
  
  console.log(`Found ${results.length} users:`);
  
  results.forEach(user => {
    console.log(`ID: ${user.id}, Username: ${user.username}`);
    console.log(`  Bio: ${user.bio}`);
    console.log(`  Profile Picture: ${user.profile_picture}`);
    console.log('-----------------------------------');
  });
  
  process.exit(0);
});
