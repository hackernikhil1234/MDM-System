import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  TextField,
  Alert,
  LinearProgress,
  Switch,
  FormControlLabel,
  alpha,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { versions } from '../services/api';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import EmptyState from '../components/EmptyState';
import StyledDialog from '../components/StyledDialog';

const ORANGE = '#FF6B35';

const VersionStatCard = ({ title, value, icon, color, subtitle }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ height: '100%' }}>
    <Card className="glass-card" sx={{ height: '100%', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-5px)', borderColor: alpha(color, 0.3) } }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.65rem' }}>
              {title}
            </Typography>
            <Typography sx={{ fontWeight: 900, fontSize: '1.75rem', color: '#fff', letterSpacing: '-0.02em', mt: 0.5 }}>{value}</Typography>
            <Typography variant="caption" sx={{ color: alpha(color, 0.8), mt: 0.5, display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {subtitle}
            </Typography>
          </Box>
          <Box sx={{ width: 44, height: 44, borderRadius: '14px', background: alpha(color, 0.1), border: `1px solid ${alpha(color, 0.2)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
            {React.cloneElement(icon, { sx: { fontSize: 22 } })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);

function VersionManagement() {
  const navigate = useNavigate();
  const [versionList, setVersionList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [formData, setFormData] = useState({
    versionCode: '',
    versionName: '',
    releaseDate: new Date().toISOString().split('T')[0],
    supportedOSRange: { min: '', max: '' },
    isMandatory: false,
    isActive: true,
    releaseNotes: '',
    downloadUrl: '',
    fileSize: '',
  });
  const [sortConfig, setSortConfig] = useState({
    field: 'releaseDate',
    direction: 'desc'
  });

  useEffect(() => {
    fetchVersions();
  }, []);

  const handleSort = (field) => {
    setSortConfig({
      field,
      direction: sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const sortedVersions = [...versionList].sort((a, b) => {
    let aVal, bVal;
    switch(sortConfig.field) {
      case 'versionCode': aVal = a.versionCode; bVal = b.versionCode; break;
      case 'versionName': aVal = a.versionName; bVal = b.versionName; break;
      case 'releaseDate': aVal = new Date(a.releaseDate).getTime(); bVal = new Date(b.releaseDate).getTime(); break;
      case 'isMandatory': aVal = a.isMandatory ? 1 : 0; bVal = b.isMandatory ? 1 : 0; break;
      default: return 0;
    }
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const response = await versions.getAll();
      setVersionList(response.data.versions || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching versions:', error);
      setError('Failed to load version manifest');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (version = null) => {
    if (version) {
      setSelectedVersion(version);
      setFormData({
        versionCode: version.versionCode,
        versionName: version.versionName,
        releaseDate: version.releaseDate.split('T')[0],
        supportedOSRange: version.supportedOSRange || { min: '', max: '' },
        isMandatory: version.isMandatory || false,
        isActive: version.isActive !== false,
        releaseNotes: version.releaseNotes || '',
        downloadUrl: version.downloadUrl || '',
        fileSize: version.fileSize || '',
      });
    } else {
      setSelectedVersion(null);
      setFormData({
        versionCode: '',
        versionName: '',
        releaseDate: new Date().toISOString().split('T')[0],
        supportedOSRange: { min: '', max: '' },
        isMandatory: false,
        isActive: true,
        releaseNotes: '',
        downloadUrl: '',
        fileSize: '',
      });
    }
    setDialogOpen(true);
  };

  const handleDeleteVersion = (version) => {
    setSelectedVersion(version);
    setDeleteDialogOpen(true);
  };

  const handleSaveVersion = async () => {
    try {
      setLoading(true);
      if (selectedVersion) {
        await versions.update(selectedVersion.versionCode, formData);
      } else {
        await versions.create(formData);
      }
      setDialogOpen(false);
      await fetchVersions();
    } catch (error) {
      setError('Critical: Failed to sync version metadata');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      await versions.delete(selectedVersion.versionCode);
      setDeleteDialogOpen(false);
      await fetchVersions();
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      if (errorMsg.includes('schedule')) {
        if (window.confirm(`This build is actively referenced in schedules. Redirect to Broadcast Management?`)) {
          navigate(`/schedules?version=${selectedVersion.versionCode}`);
        }
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const activeVersions = versionList.filter(v => v.isActive).length;
  const latestVersion = versionList[0]?.versionName || 'N/A';

  return (
    <PageTransition>
      <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
        {/* Header Section */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', mb: 1, textTransform: 'uppercase' }}>
              Build <span style={{ color: ORANGE }}>Archive</span>
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.95rem', fontWeight: 600 }}>
              Manage infrastructure build cycles, OTA updates and system mandates
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ bgcolor: ORANGE, color: '#fff', borderRadius: '12px', fontWeight: 800, px: 4, py: 1.5, boxShadow: `0 8px 25px ${alpha(ORANGE, 0.4)}`, '&:hover': { bgcolor: '#E55A2B', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}
          >
            Deploy New Build
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: '12px', bgcolor: alpha('#EF4444', 0.1), color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </Alert>
        )}

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <VersionStatCard
              title="Registry Size"
              value={versionList.length}
              icon={<HistoryIcon />}
              color="#3B82F6"
              subtitle="Total builds archived"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <VersionStatCard
              title="OTA Active"
              value={activeVersions}
              icon={<CheckCircleIcon />}
              color="#10B981"
              subtitle="Live production builds"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <VersionStatCard
              title="Latest Signal"
              value={latestVersion}
              icon={<CloudUploadIcon />}
              color={ORANGE}
              subtitle="Current system head"
            />
          </Grid>
        </Grid>

        {/* Main Content Table */}
        <Card className="glass-card" sx={{ overflow: 'hidden' }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell onClick={() => handleSort('versionName')} sx={{ bgcolor: 'rgba(20, 20, 35, 0.9) !important', color: 'rgba(255,255,255,0.4) !important', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    Build Identifier {sortConfig.field === 'versionName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell onClick={() => handleSort('versionCode')} sx={{ bgcolor: 'rgba(20, 20, 35, 0.9) !important', color: 'rgba(255,255,255,0.4) !important', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    Revision {sortConfig.field === 'versionCode' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell onClick={() => handleSort('releaseDate')} sx={{ bgcolor: 'rgba(20, 20, 35, 0.9) !important', color: 'rgba(255,255,255,0.4) !important', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    Release Cycle {sortConfig.field === 'releaseDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell sx={{ bgcolor: 'rgba(20, 20, 35, 0.9) !important', color: 'rgba(255,255,255,0.4) !important', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    Environment
                  </TableCell>
                  <TableCell sx={{ bgcolor: 'rgba(20, 20, 35, 0.9) !important', color: 'rgba(255,255,255,0.4) !important', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    Type
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
                ) : versionList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ py: 12, textAlign: 'center', borderBottom: 'none' }}>
                      <EmptyState
                        icon={<CloudUploadIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.05)' }} />}
                        title="ARCHIVE EMPTY"
                        description="Start the system by deploying the first build revision."
                        actionText="DEPLOY NOW"
                        onAction={() => handleOpenDialog()}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  <AnimatePresence>
                    {sortedVersions.map((version, i) => (
                      <motion.tr
                        key={version._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        style={{ display: 'table-row' }}
                        className="hover-row"
                      >
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <Typography sx={{ color: '#fff', fontSize: '0.9rem', fontWeight: 800 }}>{version.versionName}</Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <Chip label={`REV-${version.versionCode}`} size="small" sx={{ fontWeight: 900, fontSize: '0.65rem', bgcolor: alpha('#3B82F6', 0.1), color: '#3B82F6', border: `1px solid ${alpha('#3B82F6', 0.2)}` }} />
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: 600 }}>{format(new Date(version.releaseDate), 'PP')}</Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', fontWeight: 700 }}>OS {version.supportedOSRange?.min} - {version.supportedOSRange?.max}</Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <Chip
                            label={version.isMandatory ? 'MANDATORY' : 'OPTIONAL'}
                            size="small"
                            sx={{
                              fontWeight: 900,
                              fontSize: '0.6rem',
                              bgcolor: version.isMandatory ? alpha('#F59E0B', 0.1) : alpha('rgba(255,255,255,0.5)', 0.05),
                              color: version.isMandatory ? '#F59E0B' : 'rgba(255,255,255,0.4)',
                              border: `1px solid ${version.isMandatory ? alpha('#F59E0B', 0.2) : 'rgba(255,255,255,0.1)'}`
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <Chip
                            label={version.isActive ? 'LIVE' : 'ARCHIVED'}
                            size="small"
                            sx={{
                              fontWeight: 900,
                              fontSize: '0.6rem',
                              bgcolor: version.isActive ? alpha('#10B981', 0.1) : alpha('#EF4444', 0.1),
                              color: version.isActive ? '#10B981' : '#EF4444',
                              border: `1px solid ${version.isActive ? alpha('#10B981', 0.2) : alpha('#EF4444', 0.2)}`
                            }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <IconButton size="small" onClick={() => handleOpenDialog(version)} sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: ORANGE, bgcolor: alpha(ORANGE, 0.1) } }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDeleteVersion(version)} sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#EF4444', bgcolor: alpha('#EF4444', 0.1) } }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
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

        {/* Action Dialogs */}
        <StyledDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title={selectedVersion ? 'EDIT BUILD PROFILE' : 'DEPLOY NEW BUILD'}
          onConfirm={handleSaveVersion}
          confirmText="COMMIT CHANGES"
          loading={loading}
          maxWidth="md"
        >
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Version Code (Numeric)" type="number" value={formData.versionCode} onChange={(e) => setFormData({...formData, versionCode: e.target.value})} disabled={selectedVersion} 
                variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Version Name (String)" value={formData.versionName} onChange={(e) => setFormData({...formData, versionName: e.target.value})} 
                variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Release Timestamp" type="date" value={formData.releaseDate} onChange={(e) => setFormData({...formData, releaseDate: e.target.value})} 
                InputLabelProps={{ shrink: true }} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Binary Download Endpoint" value={formData.downloadUrl} onChange={(e) => setFormData({...formData, downloadUrl: e.target.value})} 
                variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField fullWidth label="Min OS" value={formData.supportedOSRange.min} onChange={(e) => setFormData({...formData, supportedOSRange: {...formData.supportedOSRange, min: e.target.value}})} 
                variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField fullWidth label="Max OS" value={formData.supportedOSRange.max} onChange={(e) => setFormData({...formData, supportedOSRange: {...formData.supportedOSRange, max: e.target.value}})} 
                variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 3 }}>
                <FormControlLabel control={<Switch checked={formData.isMandatory} onChange={(e) => setFormData({...formData, isMandatory: e.target.checked})} color="warning" />} label="MANDATORY" sx={{ '& .MuiTypography-root': { fontWeight: 800, fontSize: '0.75rem', color: formData.isMandatory ? '#F59E0B' : 'rgba(255,255,255,0.3)' } }} />
                <FormControlLabel control={<Switch checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} color="success" />} label="ACTIVE OTA" sx={{ '& .MuiTypography-root': { fontWeight: 800, fontSize: '0.75rem', color: formData.isActive ? '#10B981' : 'rgba(255,255,255,0.3)' } }} />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Release Intelligence & Notes" multiline rows={4} value={formData.releaseNotes} onChange={(e) => setFormData({...formData, releaseNotes: e.target.value})} 
                variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
            </Grid>
          </Grid>
        </StyledDialog>

        <StyledDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          title="DESTRUCTIVE ACTION"
          onConfirm={handleConfirmDelete}
          confirmText="PURGE BUILD"
          confirmColor="error"
          loading={loading}
        >
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <WarningIcon sx={{ fontSize: 64, color: '#EF4444', mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, mb: 1 }}>Confirm Build Purge?</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.5)', mb: 3 }}>You are about to permanently delete version <strong style={{ color: '#fff' }}>{selectedVersion?.versionName}</strong> from the system manifest.</Typography>
            <Alert severity="error" sx={{ bgcolor: alpha('#EF4444', 0.1), color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)', textAlign: 'left', borderRadius: '10px' }}>
              This action is immutable. Active schedules referencing this build may experience telemetry failures.
            </Alert>
          </Box>
        </StyledDialog>
      </Box>
    </PageTransition>
  );
}

export default VersionManagement;