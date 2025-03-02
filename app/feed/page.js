'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../provider/AuthContext';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Grid,
  Button,
  Alert,
} from '@mui/material';
import Navbar from '../../components/Navbar';
import PostCard from '../../components/PostCard';
import { addComment } from '../../utils/comments';

export default function FeedPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated() && !loading) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Fetch posts on initial load
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Include userId in the request to get personalized like status
        const response = await fetch(`/api/posts?page=1&limit=10&userId=${user?.id || ''}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        
        const data = await response.json();
        setPosts(data.posts);
        setHasMore(data.hasMore);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated() && user) {
      fetchPosts();
    }
  }, [isAuthenticated, user]);

  // Load more posts
  const loadMorePosts = async () => {
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      
      const response = await fetch(`/api/posts?page=${nextPage}&limit=10&userId=${user?.id || ''}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch more posts');
      }
      
      const data = await response.json();
      
      setPosts(prevPosts => [...prevPosts, ...data.posts]);
      setPage(nextPage);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Error loading more posts:', error);
      setError('Failed to load more posts. Please try again.');
    } finally {
      setLoadingMore(false);
    }
  };

  // Handle like action
  const handleLike = async (postId, isLiked) => {
    if (!user) return;
    
    try {
      // Use the dedicated endpoints based on like action
      const endpoint = isLiked ? '/api/likes/add' : '/api/likes/remove';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId, userId: user.id }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update like status');
      }
      
      const result = await response.json();
      
      // Update the local post state if needed
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              isLikedByUser: result.liked,
              likes_count: result.likesCount
            };
          }
          return post;
        })
      );
      
      return result;
    } catch (error) {
      console.error('Error updating like:', error);
      // Return null to indicate failure
      return null;
    }
  };

  // Handle comment action
  const handleComment = async (postId, content) => {
    if (!user || !content.trim()) return;
    
    try {
      const newComment = await addComment(postId, content, user);
      
      // Update the posts state with the new comment
      setPosts(prevPosts => 
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
      // Optionally show an error message to the user
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
        
        {posts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h5" gutterBottom>
              No posts yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Be the first to share a cat photo!
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
          <>
            <Grid container spacing={0} direction="column">
              {posts.map((post) => (
                <Grid item key={post.id} xs={12}>
                  <PostCard 
                    post={post} 
                    onLike={handleLike}
                    onComment={handleComment}
                  />
                </Grid>
              ))}
            </Grid>
            
            {hasMore && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={loadMorePosts}
                  disabled={loadingMore}
                  sx={{ px: 4 }}
                >
                  {loadingMore ? <CircularProgress size={24} color="inherit" /> : 'Load More'}
                </Button>
              </Box>
            )}
          </>
        )}
      </Container>
    </>
  );
}
