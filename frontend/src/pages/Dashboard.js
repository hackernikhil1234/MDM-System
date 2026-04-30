import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Box,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  Button,
  Card,
  CardContent,
  alpha,
  Menu,
  MenuItem,
  ListItemText,
} from '@mui/material';
import {
  Devices as DevicesIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  SystemUpdateAlt as VersionIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';

import { devices, schedules, audit, updates } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import GlobalMap from '../components/GlobalMap';


import LoadingSkeleton from '../components/LoadingSkeleton';
import { motion } from 'framer-motion';

const ORANGE = '#FF6B35';
const COLORS = ['#FF6B35', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

const KPICard = ({ title, value, icon, color, subtitle, trend }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ height: '100%' }}>
    <Card className="glass-card" sx={{ height: '100%', border: `1px solid ${alpha(color, 0.1)}`, transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-5px)', borderColor: alpha(color, 0.3) } }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: alpha(color, 0.1), border: `1px solid ${alpha(color, 0.2)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
            {React.cloneElement(icon, { sx: { fontSize: 22 } })}
          </Box>
          {trend && (
            <Typography variant="caption" sx={{ color: trend > 0 ? '#10B981' : '#EF4444', fontWeight: 800, mt: 1 }}>
              {trend > 0 ? '+' : ''}{trend}%
            </Typography>
          )}
        </Box>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 900, color: '#fff', mt: 0.5, letterSpacing: '-0.02em' }}>{value}</Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', mt: 1, display: 'block', fontWeight: 600 }}>{subtitle}</Typography>
      </CardContent>
    </Card>
  </motion.div>
);

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentSchedules, setRecentSchedules] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [versionData, setVersionData] = useState([]);
  const [auditStats, setAuditStats] = useState([]);
  const [updateTrends, setUpdateTrends] = useState({ successRate: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Core device stats
      const devicesRes = await devices.getAll({ limit: 10 });
      const devicesData = devicesRes.data;
      setStats(devicesData.stats || {});
      if (devicesData.stats?.versionDistribution) setVersionData(devicesData.stats.versionDistribution);

      // Recent schedules
      const schedulesRes = await schedules.getAll({ limit: 5 });
      setRecentSchedules(schedulesRes.data?.schedules || []);

      // Recent jobs — non-critical, silently skip if API doesn't support it
      try {
        const jobsRes = await updates.getDeviceHistory?.('all');
        setRecentJobs(jobsRes?.data?.jobs || []);
      } catch (_) {
        setRecentJobs([]);
      }

      // Audit telemetry for charts
      const endDate = new Date();
      const startDate = subDays(endDate, parseInt(timeRange));
      const auditRes = await audit.getLogs({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 500
      });
      processAuditStats(auditRes.data?.logs || []);

      setError(null);
    } catch (err) {
      console.error('[Dashboard] Fetch error:', err);
      setError('Failed to synchronize live metrics. Backend may be starting up.');
    } finally {
      setLoading(false);
    }
  };

  const processAuditStats = (logs) => {
    const days = parseInt(timeRange);
    const data = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      const dayLogs = logs.filter(l => {
        const d = new Date(l.timestamp);
        return d >= dayStart && d <= dayEnd;
      });
      data.push({
        date: format(date, 'MMM dd'),
        updates: dayLogs.filter(l => l.action.includes('UPDATE')).length,
        devices: dayLogs.filter(l => l.action.includes('DEVICE')).length,
        errors: dayLogs.filter(l => l.status === 'failure').length,
      });
    }
    setAuditStats(data);
    const total = data.reduce((acc, d) => acc + d.updates, 0);
    const errors = data.reduce((acc, d) => acc + d.errors, 0);
    setUpdateTrends({ successRate: total === 0 ? 100 : Math.round(((total - errors) / total) * 100) });
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify({ stats, recentSchedules, versionData }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `mdm-intelligence-${format(new Date(), 'yyyy-MM-dd')}.json`);
    linkElement.click();
  };

  return (
    <PageTransition>
      <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
        {/* Header Section */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', mb: 1, textTransform: 'uppercase' }}>
              Command <span style={{ color: ORANGE }}>Intelligence</span>
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.95rem', fontWeight: 600 }}>
              Live orchestration and telemetry manifest · {format(new Date(), 'EEEE, MMMM do')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchDashboardData}
              sx={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', borderRadius: '12px', fontWeight: 700, px: 3, '&:hover': { borderColor: '#fff', color: '#fff', bgcolor: 'rgba(255,255,255,0.05)' } }}
            >
              Sync Matrix
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExportData}
              sx={{ bgcolor: ORANGE, color: '#fff', borderRadius: '12px', fontWeight: 800, px: 3, boxShadow: `0 8px 25px ${alpha(ORANGE, 0.4)}`, '&:hover': { bgcolor: '#E55A2B', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}
            >
              Intelligence Report
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: '12px', bgcolor: alpha('#EF4444', 0.1), color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </Alert>
        )}

        {loading && !stats ? (
          <LoadingSkeleton type="dashboard" />
        ) : (
          <>
            {/* KPI Section */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <KPICard title="Total Fleet" value={stats?.totalActive || 0} icon={<DevicesIcon />} color={ORANGE} subtitle={`${stats?.inactiveDevices || 0} nodes offline`} trend={5.2} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <KPICard title="Active Runs" value={recentSchedules.filter(s => s.status === 'in_progress').length} icon={<ScheduleIcon />} color="#3B82F6" subtitle="Awaiting telemetry" trend={-2.1} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <KPICard title="Health Index" value={`${updateTrends.successRate || 98}%`} icon={<CheckCircleIcon />} color="#10B981" subtitle="Stability rating" trend={1.5} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <KPICard title="Fleet Signal" value={`v${stats?.latestVersion || '1.0'}`} icon={<VersionIcon />} color="#8B5CF6" subtitle="Firmware baseline" />
              </Grid>
            </Grid>

            {/* Map & Analytics Section */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <Card className="glass-card" sx={{ p: 1, height: 400, overflow: 'hidden' }}>
                  <GlobalMap devices={stats?.deviceLocations || []} />
                </Card>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Card className="glass-card" sx={{ p: 4, height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 900, color: '#fff' }}>Telemetry Analytics</Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Real-time update traffic and health distribution</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                        <TimelineIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={auditStats}>
                      <defs>
                        <linearGradient id="colorUpdates" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={ORANGE} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={ORANGE} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.2)" tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'rgba(13, 13, 20, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff', fontSize: '0.8rem', fontWeight: 700 }}
                      />
                      <Area type="monotone" dataKey="updates" stroke={ORANGE} strokeWidth={3} fillOpacity={1} fill="url(#colorUpdates)" />
                      <Area type="monotone" dataKey="devices" stroke="#3B82F6" strokeWidth={3} fill="transparent" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card className="glass-card" sx={{ p: 4, height: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#fff', mb: 1 }}>Build Distribution</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, display: 'block', mb: 3 }}>Active fleet firmware manifest</Typography>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={versionData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={8} dataKey="count">
                        {versionData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />)}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    {versionData.slice(0, 4).map((v, i) => (
                      <Box key={i} sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: COLORS[i % COLORS.length] }} />
                          <Typography variant="caption" sx={{ fontWeight: 800, color: 'rgba(255,255,255,0.4)' }}>v{v._id}</Typography>
                        </Box>
                        <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '0.9rem' }}>{v.count}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Card>
              </Grid>
            </Grid>

            {/* Recent Campaigns */}
            <Card className="glass-card" sx={{ mb: 4, overflow: 'hidden' }}>
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#fff' }}>Active Campaigns</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Scheduled orchestration pathways</Typography>
                </Box>
                <Button onClick={() => navigate('/schedules')} sx={{ color: ORANGE, fontWeight: 900, fontSize: '0.75rem' }}>VIEW ALL</Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ bgcolor: 'transparent', color: 'rgba(255,255,255,0.3)', fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase' }}>Campaign</TableCell>
                      <TableCell sx={{ bgcolor: 'transparent', color: 'rgba(255,255,255,0.3)', fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase' }}>Pathway</TableCell>
                      <TableCell sx={{ bgcolor: 'transparent', color: 'rgba(255,255,255,0.3)', fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase' }}>Status</TableCell>
                      <TableCell align="right" sx={{ bgcolor: 'transparent', color: 'rgba(255,255,255,0.3)', fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase' }}>Units</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentSchedules.map((schedule) => (
                      <TableRow key={schedule._id} hover>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.85rem' }}>{schedule.name}</Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{format(new Date(schedule.createdAt), 'MMM dd')}</Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <Typography variant="caption" sx={{ color: ORANGE, fontWeight: 900 }}>v{schedule.fromVersionCode} → v{schedule.toVersionCode}</Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <Chip label={schedule.status} size="small" sx={{ fontWeight: 900, fontSize: '0.6rem', bgcolor: alpha(ORANGE, 0.1), color: ORANGE }} />
                        </TableCell>
                        <TableCell align="right" sx={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <Typography sx={{ color: '#fff', fontWeight: 800 }}>{schedule.stats?.totalDevices || 0}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>

            {/* Live Operations */}
            <Card className="glass-card" sx={{ overflow: 'hidden' }}>
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#fff' }}>Live Operations</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Real-time telemetry and state transitions</Typography>
                </Box>
                <Chip icon={<SpeedIcon sx={{ color: '#3B82F6 !important', fontSize: '1rem' }} />} label={`${recentJobs.filter(j => j.currentState === 'in_progress').length} ACTIVE`} sx={{ bgcolor: alpha('#3B82F6', 0.1), color: '#3B82F6', fontWeight: 900, fontSize: '0.65rem' }} />
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {recentJobs.map((job) => (
                      <TableRow key={job._id}>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.03)', py: 2 }}>
                          <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.8rem', fontFamily: 'monospace' }}>{job.deviceImei}</Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <Typography variant="caption" sx={{ color: ORANGE, fontWeight: 900 }}>v{job.fromVersionCode} → v{job.toVersionCode}</Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: job.currentState === 'failed' ? '#EF4444' : '#10B981', boxShadow: `0 0 10px ${job.currentState === 'failed' ? '#EF4444' : '#10B981'}` }} />
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, textTransform: 'uppercase' }}>{job.currentState.replace(/_/g, ' ')}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.2)', fontWeight: 700 }}>{format(new Date(job.createdAt), 'HH:mm:ss')}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                    {recentJobs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 6, color: 'rgba(255,255,255,0.1)', fontStyle: 'italic', border: 0 }}>
                          No active telemetry streams detected
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </>
        )}

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={() => { setTimeRange('24h'); setAnchorEl(null); }}><ListItemText>Last 24 Hours</ListItemText></MenuItem>
          <MenuItem onClick={() => { setTimeRange('7d'); setAnchorEl(null); }}><ListItemText>Last 7 Days</ListItemText></MenuItem>
          <MenuItem onClick={() => { setTimeRange('30d'); setAnchorEl(null); }}><ListItemText>Last 30 Days</ListItemText></MenuItem>
        </Menu>
      </Box>
    </PageTransition>
  );
}

export default Dashboard;