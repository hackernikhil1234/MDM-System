import React from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Devices as DevicesIcon, Home as HomeIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Mesh Gradient Background */}
      <Box
        sx={{
          position: 'absolute',
          top: -200,
          right: -200,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,107,53,0.08) 0%, rgba(255,255,255,0) 70%)',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -200,
          left: -200,
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, rgba(255,255,255,0) 70%)',
          zIndex: 0,
        }}
      />
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: 'center' }}>
            {/* Logo */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.5,
                mb: 6,
                cursor: 'pointer',
              }}
              onClick={() => navigate('/')}
            >
              <Box sx={{ width: 40, height: 40, borderRadius: 2, background: 'linear-gradient(135deg, #FF6B35, #E55A2B)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(255,107,53,0.35)' }}>
                <DevicesIcon sx={{ color: '#fff', fontSize: 22 }} />
              </Box>
              <Typography sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: '1.2rem' }}>
                MDM<span style={{ color: '#FF6B35' }}>Portal</span>
              </Typography>
            </Box>

            {/* 404 big text */}
            <Typography
              sx={{
                fontSize: { xs: '5rem', md: '8rem' },
                fontWeight: 900,
                color: 'transparent',
                backgroundImage: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 60%, #F59E0B 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                lineHeight: 1,
                mb: 2,
                letterSpacing: '-0.04em',
              }}
            >
              404
            </Typography>

            <Typography
              variant="h4"
              sx={{ fontWeight: 800, color: '#1A1A2E', mb: 1.5, fontSize: { xs: '1.5rem', md: '2rem' } }}
            >
              Page not found
            </Typography>
            <Typography
              sx={{ color: '#9CA3AF', mb: 5, lineHeight: 1.8, fontSize: '1rem', maxWidth: 380, mx: 'auto' }}
            >
              The page you're looking for doesn't exist or has been moved. Let's get you back on track.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<HomeIcon />}
                onClick={() => navigate('/dashboard')}
                sx={{
                  px: 4,
                  py: 1.6,
                  borderRadius: 2.5,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
                  boxShadow: '0 6px 20px rgba(255,107,53,0.35)',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 28px rgba(255,107,53,0.45)' },
                }}
              >
                Go to Dashboard
              </Button>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{
                  px: 4,
                  py: 1.6,
                  borderRadius: 2.5,
                  fontWeight: 600,
                  borderColor: '#E5E7EB',
                  color: '#374151',
                  '&:hover': { borderColor: '#FF6B35', color: '#FF6B35', bgcolor: 'rgba(255,107,53,0.04)' },
                }}
              >
                Go Back
              </Button>
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
