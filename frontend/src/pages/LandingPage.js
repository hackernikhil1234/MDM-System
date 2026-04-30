import React from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Container,
  Chip,
  Toolbar,
  alpha,
  Card,
} from '@mui/material';
import {
  Devices as DevicesIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  Update as UpdateIcon,
  Analytics as AnalyticsIcon,
  ArrowForward as ArrowForwardIcon,
  Public as PublicIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';

const MotionBox = motion(Box);
const ORANGE = '#FF6B35';

function LandingPage() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const headerBg = useTransform(scrollYProgress, [0, 0.05], ['rgba(13, 13, 20, 0)', 'rgba(13, 13, 20, 0.8)']);

  const features = [
    { icon: <DevicesIcon />, title: 'Fleet Orchestration', description: 'Real-time control over globally distributed mobile infrastructure.', color: ORANGE },
    { icon: <UpdateIcon />, title: 'Intelligence OTA', description: 'Zero-touch deployments with automated scheduling and failure logic.', color: '#3B82F6' },
    { icon: <SecurityIcon />, title: 'Protocol Hardening', description: 'Military-grade encryption and remote wipe capabilities.', color: '#10B981' },
    { icon: <AnalyticsIcon />, title: 'Telemetry Engine', description: 'Predictive health monitoring and sub-second compliance audit.', color: '#8B5CF6' },
    { icon: <PublicIcon />, title: 'Geospatial Mapping', description: 'High-density visualization of fleet movement across 140+ countries.', color: '#F59E0B' },
    { icon: <TimelineIcon />, title: 'Audit Ledger', description: 'Immutable transaction history for enterprise-level regulation.', color: '#EC4899' },
  ];

  return (
    <Box sx={{ bgcolor: '#0D0D14', minHeight: '100vh', overflowX: 'hidden', color: '#fff' }}>
      {/* Navigation */}
      <MotionBox style={{ backgroundColor: headerBg }} sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1200, backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ height: 90, display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }} onClick={() => navigate('/')}>
              <Box sx={{ width: 40, height: 40, borderRadius: '12px', background: `linear-gradient(135deg, ${ORANGE} 0%, #E55A2B 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 20px ${alpha(ORANGE, 0.3)}` }}>
                <DevicesIcon sx={{ color: '#fff', fontSize: 22 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.04em', color: '#fff', textTransform: 'uppercase' }}>MDM<span style={{ color: ORANGE }}>CORE</span></Typography>
            </Box>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 5 }}>
              {['INFRASTRUCTURE', 'TELEMETRY', 'SECURITY', 'REGISTRY'].map((item) => (
                <Typography key={item} sx={{ fontWeight: 800, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', cursor: 'pointer', '&:hover': { color: ORANGE }, transition: 'all 0.2s' }}>{item}</Typography>
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 2.5 }}>
              <Button onClick={() => navigate('/login')} sx={{ color: '#fff', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.05em' }}>LOG IN</Button>
              <Button variant="contained" onClick={() => navigate('/register')} sx={{ bgcolor: ORANGE, color: '#fff', borderRadius: '10px', fontWeight: 900, px: 3, boxShadow: `0 8px 20px ${alpha(ORANGE, 0.4)}`, '&:hover': { bgcolor: '#E55A2B', transform: 'translateY(-2px)' } }}>INITIALIZE</Button>
            </Box>
          </Toolbar>
        </Container>
      </MotionBox>

      {/* Hero Section */}
      <Box sx={{ pt: 25, pb: 15, position: 'relative' }}>
        <Box sx={{ position: 'absolute', top: -200, right: -200, width: 800, height: 800, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(ORANGE, 0.05)} 0%, transparent 70%)` }} />
        <Box sx={{ position: 'absolute', bottom: -200, left: -200, width: 800, height: 800, borderRadius: '50%', background: `radial-gradient(circle, ${alpha('#3B82F6', 0.05)} 0%, transparent 70%)` }} />
        
        <Container maxWidth="xl">
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} lg={7}>
              <MotionBox initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                <Chip label="ENTERPRISE INFRASTRUCTURE V4.0" sx={{ bgcolor: alpha(ORANGE, 0.1), color: ORANGE, fontWeight: 900, fontSize: '0.65rem', letterSpacing: '0.15em', mb: 4, height: 30, borderRadius: '6px', border: `1px solid ${alpha(ORANGE, 0.2)}` }} />
                <Typography variant="h1" sx={{ fontWeight: 900, fontSize: { xs: '3.5rem', md: '5.5rem' }, lineHeight: 0.95, letterSpacing: '-0.05em', mb: 4 }}>
                  Orchestrate Your <br />
                  <span style={{ background: `linear-gradient(135deg, ${ORANGE} 0%, #E55A2B 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Mobile Fleet</span> <br />
                  With Precision.
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.25rem', fontWeight: 600, maxWidth: 650, mb: 6, lineHeight: 1.6 }}>
                  The industry-standard platform for mission-critical device management. Deploy updates, monitor telemetry, and secure thousands of nodes with sub-second latency.
                </Typography>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <Button variant="contained" size="large" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/register')} sx={{ bgcolor: ORANGE, color: '#fff', borderRadius: '12px', fontWeight: 900, px: 5, py: 2.2, fontSize: '1rem', boxShadow: `0 20px 40px ${alpha(ORANGE, 0.3)}`, '&:hover': { bgcolor: '#E55A2B', transform: 'translateY(-4px)' } }}>DEPLOY FLEET</Button>
                  <Button variant="outlined" size="large" startIcon={<PublicIcon />} sx={{ borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px', fontWeight: 800, px: 5, '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.05)' } }}>COMMAND CENTER DEMO</Button>
                </Box>
              </MotionBox>
            </Grid>
            <Grid item xs={12} lg={5}>
              <MotionBox initial={{ opacity: 0, scale: 0.9, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}>
                <Card className="glass-card" sx={{ p: 1, borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Box sx={{ bgcolor: '#000', borderRadius: '20px', overflow: 'hidden', position: 'relative' }}>
                    <Box sx={{ position: 'absolute', top: 20, left: 20, display: 'flex', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#FF5F56' }} />
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#FFBD2E' }} />
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#27C93F' }} />
                    </Box>
                    <Box sx={{ p: 6, pt: 8 }}>
                      <Box sx={{ height: 2, bgcolor: 'rgba(255,255,255,0.05)', mb: 4 }} />
                      <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
                        <Box sx={{ width: '60%', height: 120, borderRadius: '12px', bgcolor: alpha(ORANGE, 0.1), border: `1px solid ${alpha(ORANGE, 0.2)}` }} />
                        <Box sx={{ width: '40%', height: 120, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }} />
                      </Box>
                      <Box sx={{ height: 150, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Box sx={{ width: 100, height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.1)' }} />
                          <Box sx={{ width: 40, height: 8, borderRadius: 4, bgcolor: ORANGE }} />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          {[1, 2, 3].map(i => <Box key={i} sx={{ width: `${100 - i * 15}%`, height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)' }} />)}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Card>
              </MotionBox>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Bar */}
      <Box sx={{ py: 8, borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', bgcolor: alpha('#fff', 0.01) }}>
        <Container maxWidth="xl">
          <Grid container spacing={4} justifyContent="center">
            {[ {l: 'DEVICES MANAGED', v: '1.2M+'}, {l: 'UPDATE SUCCESS', v: '99.98%'}, {l: 'LATENCY', v: '<25ms'}, {l: 'UPTIME', v: '99.99%'} ].map((stat, i) => (
              <Grid item xs={6} md={3} key={i}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: '#fff', mb: 0.5 }}>{stat.v}</Typography>
                  <Typography variant="caption" sx={{ color: ORANGE, fontWeight: 800, letterSpacing: '0.15em' }}>{stat.l}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Grid */}
      <Box sx={{ py: 20 }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: 12 }}>
            <Typography variant="caption" sx={{ color: ORANGE, fontWeight: 900, letterSpacing: '0.2em' }}>CORE CAPABILITIES</Typography>
            <Typography variant="h2" sx={{ fontWeight: 900, mt: 2, mb: 3 }}>Architected for Control.</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, fontSize: '1.2rem', maxWidth: 800, mx: 'auto' }}>Everything required to orchestrate global infrastructure with military-standard reliability and speed.</Typography>
          </Box>
          <Grid container spacing={4}>
            {features.map((f, i) => (
              <Grid item xs={12} md={4} key={i}>
                <MotionBox whileHover={{ y: -10 }} sx={{ p: 5, height: '100%', borderRadius: '24px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', '&:hover': { background: 'rgba(255,255,255,0.02)', borderColor: ORANGE } }}>
                  <Box sx={{ width: 56, height: 56, borderRadius: '14px', bgcolor: alpha(f.color, 0.1), border: `1px solid ${alpha(f.color, 0.2)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, mb: 4 }}>
                    {React.cloneElement(f.icon, { sx: { fontSize: 28 } })}
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 900, mb: 2 }}>{f.title}</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, mb: 4, lineHeight: 1.6 }}>{f.description}</Typography>
                  <Button endIcon={<ChevronRightIcon />} sx={{ color: f.color, fontWeight: 800, p: 0, '&:hover': { bgcolor: 'transparent', transform: 'translateX(5px)' } }}>READ PROTOCOL</Button>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 15 }}>
        <Container maxWidth="lg">
          <MotionBox initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} sx={{ p: { xs: 6, md: 10 }, borderRadius: '32px', background: 'linear-gradient(135deg, #1A1A2E 0%, #0D0D14 100%)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at top right, rgba(255,107,53,0.1), transparent 50%)' }} />
            <Typography variant="h2" sx={{ fontWeight: 900, mb: 3 }}>Start Orchestrating.</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, fontSize: '1.2rem', maxWidth: 600, mx: 'auto', mb: 6 }}>Join global enterprises securing their mobile future with MDMCORE. Zero configuration required to start.</Typography>
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="contained" size="large" onClick={() => navigate('/register')} sx={{ bgcolor: ORANGE, color: '#fff', borderRadius: '12px', fontWeight: 900, px: 6, py: 2.2, fontSize: '1.1rem', boxShadow: `0 20px 40px ${alpha(ORANGE, 0.3)}` }}>CREATE ACCOUNT</Button>
              <Button size="large" sx={{ color: '#fff', fontWeight: 800 }}>SCHEDULE PROTOCOL DEMO</Button>
            </Box>
          </MotionBox>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 10, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '8px', background: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DevicesIcon sx={{ color: '#fff', fontSize: 18 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.04em' }}>MDM<span style={{ color: ORANGE }}>CORE</span></Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>© 2026 MDMCORE ENTERPRISE · BUILT FOR MISSION-CRITICAL RELIABILITY</Typography>
            <Box sx={{ display: 'flex', gap: 4 }}>
              {['SECURITY', 'PRIVACY', 'TERMS'].map(l => <Typography key={l} variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 800, cursor: 'pointer', '&:hover': { color: '#fff' } }}>{l}</Typography>)}
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default LandingPage;