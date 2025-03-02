'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../provider/AuthContext';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Stack,
  Paper,
} from '@mui/material';
import Navbar from '../components/Navbar';
import { getImageStyle } from '../styles/imageStyles';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect to feed if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/feed');
    }
  }, [isAuthenticated, router]);

  return (
    <>
      <Navbar />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* New Hero Section with Cat Paw Pattern */}
        <Box 
          sx={{
            background: 'linear-gradient(135deg, #FFF5F5 0%, #FFE8E8 100%)',
            py: { xs: 6, md: 10 },
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center" justifyContent="space-between">
              {/* Left side content */}
              <Grid item xs={12} md={6} sx={{ order: { xs: 2, md: 1 } }}>
                <Box sx={{ p: { xs: 2, md: 4 } }}>
                  <Typography
                    variant="h2"
                    component="h1"
                    className="app-logo"
                    sx={{
                      fontFamily: 'Pacifico, cursive',
                      fontWeight: 400,
                      color: '#FF6B6B',
                      mb: 3,
                      fontSize: { xs: '3rem', md: '4.5rem' },
                      textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    InstaPurr
                  </Typography>
                  
                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{ 
                      mb: 3, 
                      color: '#333', 
                      fontWeight: 600,
                      maxWidth: '90%' 
                    }}
                  >
                    Share your cat photos with the world
                  </Typography>
                  
                  <Typography
                    variant="body1"
                    sx={{ 
                      mb: 4, 
                      color: '#666', 
                      fontSize: '1.1rem',
                      maxWidth: '90%' 
                    }}
                  >
                    Join our community of cat lovers and showcase your feline friends.
                    Upload photos, share stories, and connect with other cat enthusiasts.
                  </Typography>
                  
                  <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    spacing={2} 
                    sx={{ mb: { xs: 4, md: 0 } }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={() => router.push('/register')}
                      sx={{ 
                        px: 4, 
                        py: 1.5, 
                        fontSize: '1.1rem',
                        borderRadius: 2,
                        boxShadow: '0 4px 10px rgba(255, 107, 107, 0.3)'
                      }}
                    >
                      Sign Up
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="large"
                      onClick={() => router.push('/login')}
                      sx={{ 
                        px: 4, 
                        py: 1.5,
                        fontSize: '1.1rem',
                        borderRadius: 2
                      }}
                    >
                      Log In
                    </Button>
                  </Stack>
                </Box>
              </Grid>
              
              {/* Right side images - Cat gallery showcase */}
              <Grid item xs={12} md={6} sx={{ order: { xs: 1, md: 2 } }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gridTemplateRows: 'repeat(2, 1fr)',
                    gap: 2,
                    maxHeight: '500px',
                  }}
                >
                  {/* Main image */}
                  <Paper
                    elevation={5}
                    sx={{
                      gridColumn: '1 / 3',
                      gridRow: '1 / 3',
                      borderRadius: 3,
                      overflow: 'hidden',
                      transform: { xs: 'none', md: 'rotate(-2deg)' },
                      position: 'relative',
                      zIndex: 2,
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3"
                      alt="Main Cat"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </Paper>
                  
                  {/* First overlay image */}
                  <Paper
                    elevation={4}
                    sx={{
                      gridColumn: '2',
                      gridRow: '2',
                      borderRadius: 3,
                      overflow: 'hidden',
                      transform: { xs: 'none', md: 'rotate(5deg) translate(20px, -40px)' },
                      position: 'relative',
                      zIndex: 3,
                      display: { xs: 'none', md: 'block' },
                      width: '140px',
                      height: '140px',
                      justifySelf: 'end',
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?ixlib=rb-4.0.3"
                      alt="Cat 2"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </Paper>
                  
                  {/* Second overlay image */}
                  <Paper
                    elevation={3}
                    sx={{
                      gridColumn: '1',
                      gridRow: '1',
                      borderRadius: 3,
                      overflow: 'hidden',
                      transform: { xs: 'none', md: 'rotate(-7deg) translate(-30px, 30px)' },
                      position: 'relative',
                      zIndex: 1,
                      display: { xs: 'none', md: 'block' },
                      width: '120px',
                      height: '120px',
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1533738363-b7f9aef128ce?ixlib=rb-4.0.3"
                      alt="Cat 3"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </Paper>
                </Box>
              </Grid>
            </Grid>
          </Container>
          
          {/* Paw print decorations */}
          <Box 
            sx={{ 
              position: 'absolute',
              top: '5%',
              right: '5%',
              width: '60px',
              height: '60px',
              opacity: 0.1,
              transform: 'rotate(-15deg)',
              display: { xs: 'none', md: 'block' }
            }}
          >
            <img 
              src="/images/paw-print.png" 
              alt="Paw print" 
              style={{ width: '100%', height: '100%' }} 
            />
          </Box>
          
          <Box 
            sx={{ 
              position: 'absolute',
              bottom: '10%',
              left: '7%',
              width: '40px',
              height: '40px',
              opacity: 0.1,
              transform: 'rotate(25deg)',
              display: { xs: 'none', md: 'block' }
            }}
          >
            <img 
              src="/images/paw-print.png" 
              alt="Paw print" 
              style={{ width: '100%', height: '100%' }} 
            />
          </Box>
        </Box>

        {/* Features Section */}
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography
            variant="h4"
            component="h2"
            align="center"
            sx={{ mb: 6, fontWeight: 600 }}
          >
            Why Cat Lovers Choose InstaPurr
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 5px 15px rgba(0,0,0,0.08)' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image="https://images.unsplash.com/photo-1533738363-b7f9aef128ce?ixlib=rb-4.0.3"
                  alt="Cat community"
                  sx={{ objectPosition: 'center 30%' }}
                />
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Cat-Loving Community
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Connect with fellow cat enthusiasts who share your passion for all things feline.
                    Share experiences and build friendships around your love for cats.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 5px 15px rgba(0,0,0,0.08)' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image="https://images.unsplash.com/photo-1511044568932-338cba0ad803?ixlib=rb-4.0.3"
                  alt="Interactions"
                />
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Engage & Interact
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Like, comment, and share your thoughts on adorable cat content.
                    Create meaningful connections through shared feline appreciation.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 5px 15px rgba(0,0,0,0.08)' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image="https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?ixlib=rb-4.0.3"
                  alt="Showcase"
                />
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Showcase Your Cats
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create a beautiful profile showcasing your furry friends and their unique personalities.
                    Share special moments and stories that make your cats special.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            py: 3,
            px: 2,
            mt: 'auto',
            backgroundColor: '#f5f5f5',
            borderTop: '1px solid #eaeaea',
          }}
        >
          <Container maxWidth="lg">
            <Typography variant="body2" color="text.secondary" align="center">
              © {new Date().getFullYear()} InstaPurr. All rights reserved.
            </Typography>
          </Container>
        </Box>
      </Box>
    </>
  );
}
