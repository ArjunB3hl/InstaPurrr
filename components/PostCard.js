'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  Avatar,
  IconButton,
  Typography,
  Box,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Comment as CommentIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { useAuth } from '../provider/AuthContext';
import { formatDistanceToNow } from 'date-fns';

export default function PostCard({ post, onLike, onComment }) {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLikedByUser || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [comments, setComments] = useState(post.comments || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // For debugging - log like status
  useEffect(() => {
    console.log(`Post ${post.id} isLikedByUser:`, post.isLikedByUser);
  }, [post.id, post.isLikedByUser]);

  // Safe access to post properties with fallbacks
  const posterUsername = post.username || 'Unknown User';
  const profileImage = post.profile_picture || '/static/images/avatar/default.jpg';
  const imageUrl = post.image_path || '/static/images/avatar/default.jpg';
  const caption = post.caption || '';
  const postId = post.id;
  const userId = post.user_id;
  const postedTime = post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) : 'some time ago';

  const handleLikeClick = async () => {
    if (!user) return;
    
    const newLikeStatus = !isLiked;
    const newLikesCount = isLiked ? likesCount - 1 : likesCount + 1;
    
    // Optimistic update
    setIsLiked(newLikeStatus);
    setLikesCount(newLikesCount);
    
    try {
      if (onLike) {
        const result = await onLike(post.id, newLikeStatus);
        
        // If the API returns a different like count, update to match
        if (result && typeof result.likesCount === 'number') {
          setLikesCount(result.likesCount);
        }
      }
    } catch (error) {
      // Revert on failure
      console.error('Error toggling like:', error);
      setIsLiked(!newLikeStatus);
      setLikesCount(isLiked ? likesCount : likesCount - 1);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !user || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      let newCommentData;
      
      if (onComment) {
        try {
          // Try to get comment data from the onComment function
          newCommentData = await onComment(postId, comment);
        } catch (error) {
          console.error('Error from onComment function:', error);
          // If onComment fails, we'll create a fallback comment
          newCommentData = null;
        }
      }
      
      // If onComment didn't return valid data, create a fallback comment
      if (!newCommentData) {
        console.log('Creating fallback comment data since onComment returned invalid data');
        newCommentData = {
          id: `temp_${Date.now()}`,
          content: comment,
          createdAt: new Date().toISOString(),
          userId: user.id,
          username: user.username,
          profilePicture: user.profile_picture || '/static/images/avatar/default.jpg'
        };
      }
      
      // Ensure the comment has all required properties
      const safeComment = {
        id: newCommentData.id || `temp_${Date.now()}`,
        content: newCommentData.content || comment,
        createdAt: newCommentData.createdAt || new Date().toISOString(),
        userId: newCommentData.userId || newCommentData.user_id || user.id,
        username: newCommentData.username || user.username,
        // Handle both possible property names for profile picture
        profilePicture: newCommentData.profilePicture || 
                        newCommentData.profile_picture || 
                        user.profile_picture || 
                        '/static/images/avatar/default.jpg'
      };
      
      console.log('Adding new comment to state:', safeComment);
      
      setComments(prevComments => [safeComment, ...prevComments]);
      setComment('');
      if (!showComments) setShowComments(true);
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mb: 3, borderRadius: 2 }}>
      <CardHeader
        avatar={
          <Link href={`/profile/${userId}`} passHref style={{ textDecoration: 'none' }}>
            <Avatar 
              src={profileImage}
              alt={posterUsername} 
              sx={{ cursor: 'pointer' }}
            />
          </Link>
        }
        title={
          <Link href={`/profile/${userId}`} passHref style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography component="span" sx={{ fontWeight: 500, cursor: 'pointer' }}>
              {posterUsername}
            </Typography>
          </Link>
        }
        subheader={postedTime}
      />
      <CardMedia
        component="img"
        height="auto"
        image={imageUrl}
        alt={caption || 'Post image'}
        sx={{ 
          maxHeight: 500, 
          objectFit: 'contain' // Already using 'contain' which is good for preserving aspect ratio
        }}
      />
      <CardActions disableSpacing>
        <IconButton 
          aria-label={isLiked ? 'Unlike' : 'Like'}
          onClick={handleLikeClick}
          color={isLiked ? 'primary' : 'default'}
        >
          {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>
        <IconButton 
          aria-label="Comment" 
          onClick={() => setShowComments(!showComments)}
          color={showComments ? 'primary' : 'default'}
        >
          <CommentIcon />
        </IconButton>
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {likesCount} {likesCount === 1 ? 'like' : 'likes'}
          </Typography>
        </Box>
      </CardActions>
      
      {caption && (
        <CardContent sx={{ pt: 1, pb: 1 }}>
          <Typography variant="body2" color="text.primary">
            <Box component="span" sx={{ fontWeight: 500 }}>
              {posterUsername}
            </Box>
            {' '}{caption}
          </Typography>
        </CardContent>
      )}
      
      {/* Comments section */}
      {showComments && (
        <CardContent sx={{ pt: 1, pb: 1 }}>
          <Divider sx={{ my: 1 }} />
          
          {comments.length > 0 ? (
            <List sx={{ py: 0 }}>
              {comments.map((comment, index) => {
                // Safe access to comment properties
                const commentUsername = comment?.username || 'Unknown User';
                const commentContent = comment?.content || '';
                const commentDate = comment?.createdAt || comment?.created_at || new Date().toISOString();
                // Use either profilePicture or profile_picture property
                const avatarSrc = comment?.profilePicture || comment?.profile_picture || '/static/images/avatar/default.jpg';
                
                return (
                  <ListItem key={comment?.id || index} alignItems="flex-start" sx={{ px: 0, py: 0.5 }}>
                    <ListItemAvatar sx={{ minWidth: 40 }}>
                      <Avatar 
                        src={avatarSrc}
                        alt={commentUsername}
                        sx={{ width: 30, height: 30 }}
                      />
                    </ListItemAvatar>
                    <ListItemText 
                      primary={
                        <Typography variant="body2">
                          <Box component="span" sx={{ fontWeight: 500 }}>
                            {commentUsername}
                          </Box>
                          {' '}{commentContent}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(new Date(commentDate), { addSuffix: true })}
                        </Typography>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
              No comments yet. Be the first to comment!
            </Typography>
          )}
          
          <Box component="form" onSubmit={handleCommentSubmit} sx={{ display: 'flex', mt: 1 }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Add a comment..."
              fullWidth
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isSubmitting}
            />
            <Button 
              type="submit"
              disabled={!comment.trim() || isSubmitting}
              sx={{ ml: 1 }}
            >
              <SendIcon />
            </Button>
          </Box>
        </CardContent>
      )}
    </Card>
  );
}
