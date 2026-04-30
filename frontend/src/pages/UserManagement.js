import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Select, FormControl,
  InputLabel, Alert, Avatar, Tooltip, Switch, CircularProgress, InputAdornment,
  Card, CardContent, Grid, alpha,
} from '@mui/material';

const ORANGE = '#FF6B35';
import {
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Shield as ShieldIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  AdminPanelSettings as AdminIcon,
  ManageAccounts as ManagerIcon,
  Visibility as ViewerIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

const roleColors = {
  admin: { bg: 'rgba(255,107,53,0.08)', text: '#FF6B35', border: 'rgba(255,107,53,0.3)', icon: <AdminIcon sx={{ fontSize: 14 }} /> },
  manager: { bg: 'rgba(59,130,246,0.08)', text: '#3B82F6', border: 'rgba(59,130,246,0.3)', icon: <ManagerIcon sx={{ fontSize: 14 }} /> },
  viewer: { bg: 'rgba(16,185,129,0.08)', text: '#10B981', border: 'rgba(16,185,129,0.3)', icon: <ViewerIcon sx={{ fontSize: 14 }} /> },
};

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function avatarColor(name = '') {
  const colors = ['#FF6B35','#3B82F6','#10B981','#8B5CF6','#F59E0B','#EF4444'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [roleDialog, setRoleDialog] = useState(null);
  const [inviteDialog, setInviteDialog] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', password: '', role: 'viewer', organization: '' });
  const [inviteLoading, setInviteLoading] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { 'x-auth-token': token };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/users', { headers });
      setUsers(res.data.users || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = async (userId) => {
    try {
      const res = await api.put(`/users/${userId}/toggle`, {}, { headers });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: res.data.user.isActive } : u));
      setSuccess('User status updated');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleRoleChange = async () => {
    try {
      const res = await api.put(`/users/${roleDialog._id}/role`, { role: newRole }, { headers });
      setUsers(prev => prev.map(u => u._id === roleDialog._id ? { ...u, role: res.data.user.role } : u));
      setRoleDialog(null);
      setSuccess('Role updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update role');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/users/${deleteDialog._id}`, { headers });
      setUsers(prev => prev.filter(u => u._id !== deleteDialog._id));
      setDeleteDialog(null);
      setSuccess('User deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const handleInvite = async () => {
    setInviteLoading(true);
    try {
      const res = await api.post('/auth/register', inviteForm);
      if (res.data.success) {
        // Update the role if not viewer
        if (inviteForm.role !== 'viewer') {
          await api.put(`/users/${res.data.user.id}/role`, { role: inviteForm.role }, { headers });
        }
        setInviteDialog(false);
        setInviteForm({ name: '', email: '', password: '', role: 'viewer', organization: '' });
        fetchUsers();
        setSuccess('User invited successfully');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to invite user');
    } finally {
      setInviteLoading(false);
    }
  };

  // Stats
  const stats = [
    { label: 'Total Users', value: users.length, color: '#FF6B35', icon: <PersonIcon /> },
    { label: 'Admins', value: users.filter(u => u.role === 'admin').length, color: '#8B5CF6', icon: <AdminIcon /> },
    { label: 'Active Users', value: users.filter(u => u.isActive).length, color: '#10B981', icon: <CheckCircleIcon /> },
    { label: 'Inactive', value: users.filter(u => !u.isActive).length, color: '#EF4444', icon: <BlockIcon /> },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Premium Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: 4,
          p: { xs: 3, md: 4 },
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.05)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        }}
      >
        <Box sx={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(ORANGE, 0.08)} 0%, transparent 70%)`, pointerEvents: 'none' }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3, position: 'relative', zIndex: 1 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', mb: 1, letterSpacing: '-0.03em' }}>
              Personnel Directory
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', fontWeight: 500 }}>
              Oversee administrative access and manage team permissions
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setInviteDialog(true)}
            sx={{ bgcolor: ORANGE, color: '#fff', borderRadius: 2, fontWeight: 800, px: 3, '&:hover': { bgcolor: '#E55A2B', transform: 'translateY(-2px)' }, boxShadow: `0 8px 20px ${alpha(ORANGE, 0.3)}`, transition: 'all 0.2s' }}
          >
            Add Operator
          </Button>
        </Box>
      </Box>


      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((s, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="glass-card" sx={{ border: `1px solid ${alpha(s.color, 0.1)}` }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '10px', background: `${s.color}15`, border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, mb: 2 }}>
                    {s.icon}
                  </Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {s.label}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', mt: 0.5 }}>{s.value}</Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>


      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Personnel Table */}
      <Card className="glass-card" sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search operator by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{ 
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 20 }} /></InputAdornment>,
              sx: { color: '#fff' }
            }}
            sx={{ 
              flex: 1, 
              minWidth: 300,
              '& .MuiOutlinedInput-root': { 
                borderRadius: 2, 
                bgcolor: 'rgba(255,255,255,0.03)', 
                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, 
                '&:hover fieldset': { borderColor: alpha(ORANGE, 0.5) },
                '&.Mui-focused fieldset': { borderColor: ORANGE }
              } 
            }}
          />
          <Chip label={`${filteredUsers.length} Operators Enrolled`} sx={{ bgcolor: alpha(ORANGE, 0.1), color: ORANGE, fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase' }} />
        </Box>


        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress sx={{ color: '#FF6B35' }} /></Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {['OPERATOR', 'CLEARANCE LEVEL', 'CLEARANCE STATUS', 'LAST SESSION', 'ENROLLMENT', 'OPERATIONS'].map(h => (
                    <TableCell key={h} sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredUsers.map((u, i) => {
                  const rc = roleColors[u.role] || roleColors.viewer;
                  const isMe = u._id === currentUser?.id;
                  return (
                    <TableRow key={u._id} hover sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}
                      component={motion.tr} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                      <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar 
                            sx={{ 
                              width: 38, 
                              height: 38, 
                              bgcolor: avatarColor(u.name), 
                              fontWeight: 800, 
                              fontSize: '0.85rem',
                              border: '2px solid rgba(255,255,255,0.1)',
                              boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                            }}
                          >
                            {getInitials(u.name)}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                              {u.name} 
                              {isMe && <Chip label="CURRENT SESSION" size="small" sx={{ height: 16, fontSize: '0.55rem', fontWeight: 800, bgcolor: alpha(ORANGE, 0.1), color: ORANGE, border: `1px solid ${alpha(ORANGE, 0.2)}` }} />}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{u.email}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <Chip 
                          icon={rc.icon}
                          label={u.role.toUpperCase()} 
                          size="small" 
                          sx={{ 
                            bgcolor: alpha(rc.text, 0.1), 
                            color: rc.text, 
                            fontWeight: 800, 
                            fontSize: '0.65rem',
                            border: `1px solid ${alpha(rc.text, 0.2)}`,
                            '& .MuiChip-icon': { color: 'inherit' },
                            letterSpacing: '0.05em'
                          }} 
                        />
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Switch
                            checked={u.isActive}
                            onChange={() => !isMe && handleToggle(u._id)}
                            disabled={isMe}
                            size="small"
                            sx={{ 
                              '& .MuiSwitch-switchBase.Mui-checked': { color: '#10B981' }, 
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#10B981' },
                              '& .MuiSwitch-track': { bgcolor: 'rgba(255,255,255,0.1)' }
                            }}
                          />
                          <Typography variant="caption" sx={{ color: u.isActive ? '#10B981' : '#EF4444', fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase' }}>
                            {u.isActive ? 'ACTIVE' : 'LOCKED'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>
                          {u.lastLogin ? format(new Date(u.lastLogin), 'MMM d, HH:mm') : 'NO SESSIONS'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>
                          {u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Elevate/Demote Clearance">
                            <IconButton size="small" disabled={isMe}
                              onClick={() => { setRoleDialog(u); setNewRole(u.role); }}
                              sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#3B82F6', bgcolor: 'rgba(59,130,246,0.1)' }, '&:disabled': { color: 'rgba(255,255,255,0.1)' } }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Purge Record">
                            <IconButton size="small" disabled={isMe}
                              onClick={() => setDeleteDialog(u)}
                              sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#EF4444', bgcolor: 'rgba(239,68,68,0.1)' }, '&:disabled': { color: 'rgba(255,255,255,0.1)' } }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>

                  );
                })}
                {filteredUsers.length === 0 && !loading && (
                  <TableRow><TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: '#9CA3AF' }}>No users found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Role Change Dialog */}
      <Dialog 
        open={!!roleDialog} 
        onClose={() => setRoleDialog(null)} 
        PaperProps={{ 
          sx: { 
            bgcolor: '#1a1a2e', 
            borderRadius: 3, 
            p: 1, 
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            color: '#fff'
          } 
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Adjust Clearance Level</DialogTitle>
        <DialogContent sx={{ minWidth: 320, mt: 2 }}>
          <Typography sx={{ mb: 3, color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', fontWeight: 600 }}>
            Modify administrative privileges for <strong style={{ color: '#fff' }}>{roleDialog?.name}</strong>
          </Typography>
          <FormControl fullWidth>
            <InputLabel sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Clearance Level</InputLabel>
            <Select 
              value={newRole} 
              label="Clearance Level" 
              onChange={e => setNewRole(e.target.value)} 
              sx={{ 
                borderRadius: 2,
                color: '#fff',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(ORANGE, 0.5) },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ORANGE },
                bgcolor: 'rgba(255,255,255,0.02)'
              }}
            >
              <MenuItem value="viewer" sx={{ fontWeight: 600 }}>Viewer — Restricted Access</MenuItem>
              <MenuItem value="manager" sx={{ fontWeight: 600 }}>Manager — Operational Access</MenuItem>
              <MenuItem value="admin" sx={{ fontWeight: 600 }}>Admin — Full Clearance</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 2, borderTop: '1px solid rgba(255,255,255,0.05)', pt: 2 }}>
          <Button onClick={() => setRoleDialog(null)} sx={{ borderRadius: 2, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>Abort</Button>
          <Button 
            variant="contained" 
            onClick={handleRoleChange}
            sx={{ borderRadius: 2, bgcolor: ORANGE, fontWeight: 800, px: 3, '&:hover': { bgcolor: '#E55A2B' } }}
          >
            Commit Change
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog 
        open={!!deleteDialog} 
        onClose={() => setDeleteDialog(null)} 
        PaperProps={{ 
          sx: { 
            bgcolor: '#1a1a2e', 
            borderRadius: 3, 
            p: 1, 
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            color: '#fff'
          } 
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#EF4444', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Purge Personnel Record</DialogTitle>
        <DialogContent sx={{ minWidth: 320, mt: 2 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
            Are you certain you wish to purge <strong style={{ color: '#fff' }}>{deleteDialog?.name}</strong>? This operation is irreversible and all associated logs will be archived.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 2, borderTop: '1px solid rgba(255,255,255,0.05)', pt: 2 }}>
          <Button onClick={() => setDeleteDialog(null)} sx={{ borderRadius: 2, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleDelete} 
            disabled={deleting}
            sx={{ borderRadius: 2, bgcolor: '#EF4444', '&:hover': { bgcolor: '#DC2626' }, fontWeight: 800, px: 3 }}
          >
            {deleting ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Confirm Purge'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog 
        open={inviteDialog} 
        onClose={() => setInviteDialog(false)} 
        PaperProps={{ 
          sx: { 
            bgcolor: '#1a1a2e', 
            borderRadius: 3, 
            p: 1, 
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            color: '#fff'
          } 
        }} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ShieldIcon sx={{ color: ORANGE }} /> Enroll New Personnel
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
            
            <TextField 
              fullWidth 
              label="Full Name" 
              value={inviteForm.name} 
              onChange={e => setInviteForm(p => ({ ...p, name: e.target.value }))}
              InputProps={{ 
                startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 20 }} /></InputAdornment>,
                sx: { color: '#fff' }
              }}
              InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.4)', fontWeight: 600 } }}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 2,
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                  '&:hover fieldset': { borderColor: alpha(ORANGE, 0.5) },
                  '&.Mui-focused fieldset': { borderColor: ORANGE },
                  bgcolor: 'rgba(255,255,255,0.02)'
                } 
              }} 
            />
            
            <TextField 
              fullWidth 
              label="Email Address" 
              type="email" 
              value={inviteForm.email} 
              onChange={e => setInviteForm(p => ({ ...p, email: e.target.value }))}
              InputProps={{ 
                startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 20 }} /></InputAdornment>,
                sx: { color: '#fff' }
              }}
              InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.4)', fontWeight: 600 } }}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 2,
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                  '&:hover fieldset': { borderColor: alpha(ORANGE, 0.5) },
                  '&.Mui-focused fieldset': { borderColor: ORANGE },
                  bgcolor: 'rgba(255,255,255,0.02)'
                } 
              }} 
            />
            
            <TextField 
              fullWidth 
              label="Access Password" 
              type="password" 
              value={inviteForm.password} 
              onChange={e => setInviteForm(p => ({ ...p, password: e.target.value }))}
              helperText="Minimum 8 alphanumeric characters required"
              FormHelperTextProps={{ sx: { color: 'rgba(255,255,255,0.3)', fontWeight: 600 } }}
              InputProps={{ 
                startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 20 }} /></InputAdornment>,
                sx: { color: '#fff' }
              }}
              InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.4)', fontWeight: 600 } }}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 2,
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                  '&:hover fieldset': { borderColor: alpha(ORANGE, 0.5) },
                  '&.Mui-focused fieldset': { borderColor: ORANGE },
                  bgcolor: 'rgba(255,255,255,0.02)'
                } 
              }} 
            />
            
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Assigned Clearance</InputLabel>
              <Select 
                value={inviteForm.role} 
                label="Assigned Clearance" 
                onChange={e => setInviteForm(p => ({ ...p, role: e.target.value }))}
                sx={{ 
                  borderRadius: 2,
                  color: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(ORANGE, 0.5) },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ORANGE },
                  bgcolor: 'rgba(255,255,255,0.02)'
                }}
              >
                <MenuItem value="viewer" sx={{ fontWeight: 600 }}>Viewer</MenuItem>
                <MenuItem value="manager" sx={{ fontWeight: 600 }}>Manager</MenuItem>
                <MenuItem value="admin" sx={{ fontWeight: 600 }}>Admin</MenuItem>
              </Select>
            </FormControl>
            
            <TextField 
              fullWidth 
              label="Organization (Optional)" 
              value={inviteForm.organization} 
              onChange={e => setInviteForm(p => ({ ...p, organization: e.target.value }))}
              InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.4)', fontWeight: 600 } }}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 2,
                  color: '#fff',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                  '&:hover fieldset': { borderColor: alpha(ORANGE, 0.5) },
                  '&.Mui-focused fieldset': { borderColor: ORANGE },
                  bgcolor: 'rgba(255,255,255,0.02)'
                } 
              }} 
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 4, gap: 2, borderTop: '1px solid rgba(255,255,255,0.05)', pt: 3 }}>
          <Button onClick={() => setInviteDialog(false)} sx={{ borderRadius: 2, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleInvite} 
            disabled={inviteLoading}
            sx={{ borderRadius: 2, bgcolor: ORANGE, fontWeight: 800, px: 4, '&:hover': { bgcolor: '#E55A2B' }, boxShadow: `0 8px 20px ${alpha(ORANGE, 0.2)}` }}
          >
            {inviteLoading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Finalize Enrollment'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
