import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  InputBase,
  Typography,
  CircularProgress,
  Chip,
  Avatar,
  Modal,
  Backdrop,
  Paper,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Devices as DevicesIcon,
  Schedule as ScheduleIcon,
  Update as UpdateIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { devices, schedules, versions } from '../services/api';
import { alpha } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';

function SearchBar({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ devices: [], schedules: [], versions: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults({ devices: [], schedules: [], versions: [] });
    }
  }, [open]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.length > 1) {
        performSearch();
      } else {
        setResults({ devices: [], schedules: [], versions: [] });
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const performSearch = useCallback(async () => {
    setLoading(true);
    try {
      const [devRes, schedRes, verRes] = await Promise.allSettled([
        devices.getAll({ search: query, limit: 4 }),
        schedules.getAll({ search: query, limit: 4 }),
        versions.getAll({ search: query, limit: 4 }),
      ]);
      setResults({
        devices: devRes.status === 'fulfilled' ? devRes.value.data.devices || [] : [],
        schedules: schedRes.status === 'fulfilled' ? schedRes.value.data.schedules || [] : [],
        versions: verRes.status === 'fulfilled' ? verRes.value.data.versions || [] : [],
      });
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleNavigate = (type, item) => {
    onClose();
    switch (type) {
      case 'device':
        navigate(`/devices?imei=${item.imei}`);
        break;
      case 'schedule':
        navigate(`/schedules?id=${item._id}`);
        break;
      case 'version':
        navigate(`/versions?code=${item.versionCode}`);
        break;
      default:
        break;
    }
  };

  const totalResults = results.devices.length + results.schedules.length + results.versions.length;
  const hasResults = totalResults > 0;

  const ResultItem = ({ icon, primary, secondary, color, onClick }) => (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2,
        py: 1.5,
        cursor: 'pointer',
        borderRadius: 2,
        mx: 1,
        transition: 'all 0.15s ease',
        '&:hover': {
          bgcolor: alpha('#FF6B35', 0.06),
          '& .result-arrow': { opacity: 1, transform: 'translateX(0)' },
        },
      }}
    >
      <Avatar sx={{ bgcolor: alpha(color, 0.12), color: color, width: 36, height: 36 }}>
        {icon}
      </Avatar>
      <Box flex={1} overflow="hidden">
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1A1A2E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {primary}
        </Typography>
        <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
          {secondary}
        </Typography>
      </Box>
      <ArrowForwardIcon
        className="result-arrow"
        fontSize="small"
        sx={{
          color: '#FF6B35',
          opacity: 0,
          transform: 'translateX(-4px)',
          transition: 'all 0.15s ease',
          flexShrink: 0,
        }}
      />
    </Box>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { sx: { bgcolor: 'rgba(26, 26, 46, 0.4)', backdropFilter: 'blur(4px)' } } }}
      sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', pt: { xs: 6, md: 12 }, px: 2 }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -16 }}
            transition={{ duration: 0.2 }}
            style={{ width: '100%', maxWidth: 600, outline: 'none' }}
          >
            <Paper
              elevation={0}
              sx={{
                width: '100%',
                borderRadius: 3,
                border: '1px solid #E5E7EB',
                boxShadow: '0 24px 60px rgba(0,0,0,0.12)',
                overflow: 'hidden',
              }}
            >
              {/* Search Input */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 2.5,
                  py: 2,
                  borderBottom: hasResults || loading ? '1px solid #F3F4F6' : 'none',
                }}
              >
                <SearchIcon sx={{ color: '#9CA3AF', mr: 1.5, fontSize: 22 }} />
                <InputBase
                  autoFocus
                  fullWidth
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search devices, schedules, versions…"
                  sx={{
                    fontSize: '1rem',
                    color: '#1A1A2E',
                    fontWeight: 500,
                    fontFamily: '"Poppins", sans-serif',
                    '& ::placeholder': { color: '#9CA3AF' },
                  }}
                />
                {loading ? (
                  <CircularProgress size={18} sx={{ color: '#FF6B35', ml: 1 }} />
                ) : (
                  <Chip
                    label="ESC"
                    size="small"
                    onClick={onClose}
                    sx={{ cursor: 'pointer', height: 22, fontSize: '0.65rem', fontWeight: 700, bgcolor: '#F3F4F6', color: '#9CA3AF' }}
                  />
                )}
              </Box>

              {/* Results */}
              {hasResults && (
                <Box sx={{ maxHeight: 420, overflowY: 'auto', py: 1 }}>
                  {results.devices.length > 0 && (
                    <>
                      <Typography variant="caption" sx={{ px: 3, py: 1, display: 'block', color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.65rem' }}>
                        Devices
                      </Typography>
                      {results.devices.map(d => (
                        <ResultItem
                          key={d.imei}
                          icon={<DevicesIcon fontSize="small" />}
                          primary={d.imei}
                          secondary={`${d.deviceModel} • ${d.status}`}
                          color="#FF6B35"
                          onClick={() => handleNavigate('device', d)}
                        />
                      ))}
                    </>
                  )}

                  {results.schedules.length > 0 && (
                    <>
                      <Divider sx={{ my: 1, borderColor: '#F3F4F6' }} />
                      <Typography variant="caption" sx={{ px: 3, py: 1, display: 'block', color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.65rem' }}>
                        Schedules
                      </Typography>
                      {results.schedules.map(s => (
                        <ResultItem
                          key={s._id}
                          icon={<ScheduleIcon fontSize="small" />}
                          primary={s.name}
                          secondary={`v${s.fromVersionCode} → v${s.toVersionCode} • ${s.status}`}
                          color="#3B82F6"
                          onClick={() => handleNavigate('schedule', s)}
                        />
                      ))}
                    </>
                  )}

                  {results.versions.length > 0 && (
                    <>
                      <Divider sx={{ my: 1, borderColor: '#F3F4F6' }} />
                      <Typography variant="caption" sx={{ px: 3, py: 1, display: 'block', color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.65rem' }}>
                        Versions
                      </Typography>
                      {results.versions.map(v => (
                        <ResultItem
                          key={v._id}
                          icon={<UpdateIcon fontSize="small" />}
                          primary={`v${v.versionName} (${v.versionCode})`}
                          secondary={v.isActive ? 'Active' : 'Inactive'}
                          color="#10B981"
                          onClick={() => handleNavigate('version', v)}
                        />
                      ))}
                    </>
                  )}
                </Box>
              )}

              {query.length > 1 && !loading && !hasResults && (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                  <SearchIcon sx={{ fontSize: 36, color: '#E5E7EB', mb: 1 }} />
                  <Typography variant="body2" sx={{ color: '#9CA3AF', fontWeight: 500 }}>
                    No results for "<strong style={{ color: '#1A1A2E' }}>{query}</strong>"
                  </Typography>
                </Box>
              )}

              {!query && (
                <Box sx={{ px: 3, py: 2.5 }}>
                  <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600, display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.65rem' }}>
                    Quick Actions
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {[{ label: 'View Devices', path: '/devices', color: '#FF6B35' }, { label: 'Schedules', path: '/schedules', color: '#3B82F6' }, { label: 'Versions', path: '/versions', color: '#10B981' }].map(item => (
                      <Chip
                        key={item.label}
                        label={item.label}
                        size="small"
                        onClick={() => { navigate(item.path); onClose(); }}
                        sx={{
                          cursor: 'pointer',
                          bgcolor: alpha(item.color, 0.08),
                          color: item.color,
                          fontWeight: 600,
                          border: `1px solid ${alpha(item.color, 0.2)}`,
                          '&:hover': { bgcolor: alpha(item.color, 0.14) },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}

export default SearchBar;