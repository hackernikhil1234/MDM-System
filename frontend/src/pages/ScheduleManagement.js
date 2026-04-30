import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  alpha,
  useTheme,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Warning as WarningIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { schedules, versions } from '../services/api';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import EmptyState from '../components/EmptyState';

const ORANGE = '#FF6B35';

function ScheduleManagement() {
  const theme = useTheme();
  const [scheduleList, setScheduleList] = useState([]);
  const [versionList, setVersionList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    fromVersionCode: '',
    toVersionCode: '',
    targetCriteria: {
      regions: [],
      cities: [],
      percentage: 100,
    },
    scheduleType: 'immediate',
    scheduledTime: '',
    phasedConfig: {
      batchSize: 100,
      batchInterval: 60,
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schedulesRes, versionsRes] = await Promise.all([
        schedules.getAll(),
        versions.getAll()
      ]);
      setScheduleList(schedulesRes.data.schedules || []);
      setVersionList(versionsRes.data.versions || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async () => {
    try {
      setLoading(true);
      await schedules.delete(scheduleToDelete._id);
      setDeleteDialogOpen(false);
      await fetchData();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to delete schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async () => {
    try {
      if (!formData.name) return setError('Schedule name is required');
      if (!formData.fromVersionCode) return setError('Source version is required');
      if (!formData.toVersionCode) return setError('Target version is required');
      if (formData.toVersionCode < formData.fromVersionCode) return setError('Cannot schedule a downgrade');

      setLoading(true);
      await schedules.create(formData);
      setDialogOpen(false);
      setFormData({
        name: '',
        description: '',
        fromVersionCode: '',
        toVersionCode: '',
        targetCriteria: { regions: [], cities: [], percentage: 100 },
        scheduleType: 'immediate',
        scheduledTime: '',
        phasedConfig: { batchSize: 100, batchInterval: 60 },
      });
      await fetchData();
      setError(null);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSchedule = async (id) => {
    try {
      setLoading(true);
      await schedules.approve(id);
      await fetchData();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to approve schedule');
    } finally {
      setLoading(false);
    }
  };


  const getStatusChipStyle = (status) => {
    const styles = {
      completed: { bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main },
      in_progress: { bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main },
      approved: { bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main },
      pending_approval: { bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main },
      cancelled: { bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main },
      failed: { bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main },
    };
    return {
      ...(styles[status] || { bgcolor: alpha(theme.palette.grey[500], 0.1), color: theme.palette.grey[500] }),
      border: '1px solid currentColor',
      fontWeight: 800,
      fontSize: '0.6rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    };
  };

  const stats = {
    total: scheduleList.length,
    inProgress: scheduleList.filter(s => s.status === 'in_progress').length,
    pending: scheduleList.filter(s => s.status === 'pending_approval').length,
    completed: scheduleList.filter(s => s.status === 'completed').length,
    cancelled: scheduleList.filter(s => s.status === 'cancelled').length,
  };

  const premiumDialogProps = {
    PaperProps: {
      sx: {
        bgcolor: '#1a1a2e',
        backgroundImage: 'none',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 4,
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        color: '#fff'
      }
    }
  };

  return (
    <PageTransition>
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: 4,
          p: { xs: 3, md: 4 },
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.05)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        }}>
          <Box sx={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(ORANGE, 0.08)} 0%, transparent 70%)`, pointerEvents: 'none' }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3, position: 'relative', zIndex: 1 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', mb: 1, letterSpacing: '-0.03em' }}>Update Rollouts</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', fontWeight: 500 }}>Orchestrate and monitor firmware deployments across your fleet</Typography>
            </Box>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} sx={{ bgcolor: ORANGE, color: '#fff', borderRadius: 2, fontWeight: 800, px: 3, '&:hover': { bgcolor: '#E55A2B', transform: 'translateY(-2px)' }, boxShadow: `0 8px 20px ${alpha(ORANGE, 0.3)}`, transition: 'all 0.2s' }}>
              Create Campaign
            </Button>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { title: 'Total Campaigns', value: stats.total, icon: <ScheduleIcon />, color: '#3B82F6' },
            { title: 'In Progress', value: stats.inProgress, icon: <PlayIcon />, color: '#10B981' },
            { title: 'Awaiting Approval', value: stats.pending, icon: <WarningIcon />, color: '#F59E0B' },
            { title: 'Finalized', value: stats.completed, icon: <CheckCircleIcon />, color: '#8B5CF6' },
            { title: 'Cancelled', value: stats.cancelled, icon: <CancelIcon />, color: '#EF4444' }
          ].map((stat, i) => (
            <Grid item xs={12} sm={6} md={2.4} key={i}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="glass-card" sx={{ border: `1px solid ${alpha(stat.color, 0.1)}` }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '10px', background: `${stat.color}15`, border: `1px solid ${stat.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, mb: 2 }}>
                      {stat.icon}
                    </Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{stat.title}</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', mt: 0.5 }}>{stat.value}</Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Card className="glass-card" sx={{ p: 0, overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {['Campaign', 'Pathway', 'Strategy', 'Criteria', 'Status', 'Progress', 'Actions'].map((head) => (
                    <TableCell key={head} sx={{ bgcolor: '#0f172a', color: 'rgba(255,255,255,0.4)', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{head}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? <TableRow><TableCell colSpan={7}><LinearProgress sx={{ bgcolor: '#1a1a1a', '& .MuiLinearProgress-bar': { bgcolor: ORANGE } }} /></TableCell></TableRow> :
                  scheduleList.length === 0 ? <TableRow><TableCell colSpan={7}><EmptyState icon={<ScheduleIcon sx={{ fontSize: 48 }} />} title="No campaigns found" description="Initialize your first rollout to start managing updates." actionText="Create Campaign" onAction={() => setDialogOpen(true)} /></TableCell></TableRow> :
                  <AnimatePresence>
                    {scheduleList.map((schedule, index) => (
                      <motion.tr key={schedule._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'table-row' }}>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#fff' }}>{schedule.name}</Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{format(new Date(schedule.createdAt), 'MMM dd, yyyy')}</Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'rgba(255,255,255,0.3)' }}>v{schedule.fromVersionCode}</Typography>
                            <Box sx={{ width: 12, height: 1, bgcolor: 'rgba(255,255,255,0.1)' }} />
                            <Typography variant="caption" sx={{ fontWeight: 800, color: ORANGE }}>v{schedule.toVersionCode}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <Chip label={schedule.scheduleType} size="small" sx={{ bgcolor: alpha('#3B82F6', 0.1), color: '#3B82F6', border: '1px solid currentColor', fontWeight: 800, fontSize: '0.6rem' }} />
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }} />
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: '0.8rem' }}>{schedule.targetCriteria?.regions?.length || 'Global'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <Chip label={schedule.status.replace(/_/g, ' ')} size="small" sx={getStatusChipStyle(schedule.status)} />
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <Box sx={{ width: 120 }}>
                            <LinearProgress variant="determinate" value={schedule.stats?.totalDevices ? (schedule.stats.completedDevices / schedule.stats.totalDevices) * 100 : 0} sx={{ height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: ORANGE } }} />
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700, mt: 0.5, display: 'block', fontSize: '0.6rem' }}>{schedule.stats?.completedDevices || 0} / {schedule.stats?.totalDevices || 0} UNITS</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <IconButton size="small" onClick={() => { setSelectedSchedule(schedule); setDetailsDialogOpen(true); }} sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.05)' } }}><VisibilityIcon fontSize="small" /></IconButton>
                            {schedule.status === 'pending_approval' && <IconButton size="small" onClick={() => handleApproveSchedule(schedule._id)} sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#10B981', bgcolor: 'rgba(16, 185, 129, 0.1)' } }}><CheckCircleIcon fontSize="small" /></IconButton>}
                            {(schedule.status === 'completed' || schedule.status === 'cancelled') && <IconButton size="small" onClick={() => { setScheduleToDelete(schedule); setDeleteDialogOpen(true); }} sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#EF4444', bgcolor: 'rgba(239, 68, 68, 0.1)' } }}><DeleteIcon fontSize="small" /></IconButton>}
                          </Box>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                }
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Create Campaign Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth {...premiumDialogProps}>
          <DialogTitle sx={{ p: 3, fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Configure Rollout Campaign</DialogTitle>
          <DialogContent sx={{ p: 3, mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}><TextField fullWidth label="Campaign Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} variant="outlined" required sx={{ '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&.Mui-focused fieldset': { borderColor: ORANGE } }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.4)' } }} /></Grid>
              <Grid item xs={6}>
                <FormControl fullWidth variant="outlined" required>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.4)' }}>Source Version</InputLabel>
                  <Select value={formData.fromVersionCode} onChange={(e) => setFormData({ ...formData, fromVersionCode: e.target.value })} label="Source Version" sx={{ color: '#fff', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ORANGE } }}>
                    {versionList.map(v => <MenuItem key={v.versionCode} value={v.versionCode}>v{v.versionName} (Build {v.versionCode})</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth variant="outlined" required>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.4)' }}>Target Version</InputLabel>
                  <Select value={formData.toVersionCode} onChange={(e) => setFormData({ ...formData, toVersionCode: e.target.value })} label="Target Version" sx={{ color: '#fff', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ORANGE } }}>
                    {versionList.map(v => <MenuItem key={v.versionCode} value={v.versionCode}>v{v.versionName} (Build {v.versionCode})</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}><Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} /></Grid>
              <Grid item xs={12}><Typography variant="subtitle2" sx={{ color: ORANGE, fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase' }}>Target Acquisition</Typography></Grid>
              <Grid item xs={8}><TextField fullWidth label="Regions" placeholder="Global, APAC..." value={formData.targetCriteria.regions.join(', ')} onChange={(e) => setFormData({ ...formData, targetCriteria: { ...formData.targetCriteria, regions: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } })} sx={{ '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }} /></Grid>
              <Grid item xs={4}><TextField fullWidth label="Sampling (%)" type="number" value={formData.targetCriteria.percentage} onChange={(e) => setFormData({ ...formData, targetCriteria: { ...formData.targetCriteria, percentage: e.target.value } })} sx={{ '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }} /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 4, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <Button onClick={() => setDialogOpen(false)} sx={{ color: 'rgba(255,255,255,0.4)' }}>Cancel</Button>
            <Button onClick={handleCreateSchedule} variant="contained" sx={{ bgcolor: ORANGE, fontWeight: 800, px: 4, '&:hover': { bgcolor: '#E55A2B' } }}>Initiate Rollout</Button>
          </DialogActions>
        </Dialog>

        {/* Details Dialog */}
        <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="sm" fullWidth {...premiumDialogProps}>
          {selectedSchedule && (
            <>
              <DialogTitle sx={{ p: 3, fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Campaign Intelligence</DialogTitle>
              <DialogContent sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 800 }}>Manifest Name</Typography>
                  <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800 }}>{selectedSchedule.name}</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}><Card sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', p: 2 }}><Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', display: 'block' }}>Pathway</Typography><Typography variant="body1" sx={{ color: '#fff', fontWeight: 700 }}>v{selectedSchedule.fromVersionCode} → v{selectedSchedule.toVersionCode}</Typography></Card></Grid>
                  <Grid item xs={6}><Card sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', p: 2 }}><Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', display: 'block' }}>Status</Typography><Chip label={selectedSchedule.status} size="small" sx={getStatusChipStyle(selectedSchedule.status)} /></Card></Grid>
                  <Grid item xs={12}><Card sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', p: 2 }}><Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', display: 'block', mb: 1 }}>Fleet Saturation</Typography><Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><LinearProgress variant="determinate" value={(selectedSchedule.stats?.completedDevices / selectedSchedule.stats?.totalDevices) * 100 || 0} sx={{ flexGrow: 1, height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: ORANGE } }} /><Typography variant="body2" sx={{ color: '#fff', fontWeight: 800 }}>{Math.round((selectedSchedule.stats?.completedDevices / selectedSchedule.stats?.totalDevices) * 100) || 0}%</Typography></Box></Card></Grid>
                </Grid>
              </DialogContent>
              <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <Button onClick={() => setDetailsDialogOpen(false)} sx={{ color: 'rgba(255,255,255,0.4)' }}>Close Manifest</Button>
                {selectedSchedule.status === 'pending_approval' && <Button onClick={() => handleApproveSchedule(selectedSchedule._id)} variant="contained" sx={{ bgcolor: '#10B981' }}>Authorize Deployment</Button>}
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} {...premiumDialogProps}>
          <DialogTitle sx={{ fontWeight: 800 }}>Purge Campaign Record?</DialogTitle>
          <DialogContent><Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>This will permanently remove the campaign telemetry for "{scheduleToDelete?.name}". This action is irreversible.</Typography></DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: 'rgba(255,255,255,0.4)' }}>Abort</Button>
            <Button onClick={handleDeleteSchedule} variant="contained" color="error" sx={{ fontWeight: 800 }}>Purge Record</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageTransition>
  );
}

export default ScheduleManagement;