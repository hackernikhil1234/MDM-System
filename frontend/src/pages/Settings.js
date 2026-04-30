import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, TextField, Button,
  Switch, Divider, Alert, Chip, InputAdornment,
  IconButton, Avatar, List, ListItem,
  ListItemText, ListItemSecondaryAction, alpha,
} from '@mui/material';
import {
  Lock as LockIcon,
  Visibility, VisibilityOff,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  QrCode as QrCodeIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const ORANGE = '#FF6B35';

const SectionCard = ({ title, subtitle, icon, children }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
    <Card className="glass-card" sx={{ mb: 4, overflow: 'visible', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
      <CardContent sx={{ p: { xs: 3, md: 5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
          <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: alpha(ORANGE, 0.1), border: `1px solid ${alpha(ORANGE, 0.2)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ORANGE }}>
            {React.cloneElement(icon, { sx: { fontSize: 22 } })}
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>{title}</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{subtitle}</Typography>
          </Box>
        </Box>
        <Divider sx={{ mb: 4, borderColor: 'rgba(255,255,255,0.05)' }} />
        {children}
      </CardContent>
    </Card>
  </motion.div>
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
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaData, setMfaData] = useState(null);
  const [mfaToken, setMfaToken] = useState('');
  const [mfaEnabled, setMfaEnabled] = useState(user?.twoFactorEnabled || false);
  const [notifPrefs, setNotifPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mdm_notif_prefs') || '{}'); } catch { return {}; }
  });

  const notifOptions = [
    { key: 'deviceOffline', label: 'NODE OFFLINE SIGNAL', desc: 'Alert when a hardware node loses telemetry' },
    { key: 'updateFailed', label: 'OTA DEPLOYMENT FAILURE', desc: 'Notify when a firmware update fails to execute' },
    { key: 'scheduleComplete', label: 'CAMPAIGN COMPLETION', desc: 'When a scheduled orchestration cycle finishes' },
    { key: 'newUser', label: 'IDENTITY PROVISIONING', desc: 'Admin alert for new account clearance requests' },
  ];

  const handlePasswordChange = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) return setError('Mismatch: Secrets do not align');
    setPwLoading(true);
    try {
      await api.put(`/users/${user?.id}/password`, { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('Security protocol successful: Password updated');
    } catch (err) {
      setError(err.response?.data?.error || 'Security breach: Failed to rotate secrets');
    } finally { setPwLoading(false); }
  };

  const handleGenerateMFA = async () => {
    setMfaLoading(true);
    try {
      const res = await api.get('/auth/2fa/generate');
      setMfaData(res.data);
    } catch (err) { setError('MFA Engine: Signal lost'); }
    finally { setMfaLoading(false); }
  };

  const handleEnableMFA = async () => {
    if (mfaToken.length < 6) return;
    setMfaLoading(true);
    try {
      const res = await api.post('/auth/verify-2fa', { userId: user.id, token: mfaToken });
      if (res.data.success) {
        setMfaEnabled(true);
        setMfaData(null);
        setSuccess('MFA Protocol established and active');
      }
    } catch (err) { setError('Validation error: Invalid OTP sequence'); }
    finally { setMfaLoading(false); }
  };

  const handleNotifToggle = (key) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    localStorage.setItem('mdm_notif_prefs', JSON.stringify(updated));
  };

  return (
    <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', mb: 1, textTransform: 'uppercase' }}>Configuration <span style={{ color: ORANGE }}>Center</span></Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.95rem', fontWeight: 600 }}>Manage administrative credentials and operational parameters</Typography>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 4, borderRadius: '12px', bgcolor: alpha('#10B981', 0.1), color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 4, borderRadius: '12px', bgcolor: alpha('#EF4444', 0.1), color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</Alert>}

      <SectionCard title="Operator Profile" subtitle="Identity and Clearance Level" icon={<PersonIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: ORANGE, fontWeight: 900, fontSize: '2rem', border: '4px solid rgba(255,255,255,0.05)', boxShadow: `0 10px 30px ${alpha(ORANGE, 0.3)}` }}>{getInitials(user?.name)}</Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 900, color: '#fff', fontSize: '1.5rem', mb: 0.5 }}>{user?.name}</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.4)', mb: 2.5, fontWeight: 700 }}>{user?.email}</Typography>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Chip label={user?.role?.toUpperCase()} size="small" sx={{ bgcolor: alpha(ORANGE, 0.1), color: ORANGE, fontWeight: 900, fontSize: '0.65rem' }} />
              <Chip label="IDENTITY VERIFIED" size="small" icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: '#10B981 !important' }} />} sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: '#10B981', fontWeight: 900, fontSize: '0.65rem' }} />
            </Box>
          </Box>
        </Box>
      </SectionCard>

      <SectionCard title="Security Protocols" subtitle="Credential Rotation and Access Control" icon={<SecurityIcon />}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <TextField fullWidth label="CURRENT SECRET" type={showPw.current ? 'text' : 'password'} value={pwForm.currentPassword} onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: 'rgba(255,255,255,0.2)', fontSize: 20 }} /></InputAdornment>, endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPw(p => ({ ...p, current: !p.current }))}>{showPw.current ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>, sx: { color: '#fff', height: 56, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.02)', '& fieldset': { borderColor: 'rgba(255,255,255,0.05)' } } }} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.3)', fontWeight: 800, fontSize: '0.7rem' } }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="NEW SECRET" type={showPw.new ? 'text' : 'password'} value={pwForm.newPassword} onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: 'rgba(255,255,255,0.2)', fontSize: 20 }} /></InputAdornment>, sx: { color: '#fff', height: 56, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.02)', '& fieldset': { borderColor: 'rgba(255,255,255,0.05)' } } }} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.3)', fontWeight: 800, fontSize: '0.7rem' } }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="VERIFY SECRET" type={showPw.confirm ? 'text' : 'password'} value={pwForm.confirmPassword} onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))} InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: 'rgba(255,255,255,0.2)', fontSize: 20 }} /></InputAdornment>, sx: { color: '#fff', height: 56, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.02)', '& fieldset': { borderColor: 'rgba(255,255,255,0.05)' } } }} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.3)', fontWeight: 800, fontSize: '0.7rem' } }} />
          </Grid>
        </Grid>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={handlePasswordChange} disabled={pwLoading || !pwForm.currentPassword} sx={{ py: 1.5, px: 4, borderRadius: '10px', bgcolor: ORANGE, fontWeight: 900, boxShadow: `0 8px 25px ${alpha(ORANGE, 0.3)}` }}>{pwLoading ? 'ROTATING...' : 'EXECUTE SECRET ROTATION'}</Button>
      </SectionCard>

      <SectionCard title="Multifactor Auth" subtitle="Hardware-Backed Identity Verification" icon={<ShieldIcon />}>
        {mfaEnabled ? (
          <Box sx={{ p: 3, borderRadius: '16px', bgcolor: 'rgba(16,185,129,0.03)', border: '1px solid rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircleIcon sx={{ color: '#10B981', fontSize: 28 }} /></Box>
            <Box><Typography sx={{ fontWeight: 900, color: '#fff' }}>CRYPTO-SHIELD ACTIVE</Typography><Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 600 }}>Multi-step verification is enforced for this operator.</Typography></Box>
          </Box>
        ) : mfaData ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: '12px' }}><img src={mfaData.qr} alt="MFA QR" style={{ width: 180, height: 180, display: 'block' }} /></Box>
            <Box sx={{ width: '100%', maxWidth: 300 }}>
              <TextField fullWidth placeholder="000 000" value={mfaToken} onChange={e => setMfaToken(e.target.value.replace(/\D/g, '').slice(0, 6))} InputProps={{ sx: { color: ORANGE, fontWeight: 900, height: 60, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.02)', fontSize: '1.5rem', '& input': { textAlign: 'center', letterSpacing: '0.4em' } } }} />
              <Button fullWidth variant="contained" onClick={handleEnableMFA} disabled={mfaLoading || mfaToken.length < 6} sx={{ mt: 3, py: 1.5, borderRadius: '10px', bgcolor: '#10B981', fontWeight: 900 }}>ESTABLISH TRUST</Button>
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, mb: 4, lineHeight: 1.6 }}>Enforce hardware-backed MFA to significantly harden this administrative node against unauthorized access.</Typography>
            <Button variant="outlined" startIcon={<QrCodeIcon />} onClick={handleGenerateMFA} sx={{ py: 1.5, px: 4, borderRadius: '10px', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 800 }}>PROVISION MFA</Button>
          </Box>
        )}
      </SectionCard>

      <SectionCard title="Telemetry Rules" subtitle="Granular Alert Thresholds" icon={<NotificationsIcon />}>
        <List disablePadding>
          {notifOptions.map((opt, i) => (
            <ListItem key={opt.key} sx={{ py: 2.5, px: 0, borderBottom: i < notifOptions.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
              <ListItemText primary={<Typography sx={{ fontWeight: 900, color: '#fff', fontSize: '0.9rem', letterSpacing: '0.05em' }}>{opt.label}</Typography>} secondary={<Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontWeight: 600 }}>{opt.desc}</Typography>} />
              <ListItemSecondaryAction><Switch checked={!!notifPrefs[opt.key]} onChange={() => handleNotifToggle(opt.key)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: ORANGE }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: ORANGE } }} /></ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </SectionCard>
    </Box>
  );
}
