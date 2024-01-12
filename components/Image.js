

import React, { useState, useEffect } from 'react';
import { Card, CardMedia, CardContent, Typography, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite'

export default function Image({ item }) {
    const [hover, setHover] = useState(false);
    const [liked, setLiked] = useState(false);


    useEffect(() => {
        const checkLikes = async () => {
            const savedFormData = JSON.parse(localStorage.getItem('formData'));
            const userId = savedFormData ? savedFormData.id : null;

            try {
                const response = await fetch('/api/getLikes');
                const likes = await response.json();

                const hasLiked = likes.some(like => like.user_id === userId && like.image_id === item.id);
                setLiked(hasLiked);
            } catch (error) {
                console.error('Error fetching likes:', error);
            }
        };

        checkLikes();
    }, [item.id]);

    const toggleLike = async () => {
        const savedFormData = JSON.parse(localStorage.getItem('formData'));
        const userId = savedFormData ? savedFormData.id : null;
        const likeData = { userId: userId, imageId: item.id };

        try {
            const method = liked ? 'DELETE' : 'POST';
            const response = await fetch(`/api/${liked ? 'deleteLikes' : 'postLikes'}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(likeData),
            });

            if (response.ok) {
                setLiked(!liked);
            } else {
                throw new Error('Failed to update like status');
            }
        } catch (error) {
            console.error('Error updating like status:', error);
        }
    };

    return (
        <Card
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            sx={{ position: 'relative', height: '100%' }}
        >
            <CardMedia
                component="img"
                image={`${item.image}?w=248&fit=crop&auto=format`}
                alt={`Image ${item.id}`}
            />
            {hover && (



                <CardContent
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px',
                    }}
                >

                    <Typography
                        variant="h6"
                        fontWeight="bold"
                        fontFamily="Arial, sans-serif"

                    >
                        Created By {item.user_username}
                    </Typography>

                    <IconButton onClick={toggleLike} sx={{ color: 'white' }}>
                        <FavoriteIcon sx={{ color: liked ? 'red' : 'white' }} />
                    </IconButton>
                </CardContent>

            )}
        </Card>
    );
}