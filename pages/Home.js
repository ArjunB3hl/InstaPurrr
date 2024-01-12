
import React, { useEffect, useState } from 'react';
import Post from '../components/Post';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';

import Image from '../components/Image';

export default function HomePage() {
    const [images, setImages] = useState([]);


    const fetchImages = () => {
        fetch('/api/getImages')
            .then(response => response.json())
            .then(data => setImages(data))
            .catch(error => console.error('Error fetching images:', error));


    };


    const addImage = (newImage) => {
        const savedFormData = JSON.parse(localStorage.getItem('formData'));
        const username = savedFormData ? savedFormData.username : 'Unknown';
        const newImageWithUser = { ...newImage, user_username: username };
        setImages(currentImages => [...currentImages, newImageWithUser]);
    };


    useEffect(() => {
        fetchImages();

    }, []);



    return (
        <>
            <Post onAddImage={addImage} />
            <div>
                <ImageList variant="masonry" cols={3} gap={8}>
                    {images.map((item) => (
                        <ImageListItem key={item.id} sx={{ height: 'auto' }}>
                            <Image item={item} key={item.id} />
                        </ImageListItem>

                    ))}
                </ImageList>
            </div>
        </>
    );
}