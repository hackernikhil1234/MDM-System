import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
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
  Tooltip,
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
  Info as InfoIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { schedules, versions } from '../services/api';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import StatsCard from '../components/StatsCard';
import EmptyState from '../components/EmptyState';

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
      console.error('Error deleting schedule:', error);
      setError(error.response?.data?.error || 'Failed to delete schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async () => {
    try {
      // Validate form data
      if (!formData.name) {
        setError('Schedule name is required');
        return;
      }
      if (!formData.fromVersionCode) {
        setError('From version is required');
        return;
      }
      if (!formData.toVersionCode) {
        setError('To version is required');
        return;
      }

      // Check for downgrade
      if (formData.toVersionCode < formData.fromVersionCode) {
        setError('Cannot schedule a downgrade');
        return;
      }

      setLoading(true);
      const response = await schedules.create(formData);
      console.log('Schedule created:', response.data);
      setDialogOpen(false);
      
      // Reset form
      setFormData({
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
      
      await fetchData();
      setError(null);
    } catch (error) {
      console.error('Error creating schedule:', error);
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
      console.error('Error approving schedule:', error);
      setError(error.response?.data?.error || 'Failed to approve schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSchedule = async (id) => {
    try {
      setLoading(true);
      await schedules.cancel(id);
      await fetchData();
    } catch (error) {
      console.error('Error cancelling schedule:', error);
      setError(error.response?.data?.error || 'Failed to cancel schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (schedule) => {
    setSelectedSchedule(schedule);
    setDetailsDialogOpen(true);
  };

  const getStatusChipStyle = (status) => {
    switch (status) {
      case 'completed':
        return {
          bgcolor: alpha(theme.palette.success.main, 0.1),
          color: theme.palette.success.main,
          border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
        };
      case 'in_progress':
        return {
          bgcolor: alpha(theme.palette.info.main, 0.1),
          color: theme.palette.info.main,
          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
        };
      case 'approved':
        return {
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          color: theme.palette.primary.main,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        };
      case 'pending_approval':
        return {
          bgcolor: alpha(theme.palette.warning.main, 0.1),
          color: theme.palette.warning.main,
          border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
        };
      case 'cancelled':
      case 'failed':
        return {
          bgcolor: alpha(theme.palette.error.main, 0.1),
          color: theme.palette.error.main,
          border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
        };
      default:
        return {
          bgcolor: alpha(theme.palette.grey[500], 0.1),
          color: theme.palette.grey[500],
          border: `1px solid ${alpha(theme.palette.grey[500], 0.2)}`,
        };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon fontSize="small" />;
      case 'in_progress': return <PlayIcon fontSize="small" />;
      case 'pending_approval': return <WarningIcon fontSize="small" />;
      case 'cancelled': return <CancelIcon fontSize="small" />;
      default: return <InfoIcon fontSize="small" />;
    }
  };

  const stats = {
    total: scheduleList.length,
    inProgress: scheduleList.filter(s => s.status === 'in_progress').length,
    pending: scheduleList.filter(s => s.status === 'pending_approval').length,
    completed: scheduleList.filter(s => s.status === 'completed').length,
    cancelled: scheduleList.filter(s => s.status === 'cancelled').length,
  };

  return (
    <PageTransition>
      <Box sx={{ flexGrow: 1 }}>
  const ORANGE = '#FF6B35';

  return (
    <PageTransition>
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
                Update Rollouts
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', fontWeight: 500 }}>
                Orchestrate and monitor firmware deployments across your fleet
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
              sx={{ bgcolor: ORANGE, color: '#fff', borderRadius: 2, fontWeight: 800, px: 3, '&:hover': { bgcolor: '#E55A2B', transform: 'translateY(-2px)' }, boxShadow: `0 8px 20px ${alpha(ORANGE, 0.3)}`, transition: 'all 0.2s' }}
            >
              Create Campaign
            </Button>
          </Box>
        </Box>


        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }} 
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
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
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', mt: 0.5 }}>{stat.value}</Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>


        {/* Schedules Table */}
        <Card className="glass-card" sx={{ p: 0, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>CAMPAIGN</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>VERSION PATH</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>STRATEGY</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>CRITERIA</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>STATUS</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>PROGRESS</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>METRICS</TableCell>
                  <TableCell align="right" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <LinearProgress sx={{ bgcolor: '#1a1a1a' }} />
                    </TableCell>
                  </TableRow>
                ) : scheduleList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <EmptyState
                        icon={<ScheduleIcon sx={{ fontSize: 48 }} />}
                        title="No schedules found"
                        description="Create your first update schedule to start rolling out updates."
                        actionText="Create Schedule"
                        onAction={() => setDialogOpen(true)}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  <AnimatePresence>
                    {scheduleList.map((schedule, index) => (
                      <motion.tr
                        key={schedule._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.05 }}
                        style={{ display: 'table-row' }}
                      >
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#ffffff' }}>
                            {schedule.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
                            {schedule.description?.substring(0, 50)}
                            {schedule.description?.length > 50 ? '...' : ''}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'rgba(255,255,255,0.3)' }}>v{schedule.fromVersionCode}</Typography>
                            <Box sx={{ width: 12, height: 1, bgcolor: 'rgba(255,255,255,0.1)' }} />
                            <Typography variant="caption" sx={{ fontWeight: 800, color: ORANGE }}>v{schedule.toVersionCode}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <Chip
                            label={schedule.scheduleType}
                            size="small"
                            sx={{
                              bgcolor: schedule.scheduleType === 'phased' 
                                ? alpha('#8B5CF6', 0.1)
                                : alpha('#3B82F6', 0.1),
                              color: schedule.scheduleType === 'phased' 
                                ? '#8B5CF6'
                                : '#3B82F6',
                              border: `1px solid ${schedule.scheduleType === 'phased' 
                                ? alpha('#8B5CF6', 0.2)
                                : alpha('#3B82F6', 0.2)}`,
                              fontWeight: 800,
                              fontSize: '0.65rem',
                              textTransform: 'uppercase'
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }} />
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: '0.8rem' }}>
                              {schedule.targetCriteria?.regions?.length || 'Global'}
                            </Typography>
                          </Box>
                          {schedule.targetCriteria?.percentage < 100 && (
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', display: 'block', fontWeight: 700 }}>
                              {schedule.targetCriteria.percentage}% Sample
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <Chip
                            label={schedule.status.replace(/_/g, ' ')}
                            size="small"
                            sx={{
                              ...getStatusChipStyle(schedule.status),
                              fontWeight: 800,
                              fontSize: '0.6rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <Box sx={{ width: 100 }}>
                            <LinearProgress
                              variant="determinate"
                              value={schedule.stats?.totalDevices ? 
                                ((schedule.stats.completedDevices + schedule.stats.failedDevices) / schedule.stats.totalDevices) * 100 : 0
                              }
                              sx={{ 
                                height: 4, 
                                borderRadius: 2,
                                bgcolor: 'rgba(255,255,255,0.05)',
                                '& .MuiLinearProgress-bar': {
                                  background: schedule.status === 'completed' ? '#10B981' :
                                             schedule.status === 'failed' ? '#EF4444' :
                                             `linear-gradient(90deg, ${ORANGE}, #FF8C5A)`
                                }
                              }}
                            />
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700, mt: 0.5, display: 'block', fontSize: '0.65rem' }}>
                              {schedule.stats?.completedDevices || 0} / {schedule.stats?.totalDevices || 0} COMPLETED
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700, fontSize: '0.8rem' }}>
                            {format(new Date(schedule.createdAt), 'MMM dd')}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
                            {schedule.createdBy?.userName?.split(' ')[0] || 'System'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                            <Tooltip title="Deep Analytics">
                              <IconButton 
                                size="small" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetails(schedule);
                                }}
                                sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#3B82F6', bgcolor: 'rgba(59, 130, 246, 0.1)' } }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            {schedule.status === 'pending_approval' && (
                              <>
                                <Tooltip title="Approve Execution">
                                  <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleApproveSchedule(schedule._id);
                                    }}
                                    sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#10B981', bgcolor: 'rgba(16, 185, 129, 0.1)' } }}
                                  >
                                    <CheckCircleIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Reject Execution">
                                  <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCancelSchedule(schedule._id);
                                    }}
                                    sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#EF4444', bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                                  >
                                    <CancelIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                            
                            {schedule.status === 'in_progress' && (
                              <Tooltip title="Kill Campaign">
                                <IconButton 
                                  size="small" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelSchedule(schedule._id);
                                  }}
                                  sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#EF4444', bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                                >
                                  <CancelIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            
                            {(schedule.status === 'draft' || schedule.status === 'cancelled' || schedule.status === 'completed') && (
                              <Tooltip title="Archive Record">
                                <IconButton 
                                  size="small" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setScheduleToDelete(schedule);
                                    setDeleteDialogOpen(true);
                                  }}
                                  sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#EF4444', bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>

                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Create Schedule Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={() => {
            setDialogOpen(false);
            setError(null);
            setFormData({
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
          }} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: '#1a1a2e',
              backgroundImage: 'none',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 3,
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
              color: '#fff'
            }
          }}
        >
          <DialogTitle sx={{ p: 3, fontWeight: 800, color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            Configure New Campaign
          </DialogTitle>

          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Schedule Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  variant="outlined"
                  required
                  error={!formData.name && error?.includes('name')}
                  InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.4)', fontWeight: 600 } }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      color: '#fff',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                      '&:hover fieldset': { borderColor: alpha(ORANGE, 0.5) },
                      '&.Mui-focused fieldset': { borderColor: ORANGE },
                      bgcolor: 'rgba(255,255,255,0.02)'
                    } 
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mission Objective (Description)"
                  multiline
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  variant="outlined"
                  InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.4)', fontWeight: 600 } }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      color: '#fff',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                      '&:hover fieldset': { borderColor: alpha(ORANGE, 0.5) },
                      '&.Mui-focused fieldset': { borderColor: ORANGE },
                      bgcolor: 'rgba(255,255,255,0.02)'
                    } 
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth variant="outlined" required>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Source Version</InputLabel>
                  <Select
                    value={formData.fromVersionCode}
                    onChange={(e) => setFormData({...formData, fromVersionCode: e.target.value})}
                    label="Source Version"
                    sx={{ 
                      color: '#fff',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(ORANGE, 0.5) },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ORANGE },
                      bgcolor: 'rgba(255,255,255,0.02)'
                    }}
                  >
                    {versionList.map(v => (
                      <MenuItem key={v.versionCode} value={v.versionCode} sx={{ fontWeight: 600 }}>
                        v{v.versionName} (ID: {v.versionCode})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth variant="outlined" required>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Target Version</InputLabel>
                  <Select
                    value={formData.toVersionCode}
                    onChange={(e) => setFormData({...formData, toVersionCode: e.target.value})}
                    label="Target Version"
                    sx={{ 
                      color: '#fff',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(ORANGE, 0.5) },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ORANGE },
                      bgcolor: 'rgba(255,255,255,0.02)'
                    }}
                  >
                    {versionList.map(v => (
                      <MenuItem key={v.versionCode} value={v.versionCode} sx={{ fontWeight: 600 }}>
                        v{v.versionName} (ID: {v.versionCode})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Rollout Strategy</InputLabel>
                  <Select
                    value={formData.scheduleType}
                    onChange={(e) => setFormData({...formData, scheduleType: e.target.value})}
                    label="Rollout Strategy"
                    sx={{ 
                      color: '#fff',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(ORANGE, 0.5) },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ORANGE },
                      bgcolor: 'rgba(255,255,255,0.02)'
                    }}
                  >
                    <MenuItem value="immediate" sx={{ fontWeight: 600 }}>Immediate Deployment</MenuItem>
                    <MenuItem value="scheduled" sx={{ fontWeight: 600 }}>Delayed Schedule</MenuItem>
                    <MenuItem value="phased" sx={{ fontWeight: 600 }}>Phased Wave Rollout</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {formData.scheduleType === 'scheduled' && (
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Deployment Time"
                    type="datetime-local"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                    InputLabelProps={{ shrink: true, sx: { color: 'rgba(255,255,255,0.4)', fontWeight: 600 } }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        color: '#fff',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                        '&:hover fieldset': { borderColor: alpha(ORANGE, 0.5) },
                        '&.Mui-focused fieldset': { borderColor: ORANGE },
                        bgcolor: 'rgba(255,255,255,0.02)'
                      } 
                    }}
                  />
                </Grid>
              )}
              {formData.scheduleType === 'phased' && (
                <>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Batch Payload Size"
                      type="number"
                      value={formData.phasedConfig.batchSize}
                      onChange={(e) => setFormData({
                        ...formData, 
                        phasedConfig: {...formData.phasedConfig, batchSize: parseInt(e.target.value)}
                      })}
                      InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.4)', fontWeight: 600 } }}
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          color: '#fff',
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                          '&:hover fieldset': { borderColor: alpha(ORANGE, 0.5) },
                          '&.Mui-focused fieldset': { borderColor: ORANGE },
                          bgcolor: 'rgba(255,255,255,0.02)'
                        } 
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Wave Interval (minutes)"
                      type="number"
                      value={formData.phasedConfig.batchInterval}
                      onChange={(e) => setFormData({
                        ...formData, 
                        phasedConfig: {...formData.phasedConfig, batchInterval: parseInt(e.target.value)}
                      })}
                      InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.4)', fontWeight: 600 } }}
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          color: '#fff',
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                          '&:hover fieldset': { borderColor: alpha(ORANGE, 0.5) },
                          '&.Mui-focused fieldset': { borderColor: ORANGE },
                          bgcolor: 'rgba(255,255,255,0.02)'
                        } 
                      }}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.05)' }} />
                <Typography variant="subtitle2" gutterBottom sx={{ color: ORANGE, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.7rem' }}>
                  Target Acquisition Criteria
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Target Regions"
                  placeholder="Global, APAC, EMEA..."
                  value={formData.targetCriteria.regions.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData,
                    targetCriteria: {
                      ...formData.targetCriteria,
                      regions: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }
                  })}
                  InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.4)', fontWeight: 600 } }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      color: '#fff',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                      '&:hover fieldset': { borderColor: alpha(ORANGE, 0.5) },
                      '&.Mui-focused fieldset': { borderColor: ORANGE },
                      bgcolor: 'rgba(255,255,255,0.02)'
                    } 
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Target Specific Cities"
                  placeholder="Optional city level targeting..."
                  value={formData.targetCriteria.cities.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData,
                    targetCriteria: {
                      ...formData.targetCriteria,
                      cities: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }
                  })}
                  InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.4)', fontWeight: 600 } }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      color: '#fff',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                      '&:hover fieldset': { borderColor: alpha(ORANGE, 0.5) },
                      '&.Mui-focused fieldset': { borderColor: ORANGE },
                      bgcolor: 'rgba(255,255,255,0.02)'
                    } 
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Rollout Sampling (%)"
                  type="number"
                  value={formData.targetCriteria.percentage}
                  onChange={(e) => setFormData({
                    ...formData,
                    targetCriteria: {
                      ...formData.targetCriteria,
                      percentage: parseInt(e.target.value)
                    }
                  })}
                  inputProps={{ min: 1, max: 100 }}
                  InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.4)', fontWeight: 600 } }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      color: '#fff',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                      '&:hover fieldset': { borderColor: alpha(ORANGE, 0.5) },
                      '&.Mui-focused fieldset': { borderColor: ORANGE },
                      bgcolor: 'rgba(255,255,255,0.02)'
                    } 
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 4, borderTop: '1px solid rgba(255,255,255,0.05)', gap: 2 }}>
            <Button onClick={() => setDialogOpen(false)} sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, '&:hover': { color: '#fff' } }}>
              Discard Changes
            </Button>
            <Button 
              onClick={handleCreateSchedule} 
              variant="contained"
              disabled={loading}
              sx={{ bgcolor: ORANGE, color: '#fff', fontWeight: 800, px: 4, borderRadius: 2, '&:hover': { bgcolor: '#E55A2B' }, boxShadow: `0 8px 20px ${alpha(ORANGE, 0.2)}` }}
            >
              Initiate Campaign
            </Button>
          </DialogActions>

        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog 
          open={deleteDialogOpen} 
          onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{
            sx: {
              bgcolor: '#111111',
              border: '1px solid #27272a',
              colorScheme: 'dark',
            },
            className: 'dark-container'
          }}
        >
          <DialogTitle sx={{ color: '#ffffff' }}>Delete Schedule</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action cannot be undone.
            </Alert>
            <Typography sx={{ color: '#e4e4e7' }}>
              Are you sure you want to delete schedule "{scheduleToDelete?.name}"?
            </Typography>
            {scheduleToDelete?.stats?.totalDevices > 0 && (
              <Typography sx={{ color: '#ef4444', mt: 2, fontSize: '0.875rem' }}>
                Warning: This schedule has {scheduleToDelete.stats.totalDevices} associated update jobs that will also be deleted.
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: '#a1a1aa' }}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteSchedule} 
              color="error" 
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Schedule Details Dialog */}
        <Dialog
          open={detailsDialogOpen}
          onClose={() => setDetailsDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: '#111111',
              border: '1px solid #27272a',
              colorScheme: 'dark',
            },
            className: 'dark-container'
          }}
        >
          {selectedSchedule && (
            <>
              <DialogTitle sx={{ color: '#ffffff', borderBottom: '1px solid #27272a' }}>
                Schedule Details
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ color: '#ffffff', mb: 2 }}>
                      {selectedSchedule.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#a1a1aa', mb: 3 }}>
                      {selectedSchedule.description || 'No description provided'}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Card sx={{ bgcolor: '#0a0a0a', border: '1px solid #27272a' }}>
                      <CardContent>
                        <Typography variant="caption" sx={{ color: '#71717a', display: 'block', mb: 1 }}>
                          Version Change
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 500 }}>
                          v{selectedSchedule.fromVersionCode} → v{selectedSchedule.toVersionCode}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={6}>
                    <Card sx={{ bgcolor: '#0a0a0a', border: '1px solid #27272a' }}>
                      <CardContent>
                        <Typography variant="caption" sx={{ color: '#71717a', display: 'block', mb: 1 }}>
                          Status
                        </Typography>
                        <Chip
                          label={selectedSchedule.status.replace(/_/g, ' ')}
                          icon={getStatusIcon(selectedSchedule.status)}
                          size="small"
                          sx={getStatusChipStyle(selectedSchedule.status)}
                        />
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={6}>
                    <Card sx={{ bgcolor: '#0a0a0a', border: '1px solid #27272a' }}>
                      <CardContent>
                        <Typography variant="caption" sx={{ color: '#71717a', display: 'block', mb: 1 }}>
                          Schedule Type
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 500, textTransform: 'capitalize' }}>
                          {selectedSchedule.scheduleType}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={6}>
                    <Card sx={{ bgcolor: '#0a0a0a', border: '1px solid #27272a' }}>
                      <CardContent>
                        <Typography variant="caption" sx={{ color: '#71717a', display: 'block', mb: 1 }}>
                          Created By
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 500 }}>
                          {selectedSchedule.createdBy?.userName || 'System'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#71717a' }}>
                          {format(new Date(selectedSchedule.createdAt), 'PPp')}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ color: '#ffffff', mb: 2 }}>
                      Target Criteria
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="caption" sx={{ color: '#71717a', display: 'block' }}>
                          Regions
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#e4e4e7' }}>
                          {selectedSchedule.targetCriteria?.regions?.length > 0 
                            ? selectedSchedule.targetCriteria.regions.join(', ') 
                            : 'All Regions'}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" sx={{ color: '#71717a', display: 'block' }}>
                          Cities
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#e4e4e7' }}>
                          {selectedSchedule.targetCriteria?.cities?.length > 0 
                            ? selectedSchedule.targetCriteria.cities.join(', ') 
                            : 'All Cities'}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" sx={{ color: '#71717a', display: 'block' }}>
                          Rollout Percentage
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#e4e4e7' }}>
                          {selectedSchedule.targetCriteria?.percentage || 100}%
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ color: '#ffffff', mb: 2 }}>
                      Progress Statistics
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Card sx={{ bgcolor: '#0a0a0a', border: '1px solid #27272a' }}>
                          <CardContent>
                            <Typography variant="h6" sx={{ color: '#3b82f6', fontWeight: 600 }}>
                              {selectedSchedule.stats?.totalDevices || 0}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#71717a' }}>
                              Total Devices
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={4}>
                        <Card sx={{ bgcolor: '#0a0a0a', border: '1px solid #27272a' }}>
                          <CardContent>
                            <Typography variant="h6" sx={{ color: '#22c55e', fontWeight: 600 }}>
                              {selectedSchedule.stats?.completedDevices || 0}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#71717a' }}>
                              Completed
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={4}>
                        <Card sx={{ bgcolor: '#0a0a0a', border: '1px solid #27272a' }}>
                          <CardContent>
                            <Typography variant="h6" sx={{ color: '#ef4444', fontWeight: 600 }}>
                              {selectedSchedule.stats?.failedDevices || 0}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#71717a' }}>
                              Failed
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Grid>

                  {selectedSchedule.scheduleType === 'phased' && selectedSchedule.phasedConfig && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ color: '#ffffff', mb: 2 }}>
                        Phased Rollout Configuration
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Card sx={{ bgcolor: '#0a0a0a', border: '1px solid #27272a' }}>
                            <CardContent>
                              <Typography variant="caption" sx={{ color: '#71717a', display: 'block' }}>
                                Batch Size
                              </Typography>
                              <Typography variant="body1" sx={{ color: '#ffffff' }}>
                                {selectedSchedule.phasedConfig.batchSize} devices
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={6}>
                          <Card sx={{ bgcolor: '#0a0a0a', border: '1px solid #27272a' }}>
                            <CardContent>
                              <Typography variant="caption" sx={{ color: '#71717a', display: 'block' }}>
                                Batch Interval
                              </Typography>
                              <Typography variant="body1" sx={{ color: '#ffffff' }}>
                                {selectedSchedule.phasedConfig.batchInterval} minutes
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    </Grid>
                  )}
                </Grid>
              </DialogContent>
              <DialogActions sx={{ p: 3, borderTop: '1px solid #27272a' }}>
                <Button onClick={() => setDetailsDialogOpen(false)} sx={{ color: '#a1a1aa' }}>
                  Close
                </Button>
                {selectedSchedule.status === 'pending_approval' && (
                  <>
                    <Button 
                      onClick={() => {
                        handleApproveSchedule(selectedSchedule._id);
                        setDetailsDialogOpen(false);
                      }}
                      variant="contained"
                      sx={{ bgcolor: '#22c55e' }}
                    >
                      Approve
                    </Button>
                    <Button 
                      onClick={() => {
                        handleCancelSchedule(selectedSchedule._id);
                        setDetailsDialogOpen(false);
                      }}
                      variant="contained"
                      sx={{ bgcolor: '#ef4444' }}
                    >
                      Reject
                    </Button>
                  </>
                )}
                {selectedSchedule.status === 'in_progress' && (
                  <Button 
                    onClick={() => {
                      handleCancelSchedule(selectedSchedule._id);
                      setDetailsDialogOpen(false);
                    }}
                    variant="contained"
                    sx={{ bgcolor: '#ef4444' }}
                  >
                    Cancel Schedule
                  </Button>
                )}
                {(selectedSchedule.status === 'cancelled' || selectedSchedule.status === 'completed') && (
                  <Button 
                    onClick={() => {
                      setScheduleToDelete(selectedSchedule);
                      setDetailsDialogOpen(false);
                      setDeleteDialogOpen(true);
                    }}
                    variant="contained"
                    sx={{ bgcolor: '#ef4444' }}
                  >
                    Delete Schedule
                  </Button>
                )}
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </PageTransition>
  );
}

export default ScheduleManagement;