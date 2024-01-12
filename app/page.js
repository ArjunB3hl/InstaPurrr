import React from 'react';
import Link from '@mui/material/Link';

export default function Page() {
    return (
        <div
            style={{
                height: '100vh',
                backgroundImage: 'url(https://t3.ftcdn.net/jpg/06/28/98/76/360_F_628987609_DRHB0fUHZf7hXmzOdqGIjtkakC1jim1m.jpg)',
                backgroundSize: 'cover',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Link
                href="/Register"
                underline="hover"
                sx={{
                    fontSize: '2rem', // Adjust the text size
                    color: 'black', // Set the text color to black
                    fontWeight: 'bold', // Optional: make it bold
                }}
            >
                Register
            </Link>
        </div>
    );
}
