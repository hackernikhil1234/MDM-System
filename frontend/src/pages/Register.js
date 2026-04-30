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
  Stepper,
  Step,
  StepLabel,
  Chip,
  LinearProgress,
  alpha,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Devices as DevicesIcon,
  ArrowForward as ArrowForwardIcon,
  Shield as ShieldIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion(Box);
const ORANGE = '#FF6B35';

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    bgcolor: 'rgba(255,255,255,0.02)',
    color: '#fff',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.05)' },
    '&:hover fieldset': { borderColor: alpha(ORANGE, 0.3) },
    '&.Mui-focused fieldset': { borderColor: ORANGE, borderWidth: 1 },
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.4)' },
  '& input': { fontWeight: 600 }
};

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function PasswordStrengthBar({ password }) {
  const strength = getPasswordStrength(password);
  const colors = ['', '#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#10B981'];
  const pct = (strength / 5) * 100;
  if (!password) return null;
  return (
    <Box sx={{ mt: 1.5 }}>
      <LinearProgress variant="determinate" value={pct} sx={{ height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { background: colors[strength] } }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
        <Typography variant="caption" sx={{ color: colors[strength], fontWeight: 800, fontSize: '0.6rem', textTransform: 'uppercase' }}>STRENGTH: {['NONE', 'CRITICAL', 'WEAK', 'OPTIMAL', 'HARDENED', 'ENCRYPTED'][strength]}</Typography>
      </Box>
    </Box>
  );
}

const steps = ['IDENTITY', 'SECURITY', 'REGISTRY'];

export default function Register() {
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', organization: '', password: '', confirmPassword: '' });
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setLocalError('');
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!form.name.trim()) return setLocalError('Identity token required: Name');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setLocalError('Signal error: Invalid email format');
    }
    if (activeStep === 1) {
      if (form.password.length < 8) return setLocalError('Security breach: Password too short');
      if (form.password !== form.confirmPassword) return setLocalError('Mismatch: Passwords do not align');
    }
    setLocalError('');
    setActiveStep((s) => s + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register({ name: form.name, email: form.email, password: form.password, organization: form.organization });
    if (result.success) navigate('/dashboard');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0D0D14', color: '#fff', overflow: 'hidden', position: 'relative' }}>
      {/* Background Elements */}
      <Box sx={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(ORANGE, 0.08)} 0%, transparent 70%)` }} />
      <Box sx={{ position: 'absolute', bottom: -200, left: -200, width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, ${alpha('#3B82F6', 0.08)} 0%, transparent 70%)` }} />

      {/* Branding Panel */}
      <Box sx={{ display: { xs: 'none', lg: 'flex' }, width: '45%', p: 8, flexDirection: 'column', justifyContent: 'space-between', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <Box sx={{ width: 40, height: 40, borderRadius: '12px', background: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 20px ${alpha(ORANGE, 0.3)}` }}>
            <DevicesIcon sx={{ color: '#fff', fontSize: 22 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.04em', textTransform: 'uppercase' }}>MDM<span style={{ color: ORANGE }}>CORE</span></Typography>
        </Box>

        <Box>
          <Typography variant="h2" sx={{ fontWeight: 900, lineHeight: 1, mb: 3, letterSpacing: '-0.04em' }}>Join the <br /><span style={{ color: ORANGE }}>Next-Gen</span> <br />Infrastructure.</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.25rem', fontWeight: 600, maxWidth: 450, mb: 6, lineHeight: 1.6 }}>Initialize your enterprise node and gain full oversight of your global fleet in under 2 minutes.</Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {[ {i: <DevicesIcon />, t: 'Sub-second Node Synchronization'}, {i: <ShieldIcon />, t: 'Military-grade Encryption Protocol'}, {i: <AnalyticsIcon />, t: 'Real-time Intelligence Broadcast'} ].map((b, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ORANGE }}>{b.i}</Box>
                <Typography sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>{b.t}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {['256-BIT SSL', 'SOC 2', 'GDPR COMPLIANT'].map(b => <Chip key={b} label={b} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)', fontWeight: 800, fontSize: '0.6rem' }} />)}
        </Box>
      </Box>

      {/* Form Panel */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4, zIndex: 1 }}>
        <MotionBox initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} sx={{ width: '100%', maxWidth: 480 }}>
          <Box className="glass-card" sx={{ p: { xs: 4, sm: 6 }, borderRadius: '32px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Box sx={{ mb: 6 }}>
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>Registration</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Already registered? <span style={{ color: ORANGE, cursor: 'pointer' }} onClick={() => navigate('/login')}>Initialize Login</span></Typography>
            </Box>

            <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel sx={{ '& .MuiStepLabel-label': { fontSize: '0.65rem', fontWeight: 900, color: activeStep >= index ? ORANGE : 'rgba(255,255,255,0.2) !important', letterSpacing: '0.1em' }, '& .MuiStepIcon-root': { color: 'rgba(255,255,255,0.05)', '&.Mui-active': { color: ORANGE }, '&.Mui-completed': { color: '#10B981' } } }}>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {(localError || error) && <Alert severity="error" sx={{ mb: 4, borderRadius: '12px', bgcolor: alpha('#EF4444', 0.1), color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{localError || error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {activeStep === 0 && (
                  <MotionBox key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: ORANGE, fontWeight: 900, mb: 1, display: 'block', letterSpacing: '0.1em' }}>IDENTITY TOKEN</Typography>
                      <TextField fullWidth placeholder="Full Name" value={form.name} onChange={handleChange('name')} InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: 'rgba(255,255,255,0.2)', fontSize: 20 }} /></InputAdornment> }} sx={inputSx} />
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: ORANGE, fontWeight: 900, mb: 1, display: 'block', letterSpacing: '0.1em' }}>SIGNAL FREQUENCY (EMAIL)</Typography>
                      <TextField fullWidth placeholder="admin@mdmcore.io" value={form.email} onChange={handleChange('email')} InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: 'rgba(255,255,255,0.2)', fontSize: 20 }} /></InputAdornment> }} sx={inputSx} />
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: ORANGE, fontWeight: 900, mb: 1, display: 'block', letterSpacing: '0.1em' }}>ENTERPRISE DOMAIN</Typography>
                      <TextField fullWidth placeholder="Organization" value={form.organization} onChange={handleChange('organization')} InputProps={{ startAdornment: <InputAdornment position="start"><BusinessIcon sx={{ color: 'rgba(255,255,255,0.2)', fontSize: 20 }} /></InputAdornment> }} sx={inputSx} />
                    </Box>
                    <Button fullWidth variant="contained" endIcon={<ArrowForwardIcon />} onClick={handleNext} sx={{ py: 2, borderRadius: '12px', bgcolor: ORANGE, fontWeight: 900 }}>CONTINUE PROTOCOL</Button>
                  </MotionBox>
                )}

                {activeStep === 1 && (
                  <MotionBox key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: ORANGE, fontWeight: 900, mb: 1, display: 'block', letterSpacing: '0.1em' }}>ENCRYPTION KEY</Typography>
                      <TextField fullWidth type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={handleChange('password')} InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: 'rgba(255,255,255,0.2)', fontSize: 20 }} /></InputAdornment>, endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} sx={{ color: 'rgba(255,255,255,0.2)' }}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }} sx={inputSx} />
                      <PasswordStrengthBar password={form.password} />
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: ORANGE, fontWeight: 900, mb: 1, display: 'block', letterSpacing: '0.1em' }}>VERIFY ACCESS KEY</Typography>
                      <TextField fullWidth type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" value={form.confirmPassword} onChange={handleChange('confirmPassword')} InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: 'rgba(255,255,255,0.2)', fontSize: 20 }} /></InputAdornment>, endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} sx={{ color: 'rgba(255,255,255,0.2)' }}>{showConfirmPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }} sx={inputSx} />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button fullWidth onClick={() => setActiveStep(0)} sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 800 }}>BACK</Button>
                      <Button fullWidth variant="contained" endIcon={<ArrowForwardIcon />} onClick={handleNext} sx={{ py: 2, borderRadius: '12px', bgcolor: ORANGE, fontWeight: 900 }}>CONTINUE</Button>
                    </Box>
                  </MotionBox>
                )}

                {activeStep === 2 && (
                  <MotionBox key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Box sx={{ p: 3, borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <Typography variant="caption" sx={{ color: ORANGE, fontWeight: 900, mb: 2, display: 'block', letterSpacing: '0.1em' }}>MANIFEST SUMMARY</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {[ {l: 'IDENTIFIER', v: form.name}, {l: 'FREQUENCY', v: form.email}, {l: 'DOMAIN', v: form.organization || 'GLOBAL'} ].map((item, i) => (
                          <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', pb: 1.5, borderBottom: i === 2 ? 'none' : '1px solid rgba(255,255,255,0.03)' }}>
                            <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', fontWeight: 800 }}>{item.l}</Typography>
                            <Typography sx={{ color: '#fff', fontSize: '0.8rem', fontWeight: 900 }}>{item.v}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', lineHeight: 1.6 }}>By initializing, you agree to the MDMCORE <span style={{ color: ORANGE }}>PROTOCOL TERMS</span> and <span style={{ color: ORANGE }}>PRIVACY MANIFEST</span>.</Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button fullWidth onClick={() => setActiveStep(1)} sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 800 }}>BACK</Button>
                      <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ py: 2, borderRadius: '12px', bgcolor: ORANGE, fontWeight: 900 }}>{loading ? <CircularProgress size={24} color="inherit" /> : 'INITIALIZE NODE'}</Button>
                    </Box>
                  </MotionBox>
                )}
              </AnimatePresence>
            </Box>
          </Box>
        </MotionBox>
      </Box>
    </Box>
  );
}
