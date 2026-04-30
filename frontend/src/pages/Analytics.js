import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CircularProgress, Alert,
  ToggleButtonGroup, ToggleButton, Divider, LinearProgress, alpha, useTheme
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

import api from '../services/api';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';
import { Download as DownloadIcon } from '@mui/icons-material';
import { Button } from '@mui/material';
import { format } from 'date-fns';
const ORANGE = '#FF6B35';
const COLORS = [ORANGE, '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

const StatCard = ({ title, value, subtitle, color, icon, trend }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ height: '100%' }}>
    <Card className="glass-card" sx={{ height: '100%', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-5px)', borderColor: color } }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.65rem' }}>
              {title}
            </Typography>
            <Typography sx={{ fontWeight: 800, fontSize: '1.75rem', color: '#fff', letterSpacing: '-0.02em', mt: 0.5 }}>{value}</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', mt: 0.5, display: 'block', fontWeight: 600 }}>{subtitle}</Typography>
          </Box>
          <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
            {React.cloneElement(icon, { fontSize: 'small' })}
          </Box>
        </Box>
        {trend !== undefined && (
          <Box sx={{ mt: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ color: color, fontWeight: 700 }}>{trend}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={Math.min(trend, 100)}
              sx={{ height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { background: `linear-gradient(90deg, ${color}, ${color}80)`, borderRadius: 2 } }} />
          </Box>
        )}
      </CardContent>
    </Card>
  </motion.div>
);


