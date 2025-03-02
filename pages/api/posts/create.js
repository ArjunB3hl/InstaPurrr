import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import connection from '../../../database/index';

// Configure multer storage
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, uniqueSuffix + ext);
    }
  }),
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Helper function to run middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export const config = {
  api: {
    bodyParser: false, // Disable built-in bodyParser
  },
};

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Process file upload
    await runMiddleware(req, res, upload.single('image'));

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    // Get form data
    const userId = req.body.userId;
    const caption = req.body.caption || '';

    // Validate user ID
    if (!userId || isNaN(parseInt(userId))) {
      // Remove uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Create relative path for database storage
    const imagePath = `/uploads/${path.basename(req.file.path)}`;

    // Insert post into database
    const insertPostQuery = `
      INSERT INTO posts (image_path, caption, user_id, created_at) 
      VALUES (?, ?, ?, NOW())
    `;
    
    const [result] = await connection.promise().query(
      insertPostQuery, 
      [imagePath, caption, userId]
    );

    return res.status(201).json({
      message: 'Post created successfully',
      id: result.insertId,
      imagePath,
    });
  } catch (error) {
    console.error('Error creating post:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    
    return res.status(500).json({ message: 'Internal server error' });
  }
}
