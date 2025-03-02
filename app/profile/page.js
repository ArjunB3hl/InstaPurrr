'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../provider/AuthContext';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Button,
  Grid,
  Tabs,
  Tab,
  CircularProgress,
  Paper,
  Divider,
  TextField,
  IconButton,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import Navbar from '../../components/Navbar';
import PostCard from '../../components/PostCard';

export default function ProfilePage() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    bio: '',
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated() && !loading) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Fetch user data and posts
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError('');
        
        // Fetch user profile data
        const profileResponse = await fetch(`/api/users/${user.id}`);
        
        if (!profileResponse.ok) {
          throw new Error('Failed to fetch user profile');
        }
        
        const profileData = await profileResponse.json();
        setProfileData({
          username: profileData.username,
          bio: profileData.bio || '',
        });
        
        // Fetch user posts
        const postsResponse = await fetch(`/api/posts/user/${user.id}`);
        
        if (!postsResponse.ok) {
          throw new Error('Failed to fetch user posts');
        }
        
        const postsData = await postsResponse.json();
        setUserPosts(postsData.posts);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated() && user) {
      fetchUserData();
    }
  }, [isAuthenticated, user]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditProfile = () => {
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    // Reset form data to original values
    if (user) {
      setProfileData({
        username: user.username,
        bio: user.bio || '',
      });
    }
    setEditMode(false);
    setSaveError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      setSaveError('');
      
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bio: profileData.bio,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle like action
  const handleLike = async (postId, isLiked) => {
    if (!user) return;
    
    try {
      const method = isLiked ? 'POST' : 'DELETE';
      const endpoint = isLiked ? '/api/likes/add' : '/api/likes/remove';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId, userId: user.id }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update like status');
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  // Handle comment action
  const handleComment = async (postId, content) => {
    if (!user || !content.trim()) return;
    
    try {
      const response = await fetch('/api/comments/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          userId: user.id,
          content,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      
      const newComment = await response.json();
      
      // Update the posts state with the new comment
      setUserPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [...(post.comments || []), {
                ...newComment,
                user: {
                  username: user.username,
                  profilePicture: user.profilePicture,
                },
              }],
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress color="primary" />
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}
        
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', mb: 3 }}>
            <Avatar
              src={user?.profilePicture || '/images/default-avatar.png'}
              alt={user?.username || 'User'}
              sx={{ 
                width: { xs: 100, sm: 120 }, 
                height: { xs: 100, sm: 120 },
                mr: { xs: 0, sm: 4 },
                mb: { xs: 2, sm: 0 },
              }}
            />
            
            <Box sx={{ flexGrow: 1 }}>
              {editMode ? (
                <>
                  {saveError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {saveError}
                    </Alert>
                  )}
                  
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={profileData.username}
                    disabled
                    sx={{ mb: 2 }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Bio"
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                    placeholder="Tell us about yourself and your cats..."
                    sx={{ mb: 2 }}
                  />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={handleCancelEdit}
                      sx={{ mr: 1 }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveProfile}
                      disabled={saving}
                    >
                      {saving ? <CircularProgress size={24} color="inherit" /> : 'Save'}
                    </Button>
                  </Box>
                </>
              ) : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
                      {profileData.username}
                    </Typography>
                    <IconButton 
                      color="primary" 
                      onClick={handleEditProfile}
                      sx={{ ml: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {profileData.bio || 'No bio yet.'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 3 }}>
                    <Typography variant="body2">
                      <strong>{userPosts.length}</strong> posts
                    </Typography>
                    <Typography variant="body2">
                      <strong>0</strong> followers
                    </Typography>
                    <Typography variant="body2">
                      <strong>0</strong> following
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
              <Tab label="Posts" />
              <Tab label="Liked" />
            </Tabs>
          </Box>
        </Paper>
        
        {tabValue === 0 && (
          <>
            {userPosts.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" gutterBottom>
                  No posts yet
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Share your first cat photo!
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => router.push('/create')}
                >
                  Create Post
                </Button>
              </Box>
            ) : (
              <Grid container spacing={0} direction="column">
                {userPosts.map((post) => (
                  <Grid item key={post.id} xs={12}>
                    <PostCard 
                      post={post} 
                      onLike={handleLike}
                      onComment={handleComment}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
        
        {tabValue === 1 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" gutterBottom>
              Liked posts will appear here
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Browse the feed and like some cat photos!
            </Typography>
          </Box>
        )}
      </Container>
    </>
  );
}
