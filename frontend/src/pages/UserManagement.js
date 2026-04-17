import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Select, FormControl,
  InputLabel, Alert, Avatar, Tooltip, Switch, CircularProgress, InputAdornment,
  Card, CardContent, Grid,
} from '@mui/material';
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
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: { xs: '1.5rem', md: '2rem' } }}>
            User Management
          </Typography>
          <Typography sx={{ color: '#9CA3AF', mt: 0.5 }}>
            Manage team members, roles, and access permissions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setInviteDialog(true)}
          sx={{ background: 'linear-gradient(135deg, #FF6B35, #E55A2B)', borderRadius: 2.5, fontWeight: 700, boxShadow: '0 4px 14px rgba(255,107,53,0.35)', px: 3 }}
        >
          Add User
        </Button>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((s, i) => (
          <Grid item xs={6} sm={3} key={i}>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #F3F4F6' }}>
                <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1, color: s.color }}>
                    {s.icon}
                  </Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.6rem', color: '#1A1A2E' }}>{s.value}</Typography>
                  <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600 }}>{s.label}</Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Table */}
      <Paper sx={{ borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', overflow: 'hidden', border: '1px solid #F3F4F6' }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search users…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9CA3AF', fontSize: 18 }} /></InputAdornment> }}
            sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#F8F9FA', '& fieldset': { borderColor: '#E5E7EB' }, '&:hover fieldset': { borderColor: '#FF6B35' } } }}
          />
          <Chip label={`${filteredUsers.length} users`} size="small" sx={{ bgcolor: 'rgba(255,107,53,0.1)', color: '#FF6B35', fontWeight: 700 }} />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress sx={{ color: '#FF6B35' }} /></Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#FAFAFA' }}>
                  {['User', 'Role', 'Status', 'Last Login', 'Joined', 'Actions'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, color: '#6B7280', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', py: 1.5 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((u, i) => {
                  const rc = roleColors[u.role] || roleColors.viewer;
                  const isMe = u._id === currentUser?.id;
                  return (
                    <TableRow key={u._id} hover sx={{ '&:hover': { bgcolor: '#FAFAFA' } }}
                      component={motion.tr} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: avatarColor(u.name), fontWeight: 700, fontSize: '0.8rem' }}>
                            {getInitials(u.name)}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 700, color: '#1A1A2E', fontSize: '0.88rem' }}>
                              {u.name} {isMe && <Chip label="You" size="small" sx={{ ml: 0.5, height: 18, fontSize: '0.65rem', bgcolor: 'rgba(255,107,53,0.1)', color: '#FF6B35' }} />}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>{u.email}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          icon={rc.icon}
                          label={u.role.toUpperCase()} 
                          size="small" 
                          sx={{ 
                            bgcolor: rc.bg, 
                            color: rc.text, 
                            fontWeight: 800, 
                            fontSize: '0.65rem',
                            border: `1px solid ${rc.border}`,
                            '& .MuiChip-icon': { color: 'inherit' }
                          }} 
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Switch
                            checked={u.isActive}
                            onChange={() => !isMe && handleToggle(u._id)}
                            disabled={isMe}
                            size="small"
                            sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#10B981' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#10B981' } }}
                          />
                          <Typography variant="caption" sx={{ color: u.isActive ? '#10B981' : '#EF4444', fontWeight: 600 }}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: '#6B7280' }}>
                          {u.lastLogin ? format(new Date(u.lastLogin), 'MMM d, yyyy HH:mm') : 'Never'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: '#6B7280' }}>
                          {u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Change Role">
                            <IconButton size="small" disabled={isMe}
                              onClick={() => { setRoleDialog(u); setNewRole(u.role); }}
                              sx={{ color: '#3B82F6', '&:hover': { bgcolor: 'rgba(59,130,246,0.08)' }, '&:disabled': { color: '#D1D5DB' } }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete User">
                            <IconButton size="small" disabled={isMe}
                              onClick={() => setDeleteDialog(u)}
                              sx={{ color: '#EF4444', '&:hover': { bgcolor: 'rgba(239,68,68,0.08)' }, '&:disabled': { color: '#D1D5DB' } }}>
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
      </Paper>

      {/* Role Change Dialog */}
      <Dialog open={!!roleDialog} onClose={() => setRoleDialog(null)} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#1A1A2E' }}>Change Role</DialogTitle>
        <DialogContent sx={{ minWidth: 320 }}>
          <Typography sx={{ mb: 2, color: '#6B7280', fontSize: '0.9rem' }}>
            Update role for <strong>{roleDialog?.name}</strong>
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select value={newRole} label="Role" onChange={e => setNewRole(e.target.value)} sx={{ borderRadius: 2 }}>
              <MenuItem value="viewer">Viewer — Read-only access</MenuItem>
              <MenuItem value="manager">Manager — Can manage devices & schedules</MenuItem>
              <MenuItem value="admin">Admin — Full system access</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setRoleDialog(null)} sx={{ borderRadius: 2, color: '#6B7280' }}>Cancel</Button>
          <Button variant="contained" onClick={handleRoleChange}
            sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #FF6B35, #E55A2B)', fontWeight: 700 }}>
            Update Role
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#EF4444' }}>Delete User</DialogTitle>
        <DialogContent sx={{ minWidth: 320 }}>
          <Typography sx={{ color: '#6B7280' }}>
            Are you sure you want to delete <strong>{deleteDialog?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setDeleteDialog(null)} sx={{ borderRadius: 2, color: '#6B7280' }}>Cancel</Button>
          <Button variant="contained" onClick={handleDelete} disabled={deleting}
            sx={{ borderRadius: 2, bgcolor: '#EF4444', '&:hover': { bgcolor: '#DC2626' }, fontWeight: 700 }}>
            {deleting ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Delete User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={inviteDialog} onClose={() => setInviteDialog(false)} PaperProps={{ sx: { borderRadius: 3, p: 1 } }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#1A1A2E' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShieldIcon sx={{ color: '#FF6B35' }} /> Add New User
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
            <TextField fullWidth label="Full Name" value={inviteForm.name} onChange={e => setInviteForm(p => ({ ...p, name: e.target.value }))}
              InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#9CA3AF', fontSize: 18 }} /></InputAdornment> }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            <TextField fullWidth label="Email Address" type="email" value={inviteForm.email} onChange={e => setInviteForm(p => ({ ...p, email: e.target.value }))}
              InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#9CA3AF', fontSize: 18 }} /></InputAdornment> }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            <TextField fullWidth label="Temporary Password" type="password" value={inviteForm.password} onChange={e => setInviteForm(p => ({ ...p, password: e.target.value }))}
              helperText="Min. 8 characters"
              InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#9CA3AF', fontSize: 18 }} /></InputAdornment> }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <InputLabel>Role</InputLabel>
              <Select value={inviteForm.role} label="Role" onChange={e => setInviteForm(p => ({ ...p, role: e.target.value }))}>
                <MenuItem value="viewer">Viewer</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <TextField fullWidth label="Organization (optional)" value={inviteForm.organization} onChange={e => setInviteForm(p => ({ ...p, organization: e.target.value }))}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setInviteDialog(false)} sx={{ borderRadius: 2, color: '#6B7280' }}>Cancel</Button>
          <Button variant="contained" onClick={handleInvite} disabled={inviteLoading}
            sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #FF6B35, #E55A2B)', fontWeight: 700, px: 3 }}>
            {inviteLoading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Add User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
