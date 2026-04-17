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
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Shield as ShieldIcon,
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion(Box);

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2.5,
    bgcolor: '#F8F9FA',
    '& fieldset': { borderColor: '#E5E7EB' },
    '&:hover fieldset': { borderColor: '#FF6B35' },
    '&.Mui-focused fieldset': { borderColor: '#FF6B35', borderWidth: 2 },
    '&.Mui-focused': { bgcolor: '#FFFFFF' },
  },
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
  const labels = ['', 'Very Weak', 'Weak', 'Good', 'Strong', 'Very Strong'];
  const colors = ['', '#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#10B981'];
  const pct = (strength / 5) * 100;

  if (!password) return null;
  return (
    <Box sx={{ mt: 1 }}>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 5,
          borderRadius: 4,
          bgcolor: '#E5E7EB',
          '& .MuiLinearProgress-bar': {
            background: colors[strength],
            borderRadius: 4,
          },
        }}
      />
      <Typography variant="caption" sx={{ color: colors[strength], fontWeight: 600, mt: 0.5, display: 'block' }}>
        {labels[strength]}
      </Typography>
    </Box>
  );
}

const steps = ['Account Info', 'Security', 'Confirm'];

export default function Register() {
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    organization: '',
    password: '',
    confirmPassword: '',
  });

  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setLocalError('');
  };

  const validateStep = () => {
    if (activeStep === 0) {
      if (!form.name.trim()) return 'Full name is required';
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        return 'A valid email address is required';
    }
    if (activeStep === 1) {
      if (form.password.length < 8)
        return 'Password must be at least 8 characters';
      if (form.password !== form.confirmPassword)
        return 'Passwords do not match';
    }
    return '';
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) { setLocalError(err); return; }
    setLocalError('');
    setActiveStep((s) => s + 1);
  };

  const handleBack = () => {
    setLocalError('');
    setActiveStep((s) => s - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register({
      name: form.name,
      email: form.email,
      password: form.password,
      organization: form.organization,
    });
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const benefits = [
    { icon: <DevicesIcon sx={{ fontSize: 18 }} />, text: 'Monitor your device fleet instantly' },
    { icon: <ShieldIcon sx={{ fontSize: 18 }} />, text: 'Enterprise-grade security built-in' },
    { icon: <SpeedIcon sx={{ fontSize: 18 }} />, text: 'Real-time OTA update management' },
    { icon: <AnalyticsIcon sx={{ fontSize: 18 }} />, text: 'Actionable insights & analytics' },
  ];

  const displayError = localError || error;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#FFFFFF' }}>
      {/* Left Brand Panel */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: '46%',
          flexShrink: 0,
          background: 'linear-gradient(160deg, #FF6B35 0%, #E55A2B 50%, #CC4E22 100%)',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -100, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', top: '40%', right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <MotionBox
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, position: 'relative', zIndex: 1 }}
        >
          <Box sx={{ width: 46, height: 46, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.3)' }}>
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

        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          sx={{ position: 'relative', zIndex: 1 }}
        >
          <Typography sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: '2.4rem', lineHeight: 1.2, mb: 2, letterSpacing: '-0.02em' }}>
            Join thousands of{' '}
            <Box component="span" sx={{ color: 'rgba(255,255,255,0.75)' }}>
              teams managing
            </Box>{' '}
            devices at scale
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', lineHeight: 1.8, mb: 4 }}>
            Create your free account and get full access to MDMPortal's powerful device management tools in under 2 minutes.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {benefits.map((b, i) => (
              <MotionBox
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
              >
                <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0, border: '1px solid rgba(255,255,255,0.2)' }}>
                  {b.icon}
                </Box>
                <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500, fontSize: '0.95rem' }}>{b.text}</Typography>
              </MotionBox>
            ))}
          </Box>
        </MotionBox>

        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}
        >
          {['Free to start', 'No credit card', '5-min setup', 'GDPR Ready'].map((badge) => (
            <Chip
              key={badge}
              icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: 'rgba(255,255,255,0.9) !important' }} />}
              label={badge}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', fontWeight: 600, fontSize: '0.7rem', border: '1px solid rgba(255,255,255,0.25)' }}
            />
          ))}
        </MotionBox>
      </Box>

      {/* Right Form Panel */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#FFFFFF', p: { xs: 3, sm: 5, md: 6 } }}>
        <MotionBox
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          sx={{ width: '100%', maxWidth: 450 }}
        >
          {/* Mobile logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 4 }}>
            <Box sx={{ width: 38, height: 38, borderRadius: 2, background: 'linear-gradient(135deg, #FF6B35, #E55A2B)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DevicesIcon sx={{ color: '#fff', fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: '1.1rem' }}>
              MDM<span style={{ color: '#FF6B35' }}>Portal</span>
            </Typography>
          </Box>

          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: '2rem', letterSpacing: '-0.02em', mb: 0.5 }}>
              Create account
            </Typography>
            <Typography sx={{ color: '#9CA3AF', fontSize: '0.95rem' }}>
              Already have an account?{' '}
              <Box
                component="span"
                onClick={() => navigate('/login')}
                sx={{ color: '#FF6B35', fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              >
                Sign in
              </Box>
            </Typography>
          </Box>

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': { fontSize: '0.78rem', fontWeight: 600 },
                    '& .MuiStepIcon-root': { color: '#E5E7EB' },
                    '& .MuiStepIcon-root.Mui-active': { color: '#FF6B35' },
                    '& .MuiStepIcon-root.Mui-completed': { color: '#10B981' },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {displayError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setLocalError('')}>
              {displayError}
            </Alert>
          )}

          {/* Step Forms */}
          <Box component="form" onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {/* Step 0: Account Info */}
              {activeStep === 0 && (
                <MotionBox
                  key="step0"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25 }}
                  sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
                >
                  <Box>
                    <Typography variant="caption" sx={{ color: '#374151', fontWeight: 600, mb: 0.8, display: 'block' }}>
                      Full Name *
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="John Smith"
                      value={form.name}
                      onChange={handleChange('name')}
                      InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#9CA3AF', fontSize: 20 }} /></InputAdornment> }}
                      sx={inputSx}
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#374151', fontWeight: 600, mb: 0.8, display: 'block' }}>
                      Work Email *
                    </Typography>
                    <TextField
                      fullWidth
                      type="email"
                      placeholder="you@company.com"
                      value={form.email}
                      onChange={handleChange('email')}
                      InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#9CA3AF', fontSize: 20 }} /></InputAdornment> }}
                      sx={inputSx}
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#374151', fontWeight: 600, mb: 0.8, display: 'block' }}>
                      Organization <Box component="span" sx={{ color: '#9CA3AF', fontWeight: 400 }}>(optional)</Box>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Acme Corp"
                      value={form.organization}
                      onChange={handleChange('organization')}
                      InputProps={{ startAdornment: <InputAdornment position="start"><BusinessIcon sx={{ color: '#9CA3AF', fontSize: 20 }} /></InputAdornment> }}
                      sx={inputSx}
                    />
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={handleNext}
                    sx={{ mt: 1, py: 1.8, borderRadius: 2.5, fontWeight: 700, fontSize: '1rem', background: 'linear-gradient(135deg, #FF6B35, #E55A2B)', boxShadow: '0 6px 20px rgba(255,107,53,0.35)' }}
                  >
                    Continue
                  </Button>
                </MotionBox>
              )}

              {/* Step 1: Security */}
              {activeStep === 1 && (
                <MotionBox
                  key="step1"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25 }}
                  sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
                >
                  <Box>
                    <Typography variant="caption" sx={{ color: '#374151', fontWeight: 600, mb: 0.8, display: 'block' }}>
                      Password *
                    </Typography>
                    <TextField
                      fullWidth
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={handleChange('password')}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#9CA3AF', fontSize: 20 }} /></InputAdornment>,
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                              {showPassword ? <VisibilityOff sx={{ fontSize: 18, color: '#9CA3AF' }} /> : <Visibility sx={{ fontSize: 18, color: '#9CA3AF' }} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={inputSx}
                    />
                    <PasswordStrengthBar password={form.password} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#374151', fontWeight: 600, mb: 0.8, display: 'block' }}>
                      Confirm Password *
                    </Typography>
                    <TextField
                      fullWidth
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Repeat your password"
                      value={form.confirmPassword}
                      onChange={handleChange('confirmPassword')}
                      error={!!form.confirmPassword && form.password !== form.confirmPassword}
                      helperText={form.confirmPassword && form.password !== form.confirmPassword ? "Passwords don't match" : ''}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#9CA3AF', fontSize: 20 }} /></InputAdornment>,
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                              {showConfirmPassword ? <VisibilityOff sx={{ fontSize: 18, color: '#9CA3AF' }} /> : <Visibility sx={{ fontSize: 18, color: '#9CA3AF' }} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={inputSx}
                    />
                  </Box>

                  <Box sx={{ bgcolor: '#FFF3EF', borderRadius: 2, p: 2, border: '1px solid rgba(255,107,53,0.15)' }}>
                    <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, display: 'block', mb: 0.5 }}>
                      Password requirements:
                    </Typography>
                    {['At least 8 characters', 'One uppercase letter', 'One number', 'One special character'].map((req) => (
                      <Box key={req} sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
                        <CheckCircleIcon sx={{ fontSize: 12, color: '#D1D5DB' }} />
                        <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.75rem' }}>{req}</Typography>
                      </Box>
                    ))}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button fullWidth variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleBack}
                      sx={{ py: 1.8, borderRadius: 2.5, fontWeight: 600, borderColor: '#E5E7EB', color: '#374151' }}>
                      Back
                    </Button>
                    <Button fullWidth variant="contained" endIcon={<ArrowForwardIcon />} onClick={handleNext}
                      sx={{ py: 1.8, borderRadius: 2.5, fontWeight: 700, background: 'linear-gradient(135deg, #FF6B35, #E55A2B)', boxShadow: '0 6px 20px rgba(255,107,53,0.35)' }}>
                      Continue
                    </Button>
                  </Box>
                </MotionBox>
              )}

              {/* Step 2: Confirm */}
              {activeStep === 2 && (
                <MotionBox
                  key="step2"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25 }}
                  sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
                >
                  <Box sx={{ bgcolor: '#F8F9FA', borderRadius: 3, p: 3, border: '1px solid #E5E7EB' }}>
                    <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.65rem', mb: 2, display: 'block' }}>
                      Review your details
                    </Typography>
                    {[
                      { label: 'Full Name', value: form.name },
                      { label: 'Email', value: form.email },
                      { label: 'Organization', value: form.organization || 'Not specified' },
                      { label: 'Role', value: 'Viewer (upgradeable by admin)' },
                    ].map(({ label, value }) => (
                      <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, pb: 1.5, borderBottom: '1px dashed #E5E7EB', '&:last-child': { mb: 0, pb: 0, border: 'none' } }}>
                        <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600, fontSize: '0.8rem' }}>{label}</Typography>
                        <Typography variant="caption" sx={{ color: '#1A1A2E', fontWeight: 700, fontSize: '0.8rem', maxWidth: '60%', textAlign: 'right' }}>{value}</Typography>
                      </Box>
                    ))}
                  </Box>

                  <Box sx={{ bgcolor: 'rgba(16,185,129,0.06)', borderRadius: 2, p: 2, border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <CheckCircleIcon sx={{ color: '#10B981', fontSize: 18, mt: 0.1, flexShrink: 0 }} />
                    <Typography variant="caption" sx={{ color: '#374151', lineHeight: 1.6, fontSize: '0.8rem' }}>
                      By creating an account, you agree to our <Box component="span" sx={{ color: '#FF6B35', fontWeight: 700 }}>Terms of Service</Box> and <Box component="span" sx={{ color: '#FF6B35', fontWeight: 700 }}>Privacy Policy</Box>.
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button fullWidth variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleBack}
                      sx={{ py: 1.8, borderRadius: 2.5, fontWeight: 600, borderColor: '#E5E7EB', color: '#374151' }}>
                      Back
                    </Button>
                    <Button type="submit" fullWidth variant="contained" disabled={loading}
                      endIcon={!loading && <CheckCircleIcon />}
                      sx={{ py: 1.8, borderRadius: 2.5, fontWeight: 700, background: 'linear-gradient(135deg, #FF6B35, #E55A2B)', boxShadow: '0 6px 20px rgba(255,107,53,0.35)', '&:disabled': { background: '#E5E7EB', boxShadow: 'none', color: '#9CA3AF' } }}>
                      {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Create Account'}
                    </Button>
                  </Box>
                </MotionBox>
              )}
            </AnimatePresence>
          </Box>

          {/* Footer */}
          <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mt: 4, textAlign: 'center', fontSize: '0.75rem', lineHeight: 1.6 }}>
            🔒 Your data is encrypted with 256-bit SSL. We never share your information.
          </Typography>
        </MotionBox>
      </Box>
    </Box>
  );
}
