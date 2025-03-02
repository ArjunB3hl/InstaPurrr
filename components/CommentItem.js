import { 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Avatar, 
  Typography, 
  Box 
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';

// Safe component for displaying comments with fallback values
export default function CommentItem({ comment = {}, index }) {
  // Extract properties with fallbacks
  const {
    username = 'Unknown User',
    content = '',
    profilePicture,
    profile_picture
  } = comment;

  // Handle multiple date formats or provide fallback
  const createdAt = comment?.createdAt || comment?.created_at;
  const timeAgo = createdAt 
    ? formatDistanceToNow(new Date(createdAt), { addSuffix: true }) 
    : 'recently';
  
  // Use either profilePicture or profile_picture with fallback
  const avatarSrc = profilePicture || profile_picture || '/static/images/avatar/default.jpg';

  return (
    <ListItem alignItems="flex-start" sx={{ px: 0, py: 0.5 }}>
      <ListItemAvatar sx={{ minWidth: 40 }}>
        <Avatar 
          src={avatarSrc} 
          alt={username}
          sx={{ width: 30, height: 30 }}
        />
      </ListItemAvatar>
      <ListItemText 
        primary={
          <Typography variant="body2">
            <Box component="span" sx={{ fontWeight: 500 }}>
              {username}
            </Box>
            {' '}{content}
          </Typography>
        }
        secondary={
          <Typography variant="caption" color="text.secondary">
            {timeAgo}
          </Typography>
        }
      />
    </ListItem>
  );
}
