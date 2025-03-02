const fs = require('fs');
const path = require('path');
const https = require('https');
const { createCanvas } = require('canvas');

// Create directories if they don't exist
const imagesDir = path.join(process.cwd(), 'public/images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log('Created images directory');
}

// Generate a paw print SVG
function createPawPrint() {
  const fileName = path.join(imagesDir, 'paw-print.png');
  console.log(`Creating paw print file at ${fileName}`);

  // Create canvas for the paw print
  const canvas = createCanvas(100, 100);
  const ctx = canvas.getContext('2d');

  // Draw the main paw pad
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.ellipse(50, 60, 25, 20, 0, 0, 2 * Math.PI);
  ctx.fill();

  // Draw the toe pads
  const toePads = [
    [30, 30, 12, 10, 0.5],   // Left top toe
    [50, 25, 12, 10, 0],     // Middle top toe
    [70, 30, 12, 10, -0.5],  // Right top toe
    [75, 50, 12, 10, -0.7],  // Right middle toe
  ];

  toePads.forEach(pad => {
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(pad[0], pad[1], pad[2], pad[3], pad[4], 0, 2 * Math.PI);
    ctx.fill();
  });

  // Save the image to a file
  try {
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(fileName, buffer);
    console.log('Paw print image created successfully');
  } catch (error) {
    console.error('Error saving paw print image:', error.message);
    
    // If canvas fails, download a fallback image
    console.log('Attempting to download fallback paw print image...');
    downloadPawPrint();
  }
}

// Download a paw print image as fallback
function downloadPawPrint() {
  const pawPrintUrl = 'https://cdn-icons-png.flaticon.com/512/1076/1076928.png';
  const fileName = path.join(imagesDir, 'paw-print.png');
  
  const file = fs.createWriteStream(fileName);
  https.get(pawPrintUrl, response => {
    response.pipe(file);
    
    file.on('finish', () => {
      file.close();
      console.log(`Paw print image downloaded to ${fileName}`);
    });
  }).on('error', err => {
    fs.unlink(fileName, () => {}); // Delete the file if there's an error
    console.error('Error downloading paw print image:', err.message);
  });
}

// Try to create the paw print
try {
  createPawPrint();
} catch (error) {
  console.error('Error creating paw print:', error);
  downloadPawPrint();
}
