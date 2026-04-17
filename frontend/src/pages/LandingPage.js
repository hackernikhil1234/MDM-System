import React from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Container,
  Chip,
  AppBar,
  Toolbar,
  Avatar,
  IconButton,
  alpha,
  Divider,
} from '@mui/material';
import {
  Devices as DevicesIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  Update as UpdateIcon,
  Analytics as AnalyticsIcon,
  ArrowForward as ArrowForwardIcon,
  Language as LanguageIcon,
  Bolt as BoltIcon,
  Public as PublicIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';

const MotionBox = motion(Box);

function LandingPage() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const features = [
    {
      icon: <DevicesIcon />,
      title: 'Universal Fleet Control',
      description: 'Manage a globally distributed fleet of Android and iOS devices from a single, high-performance interface.',
      color: '#FF6B35',
      delay: 0.1,
    },
    {
      icon: <UpdateIcon />,
      title: 'Intelligent OTA Pipelines',
      description: 'Zero-touch update deployments with automated scheduling, batching, and failure recovery.',
      color: '#3B82F6',
      delay: 0.2,
    },
    {
      icon: <SecurityIcon />,
      title: 'Hardened Security',
      description: 'Enterprise-grade 2FA, remote lock/wipe, and real-time threat detection across all endpoints.',
      color: '#10B981',
      delay: 0.3,
    },
    {
      icon: <AnalyticsIcon />,
      title: 'Predictive Analytics',
      description: 'Advanced telemetry and dashboarding to predict hardware failure and monitor compliance.',
      color: '#8B5CF6',
      delay: 0.4,
    },
    {
      icon: <PublicIcon />,
      title: 'Global Fleet Mapping',
      description: 'Real-time geographic visualization of your entire inventory with sub-second position updates.',
      color: '#F59E0B',
      delay: 0.5,
    },
    {
      icon: <TimelineIcon />,
      title: 'Compliance & Auditing',
      description: 'Military-standard audit trails and automated compliance reporting for industry regulations.',
      color: '#EC4899',
      delay: 0.6,
    },
  ];

  const stats = [
    { label: 'Devices Managed', value: '1.2M+' },
    { label: 'Update Success', value: '99.98%' },
    { label: 'Reaction Time', value: '< 250ms' },
    { label: 'Countries', value: '140+' },
  ];

  const trustedBy = [
    'TechGlobal', 'NexusCorp', 'SecureFleet', 'AeroLogistics', 'DataShield'
  ];

  return (
    <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Premium Navigation */}
      <AppBar 
        position="fixed" 
        elevation={0} 
        sx={{ 
          bgcolor: 'rgba(255, 255, 255, 0.8)', 
          backdropFilter: 'blur(20px)', 
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          zIndex: 1200 
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ height: 80, display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => navigate('/')}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 1.25,
                  background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 16px -4px rgba(255, 107, 53, 0.4)',
                }}
              >
                <DevicesIcon sx={{ color: '#fff', fontSize: 24 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: '#1A1A2E' }}>
                MDM<span style={{ color: '#FF6B35' }}>Portal</span>
              </Typography>
            </Box>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4 }}>
              {['Solutions', 'Features', 'Compliance', 'Pricing'].map((item) => (
                <Typography 
                  key={item} 
                  sx={{ 
                    fontWeight: 600, 
                    color: '#64748b', 
                    cursor: 'pointer',
                    '&:hover': { color: '#FF6B35' },
                    transition: 'color 0.2s'
                  }}
                >
                  {item}
                </Typography>
              ))}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button 
                onClick={() => navigate('/login')}
                sx={{ color: '#1A1A2E', fontWeight: 700, textTransform: 'none', px: 3 }}
              >
                Log In
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{
                  bgcolor: '#1A1A2E',
                  color: '#fff',
                  px: 4,
                  py: 1.25,
                  borderRadius: 2,
                  fontWeight: 700,
                  textTransform: 'none',
                  boxShadow: '0 10px 20px -5px rgba(26, 26, 46, 0.3)',
                  '&:hover': { bgcolor: '#000', transform: 'translateY(-2px)' },
                  transition: 'all 0.2s',
                }}
              >
                Start Free Trial
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <Box sx={{ position: 'relative', pt: { xs: 15, md: 20 }, pb: { xs: 10, md: 15 }, overflow: 'hidden' }}>
        {/* Animated Background Mesh */}
        <Box
          sx={{
            position: 'absolute',
            top: -200,
            right: -200,
            width: 800,
            height: 800,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,107,53,0.08) 0%, rgba(255,255,255,0) 70%)',
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -300,
            left: -200,
            width: 1000,
            height: 1000,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, rgba(255,255,255,0) 70%)',
            zIndex: 0,
          }}
        />

        <Container maxWidth="xl">
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} lg={6}>
              <MotionBox
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ opacity, scale }}
              >
                <Chip
                  icon={<BoltIcon sx={{ color: '#FF6B35 !important', fontSize: 18 }} />}
                  label="Mission-Critical MDM v2.0 is Here"
                  sx={{ 
                    bgcolor: 'rgba(255,107,53,0.1)', 
                    color: '#FF6B35', 
                    fontWeight: 700, 
                    mb: 3, 
                    py: 2.5,
                    px: 1,
                    borderRadius: 2,
                    border: '1px solid rgba(255,107,53,0.2)'
                  }}
                />
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '3rem', md: '4.5rem' },
                    fontWeight: 900,
                    lineHeight: 1.05,
                    letterSpacing: '-0.03em',
                    color: '#1A1A2E',
                    mb: 4,
                  }}
                >
                  Orchestrate Your <br />
                  <span style={{ 
                    background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C61 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>Global Fleet</span> With Precision.
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    color: '#64748b',
                    lineHeight: 1.6,
                    maxWidth: 580,
                    mb: 6,
                    fontWeight: 500,
                    fontSize: { xs: '1.1rem', md: '1.25rem' }
                  }}
                >
                  The industry-standard platform for enterprise device management. 
                  Deploy updates, monitor health, and secure thousands of endpoints with sub-second latency.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/register')}
                    sx={{
                      bgcolor: '#FF6B35',
                      color: '#fff',
                      px: 5,
                      py: 2,
                      borderRadius: 2,
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      textTransform: 'none',
                      boxShadow: '0 20px 40px -10px rgba(255, 107, 53, 0.4)',
                      '&:hover': { bgcolor: '#E55A2B', transform: 'translateY(-3px)' },
                      transition: 'all 0.3s',
                    }}
                  >
                    Get Started Now
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<PublicIcon />}
                    sx={{
                      borderColor: '#E2E8F0',
                      color: '#1A1A2E',
                      px: 5,
                      borderRadius: 2,
                      fontWeight: 700,
                      textTransform: 'none',
                      '&:hover': { borderColor: '#1A1A2E', bgcolor: 'transparent' },
                    }}
                  >
                    View Global Map Demo
                  </Button>
                </Box>

                <Box sx={{ mt: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Trusted By Industry Leaders
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 3, opacity: 0.6 }}>
                    {trustedBy.map(name => (
                      <Typography key={name} sx={{ fontWeight: 800, color: '#64748b', fontSize: '0.9rem' }}>{name}</Typography>
                    ))}
                  </Box>
                </Box>
              </MotionBox>
            </Grid>

            <Grid item xs={12} lg={6}>
              <MotionBox
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                sx={{ position: 'relative' }}
              >
                {/* Dashboard Image Frame */}
                <Box
                  sx={{
                    position: 'relative',
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: '0 50px 100px -20px rgba(0,0,0,0.15), 0 30px 60px -30px rgba(0,0,0,0.2)',
                    border: '8px solid rgba(255,255,255,0.8)',
                    bgcolor: '#fff',
                  }}
                >
                  <img 
                    src="/assets/dashboard-preview.png" 
                    alt="MDMPortal Dashboard" 
                    style={{ width: '100%', height: 'auto', display: 'block' }} 
                  />
                  
                  {/* Glassmorphic Overlays */}
                  <MotionBox
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    sx={{
                      position: 'absolute',
                      top: '15%',
                      left: '-10%',
                      p: 2,
                      bgcolor: 'rgba(255,255,255,0.85)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 3,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      display: { xs: 'none', md: 'block' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CircularBadge color="#10B981" />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#1A1A2E' }}>
                        Device Status: Operational
                      </Typography>
                    </Box>
                  </MotionBox>
                </Box>

                {/* Decorative Elements */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -40,
                    right: -40,
                    width: 120,
                    height: 120,
                    background: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23FF6B35\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")',
                    zIndex: -1,
                  }}
                />
              </MotionBox>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ bgcolor: '#1A1A2E', py: 10 }}>
        <Container maxWidth="xl">
          <Grid container spacing={4} justifyContent="center">
            {stats.map((stat, i) => (
              <Grid item xs={6} md={3} key={stat.label}>
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  sx={{ textAlign: 'center' }}
                >
                  <Typography variant="h2" sx={{ fontWeight: 900, color: '#fff', mb: 1, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                    {stat.label}
                  </Typography>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Grid */}
      <Box sx={{ py: 15, bgcolor: '#F8F9FA' }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: 10 }}>
            <Typography variant="overline" sx={{ color: '#FF6B35', fontWeight: 800, letterSpacing: '0.2em' }}>
              Platform Capabilities
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 900, color: '#1A1A2E', mt: 1, mb: 3 }}>
              Everything Required to <br /> Scale Your Fleet.
            </Typography>
            <Typography variant="h6" sx={{ color: '#64748b', maxWidth: 700, mx: 'auto', fontWeight: 500 }}>
              Purpose-built for administrators who demand reliability, speed, and absolute control over their mission-critical ecosystems.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={feature.title}>
                <MotionBox
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -10 }}
                  viewport={{ once: true }}
                  transition={{ delay: feature.delay }}
                  sx={{
                    p: 5,
                    height: '100%',
                    bgcolor: '#fff',
                    borderRadius: 4,
                    boxShadow: '0 4px 25px rgba(0,0,0,0.03)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
                      borderColor: '#FF6B35',
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 2.5,
                      bgcolor: alpha(feature.color, 0.1),
                      color: feature.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 4,
                    }}
                  >
                    {React.cloneElement(feature.icon, { sx: { fontSize: 32 } })}
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, color: '#1A1A2E' }}>
                    {feature.title}
                  </Typography>
                  <Typography sx={{ color: '#64748b', mb: 4, lineHeight: 1.7, fontWeight: 500 }}>
                    {feature.description}
                  </Typography>
                  <Button
                    endIcon={<ChevronRightIcon />}
                    sx={{ 
                      color: feature.color, 
                      fontWeight: 700, 
                      p: 0, 
                      textTransform: 'none',
                      '&:hover': { bgcolor: 'transparent', transform: 'translateX(5px)' },
                      transition: 'transform 0.2s'
                    }}
                  >
                    Learn more
                  </Button>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Global Reach / Map Impact Section */}
      <Box sx={{ py: 20, bgcolor: '#ffffff', position: 'relative' }}>
        <Container maxWidth="xl">
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="overline" sx={{ color: '#10B981', fontWeight: 800, letterSpacing: '0.2em' }}>
                Real-Time Tracking
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 900, color: '#1A1A2E', mt: 1, mb: 4 }}>
                Visualize Your Global <br /> Deployment.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[
                  { icon: <PublicIcon />, title: 'Geo-Fencing Actions', desc: 'Trigger automated security protocols when devices enter or leave specific regions.' },
                  { icon: <LanguageIcon />, title: 'Latency Optimization', desc: 'Auto-routing updates through regional CDN nodes for maximum throughput.' },
                  { icon: <BoltIcon />, title: 'Sub-Second Sync', desc: 'Track thousands of devices simultaneously with minimal battery impact.' },
                ].map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 3 }}>
                    <Avatar sx={{ bgcolor: alpha('#10B981', 0.1), color: '#10B981' }}>{item.icon}</Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: '#1A1A2E' }}>{item.title}</Typography>
                      <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>{item.desc}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  borderRadius: 4, 
                  overflow: 'hidden', 
                  boxShadow: '0 40px 80px -20px rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.1)',
                  position: 'relative',
                  aspectRatio: '16/10',
                  background: '#F0F2F5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {/* Simulated Map Illustration */}
                <Box sx={{ position: 'relative', width: '100%', height: '100%', opacity: 0.8 }}>
                  <PublicIcon sx={{ position: 'absolute', top: '20%', left: '30%', color: '#10B981', fontSize: 60, opacity: 0.5 }} />
                  <PublicIcon sx={{ position: 'absolute', bottom: '15%', right: '25%', color: '#FF6B35', fontSize: 40, opacity: 0.5 }} />
                  <PublicIcon sx={{ position: 'absolute', top: '40%', right: '10%', color: '#3B82F6', fontSize: 50, opacity: 0.5 }} />
                </Box>
                <Typography variant="h6" sx={{ position: 'absolute', color: '#1A1A2E', fontWeight: 800 }}>
                  Live Global Fleet Preview
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 15 }}>
        <Container maxWidth="md">
          <MotionBox
            whileInView={{ scale: [0.95, 1], opacity: [0, 1] }}
            viewport={{ once: true }}
            sx={{
              p: { xs: 5, md: 10 },
              borderRadius: 6,
              background: 'linear-gradient(135deg, #1A1A2E 0%, #000000 100%)',
              textAlign: 'center',
              boxShadow: '0 50px 100px -20px rgba(26, 26, 46, 0.5)',
              color: '#fff',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at top right, rgba(255,107,53,0.15), transparent 50%)',
                zIndex: 0
              }}
            />
            <Typography variant="h2" sx={{ fontWeight: 900, mb: 3 }}>
              Ready to Orchestrate?
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.6)', mb: 6, maxWidth: 500, mx: 'auto' }}>
              Join forward-thinking companies securing their mobile future with MDMPortal. Start your 30-day free trial today.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  bgcolor: '#FF6B35',
                  color: '#fff',
                  px: 6,
                  py: 2,
                  borderRadius: 2,
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#E55A2B', transform: 'scale(1.05)' },
                  transition: 'all 0.3s'
                }}
              >
                Create Free Account
              </Button>
              <Button
                variant="text"
                size="large"
                sx={{
                  color: '#fff',
                  px: 4,
                  fontWeight: 700,
                  textTransform: 'none',
                  '&:hover': { color: '#FF6B35' }
                }}
              >
                Schedule Demo
              </Button>
            </Box>
          </MotionBox>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 10, borderTop: '1px solid #E5E7EB' }}>
        <Container maxWidth="xl">
          <Grid container spacing={8}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    background: 'linear-gradient(135deg, #FF6B35, #E55A2B)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <DevicesIcon sx={{ color: '#fff', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1A1A2E' }}>
                  MDM<span style={{ color: '#FF6B35' }}>Portal</span>
                </Typography>
              </Box>
              <Typography sx={{ color: '#64748b', mb: 4, maxWidth: 300, lineHeight: 1.8 }}>
                The world's most advanced platform for mobile device orchestration and enterprise fleet security.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {[PublicIcon, SecurityIcon, LanguageIcon].map((Icon, i) => (
                  <IconButton key={i} size="small" sx={{ color: '#94a3b8', border: '1px solid #E2E8F0' }}>
                    <Icon fontSize="small" />
                  </IconButton>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Grid container spacing={4}>
                {['Products', 'Resources', 'Company', 'Security'].map(title => (
                  <Grid item xs={6} sm={3} key={title}>
                    <Typography sx={{ fontWeight: 800, color: '#1A1A2E', mb: 2.5, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {title}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {['Platform', 'Fleet API', 'Reports', 'Status'].map(link => (
                        <Typography 
                          key={link} 
                          sx={{ 
                            color: '#64748b', 
                            cursor: 'pointer', 
                            '&:hover': { color: '#FF6B35' },
                            fontSize: '0.95rem'
                          }}
                        >
                          {link}
                        </Typography>
                      ))}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
          <Divider sx={{ my: 8, borderColor: '#E5E7EB' }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              © 2026 MDMPortal Enterprise. All rights reserved. Built for mission-critical reliability.
            </Typography>
            <Box sx={{ display: 'flex', gap: 4 }}>
              <Typography variant="body2" sx={{ color: '#94a3b8', cursor: 'pointer', '&:hover': { color: '#FF6B35' } }}>Privacy Policy</Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', cursor: 'pointer', '&:hover': { color: '#FF6B35' } }}>Terms of Service</Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

const CircularBadge = ({ color }) => (
  <Box sx={{
    width: 10,
    height: 10,
    borderRadius: '50%',
    bgcolor: color,
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: -2,
      left: -2,
      right: -2,
      bottom: -2,
      borderRadius: '50%',
      border: `2px solid ${color}`,
      opacity: 0.4,
      animation: 'pulse 2s infinite'
    },
    '@keyframes pulse': {
      '0%': { transform: 'scale(1)', opacity: 0.4 },
      '100%': { transform: 'scale(2.5)', opacity: 0 }
    }
  }} />
);

export default LandingPage;