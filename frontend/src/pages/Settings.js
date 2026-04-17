import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, TextField, Button,
  Switch, Divider, Alert, Chip, InputAdornment,
  IconButton, CircularProgress, Avatar, Paper, List, ListItem,
  ListItemText, ListItemSecondaryAction,
} from '@mui/material';
import {
  Lock as LockIcon,
  Visibility, VisibilityOff,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Info as InfoIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  QrCode as QrCodeIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const SectionCard = ({ title, subtitle, icon, children }) => (
  <Card sx={{ borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #F3F4F6', mb: 3 }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
        <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: 'rgba(255,107,53,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF6B35' }}>
          {icon}
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: '0.95rem' }}>{title}</Typography>
          <Typography variant="caption" sx={{ color: '#9CA3AF' }}>{subtitle}</Typography>
        </Box>
      </Box>
      <Divider sx={{ mb: 2.5 }} />
      {children}
    </CardContent>
  </Card>
);

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function Settings() {
  const { user } = useAuth();
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  
  // 2FA state
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaData, setMfaData] = useState(null); // { secret, qr }
  const [mfaToken, setMfaToken] = useState('');
  const [mfaEnabled, setMfaEnabled] = useState(user?.twoFactorEnabled || false);

  // Notification prefs (UI state only — stored in localStorage)
  const [notifPrefs, setNotifPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mdm_notif_prefs') || '{}'); } catch { return {}; }
  });

  const notifOptions = [
    { key: 'deviceOffline', label: 'Device Goes Offline', desc: 'Alert when a device loses connection' },
    { key: 'updateFailed', label: 'Update Failures', desc: 'Notify when an OTA update fails' },
    { key: 'scheduleComplete', label: 'Schedule Complete', desc: 'When a scheduled update finishes' },
    { key: 'newUser', label: 'New User Registered', desc: 'Admin alert for new account signups' },
  ];

  const token = localStorage.getItem('token');

  const handlePasswordChange = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    setPwLoading(true);
    setError('');
    try {
      await api.put(`/users/${user?.id}/password`, {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      }, { headers: { 'x-auth-token': token } });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('Password updated successfully');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update password');
    } finally {
      setPwLoading(false);
    }
  };

  const handleGenerateMFA = async () => {
    setMfaLoading(true);
    setError('');
    try {
      const res = await api.get('/auth/2fa/generate', { headers: { 'x-auth-token': token } });
      setMfaData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate 2FA secret');
    } finally {
      setMfaLoading(true); // Wait for image load etc if needed, but keeping it true for now
      setMfaLoading(false);
    }
  };

  const handleEnableMFA = async () => {
    if (mfaToken.length < 6) return;
    setMfaLoading(true);
    setError('');
    try {
      // We use the same verify-2fa endpoint but it will also enable it in the DB
      const res = await api.post('/auth/verify-2fa', { 
        userId: user.id, 
        token: mfaToken 
      }, { headers: { 'x-auth-token': token } });
      
      if (res.data.success) {
        setMfaEnabled(true);
        setMfaData(null);
        setMfaToken('');
        setSuccess('Two-factor authentication enabled successfully');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid verification code');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleNotifToggle = (key) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    localStorage.setItem('mdm_notif_prefs', JSON.stringify(updated));
  };


  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 860, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: { xs: '1.5rem', md: '2rem' } }}>
          Settings
        </Typography>
        <Typography sx={{ color: '#9CA3AF', mt: 0.5 }}>
          Manage your account and system preferences
        </Typography>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Profile Overview */}
      <SectionCard title="Your Profile" subtitle="Account overview and details" icon={<PersonIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Avatar sx={{ width: 72, height: 72, bgcolor: '#FF6B35', fontWeight: 800, fontSize: '1.5rem' }}>
            {getInitials(user?.name)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: '1.2rem' }}>{user?.name}</Typography>
            <Typography sx={{ color: '#6B7280', mb: 1 }}>{user?.email}</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label={user?.role}
                size="small"
                sx={{ bgcolor: 'rgba(255,107,53,0.1)', color: '#FF6B35', fontWeight: 700, textTransform: 'capitalize' }}
              />
              <Chip
                icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: '#10B981 !important' }} />}
                label="Active"
                size="small"
                sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: '#10B981', fontWeight: 700 }}
              />
            </Box>
          </Box>
        </Box>
      </SectionCard>

      {/* Change Password */}
      <SectionCard title="Change Password" subtitle="Update your security credentials" icon={<SecurityIcon />}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Current Password"
            type={showPw.current ? 'text' : 'password'}
            value={pwForm.currentPassword}
            onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
            InputProps={{
              startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#9CA3AF', fontSize: 18 }} /></InputAdornment>,
              endAdornment: <InputAdornment position="end"><IconButton size="small" onClick={() => setShowPw(p => ({ ...p, current: !p.current }))}>{showPw.current ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}</IconButton></InputAdornment>,
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <TextField
            fullWidth
            label="New Password"
            type={showPw.new ? 'text' : 'password'}
            value={pwForm.newPassword}
            onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
            helperText="Minimum 8 characters"
            InputProps={{
              startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#9CA3AF', fontSize: 18 }} /></InputAdornment>,
              endAdornment: <InputAdornment position="end"><IconButton size="small" onClick={() => setShowPw(p => ({ ...p, new: !p.new }))}>{showPw.new ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}</IconButton></InputAdornment>,
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <TextField
            fullWidth
            label="Confirm New Password"
            type={showPw.confirm ? 'text' : 'password'}
            value={pwForm.confirmPassword}
            onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
            error={!!pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword}
            helperText={pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword ? "Passwords don't match" : ''}
            InputProps={{
              startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#9CA3AF', fontSize: 18 }} /></InputAdornment>,
              endAdornment: <InputAdornment position="end"><IconButton size="small" onClick={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))}>{showPw.confirm ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}</IconButton></InputAdornment>,
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <Button
            variant="contained"
            startIcon={pwLoading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <SaveIcon />}
            onClick={handlePasswordChange}
            disabled={pwLoading || !pwForm.currentPassword || !pwForm.newPassword}
            sx={{ alignSelf: 'flex-start', px: 3, py: 1.4, borderRadius: 2.5, fontWeight: 700, background: 'linear-gradient(135deg, #FF6B35, #E55A2B)', '&:disabled': { background: '#E5E7EB', color: '#9CA3AF' } }}
          >
            {pwLoading ? 'Updating...' : 'Update Password'}
          </Button>
        </Box>
      </SectionCard>

      {/* Two-Factor Authentication */}
      <SectionCard 
        title="Two-Factor Authentication (2FA)" 
        subtitle="Add an extra layer of security to your account" 
        icon={<ShieldIcon />}
      >
        <Box sx={{ p: 1 }}>
          {mfaEnabled ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'rgba(16,185,129,0.05)', p: 2.5, borderRadius: 2.5, border: '1px solid rgba(16,185,129,0.2)' }}>
              <CheckCircleIcon sx={{ color: '#10B981', fontSize: 24 }} />
              <Box>
                <Typography sx={{ fontWeight: 700, color: '#1A1A2E' }}>2FA is Active</Typography>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>Your account is protected with an additional verification layer.</Typography>
              </Box>
            </Box>
          ) : mfaData ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ textAlign: 'center', color: '#4B5563' }}>
                1. Scan this QR code with your authenticator app (e.g., Google Authenticator, Authy):
              </Typography>
              <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #E5E7EB' }}>
                <img src={mfaData.qr} alt="2FA QR Code" style={{ width: 180, height: 180, display: 'block' }} />
              </Box>
              <Box sx={{ width: '100%', maxWidth: 320 }}>
                <Typography variant="caption" sx={{ color: '#6B7280', mb: 1.5, display: 'block', textAlign: 'center' }}>
                  2. Enter the 6-digit code from the app to verify:
                </Typography>
                <TextField
                  fullWidth
                  placeholder="000000"
                  value={mfaToken}
                  onChange={(e) => setMfaToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputProps={{ style: { textAlign: 'center', letterSpacing: '0.3em', fontWeight: 800 } }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: '#F9FAFB' } }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  disabled={mfaLoading || mfaToken.length < 6}
                  onClick={handleEnableMFA}
                  sx={{ mt: 2, py: 1.4, borderRadius: 2.5, fontWeight: 700, background: 'linear-gradient(135deg, #10B981, #059669)' }}
                >
                  {mfaLoading ? <CircularProgress size={20} color="inherit" /> : 'Verify & Enable'}
                </Button>
                <Button 
                  fullWidth 
                  variant="text" 
                  size="small" 
                  onClick={() => setMfaData(null)}
                  sx={{ mt: 1, color: '#9CA3AF' }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" sx={{ color: '#4B5563', lineHeight: 1.6 }}>
                Two-factor authentication adds an extra layer of security. Once enabled, you'll be required to enter a code from an authenticator app when signing in.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<QrCodeIcon />}
                onClick={handleGenerateMFA}
                sx={{ alignSelf: 'flex-start', px: 3, py: 1.2, borderRadius: 2.5, fontWeight: 700, borderColor: '#E5E7EB', color: '#1A1A2E', '&:hover': { borderColor: '#FF6B35', color: '#FF6B35' } }}
              >
                Setup Authenticator
              </Button>
            </Box>
          )}
        </Box>
      </SectionCard>

      {/* Notification Preferences */}
      <SectionCard title="Notifications" subtitle="Choose what alerts you receive" icon={<NotificationsIcon />}>
        <List disablePadding>
          {notifOptions.map((opt, i) => (
            <React.Fragment key={opt.key}>
              <ListItem disablePadding sx={{ py: 1.5 }}>
                <ListItemText
                  primary={<Typography sx={{ fontWeight: 600, color: '#1A1A2E', fontSize: '0.9rem' }}>{opt.label}</Typography>}
                  secondary={<Typography variant="caption" sx={{ color: '#9CA3AF' }}>{opt.desc}</Typography>}
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={!!notifPrefs[opt.key]}
                    onChange={() => handleNotifToggle(opt.key)}
                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#FF6B35' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#FF6B35' } }}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              {i < notifOptions.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </SectionCard>

      {/* About */}
      <SectionCard title="About MDMPortal" subtitle="System version and platform information" icon={<InfoIcon />}>
        <Grid container spacing={2}>
          {[
            { label: 'Application', value: 'MDMPortal Enterprise' },
            { label: 'Version', value: 'v2.0.0' },
            { label: 'Platform', value: 'React + Node.js + MongoDB' },
            { label: 'License', value: 'Enterprise' },
            { label: 'Your Role', value: user?.role || 'viewer' },
            { label: 'Account ID', value: user?.id?.slice(-8).toUpperCase() || '—' },
          ].map(({ label, value }) => (
            <Grid item xs={12} sm={6} key={label}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8F9FA', borderRadius: 2, border: '1px solid #E5E7EB' }}>
                <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.65rem' }}>{label}</Typography>
                <Typography sx={{ fontWeight: 700, color: '#1A1A2E', mt: 0.3, textTransform: label === 'Your Role' ? 'capitalize' : 'none' }}>{value}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </SectionCard>
    </Box>
  );
}
