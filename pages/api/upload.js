import { createRouter } from 'next-connect';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Make sure upload directory exists
const uploadDir = path.join(process.cwd(), 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

// Set up multer middleware with file filtering
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    // Accept only images
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  }
});

// Create API router
const router = createRouter();

// Handle file upload
router.post(upload.single('image'), async (req, res) => {
  try {
    // Return success with file path
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Format the path for client-side use
    const filePath = `/uploads/${req.file.filename}`;
    
    return res.status(200).json({ 
      message: 'File uploaded successfully',
      filePath
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

// Setup API config
export const config = {
  api: {
    bodyParser: false, // Disable body parsing, multer handles it
  },
};

// Export handler
export default router.handler();
