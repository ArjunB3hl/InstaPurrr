'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../provider/AuthContext';
import { Container } from '@mui/material';
import Navbar from '../../components/Navbar';
import CreatePostForm from '../../components/CreatePostForm';

export default function CreatePostPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <CreatePostForm />
      </Container>
    </>
  );
}
