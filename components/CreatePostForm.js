'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../provider/AuthContext';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Card,
  CardMedia,
  IconButton,
  Alert,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ClearIcon from '@mui/icons-material/Clear';

export default function CreatePostForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, or WEBP)');
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      return;
    }

    setError('');
    setSelectedFile(file);
    
    // Create preview URL
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(file);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!selectedFile) {
      setError('Please select an image to upload');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('caption', caption);
      formData.append('userId', user.id);
      
      // Upload the post
      const response = await fetch('/api/posts/create', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create post');
      }
      
      setSuccess(true);
      
      // Reset form
      setCaption('');
      handleClearFile();
      
      // Redirect to feed after a short delay
      setTimeout(() => {
        router.push('/feed');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error.message || 'An error occurred while creating your post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom className="app-logo" sx={{ textAlign: 'center', mb: 3 }}>
        Create New Post
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Post created successfully! Redirecting to feed...
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Box 
          sx={{ 
            border: '2px dashed #ccc', 
            borderRadius: 2, 
            p: 3, 
            mb: 3, 
            textAlign: 'center',
            backgroundColor: '#f9f9f9',
            position: 'relative',
          }}
        >
          {previewUrl ? (
            <Card sx={{ position: 'relative' }}>
              <CardMedia
                component="img"
                image={previewUrl}
                alt="Preview"
                sx={{ maxHeight: 300, objectFit: 'contain' }}
              />
              <IconButton
                onClick={handleClearFile}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  },
                }}
              >
                <ClearIcon />
              </IconButton>
            </Card>
          ) : (
            <>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="upload-image"
                ref={fileInputRef}
              />
              <label htmlFor="upload-image">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                >
                  Select Image
                </Button>
              </label>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Drag and drop your image here or click to browse
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Supported formats: JPEG, PNG, GIF, WEBP (Max size: 5MB)
              </Typography>
            </>
          )}
        </Box>
        
        <TextField
          fullWidth
          label="Caption"
          multiline
          rows={3}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption for your post..."
          sx={{ mb: 3 }}
        />
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          disabled={loading || !selectedFile || success}
          sx={{ py: 1.5 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Share Post'}
        </Button>
      </Box>
    </Paper>
  );
}