const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <Box sx={{ bgcolor: 'rgba(13, 13, 20, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2, p: 1.5, boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#fff', mb: 0.5 }}>{label}</Typography>
        {payload.map((p, i) => (
          <Typography key={i} sx={{ fontSize: '0.78rem', color: p.color || p.fill, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.color || p.fill }} />
            {p.name}: {p.value}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};


export default function Analytics() {
  const theme = useTheme();
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

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(ORANGE);
    doc.text('MDM Enterprise Analytics Report', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor('#6B7280');
    doc.text(`Generated on: ${format(new Date(), 'MMMM do, yyyy HH:mm')}`, 14, 28);
    
    const kpiData = [
      ['Total Devices', stats?.totalDevices || 0, 'Success Rate', `${stats?.successRate || 0}%`],
      ['Active Devices', stats?.activeDevices || 0, 'Failed Jobs', stats?.failedJobs || 0],
      ['Total Schedules', stats?.totalSchedules || 0, 'Active Versions', stats?.activeVersions || 0]
    ];
    
    doc.autoTable({
      head: [['Metric', 'Value', 'Security Metric', 'Value']],
      body: kpiData,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: ORANGE },
    });

    const regionData = (stats?.devicesByRegion || []).map(r => ({ name: r._id || 'Unknown', devices: r.count }));
    const regRows = regionData.map(r => [r.name, r.devices]);
    doc.text('Regional Distribution', 14, (doc).lastAutoTable.finalY + 15);
    doc.autoTable({
      head: [['Region', 'Device Count']],
      body: regRows,
      startY: (doc).lastAutoTable.finalY + 18,
      theme: 'striped'
    });

    doc.save(`mdm-analytics-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const exportToCSV = () => {
    const regionData = (stats?.devicesByRegion || []).map(r => ({ name: r._id || 'Unknown', devices: r.count }));
    const dailyData = stats?.dailyStats || [];
    const statCards = [
      { title: 'Total Devices', value: stats?.totalDevices || 0 },
      { title: 'Update Success', value: `${stats?.successRate || 0}%` },
    ];
    const data = {
      summary: statCards,
      regions: regionData,
      dailyStats: dailyData
    };
    const csv = Papa.unparse(data.dailyStats);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `mdm-fleet-stats-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.click();
  };

  if (loading) return (

    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: 2 }}>
      <CircularProgress sx={{ color: ORANGE }} />
      <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Analyzing fleet data...</Typography>
    </Box>
  );

  if (error) return <Alert severity="error" sx={{ m: 3, borderRadius: 3, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</Alert>;

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

  return (
    <Box>
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
        <Box sx={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,53,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3, position: 'relative', zIndex: 1 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', mb: 1 }}>
              System Analytics
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', fontWeight: 500 }}>
              Fleet performance, regional distribution, and update reliability
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={exportToCSV}
              sx={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', borderRadius: 2, fontWeight: 700, '&:hover': { borderColor: '#fff', color: '#fff', bgcolor: 'rgba(255,255,255,0.05)' } }}
            >
              CSV Export
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={exportToPDF}
              sx={{ bgcolor: ORANGE, color: '#fff', borderRadius: 2, fontWeight: 800, px: 3, '&:hover': { bgcolor: '#E55A2B', transform: 'translateY(-2px)' }, boxShadow: '0 8px 20px rgba(255,107,53,0.3)', transition: 'all 0.2s' }}
            >
              Full Report
            </Button>
          </Box>
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
      <Card className="glass-card" sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography sx={{ fontWeight: 800, color: '#fff', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>Activity Trend</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Last 7 days — updates, devices & errors</Typography>
            </Box>
            <ToggleButtonGroup value={chartType} exclusive onChange={(e, v) => v && setChartType(v)} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {['area', 'line', 'bar'].map(t => (
                <ToggleButton key={t} value={t} sx={{ textTransform: 'capitalize', fontWeight: 700, fontSize: '0.75rem', px: 2, color: 'rgba(255,255,255,0.4)', '&.Mui-selected': { bgcolor: 'rgba(255,107,53,0.15)', color: ORANGE } }}>
                  {t}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
          <ResponsiveContainer width="100%" height={240}>
            {chartType === 'bar' ? (
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 600 }} />
                <Bar dataKey="updates" name="Updates" fill={ORANGE} radius={[4, 4, 0, 0]} />
                <Bar dataKey="devices" name="Devices" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="errors" name="Errors" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : chartType === 'line' ? (
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 600 }} />
                <Line type="monotone" dataKey="updates" name="Updates" stroke={ORANGE} strokeWidth={3} dot={{ r: 4, fill: ORANGE, strokeWidth: 2, stroke: '#1e293b' }} />
                <Line type="monotone" dataKey="devices" name="Devices" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#1e293b' }} />
                <Line type="monotone" dataKey="errors" name="Errors" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            ) : (
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="gUpdates" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={ORANGE} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={ORANGE} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gDevices" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 600 }} />
                <Area type="monotone" dataKey="updates" name="Updates" stroke={ORANGE} fill="url(#gUpdates)" strokeWidth={3} />
                <Area type="monotone" dataKey="devices" name="Devices" stroke="#3B82F6" fill="url(#gDevices)" strokeWidth={3} />
                <Line type="monotone" dataKey="errors" name="Errors" stroke="#EF4444" strokeWidth={2} strokeDasharray="6 6" dot={false} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>


      <Grid container spacing={3}>
        {/* Device Status Pie */}
        <Grid item xs={12} md={4}>
          <Card className="glass-card" sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ fontWeight: 800, color: '#fff', fontSize: '1rem', mb: 0.5, letterSpacing: '-0.02em' }}>Device Status</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Distribution across fleet</Typography>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={deviceStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} dataKey="value" paddingAngle={5}>
                    {deviceStatusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                {deviceStatusData.map((d, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS[i] }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>{d.name}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>


        {/* Regional Device Distribution */}
        <Grid item xs={12} md={5}>
          <Card className="glass-card" sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ fontWeight: 800, color: '#fff', fontSize: '1rem', mb: 0.5, letterSpacing: '-0.02em' }}>Devices by Region</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Geographic fleet distribution</Typography>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={regionData.slice(0, 6)} layout="vertical" margin={{ left: -20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)', fontWeight: 700 }} width={100} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="devices" name="Devices" fill={ORANGE} radius={[0, 4, 4, 0]} barSize={20}>
                    {regionData.slice(0, 6).map((_, i) => (
                      <Cell key={i} fill={`url(#gRegion${i})`} />
                    ))}
                  </Bar>
                  <defs>
                    {COLORS.map((c, i) => (
                      <linearGradient key={i} id={`gRegion${i}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={c} stopOpacity={0.8} />
                        <stop offset="100%" stopColor={c} stopOpacity={0.4} />
                      </linearGradient>
                    ))}
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>


        {/* Success Rate Radial */}
        <Grid item xs={12} md={3}>
          <Card className="glass-card" sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Typography sx={{ fontWeight: 800, color: '#fff', fontSize: '1rem', mb: 0.5, letterSpacing: '-0.02em' }}>Update Success</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Last 7 days</Typography>
              <Box sx={{ position: 'relative', mt: 2 }}>
                <ResponsiveContainer width="100%" height={160}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" data={radialData} startAngle={180} endAngle={-180}>
                    <RadialBar dataKey="value" background={{ fill: 'rgba(255,255,255,0.03)' }} cornerRadius={10} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', mt: -1 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.75rem', color: '#10B981', lineHeight: 1 }}>{stats?.successRate || 0}%</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>success</Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.06)' }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontWeight: 800, color: '#10B981', fontSize: '1.1rem' }}>{stats?.successJobs || 0}</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>Passed</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontWeight: 800, color: '#EF4444', fontSize: '1.1rem' }}>{stats?.failedJobs || 0}</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>Failed</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Real-time alerts */}
        <Grid item xs={12}>
          <Card className="glass-card">
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ fontWeight: 800, color: '#fff', fontSize: '1.1rem', mb: 3, letterSpacing: '-0.02em' }}>Fleet Health Summary</Typography>
              <Grid container spacing={3}>
                {[
                  { label: 'Device Availability', value: stats?.totalDevices ? Math.round((stats.activeDevices / stats.totalDevices) * 100) : 0, color: '#10B981', icon: <CheckCircleIcon /> },
                  { label: 'Schedule Completion', value: stats?.totalSchedules ? Math.round((stats.completedSchedules / stats.totalSchedules) * 100) : 0, color: '#3B82F6', icon: <TimelineIcon /> },
                  { label: 'Update Reliability', value: stats?.successRate || 0, color: ORANGE, icon: <TrendingUpIcon /> },
                  { label: 'Version Coverage', value: stats?.totalDevices && stats?.activeVersions ? Math.min(Math.round((stats.activeVersions / stats.totalDevices) * 100), 100) : 0, color: '#8B5CF6', icon: <SpeedIcon /> },
                ].map((item, i) => (
                  <Grid item xs={12} sm={6} md={3} key={i}>
                    <Box sx={{ p: 2.5, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <Box sx={{ color: item.color, display: 'flex' }}>{React.cloneElement(item.icon, { fontSize: 'small' })}</Box>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={item.value}
                        sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { background: `linear-gradient(90deg, ${item.color}, ${item.color}80)`, borderRadius: 3 } }} />
                      <Typography sx={{ fontWeight: 800, color: '#fff', mt: 1.5, fontSize: '1.1rem' }}>{item.value}%</Typography>
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
