import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Divider,
  Chip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Devices as DevicesIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Shield as ShieldIcon,
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) navigate('/dashboard');
  };

  const features = [
    { icon: <DevicesIcon sx={{ fontSize: 18 }} />, text: 'Manage unlimited devices' },
    { icon: <ShieldIcon sx={{ fontSize: 18 }} />, text: 'Enterprise-grade security' },
    { icon: <SpeedIcon sx={{ fontSize: 18 }} />, text: 'Real-time OTA updates' },
    { icon: <AnalyticsIcon sx={{ fontSize: 18 }} />, text: 'Advanced analytics & reporting' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#FFFFFF' }}>
      {/* Left Panel — Orange Brand */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: '48%',
          flexShrink: 0,
          background: 'linear-gradient(160deg, #FF6B35 0%, #E55A2B 50%, #CC4E22 100%)',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -100, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', top: '35%', right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        {/* Logo */}
        <MotionBox
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, position: 'relative', zIndex: 1 }}
        >
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2.5,
              bgcolor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          >
            <DevicesIcon sx={{ color: '#FFFFFF', fontSize: 26 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: '1.4rem', lineHeight: 1.2 }}>
              MDMPortal
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 500 }}>
              Enterprise Device Management
            </Typography>
          </Box>
        </MotionBox>

        {/* Center content */}
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          sx={{ position: 'relative', zIndex: 1 }}
        >
          <Typography
            sx={{
              fontWeight: 800,
              color: '#FFFFFF',
              fontSize: '2.6rem',
              lineHeight: 1.2,
              mb: 2,
              letterSpacing: '-0.02em',
            }}
          >
            Control your{' '}
            <Box component="span" sx={{ color: 'rgba(255,255,255,0.75)' }}>
              entire fleet
            </Box>{' '}
            from one place
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: '1.05rem',
              lineHeight: 1.8,
              mb: 5,
            }}
          >
            Push updates, monitor device health, manage compliance — all with role-based access control and real-time insights.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {features.map((f, i) => (
              <MotionBox
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    flexShrink: 0,
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  {f.icon}
                </Box>
                <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500, fontSize: '0.95rem' }}>
                  {f.text}
                </Typography>
              </MotionBox>
            ))}
          </Box>
        </MotionBox>

        {/* Bottom badges */}
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}
        >
          {['SOC 2 Compliant', '256-bit SSL', '99.9% Uptime', 'GDPR Ready'].map((badge) => (
            <Chip
              key={badge}
              icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: 'rgba(255,255,255,0.9) !important' }} />}
              label={badge}
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 600,
                fontSize: '0.7rem',
                border: '1px solid rgba(255,255,255,0.25)',
                backdropFilter: 'blur(4px)',
              }}
            />
          ))}
        </MotionBox>
      </Box>

      {/* Right Panel — White Login Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#FFFFFF',
          p: { xs: 3, sm: 5, md: 6 },
        }}
      >
        <MotionBox
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          sx={{ width: '100%', maxWidth: 420 }}
        >
          {/* Mobile logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 4 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2, background: 'linear-gradient(135deg, #FF6B35, #E55A2B)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DevicesIcon sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: '1.2rem' }}>
              MDM<span style={{ color: '#FF6B35' }}>Portal</span>
            </Typography>
          </Box>

          <Box sx={{ mb: 5 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#1A1A2E', mb: 1, letterSpacing: '-0.02em', fontSize: '2rem' }}>
              Welcome back
            </Typography>
            <Typography sx={{ color: '#9CA3AF', fontSize: '1rem' }}>
              Sign in to your admin dashboard
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#374151', fontWeight: 600, mb: 0.8, display: 'block' }}>
                Email Address
              </Typography>
              <TextField
                fullWidth
                type="email"
                placeholder="admin@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#9CA3AF', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    bgcolor: '#F8F9FA',
                    '& fieldset': { borderColor: '#E5E7EB' },
                    '&:hover fieldset': { borderColor: '#FF6B35' },
                    '&.Mui-focused fieldset': { borderColor: '#FF6B35', borderWidth: 2 },
                    '&.Mui-focused': { bgcolor: '#FFFFFF' },
                  },
                }}
              />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                <Typography variant="caption" sx={{ color: '#374151', fontWeight: 600 }}>
                  Password
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: '#FF6B35', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                >
                  Forgot password?
                </Typography>
              </Box>
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#9CA3AF', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                        {showPassword ? <VisibilityOff sx={{ color: '#9CA3AF', fontSize: 18 }} /> : <Visibility sx={{ color: '#9CA3AF', fontSize: 18 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    bgcolor: '#F8F9FA',
                    '& fieldset': { borderColor: '#E5E7EB' },
                    '&:hover fieldset': { borderColor: '#FF6B35' },
                    '&.Mui-focused fieldset': { borderColor: '#FF6B35', borderWidth: 2 },
                    '&.Mui-focused': { bgcolor: '#FFFFFF' },
                  },
                }}
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              endIcon={!loading && <ArrowForwardIcon />}
              sx={{
                mt: 1,
                py: 1.8,
                borderRadius: 2.5,
                fontSize: '1rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
                boxShadow: '0 6px 22px rgba(255, 107, 53, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #E55A2B 0%, #CC4E22 100%)',
                  boxShadow: '0 8px 28px rgba(255, 107, 53, 0.5)',
                  transform: 'translateY(-1px)',
                },
                '&:disabled': {
                  background: '#E5E7EB',
                  boxShadow: 'none',
                  color: '#9CA3AF',
                },
              }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Sign In'}
            </Button>
          </Box>

          <Divider sx={{ my: 4, color: '#9CA3AF', fontSize: '0.8rem' }}>
            <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 500, px: 1 }}>
              Secure access only
            </Typography>
          </Divider>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {['256-bit SSL', 'SOC 2', 'GDPR'].map((b) => (
              <Box key={b} sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                <CheckCircleIcon sx={{ color: '#10B981', fontSize: 14 }} />
                <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600, fontSize: '0.73rem' }}>{b}</Typography>
              </Box>
            ))}
          </Box>

          <Typography
            variant="caption"
            sx={{ color: '#9CA3AF', display: 'block', mt: 4, textAlign: 'center', fontSize: '0.78rem', lineHeight: 1.6 }}
          >
            Protected by enterprise security. By signing in, you agree to our Terms of Service and Privacy Policy.
          </Typography>
        </MotionBox>
      </Box>
    </Box>
  );
}

export default Login;