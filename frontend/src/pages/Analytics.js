import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CircularProgress, Alert,
  ToggleButtonGroup, ToggleButton, Divider, LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Devices as DevicesIcon,
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar,
} from 'recharts';
import axios from 'axios';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { Download as DownloadIcon } from '@mui/icons-material';
import { Button } from '@mui/material';
import { format } from 'date-fns';

const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api' });
const ORANGE = '#FF6B35';
const COLORS = [ORANGE, '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

const StatCard = ({ title, value, subtitle, color, icon, trend }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #F3F4F6', height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>
              {title}
            </Typography>
            <Typography sx={{ fontWeight: 900, fontSize: '2rem', color: '#1A1A2E', lineHeight: 1.2, mt: 0.5 }}>{value}</Typography>
            <Typography variant="caption" sx={{ color: '#9CA3AF', mt: 0.5, display: 'block' }}>{subtitle}</Typography>
          </Box>
          <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
            {icon}
          </Box>
        </Box>
        {trend !== undefined && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={Math.min(trend, 100)}
              sx={{ height: 6, borderRadius: 3, bgcolor: '#F3F4F6', '& .MuiLinearProgress-bar': { background: color, borderRadius: 3 } }} />
            <Typography variant="caption" sx={{ color: color, fontWeight: 700, mt: 0.5, display: 'block' }}>{trend}%</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <Box sx={{ bgcolor: '#fff', border: '1px solid #E5E7EB', borderRadius: 2, p: 1.5, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#1A1A2E', mb: 0.5 }}>{label}</Typography>
        {payload.map((p, i) => (
          <Typography key={i} sx={{ fontSize: '0.78rem', color: p.color, fontWeight: 600 }}>
            {p.name}: {p.value}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartType, setChartType] = useState('area');

  useEffect(() => {
    const token = localStorage.getItem('token');
    api.get('/stats', { headers: { 'x-auth-token': token } })
      .then(res => { setStats(res.data.stats); setLoading(false); })
      .catch(() => { setError('Failed to load analytics'); setLoading(false); });
  }, []);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: 2 }}>
      <CircularProgress sx={{ color: ORANGE }} />
      <Typography sx={{ color: '#9CA3AF' }}>Loading analytics...</Typography>
    </Box>
  );

  if (error) return <Alert severity="error" sx={{ m: 3, borderRadius: 2 }}>{error}</Alert>;

  const deviceStatusData = [
    { name: 'Active', value: stats?.activeDevices || 0 },
    { name: 'Blocked', value: stats?.blockedDevices || 0 },
    { name: 'Inactive', value: stats?.inactiveDevices || 0 },
  ];


  const regionData = (stats?.devicesByRegion || []).map(r => ({ name: r._id || 'Unknown', devices: r.count }));
  const dailyData = stats?.dailyStats || [];

  const radialData = [{ name: 'Success Rate', value: stats?.successRate || 0, fill: '#10B981' }];

  const statCards = [
    { title: 'Total Devices', value: stats?.totalDevices || 0, subtitle: `${stats?.activeDevices || 0} active`, color: ORANGE, icon: <DevicesIcon />, trend: stats?.totalDevices ? Math.round((stats.activeDevices / stats.totalDevices) * 100) : 0 },
    { title: 'Update Success', value: `${stats?.successRate || 0}%`, subtitle: `${stats?.successJobs || 0} succeeded`, color: '#10B981', icon: <CheckCircleIcon />, trend: stats?.successRate },
    { title: 'Schedules', value: stats?.totalSchedules || 0, subtitle: `${stats?.activeSchedules || 0} running`, color: '#3B82F6', icon: <TimelineIcon /> },
    { title: 'Versions', value: stats?.activeVersions || 0, subtitle: `v${stats?.latestVersion || '1.0'} latest`, color: '#8B5CF6', icon: <SpeedIcon /> },
  ];

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(ORANGE);
    doc.text('MDM Enterprise Analytics Report', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor('#6B7280');
    doc.text(`Generated on: ${format(new Date(), 'MMMM do, yyyy HH:mm')}`, 14, 28);
    
    // KPI Table
    const kpiData = [
      ['Total Devices', stats?.totalDevices || 0, 'Success Rate', `${stats?.successRate || 0}%`],
      ['Active Devices', stats?.activeDevices || 0, 'Failed Jobs', stats?.failedJobs || 0],
      ['Total Schedules', stats?.totalSchedules || 0, 'Active Versions', stats?.activeVersions || 0]
    ];
    
    autoTable(doc, {
      head: [['Metric', 'Value', 'Security Metric', 'Value']],
      body: kpiData,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: ORANGE },
    });

    // Regional data
    const regRows = regionData.map(r => [r.name, r.devices]);
    doc.text('Regional Distribution', 14, (doc).lastAutoTable.finalY + 15);
    autoTable(doc, {
      head: [['Region', 'Device Count']],
      body: regRows,
      startY: (doc).lastAutoTable.finalY + 18,
      theme: 'striped'
    });

    doc.save(`mdm-analytics-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const exportToCSV = () => {
    const data = {
      summary: statCards.map(s => ({ title: s.title, value: s.value, subtitle: s.subtitle })),
      regions: regionData,
      dailyStats: dailyData
    };
    const csv = Papa.unparse(data.dailyStats); // Exporting daily trend as CSV primary
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `mdm-fleet-stats-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.click();
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: { xs: '1.5rem', md: '2rem' } }}>
            Analytics
          </Typography>
          <Typography sx={{ color: '#9CA3AF', mt: 0.5 }}>
            Real-time insights into your device fleet performance
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={exportToCSV}
            sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, borderColor: '#E5E7EB', color: '#374151' }}
          >
            CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={exportToPDF}
            sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, background: `linear-gradient(135deg, ${ORANGE}, #E55A2B)` }}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {statCards.map((s, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <StatCard {...s} />
          </Grid>
        ))}
      </Grid>

      {/* Activity Chart */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #F3F4F6', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: '1.1rem' }}>Activity Trend</Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Last 7 days — updates, devices & errors</Typography>
            </Box>
            <ToggleButtonGroup value={chartType} exclusive onChange={(e, v) => v && setChartType(v)} size="small">
              {['area', 'line', 'bar'].map(t => (
                <ToggleButton key={t} value={t} sx={{ textTransform: 'capitalize', fontWeight: 600, fontSize: '0.75rem', '&.Mui-selected': { bgcolor: 'rgba(255,107,53,0.1)', color: ORANGE } }}>
                  {t}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
          <ResponsiveContainer width="100%" height={240}>
            {chartType === 'bar' ? (
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="updates" name="Updates" fill={ORANGE} radius={[4, 4, 0, 0]} />
                <Bar dataKey="devices" name="Devices" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="errors" name="Errors" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : chartType === 'line' ? (
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="updates" name="Updates" stroke={ORANGE} strokeWidth={2.5} dot={{ r: 4, fill: ORANGE }} />
                <Line type="monotone" dataKey="devices" name="Devices" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 4, fill: '#3B82F6' }} />
                <Line type="monotone" dataKey="errors" name="Errors" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
              </LineChart>
            ) : (
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="gUpdates" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={ORANGE} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={ORANGE} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gDevices" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area type="monotone" dataKey="updates" name="Updates" stroke={ORANGE} fill="url(#gUpdates)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="devices" name="Devices" stroke="#3B82F6" fill="url(#gDevices)" strokeWidth={2} />
                <Line type="monotone" dataKey="errors" name="Errors" stroke="#EF4444" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Device Status Pie */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #F3F4F6', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: '1rem', mb: 0.5 }}>Device Status</Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Distribution across fleet</Typography>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={deviceStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                    {deviceStatusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                {deviceStatusData.map((d, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS[i] }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#6B7280', fontSize: '0.75rem' }}>{d.name}: {d.value}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Regional Device Distribution */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #F3F4F6', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: '1rem', mb: 0.5 }}>Devices by Region</Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Geographic fleet distribution</Typography>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={regionData.slice(0, 6)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="devices" name="Devices" fill={ORANGE} radius={[0, 4, 4, 0]}>
                    {regionData.slice(0, 6).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Success Rate Radial */}
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #F3F4F6', height: '100%' }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Typography sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: '1rem', mb: 0.5 }}>Update Success</Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Last 7 days</Typography>
              <Box sx={{ position: 'relative', mt: 2 }}>
                <ResponsiveContainer width="100%" height={160}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={radialData} startAngle={180} endAngle={-180}>
                    <RadialBar dataKey="value" background={{ fill: '#F3F4F6' }} cornerRadius={8} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', mt: -1 }}>
                  <Typography sx={{ fontWeight: 900, fontSize: '1.8rem', color: '#10B981', lineHeight: 1 }}>{stats?.successRate || 0}%</Typography>
                  <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600 }}>success</Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontWeight: 800, color: '#10B981', fontSize: '1.1rem' }}>{stats?.successJobs || 0}</Typography>
                  <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600 }}>Passed</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontWeight: 800, color: '#EF4444', fontSize: '1.1rem' }}>{stats?.failedJobs || 0}</Typography>
                  <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600 }}>Failed</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Real-time alerts */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #F3F4F6' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: '1rem', mb: 2 }}>Fleet Health Summary</Typography>
              <Grid container spacing={2}>
                {[
                  { label: 'Device Availability', value: stats?.totalDevices ? Math.round((stats.activeDevices / stats.totalDevices) * 100) : 0, color: '#10B981', icon: <CheckCircleIcon /> },
                  { label: 'Schedule Completion', value: stats?.totalSchedules ? Math.round((stats.completedSchedules / stats.totalSchedules) * 100) : 0, color: '#3B82F6', icon: <TimelineIcon /> },
                  { label: 'Update Reliability', value: stats?.successRate || 0, color: ORANGE, icon: <TrendingUpIcon /> },
                  { label: 'Version Coverage', value: stats?.totalDevices && stats?.activeVersions ? Math.min(Math.round((stats.activeVersions / stats.totalDevices) * 100), 100) : 0, color: '#8B5CF6', icon: <SpeedIcon /> },
                ].map((item, i) => (
                  <Grid item xs={12} sm={6} md={3} key={i}>
                    <Box sx={{ p: 2, bgcolor: '#FAFAFA', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: item.color }}>
                        {item.icon}
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#374151' }}>{item.label}</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={item.value}
                        sx={{ height: 8, borderRadius: 4, bgcolor: '#E5E7EB', '& .MuiLinearProgress-bar': { background: item.color, borderRadius: 4 } }} />
                      <Typography sx={{ fontWeight: 800, color: item.color, mt: 0.5, fontSize: '0.9rem' }}>{item.value}%</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
