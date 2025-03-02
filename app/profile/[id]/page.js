'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Container, 
  Paper, 
  Box, 
  Typography, 
  Avatar, 
  Button, 
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Grid,
  Divider
} from '@mui/material';
import Navbar from '../../../components/Navbar';
import PostCard from '../../../components/PostCard';
import { useAuth } from '../../../provider/AuthContext';
import { fetchUserProfile, updateUserProfile } from '../../../utils/profile';
import { addComment } from '../../../utils/comments';

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [bio, setBio] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [tabValue, setTabValue] = useState(0);
  const [userPosts, setUserPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState('');

  const isOwnProfile = currentUser && currentUser.id === parseInt(id);

  // Fetch user data
  useEffect(() => {
    async function fetchUserData() {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching data for user ID: ${id}`);
        const userData = await fetchUserProfile(id);
        setUser(userData);
        setBio(userData.bio || '');
        console.log(`Successfully loaded user data for ${userData.username}`);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchUserData();
    }
  }, [id]);

  // Fetch posts based on selected tab
  useEffect(() => {
    async function fetchPosts() {
      if (!user) return;
      
      setLoadingPosts(true);
      setPostsError('');
      
      try {
        const viewerId = currentUser?.id;
        
        if (tabValue === 0) {
          // Fetch user's posts
          const response = await fetch(`/api/posts/user/${id}?viewerId=${viewerId || ''}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch user posts');
          }
          
          const data = await response.json();
          setUserPosts(data.posts);
        } else {
          // Fetch user's liked posts
          const response = await fetch(`/api/posts/liked/${id}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch liked posts');
          }
          
          const data = await response.json();
          setLikedPosts(data.posts);
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
        setPostsError(err.message || 'Failed to load posts');
      } finally {
        setLoadingPosts(false);
      }
    }
    
    fetchPosts();
  }, [id, tabValue, user, currentUser?.id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditProfile = () => {
    setEditMode(true);
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const result = await updateUserProfile(id, { bio });
      setUser(prev => ({ ...prev, bio }));
      setEditMode(false);
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to update profile',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setBio(user?.bio || '');
    setEditMode(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Handle like functionality
  const handleLike = async (postId, isLiked) => {
    if (!currentUser) return;
    
    try {
      const endpoint = isLiked ? '/api/likes/add' : '/api/likes/remove';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId, userId: currentUser.id }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update like status');
      }
      
      const result = await response.json();
      
      // Update post in the current view
      const updatePostsInState = (posts) => 
        posts.map(post => post.id === postId 
          ? { ...post, isLikedByUser: isLiked, likes_count: result.likesCount } 
          : post
        );
      
      if (tabValue === 0) {
        setUserPosts(updatePostsInState(userPosts));
      } else {
        setLikedPosts(updatePostsInState(likedPosts));
      }
      
      return result;
    } catch (error) {
      console.error('Error toggling like:', error);
      return null;
    }
  };

  // Handle comment functionality
  const handleComment = async (postId, content) => {
    if (!currentUser || !content.trim()) return;
    
    try {
      const newComment = await addComment(postId, content, currentUser);
      
      // Function to update comments in a post
      const updateCommentsInState = (posts) => 
        posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [newComment, ...(post.comments || [])]
            };
          }
          return post;
        });
      
      // Update the appropriate posts array
      if (tabValue === 0) {
        setUserPosts(updateCommentsInState(userPosts));
      } else {
        setLikedPosts(updateCommentsInState(likedPosts));
      }
      
      return newComment;
    } catch (error) {
      console.error('Error posting comment:', error);
      return null;
    }
  };

  // Loading state
  if (loading && !user) {
    return (
      <>
        <Navbar />
        <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading profile...
          </Typography>
        </Container>
      </>
    );
  }

  // Error state
  if (error && !user) {
    return (
      <>
        <Navbar />
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
          <Button variant="contained" color="primary" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Container>
      </>
    );
  }

  // Fallback for no data
  const username = user?.username || 'User';
  const profilePicture = user?.profile_picture || '/images/default-avatar.png';
  const userBio = user?.bio || 'No bio yet';
  const posts = tabValue === 0 ? userPosts : likedPosts;

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', mb: 4 }}>
            <Avatar 
              src={profilePicture} 
              alt={username}
              sx={{ width: 150, height: 150, mb: { xs: 2, md: 0 }, mr: { md: 4 } }}
            />
            
            <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {username}
              </Typography>
              
              {!editMode ? (
                <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                  {userBio}
                </Typography>
              ) : (
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  maxRows={6}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  sx={{ mb: 2 }}
                />
              )}
              
              {isOwnProfile && (
                <Box sx={{ mt: 2 }}>
                  {!editMode ? (
                    <Button variant="contained" onClick={handleEditProfile}>
                      Edit Profile
                    </Button>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button 
                        variant="contained" 
                        onClick={handleSaveProfile}
                        disabled={loading}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Save'}
                      </Button>
                      <Button 
                        variant="outlined" 
                        onClick={handleCancelEdit}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ width: '100%', mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              centered
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="Posts" />
              <Tab label="Liked" />
            </Tabs>
          </Box>
          
          {postsError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {postsError}
            </Alert>
          )}
          
          {loadingPosts ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : posts.length > 0 ? (
            <Grid container spacing={0} direction="column">
              {posts.map(post => (
                <Grid item key={post.id} xs={12}>
                  <PostCard 
                    post={post} 
                    onLike={handleLike}
                    onComment={handleComment}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                No {tabValue === 0 ? 'posts' : 'liked posts'} yet
              </Typography>
              {tabValue === 0 && isOwnProfile && (
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => router.push('/create')}
                  sx={{ mt: 2 }}
                >
                  Create Your First Post
                </Button>
              )}
            </Box>
          )}
        </Paper>
      </Container>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
