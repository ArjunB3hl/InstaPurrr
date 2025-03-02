const fs = require('fs');
const path = require('path');
const https = require('https');

// Create directories if they don't exist
const avatarDir = path.join(process.cwd(), 'public/static/images/avatar');
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
  console.log('Created avatar directory at: ' + avatarDir);
}

// Create both avatar file locations to be safe
const defaultAvatarPaths = [
  path.join(avatarDir, 'default.jpg'),
  path.join(process.cwd(), 'public/images/default-avatar.png')
];

// Define avatar URLs for different formats
const avatarUrls = [
  'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png',
  'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png'
];

// Download all avatar images
defaultAvatarPaths.forEach((filePath, index) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  if (!fs.existsSync(filePath)) {
    console.log(`Downloading avatar to: ${filePath}`);
    const file = fs.createWriteStream(filePath);
    https.get(avatarUrls[index], response => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Avatar downloaded to ${filePath}`);
      });
    }).on('error', err => {
      fs.unlink(filePath, () => {}); // Delete the file async
      console.error(`Error downloading avatar for ${filePath}:`, err.message);
    });
  } else {
    console.log(`Avatar already exists at: ${filePath}`);
  }
});

console.log('Avatar setup complete!');
