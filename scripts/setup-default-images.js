const fs = require('fs');
const path = require('path');
const https = require('https');

// Create directories if they don't exist
const imagesDir = path.join(process.cwd(), 'public/images');
const uploadsDir = path.join(process.cwd(), 'public/uploads');

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log('Created images directory');
}

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

// Download default avatar if it doesn't exist
const avatarPath = path.join(imagesDir, 'default-avatar.png');
if (!fs.existsSync(avatarPath)) {
  console.log('Downloading default avatar...');
  const avatarUrl = 'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png';
  
  const file = fs.createWriteStream(avatarPath);
  https.get(avatarUrl, response => {
    response.pipe(file);
    
    file.on('finish', () => {
      file.close();
      console.log(`Default avatar downloaded to ${avatarPath}`);
    });
  }).on('error', err => {
    fs.unlink(avatarPath, () => {}); // Delete the file async
    console.error('Error downloading default avatar:', err.message);
  });
}

console.log('Image directories setup complete!');
