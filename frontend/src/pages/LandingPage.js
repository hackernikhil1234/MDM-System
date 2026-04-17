import React from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  AppBar,
  Toolbar,
  Container,
  Chip,
} from '@mui/material';
import {
  ChevronRight as ChevronRightIcon,
  Devices as DevicesIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  Update as UpdateIcon,
  Analytics as AnalyticsIcon,
  CloudSync as CloudSyncIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <DevicesIcon sx={{ fontSize: 28 }} />,
      title: 'Device Fleet Management',
      description: 'Monitor and manage thousands of devices in real-time with a single unified dashboard.',
      color: '#FF6B35',
    },
    {
      icon: <UpdateIcon sx={{ fontSize: 28 }} />,
      title: 'Smart OTA Updates',
      description: 'Deploy firmware and software updates seamlessly with intelligent rollout scheduling.',
      color: '#3B82F6',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 28 }} />,
      title: 'Enterprise Security',
      description: 'Advanced threat detection, device blocking, and comprehensive audit trails.',
      color: '#10B981',
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 28 }} />,
      title: 'Real-time Analytics',
      description: 'Deep insights into device health, update compliance, and regional distribution.',
      color: '#8B5CF6',
    },
    {
      icon: <CloudSyncIcon sx={{ fontSize: 28 }} />,
      title: 'Cloud Synchronization',
      description: 'Instant sync across all connected devices with sub-second latency via WebSocket.',
      color: '#F59E0B',
    },
    {
      icon: <TimelineIcon sx={{ fontSize: 28 }} />,
      title: 'Audit & Compliance',
      description: 'Complete activity logs with user tracking, timestamps, and change history.',
      color: '#EC4899',
    },
  ];

  const stats = [
    { value: '50K+', label: 'Devices Managed' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '< 2s', label: 'Update Rollout' },
    { value: '256-bit', label: 'Encryption' },
  ];

  const benefits = [
    'Role-based access control (Admin / Viewer)',
    'Automated OTA update scheduling',
    'Device version compliance monitoring',
    'Real-time socket notifications',
    'Multi-region device tracking',
    'Complete audit trail & reporting',
  ];

  return (
    <Box sx={{ bgcolor: '#FFFFFF', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Navigation */}
      <AppBar position="fixed" elevation={0} sx={{ bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #E5E7EB' }}>
        <Toolbar sx={{ px: { xs: 2, md: 6 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #FF6B35, #E55A2B)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(255,107,53,0.3)',
              }}
            >
              <DevicesIcon sx={{ color: '#fff', fontSize: 20 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: '1.1rem' }}>
              MDM<span style={{ color: '#FF6B35' }}>Portal</span>
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip
              label="v2.0"
              size="small"
              sx={{ bgcolor: 'rgba(255,107,53,0.1)', color: '#FF6B35', fontWeight: 700, fontSize: '0.7rem' }}
            />
            <Button
              variant="outlined"
              onClick={() => navigate('/login')}
              sx={{
                borderColor: '#E5E7EB',
                color: '#374151',
                borderRadius: 2.5,
                px: 2.5,
                fontWeight: 600,
                '&:hover': { borderColor: '#FF6B35', color: '#FF6B35', bgcolor: 'rgba(255,107,53,0.04)' },
              }}
            >
              Sign In
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate('/register')}
              sx={{
                background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
                boxShadow: '0 4px 14px rgba(255,107,53,0.35)',
                borderRadius: 2.5,
                px: 2.5,
                fontWeight: 600,
              }}
            >
              Get Started
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          pt: { xs: 14, md: 20 },
          pb: { xs: 8, md: 14 },
          background: 'linear-gradient(160deg, #FFF3EF 0%, #FFFFFF 40%, #F8F9FA 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative blobs */}
        <Box sx={{ position: 'absolute', top: -60, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,53,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -40, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <MotionBox
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Chip
                label="🚀 Enterprise-Grade MDM Solution"
                sx={{
                  bgcolor: 'rgba(255, 107, 53, 0.1)',
                  color: '#FF6B35',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  py: 2.5,
                  px: 1,
                  mb: 3,
                  border: '1px solid rgba(255,107,53,0.25)',
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '2.2rem', md: '3.8rem' },
                  lineHeight: 1.15,
                  color: '#1A1A2E',
                  mb: 2.5,
                  letterSpacing: '-0.03em',
                }}
              >
                Manage Every Device,{' '}
                <Box component="span" sx={{ color: '#FF6B35', display: 'inline' }}>
                  Effortlessly
                </Box>
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '1rem', md: '1.2rem' },
                  color: '#6B7280',
                  maxWidth: 580,
                  mx: 'auto',
                  lineHeight: 1.8,
                  mb: 5,
                }}
              >
                A powerful, real-time Mobile Device Management platform for enterprises. 
                Push updates, monitor compliance, manage fleets — all from one dashboard.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 6 }}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/login')}
                  sx={{
                    background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
                    boxShadow: '0 6px 24px rgba(255,107,53,0.4)',
                    borderRadius: 3,
                    px: 4,
                    py: 1.7,
                    fontSize: '1rem',
                    fontWeight: 700,
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 32px rgba(255,107,53,0.5)' },
                  }}
                >
                  Launch Dashboard
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    borderColor: '#E5E7EB',
                    color: '#374151',
                    borderRadius: 3,
                    px: 4,
                    py: 1.7,
                    fontSize: '1rem',
                    fontWeight: 600,
                    '&:hover': { borderColor: '#FF6B35', color: '#FF6B35', bgcolor: 'rgba(255,107,53,0.04)' },
                  }}
                >
                  View Demo
                </Button>
              </Box>
            </MotionBox>

            {/* Stats */}
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Grid container spacing={2} justifyContent="center">
                {stats.map((stat, idx) => (
                  <Grid item key={idx}>
                    <Box
                      sx={{
                        px: { xs: 2.5, md: 4 },
                        py: 2,
                        bgcolor: '#FFFFFF',
                        borderRadius: 3,
                        border: '1px solid #E5E7EB',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                        textAlign: 'center',
                        minWidth: 120,
                      }}
                    >
                      <Typography sx={{ fontWeight: 800, fontSize: '1.7rem', color: '#FF6B35', lineHeight: 1.2 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600, fontSize: '0.75rem' }}>
                        {stat.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </MotionBox>
          </Box>
        </Container>
      </Box>

      {/* Features */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#F8F9FA' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip label="Features" sx={{ bgcolor: 'rgba(255,107,53,0.1)', color: '#FF6B35', fontWeight: 700, mb: 2, border: '1px solid rgba(255,107,53,0.2)' }} />
            <Typography variant="h2" sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: { xs: '1.8rem', md: '2.6rem' }, letterSpacing: '-0.02em', mb: 2 }}>
              Everything you need to manage devices
            </Typography>
            <Typography sx={{ color: '#6B7280', maxWidth: 500, mx: 'auto', fontSize: '1.05rem', lineHeight: 1.7 }}>
              Built for modern enterprises with a focus on reliability, security, and ease of use.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {features.map((feature, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <MotionBox
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      p: 0.5,
                      border: '1px solid #E5E7EB',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 16px 40px ${feature.color}18`,
                        borderColor: feature.color,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Avatar
                        sx={{
                          bgcolor: `${feature.color}15`,
                          color: feature.color,
                          width: 52,
                          height: 52,
                          mb: 2.5,
                          border: `2px solid ${feature.color}25`,
                        }}
                      >
                        {feature.icon}
                      </Avatar>
                      <Typography sx={{ fontWeight: 700, color: '#1A1A2E', fontSize: '1rem', mb: 1.2 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B7280', lineHeight: 1.7 }}>
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Benefits section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#FFFFFF' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={5}>
              <Chip label="Why MDMPortal" sx={{ bgcolor: 'rgba(255,107,53,0.1)', color: '#FF6B35', fontWeight: 700, mb: 2, border: '1px solid rgba(255,107,53,0.2)' }} />
              <Typography variant="h2" sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: { xs: '1.8rem', md: '2.4rem' }, letterSpacing: '-0.02em', mb: 2.5 }}>
                Built for scale. <br />
                <Box component="span" sx={{ color: '#FF6B35' }}>Designed for speed.</Box>
              </Typography>
              <Typography sx={{ color: '#6B7280', lineHeight: 1.8, mb: 4, fontSize: '1.05rem' }}>
                Whether you're managing 100 or 100,000 devices, MDMPortal provides the tools and insights you need to maintain compliance and security at scale.
              </Typography>
              <Button
                variant="contained"
                endIcon={<ChevronRightIcon />}
                onClick={() => navigate('/login')}
                sx={{
                  background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
                  boxShadow: '0 4px 14px rgba(255,107,53,0.35)',
                  borderRadius: 2.5,
                  px: 3.5,
                  py: 1.5,
                  fontWeight: 700,
                }}
              >
                Start Managing Now
              </Button>
            </Grid>
            <Grid item xs={12} md={7}>
              <Box
                sx={{
                  bgcolor: '#F8F9FA',
                  borderRadius: 4,
                  p: 4,
                  border: '1px solid #E5E7EB',
                }}
              >
                <Grid container spacing={2}>
                  {benefits.map((benefit, idx) => (
                    <Grid item xs={12} sm={6} key={idx}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <CheckCircleIcon sx={{ color: '#FF6B35', fontSize: 20, mt: 0.1, flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ color: '#374151', fontWeight: 500, lineHeight: 1.6 }}>
                          {benefit}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Final CTA */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 60%, #CC4E22 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -80, left: -40, width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Typography variant="h2" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: { xs: '1.8rem', md: '2.8rem' }, letterSpacing: '-0.02em', mb: 2 }}>
              Ready to take control of your fleet?
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', mb: 5, lineHeight: 1.7 }}>
              Join enterprises worldwide who rely on MDMPortal for device management.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/login')}
                sx={{
                  bgcolor: '#FFFFFF',
                  color: '#FF6B35',
                  borderRadius: 3,
                  px: 4,
                  py: 1.7,
                  fontSize: '1rem',
                  fontWeight: 700,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  '&:hover': { bgcolor: '#FFF3EF', transform: 'translateY(-2px)' },
                }}
              >
                Launch Dashboard
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#1A1A2E', py: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: 1.5, background: 'linear-gradient(135deg, #FF6B35, #E55A2B)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DevicesIcon sx={{ color: '#fff', fontSize: 18 }} />
              </Box>
              <Typography sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.95rem' }}>
                MDM<span style={{ color: '#FF6B35' }}>Portal</span>
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.8rem' }}>
              © 2026 MDMPortal. Enterprise Device Management Platform.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default LandingPage;