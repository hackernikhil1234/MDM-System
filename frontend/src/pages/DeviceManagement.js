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
  TablePagination,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Collapse,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tooltip,
  Avatar,
  Divider,
  Popover,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormGroup,
  Badge,
  Skeleton,
  alpha,
  useTheme,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  PhoneAndroid as PhoneAndroidIcon,
  Block as BlockIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Upload as UploadIcon,
  Info as InfoIcon,
  LocationOn as LocationIcon,
  BatteryFull as BatteryIcon,
  NetworkCheck as NetworkIcon,
  FilterList as FilterListIcon,
  ClearAll as ClearAllIcon,
  GetApp as GetAppIcon,
  MoreVert as MoreVertIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Update as UpdateIcon,
  History as HistoryIcon,
} from '@mui/icons-material';

import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import { devices, updates, audit, versions } from '../services/api';
import { format, formatDistance } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import EmptyState from '../components/EmptyState';
import StyledDialog from '../components/StyledDialog';

const ORANGE = '#FF6B35';

const DeviceStatCard = ({ title, value, icon, color, subtitle, trend }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ height: '100%' }}>
    <Card className="glass-card" sx={{ height: '100%', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', '&:hover': { transform: 'translateY(-5px)', borderColor: alpha(color, 0.3) } }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.65rem' }}>
              {title}
            </Typography>
            <Typography sx={{ fontWeight: 900, fontSize: '1.75rem', color: '#fff', letterSpacing: '-0.02em', mt: 0.5 }}>{value}</Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: alpha(color, 0.8), mt: 0.5, display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ width: 44, height: 44, borderRadius: '14px', background: alpha(color, 0.1), border: `1px solid ${alpha(color, 0.2)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
            {React.cloneElement(icon, { sx: { fontSize: 22 } })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);

function DeviceManagement() {
  const [devicesList, setDevicesList] = useState([]);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDevice, setExpandedDevice] = useState(null);
  const [deviceTimeline, setDeviceTimeline] = useState({});
  const [deviceJobs, setDeviceJobs] = useState({});
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [bulkActionDialog, setBulkActionDialog] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [advancedFilters, setAdvancedFilters] = useState({
    osVersions: [],
    batteryLevel: 'all',
    networkType: 'all',
    lastSeenDays: '30',
  });

  useEffect(() => {
    fetchDevices();
  }, [page, rowsPerPage, searchTerm, filterStatus, advancedFilters]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(advancedFilters.osVersions.length > 0 && { osVersions: advancedFilters.osVersions.join(',') }),
        ...(advancedFilters.batteryLevel !== 'all' && { batteryLevel: advancedFilters.batteryLevel }),
        ...(advancedFilters.lastSeenDays !== 'all' && { lastSeenDays: advancedFilters.lastSeenDays }),
      };
      const response = await devices.getAll(params);
      setDevicesList(response.data.devices);
      setStats(response.data.stats);
      setError(null);
    } catch (error) {
      setError('System: Failed to synchronize fleet data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeviceDetails = async (imei) => {
    try {
      const [, jobsRes, timelineRes] = await Promise.all([
        devices.getOne(imei),
        updates.getDeviceHistory(imei),
        audit.getDeviceTimeline(imei)
      ]);
      setDeviceJobs(prev => ({ ...prev, [imei]: jobsRes.data.jobs }));
      setDeviceTimeline(prev => ({ ...prev, [imei]: timelineRes.data.timeline }));
    } catch (error) {
      console.error('Details sync error:', error);
    }
  };

  const handleExpandDevice = (imei) => {
    if (expandedDevice === imei) {
      setExpandedDevice(null);
    } else {
      setExpandedDevice(imei);
      fetchDeviceDetails(imei);
    }
  };

  const handleBlockDevice = async () => {
    try {
      await devices.block(selectedDevice.imei);
      setBlockDialogOpen(false);
      fetchDevices();
    } catch (error) {
      setError('Security: Failed to execute block protocol');
    }
  };

  const handleExport = (formatType = 'csv') => {
    const dataToExport = devicesList.map(device => ({
      IMEI: device.imei,
      Version: device.appVersion,
      Model: device.deviceModel,
      OS: device.deviceOS,
      'Last Seen': format(new Date(device.lastOpenTime), 'PPpp'),
      Status: device.status,
      Battery: `${device.metadata?.batteryLevel || 'N/A'}%`,
    }));

    if (formatType === 'csv') {
      const headers = Object.keys(dataToExport[0]).join(',');
      const rows = dataToExport.map(row => Object.values(row).join(',')).join('\n');
      const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fleet-manifest-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'inactive': return 'rgba(255,255,255,0.3)';
      case 'blocked': return '#EF4444';
      default: return 'rgba(255,255,255,0.3)';
    }
  };

  const activeFilterCount = Object.keys(advancedFilters).filter(k => 
    advancedFilters[k] && advancedFilters[k] !== 'all' && 
    (Array.isArray(advancedFilters[k]) ? advancedFilters[k].length > 0 : true)
  ).length;

  return (
    <PageTransition>
      <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
        {/* Header Section */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', mb: 1, textTransform: 'uppercase' }}>
              Fleet <span style={{ color: ORANGE }}>Intelligence</span>
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.95rem', fontWeight: 600 }}>
              Real-time monitoring and command control for global device assets
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => { setPage(0); fetchDevices(); }}
              sx={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', borderRadius: '12px', fontWeight: 700, px: 3, '&:hover': { borderColor: '#fff', color: '#fff', bgcolor: 'rgba(255,255,255,0.05)' } }}
            >
              Sync Fleet
            </Button>
            <Button
              variant="contained"
              startIcon={<GetAppIcon />}
              onClick={() => handleExport('csv')}
              sx={{ bgcolor: ORANGE, color: '#fff', borderRadius: '12px', fontWeight: 800, px: 3, boxShadow: `0 8px 25px ${alpha(ORANGE, 0.4)}`, '&:hover': { bgcolor: '#E55A2B', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}
            >
              Export Manifest
            </Button>
            <IconButton
              onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
              sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }, borderRadius: '12px' }}
            >
              {viewMode === 'table' ? <ViewModuleIcon /> : <ViewListIcon />}
            </IconButton>
          </Box>
        </Box>

        {/* Stats Grid */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <DeviceStatCard
                title="Active Nodes"
                value={stats.totalActive || 0}
                icon={<PhoneAndroidIcon />}
                color={ORANGE}
                subtitle="Online infrastructure"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DeviceStatCard
                title="Stale Sync"
                value={stats.inactiveDevices || 0}
                icon={<ScheduleIcon />}
                color="#3B82F6"
                subtitle="Requires attention"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DeviceStatCard
                title="Compliance"
                value={`${Math.round((1 - (stats.totalBlocked || 0) / (stats.totalActive || 1)) * 100)}%`}
                icon={<CheckCircleIcon />}
                color="#10B981"
                subtitle="Security index"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DeviceStatCard
                title="Latest Signal"
                value={`v${stats.latestVersion || '1.0'}`}
                icon={<UpdateIcon />}
                color="#F59E0B"
                subtitle="Firmware head"
              />
            </Grid>
          </Grid>
        )}

        {/* Search & Filter Bar */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <Box className="glass-card" sx={{ flex: 1, minWidth: { xs: '100%', md: 0 }, display: 'flex', alignItems: 'center', px: 2, py: 1.5, bgcolor: 'rgba(255,255,255,0.01)' }}>
            <SearchIcon sx={{ color: ORANGE, mr: 1.5, fontSize: 22 }} />
            <TextField
              fullWidth
              variant="standard"
              placeholder="Query fleet by IMEI, hardware signature or geolocation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ disableUnderline: true, sx: { color: '#fff', fontWeight: 600, fontSize: '0.95rem' } }}
            />
          </Box>

          <Box className="glass-card" sx={{ display: 'flex', gap: 1, p: 0.75, bgcolor: 'rgba(255,255,255,0.01)' }}>
            <Button
              onClick={(e) => setFilterAnchorEl(e.currentTarget)}
              startIcon={<FilterListIcon sx={{ color: ORANGE }} />}
              sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 800, fontSize: '0.75rem', px: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              Intelligence Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>
            <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 1 }} />
            <TextField
              select
              size="small"
              variant="standard"
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
              sx={{ width: 140, px: 2 }}
              InputProps={{ disableUnderline: true, sx: { color: ORANGE, fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase' } }}
              SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: 'rgba(13, 13, 20, 0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' } } } }}
            >
              <MenuItem value="all">ALL NODES</MenuItem>
              <MenuItem value="active">ACTIVE ONLY</MenuItem>
              <MenuItem value="inactive">STALE ONLY</MenuItem>
              <MenuItem value="blocked">RESTRICTED</MenuItem>
            </TextField>
          </Box>
        </Box>

        {/* Device Content */}
        <Card className="glass-card" sx={{ overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 450px)' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: 'rgba(20, 20, 35, 0.9) !important', borderBottom: '1px solid rgba(255,255,255,0.05)' }} padding="checkbox">
                    <Checkbox sx={{ color: 'rgba(255,255,255,0.2)', '&.Mui-checked': { color: ORANGE } }} />
                  </TableCell>
                  <TableCell sx={{ bgcolor: 'rgba(20, 20, 35, 0.9) !important', color: 'rgba(255,255,255,0.4) !important', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    Signature
                  </TableCell>
                  <TableCell sx={{ bgcolor: 'rgba(20, 20, 35, 0.9) !important', color: 'rgba(255,255,255,0.4) !important', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    Hardware
                  </TableCell>
                  <TableCell sx={{ bgcolor: 'rgba(20, 20, 35, 0.9) !important', color: 'rgba(255,255,255,0.4) !important', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    Telemetry
                  </TableCell>
                  <TableCell sx={{ bgcolor: 'rgba(20, 20, 35, 0.9) !important', color: 'rgba(255,255,255,0.4) !important', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    Firmware
                  </TableCell>
                  <TableCell sx={{ bgcolor: 'rgba(20, 20, 35, 0.9) !important', color: 'rgba(255,255,255,0.4) !important', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    Status
                  </TableCell>
                  <TableCell align="right" sx={{ bgcolor: 'rgba(20, 20, 35, 0.9) !important', borderBottom: '1px solid rgba(255,255,255,0.05)' }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ py: 10, textAlign: 'center', borderBottom: 'none' }}>
                      <LinearProgress sx={{ maxWidth: 200, mx: 'auto', borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: ORANGE } }} />
                    </TableCell>
                  </TableRow>
                ) : devicesList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ py: 12, textAlign: 'center', borderBottom: 'none' }}>
                      <EmptyState icon={<PhoneAndroidIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.05)' }} />} title="ZERO NODES DETECTED" description="No hardware signatures found matching current telemetry filters." actionText="RESET FILTERS" onAction={() => setSearchTerm('')} />
                    </TableCell>
                  </TableRow>
                ) : (
                  devicesList.map((device, index) => (
                    <React.Fragment key={device.imei}>
                      <TableRow hover sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                        <TableCell padding="checkbox" sx={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <Checkbox sx={{ color: 'rgba(255,255,255,0.1)', '&.Mui-checked': { color: ORANGE } }} />
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <Typography sx={{ color: '#fff', fontSize: '0.85rem', fontWeight: 800, fontFamily: 'monospace' }}>{device.imei}</Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>SN: {device._id.substring(0, 8).toUpperCase()}</Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <Typography sx={{ color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}>{device.deviceModel}</Typography>
                          <Typography variant="caption" sx={{ color: ORANGE, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{device.deviceOS}</Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }} />
                            <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 600 }}>{device.location?.city || 'Roaming'}</Typography>
                          </Box>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>Signal: {formatDistance(new Date(device.lastOpenTime), new Date(), { addSuffix: true })}</Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <Chip label={`v${device.appVersion}`} size="small" sx={{ fontWeight: 900, fontSize: '0.65rem', bgcolor: alpha(ORANGE, 0.1), color: ORANGE, border: `1px solid ${alpha(ORANGE, 0.2)}` }} />
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: getStatusColor(device.status) }} />
                            <Typography sx={{ color: '#fff', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>{device.status}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <IconButton size="small" onClick={() => handleExpandDevice(device.imei)} sx={{ color: 'rgba(255,255,255,0.2)', '&:hover': { color: ORANGE, bgcolor: 'rgba(255,255,255,0.05)' } }}>
                            {expandedDevice === device.imei ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={7} sx={{ p: 0, border: 'none' }}>
                          <Collapse in={expandedDevice === device.imei}>
                            <Box sx={{ p: 4, bgcolor: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <Grid container spacing={4}>
                                <Grid item xs={12} md={4}>
                                  <Typography variant="caption" sx={{ color: ORANGE, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 2, display: 'block' }}>Node Intel</Typography>
                                  <Card className="glass-card" sx={{ bgcolor: 'rgba(255,255,255,0.01)' }}>
                                    <CardContent sx={{ p: 2.5 }}>
                                      {[
                                        { l: 'Battery State', v: `${device.metadata?.batteryLevel}%`, c: device.metadata?.batteryLevel > 20 ? '#10B981' : '#EF4444' },
                                        { l: 'Network Link', v: device.metadata?.networkType || 'Offline' },
                                        { l: 'Hardware ID', v: device._id.substring(0, 16).toUpperCase() },
                                        { l: 'Last Handshake', v: format(new Date(device.lastOpenTime), 'PPpp') }
                                      ].map((item, i) => (
                                        <Box key={i} sx={{ mb: i === 3 ? 0 : 2, display: 'flex', justifyContent: 'space-between' }}>
                                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>{item.l}</Typography>
                                          <Typography sx={{ color: item.c || '#fff', fontSize: '0.8rem', fontWeight: 800 }}>{item.v}</Typography>
                                        </Box>
                                      ))}
                                    </CardContent>
                                  </Card>
                                </Grid>
                                <Grid item xs={12} md={8}>
                                  <Typography variant="caption" sx={{ color: ORANGE, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 2, display: 'block' }}>Operational Timeline</Typography>
                                  <Box sx={{ height: 200, overflowY: 'auto', pr: 2 }}>
                                    {deviceTimeline[device.imei]?.map((event, i) => (
                                      <Box key={i} sx={{ mb: 2, display: 'flex', gap: 2 }}>
                                        <Box sx={{ width: 2, bgcolor: 'rgba(255,255,255,0.05)', position: 'relative' }}>
                                          <Box sx={{ position: 'absolute', top: 0, left: -4, width: 10, height: 10, borderRadius: '50%', bgcolor: ORANGE }} />
                                        </Box>
                                        <Box>
                                          <Typography sx={{ color: '#fff', fontSize: '0.8rem', fontWeight: 800 }}>{event.action.replace(/_/g, ' ')}</Typography>
                                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{format(new Date(event.timestamp), 'PPpp')}</Typography>
                                        </Box>
                                      </Box>
                                    ))}
                                  </Box>
                                </Grid>
                              </Grid>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[20, 50, 100]}
            component="div"
            count={devicesList.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            sx={{ color: 'rgba(255,255,255,0.5)', borderTop: '1px solid rgba(255,255,255,0.05)' }}
          />
        </Card>

        {/* Popovers & Dialogs */}
        <Popover
          open={Boolean(filterAnchorEl)}
          anchorEl={filterAnchorEl}
          onClose={() => setFilterAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          PaperProps={{ className: 'glass-card', sx: { width: 350, p: 3, bgcolor: 'rgba(13, 13, 20, 0.98)', mt: 1.5 } }}
        >
          <Typography variant="caption" sx={{ color: ORANGE, fontWeight: 900, textTransform: 'uppercase', mb: 3, display: 'block' }}>ADVANCED FILTRATION</Typography>
          <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 800, mb: 1.5 }}>Hardware Ecosystem</Typography>
          <FormGroup sx={{ mb: 3 }}>
            {['Android 13', 'Android 12', 'iOS 16'].map((os) => (
              <FormControlLabel key={os} control={<Checkbox checked={advancedFilters.osVersions.includes(os)} onChange={(e) => { const v = e.target.checked ? [...advancedFilters.osVersions, os] : advancedFilters.osVersions.filter(x => x !== os); setAdvancedFilters({...advancedFilters, osVersions: v}); }} sx={{ color: 'rgba(255,255,255,0.2)', '&.Mui-checked': { color: ORANGE } }} />} label={<Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 600 }}>{os}</Typography>} />
            ))}
          </FormGroup>
          <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 800, mb: 1.5 }}>Last Seen Threshold</Typography>
          <RadioGroup value={advancedFilters.lastSeenDays} onChange={(e) => setAdvancedFilters({...advancedFilters, lastSeenDays: e.target.value})} sx={{ mb: 4 }}>
            {[ {v: '7', l: '7 Days'}, {v: '30', l: '30 Days'}, {v: 'all', l: 'Infinite'} ].map(opt => (
              <FormControlLabel key={opt.v} value={opt.v} control={<Radio sx={{ color: 'rgba(255,255,255,0.2)', '&.Mui-checked': { color: ORANGE } }} />} label={<Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 600 }}>{opt.l}</Typography>} />
            ))}
          </RadioGroup>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button fullWidth variant="outlined" onClick={() => setAdvancedFilters({ osVersions: [], batteryLevel: 'all', networkType: 'all', lastSeenDays: '30' })} sx={{ borderRadius: '10px', color: '#fff', borderColor: 'rgba(255,255,255,0.1)' }}>RESET</Button>
            <Button fullWidth variant="contained" onClick={() => { setFilterAnchorEl(null); fetchDevices(); }} sx={{ borderRadius: '10px', bgcolor: ORANGE, fontWeight: 800 }}>APPLY</Button>
          </Box>
        </Popover>

        <StyledDialog open={blockDialogOpen} onClose={() => setBlockDialogOpen(false)} title="RESTRICT ACCESS" onConfirm={handleBlockDevice} confirmText="RESTRICT NODE" confirmColor="error">
          <Typography sx={{ color: 'rgba(255,255,255,0.5)', mb: 2 }}>Confirming restriction for hardware signature <strong style={{ color: '#fff' }}>{selectedDevice?.imei}</strong>. This node will be immediately disconnected from the fleet broadcast.</Typography>
          <Alert severity="warning" sx={{ bgcolor: alpha('#EF4444', 0.1), color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '10px' }}>Security Protocol: This action requires high-level administrative clearance.</Alert>
        </StyledDialog>
      </Box>
    </PageTransition>
  );
}

export default DeviceManagement;