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
  Chip,
  alpha,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Devices as DevicesIcon,
  Shield as ShieldIcon,
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const ORANGE = '#FF6B35';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState('login');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [userId, setUserId] = useState(null);
  const { login, verify2FA, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result?.success) {
      if (result.requires2FA) {
        setStep('2fa');
        setUserId(result.userId);
      } else {
        navigate('/dashboard');
      }
    }
  };

  const handle2FAVerify = async (e) => {
    e.preventDefault();
    const result = await verify2FA(userId, twoFactorCode);
    if (result?.success) {
      navigate('/dashboard');
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0D0D14', color: '#fff', overflow: 'hidden', position: 'relative' }}>
      {/* Background Orbs */}
      <Box sx={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(ORANGE, 0.08)} 0%, transparent 70%)`, pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: -200, left: -200, width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, ${alpha('#3B82F6', 0.08)} 0%, transparent 70%)`, pointerEvents: 'none' }} />

      {/* Left Panel - Branding */}
      <Box sx={{ display: { xs: 'none', lg: 'flex' }, width: '45%', p: 8, flexDirection: 'column', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <MotionBox initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: '12px', background: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 20px ${alpha(ORANGE, 0.3)}` }}>
            <DevicesIcon sx={{ color: '#fff', fontSize: 22 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.04em', textTransform: 'uppercase' }}>MDM<span style={{ color: ORANGE }}>CORE</span></Typography>
        </MotionBox>

        <MotionBox initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Typography variant="h2" sx={{ fontWeight: 900, lineHeight: 1, mb: 3, letterSpacing: '-0.04em' }}>The Future of <br /><span style={{ color: ORANGE }}>Fleet Control.</span></Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.25rem', fontWeight: 600, maxWidth: 450, mb: 6, lineHeight: 1.6 }}>Secure your infrastructure with sub-second telemetry and military-standard encryption protocol.</Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {[
              { icon: <ShieldIcon />, text: 'Encrypted Communication Pathway' },
              { icon: <SpeedIcon />, text: 'Sub-second Telemetry Broadcast' },
              { icon: <AnalyticsIcon />, text: 'AI-Driven Compliance Engine' }
            ].map((f, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ORANGE }}>{f.icon}</Box>
                <Typography sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>{f.text}</Typography>
              </Box>
            ))}
          </Box>
        </MotionBox>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {['SOC 2', 'ISO 27001', 'GDPR'].map(b => <Chip key={b} label={b} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontWeight: 800, fontSize: '0.65rem' }} />)}
        </Box>
      </Box>

      {/* Right Panel - Form */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4, position: 'relative', zIndex: 1 }}>
        <MotionBox initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} sx={{ width: '100%', maxWidth: 440 }}>
          <Box className="glass-card" sx={{ p: { xs: 4, sm: 6 }, borderRadius: '32px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Box sx={{ mb: 6 }}>
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 1.5 }}>{step === 'login' ? 'Authentication' : 'Verification'}</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{step === 'login' ? 'Synchronize with the MDMCORE matrix' : 'Execute 2FA protocol sequence'}</Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 4, borderRadius: '12px', bgcolor: alpha('#EF4444', 0.1), color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                {error}
              </Alert>
            )}

            {step === 'login' ? (
              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: ORANGE, fontWeight: 900, mb: 1, display: 'block', letterSpacing: '0.1em' }}>IDENTITY SIGNAL</Typography>
                  <TextField fullWidth placeholder="admin@mdmcore.io" value={email} onChange={(e) => setEmail(e.target.value)} required InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: 'rgba(255,255,255,0.2)', fontSize: 20 }} /></InputAdornment>, sx: { color: '#fff', fontWeight: 600, height: 56, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.02)', '& fieldset': { borderColor: 'rgba(255,255,255,0.05)' }, '&:hover fieldset': { borderColor: alpha(ORANGE, 0.3) }, '&.Mui-focused fieldset': { borderColor: ORANGE } } }} />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" sx={{ color: ORANGE, fontWeight: 900, letterSpacing: '0.1em' }}>ACCESS KEY</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 800, cursor: 'pointer', '&:hover': { color: ORANGE } }}>FORGOT?</Typography>
                  </Box>
                  <TextField fullWidth type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: 'rgba(255,255,255,0.2)', fontSize: 20 }} /></InputAdornment>, endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} size="small" sx={{ color: 'rgba(255,255,255,0.2)' }}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>, sx: { color: '#fff', fontWeight: 600, height: 56, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.02)', '& fieldset': { borderColor: 'rgba(255,255,255,0.05)' } } }} />
                </Box>

                <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ py: 2, borderRadius: '12px', bgcolor: ORANGE, fontWeight: 900, fontSize: '1rem', boxShadow: `0 12px 30px ${alpha(ORANGE, 0.3)}`, '&:hover': { bgcolor: '#E55A2B', transform: 'translateY(-2px)' } }}>{loading ? <CircularProgress size={24} color="inherit" /> : 'INITIALIZE ACCESS'}</Button>
                
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>NO CLEARANCE? <span style={{ color: ORANGE, cursor: 'pointer' }} onClick={() => navigate('/register')}>REQUEST ACCESS</span></Typography>
                </Box>
              </Box>
            ) : (
              <Box component="form" onSubmit={handle2FAVerify} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: ORANGE, fontWeight: 900, mb: 2, display: 'block', textAlign: 'center', letterSpacing: '0.2em' }}>OTP PROTOCOL</Typography>
                  <TextField fullWidth placeholder="000 000" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))} required autoFocus InputProps={{ sx: { color: ORANGE, fontWeight: 900, height: 70, borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.02)', fontSize: '1.75rem', '& fieldset': { borderColor: alpha(ORANGE, 0.2) }, '& input': { textAlign: 'center', letterSpacing: '0.25em' } } }} />
                </Box>
                <Button type="submit" fullWidth variant="contained" disabled={loading || twoFactorCode.length < 6} sx={{ py: 2, borderRadius: '12px', bgcolor: ORANGE, fontWeight: 900 }}>{loading ? <CircularProgress size={24} color="inherit" /> : 'VERIFY SEQUENCE'}</Button>
                <Button fullWidth onClick={() => setStep('login')} sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 800 }}>ABORT SEQUENCE</Button>
              </Box>
            )}
          </Box>
        </MotionBox>
      </Box>
    </Box>
  );
}

export default Login;