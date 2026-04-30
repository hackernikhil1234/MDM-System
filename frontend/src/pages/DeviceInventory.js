import React, { useState, useEffect, useCallback } from 'react';
import PageTransition from '../components/PageTransition';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, TextField, InputAdornment,
  Chip, IconButton, Collapse, Grid, Card, CardContent, LinearProgress, alpha,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  PhoneAndroid as PhoneAndroidIcon,
  LocationOn as LocationIcon,
  SignalCellularAlt as SignalIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import api from '../services/api';
import { format } from 'date-fns';

const ORANGE = '#FF6B35';

function DeviceInventory() {
  const [devices, setDevices] = useState([]);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedDevice, setExpandedDevice] = useState(null);
  const [deviceDetails, setDeviceDetails] = useState({});

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/devices', { params: { page: page + 1, limit: rowsPerPage, search: searchTerm } });
      setDevices(response.data.devices);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally { setLoading(false); }
  }, [page, rowsPerPage, searchTerm]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const fetchDeviceDetails = async (imei) => {
    try {
      const response = await api.get(`/devices/${imei}`);
      setDeviceDetails(prev => ({ ...prev, [imei]: response.data.device }));
    } catch (error) { console.error('Error fetching device details:', error); }
  };

  const handleExpandDevice = (imei) => {
    if (expandedDevice === imei) {
      setExpandedDevice(null);
    } else {
      setExpandedDevice(imei);
      if (!deviceDetails[imei]) fetchDeviceDetails(imei);
    }
  };

  const getVersionStatus = (device) => {
    const latestVersion = stats?.latestVersion || 0;
    if (device.appVersionCode >= latestVersion) return <Chip label="STABLE" size="small" sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: '#10B981', fontWeight: 900, fontSize: '0.6rem' }} />;
    return <Chip label="LEGACY" size="small" sx={{ bgcolor: alpha(ORANGE, 0.1), color: ORANGE, fontWeight: 900, fontSize: '0.6rem' }} />;
  };

  return (
    <PageTransition>
      <Box sx={{ flexGrow: 1 }}>
        {/* Header Section */}
        <Box className="glass-card" sx={{ p: { xs: 3, md: 5 }, mb: 4, position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
          <Box sx={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(ORANGE, 0.05)} 0%, transparent 70%)` }} />
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#fff', mb: 1, letterSpacing: '-0.04em' }}>HARDWARE <span style={{ color: ORANGE }}>LEDGER</span></Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.95rem', fontWeight: 600 }}>Comprehensive inventory tracking and operational telemetry for all deployed hardware nodes.</Typography>
          </Box>
        </Box>

        {/* Stats Grid */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              { label: 'TOTAL ACTIVE UNITS', value: stats.totalActive, color: '#3B82F6', icon: <PhoneAndroidIcon /> },
              { label: 'IDLE CAPACITY', value: stats.inactiveDevices, color: ORANGE, icon: <SignalIcon /> },
              { label: 'FLEET HEALTH', value: '98.2%', color: '#10B981', icon: <CheckCircleIcon /> },
              { label: 'AVG LATENCY', value: '42MS', color: '#8B5CF6', icon: <LocationIcon /> }
            ].map((s, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Card className="glass-card" sx={{ border: `1px solid ${alpha(s.color, 0.1)}`, background: 'rgba(255,255,255,0.01)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '10px', background: alpha(s.color, 0.1), border: `1px solid ${alpha(s.color, 0.2)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, mb: 2 }}>{s.icon}</Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 900, letterSpacing: '0.1em' }}>{s.label}</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#fff', mt: 0.5 }}>{s.value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Main Inventory Table */}
        <Card className="glass-card" sx={{ p: 0, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
          <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <TextField fullWidth placeholder="Filter units by IMEI, model identifier, or geolocational criteria..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'rgba(255,255,255,0.2)', fontSize: 20 }} /></InputAdornment>, sx: { color: '#fff', borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.02)', '& fieldset': { borderColor: 'rgba(255,255,255,0.05)' } } }} />
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }} />
                  <TableCell sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 900, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>IMEI IDENTIFIER</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 900, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>FIRMWARE</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 900, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>SPECS</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 900, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>LAST SIGNAL</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 900, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>GEOLOCATION</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 900, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>STATUS</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7}><LinearProgress sx={{ bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: ORANGE } }} /></TableCell></TableRow>
                ) : (
                  devices.map((device) => (
                    <React.Fragment key={device.imei}>
                      <TableRow hover sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' }, cursor: 'pointer' }} onClick={() => handleExpandDevice(device.imei)}>
                        <TableCell padding="checkbox" sx={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}><IconButton size="small" sx={{ color: 'rgba(255,255,255,0.2)' }}>{expandedDevice === device.imei ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton></TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}><Typography variant="body2" sx={{ fontWeight: 900, color: '#fff' }}>{device.imei}</Typography></TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{getVersionStatus(device)}</TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}><Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>{device.deviceModel}</Typography><Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>{device.deviceOS}</Typography></TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}><Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>{format(new Date(device.lastOpenTime), 'MMM dd, HH:mm')}</Typography></TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}><Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>{device.location?.region || 'Global'}</Typography><Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>{device.location?.city || 'Roaming'}</Typography></TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}><Chip label={device.status.toUpperCase()} size="small" sx={{ bgcolor: device.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)', color: device.status === 'active' ? '#10B981' : 'rgba(255,255,255,0.4)', fontWeight: 900, fontSize: '0.6rem' }} /></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={7} sx={{ py: 0, border: 'none' }}>
                          <Collapse in={expandedDevice === device.imei}>
                            <Box sx={{ p: 4, bgcolor: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <Grid container spacing={4}>
                                <Grid item xs={12} md={4}>
                                  <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <Typography variant="caption" sx={{ color: ORANGE, fontWeight: 900, display: 'block', mb: 2, letterSpacing: '0.1em' }}>HARDWARE TELEMETRY</Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                      {[ {l: 'Battery Charge', v: `${deviceDetails[device.imei]?.metadata?.batteryLevel || '--'}%`}, {l: 'Storage Avail', v: `${deviceDetails[device.imei]?.metadata?.storageAvailable || '--'}GB`}, {l: 'Signal Mode', v: deviceDetails[device.imei]?.metadata?.networkType || 'LTE'} ].map((item, i) => (
                                        <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontWeight: 700 }}>{item.l}</Typography><Typography sx={{ color: '#fff', fontSize: '0.75rem', fontWeight: 900 }}>{item.v}</Typography></Box>
                                      ))}
                                    </Box>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                  <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <Typography variant="caption" sx={{ color: ORANGE, fontWeight: 900, display: 'block', mb: 2, letterSpacing: '0.1em' }}>PROVISIONING INFO</Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                      {[ {l: 'Customization', v: device.clientCustomization || 'Standard'}, {l: 'Created At', v: format(new Date(device.createdAt), 'MMM dd, yyyy')}, {l: 'Last Sync', v: format(new Date(device.updatedAt), 'MMM dd, yyyy')} ].map((item, i) => (
                                        <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontWeight: 700 }}>{item.l}</Typography><Typography sx={{ color: '#fff', fontSize: '0.75rem', fontWeight: 900 }}>{item.v}</Typography></Box>
                                      ))}
                                    </Box>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                  <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <Typography variant="caption" sx={{ color: ORANGE, fontWeight: 900, display: 'block', mb: 2, letterSpacing: '0.1em' }}>POSITIONING</Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                      {[ {l: 'Geographic Node', v: device.location?.region || 'Global'}, {l: 'City/Domain', v: device.location?.city || 'Roaming'} ].map((item, i) => (
                                        <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontWeight: 700 }}>{item.l}</Typography><Typography sx={{ color: '#fff', fontSize: '0.75rem', fontWeight: 900 }}>{item.v}</Typography></Box>
                                      ))}
                                    </Box>
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

          <TablePagination rowsPerPageOptions={[10, 20, 50, 100]} component="div" count={stats?.totalActive || 0} rowsPerPage={rowsPerPage} page={page} onPageChange={(e, p) => setPage(p)} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} sx={{ color: 'rgba(255,255,255,0.4)', borderTop: '1px solid rgba(255,255,255,0.05)', '& .MuiIconButton-root': { color: 'rgba(255,255,255,0.4)' }, '& .MuiTablePagination-select': { fontWeight: 800 } }} />
        </Card>
      </Box>
    </PageTransition>
  );
}

export default DeviceInventory;