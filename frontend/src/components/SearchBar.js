import React, { useState, useCallback, useEffect } from 'react';
import {
  Box, InputBase, Typography, CircularProgress, Chip, Avatar, Modal, Backdrop, Divider, alpha,
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
import { motion, AnimatePresence } from 'framer-motion';

const ORANGE = '#FF6B35';

function SearchBar({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ devices: [], schedules: [], versions: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) { setQuery(''); setResults({ devices: [], schedules: [], versions: [] }); }
  }, [open]);

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
    } catch (err) { console.error('Search error:', err); }
    finally { setLoading(false); }
  }, [query]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.length > 1) performSearch();
      else setResults({ devices: [], schedules: [], versions: [] });
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [query, performSearch]);

  const handleNavigate = (type, item) => {
    onClose();
    if (type === 'device') navigate(`/devices?imei=${item.imei}`);
    if (type === 'schedule') navigate(`/schedules?id=${item._id}`);
    if (type === 'version') navigate(`/versions?code=${item.versionCode}`);
  };

  const totalResults = results.devices.length + results.schedules.length + results.versions.length;
  const hasResults = totalResults > 0;

  const ResultItem = ({ icon, primary, secondary, color, onClick }) => (
    <Box onClick={onClick} sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 1.5, cursor: 'pointer', borderRadius: '12px', mx: 1, transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(255,255,255,0.03)', '& .result-arrow': { opacity: 1, transform: 'translateX(0)' } } }}>
      <Avatar sx={{ bgcolor: alpha(color, 0.1), color: color, width: 36, height: 36, border: `1px solid ${alpha(color, 0.2)}` }}>{icon}</Avatar>
      <Box flex={1} overflow="hidden">
        <Typography variant="body2" sx={{ fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{primary}</Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{secondary}</Typography>
      </Box>
      <ArrowForwardIcon className="result-arrow" fontSize="small" sx={{ color: ORANGE, opacity: 0, transform: 'translateX(-8px)', transition: 'all 0.2s' }} />
    </Box>
  );

  return (
    <Modal open={open} onClose={onClose} slots={{ backdrop: Backdrop }} slotProps={{ backdrop: { sx: { bgcolor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' } } }} sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', pt: { xs: 6, md: 12 }, px: 2 }}>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -20 }} style={{ width: '100%', maxWidth: 640, outline: 'none' }}>
            <Box className="glass-card" sx={{ width: '100%', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(13, 13, 20, 0.95)', boxShadow: '0 30px 100px rgba(0,0,0,0.8)', overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', px: 3, py: 2.5, borderBottom: hasResults || loading ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <SearchIcon sx={{ color: ORANGE, mr: 2, fontSize: 24 }} />
                <InputBase autoFocus fullWidth value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search fleet infrastructure..." sx={{ fontSize: '1.1rem', color: '#fff', fontWeight: 600, '& ::placeholder': { color: 'rgba(255,255,255,0.2)' } }} />
                {loading ? <CircularProgress size={20} sx={{ color: ORANGE, ml: 1 }} /> : <Chip label="ESC" size="small" onClick={onClose} sx={{ height: 22, fontSize: '0.65rem', fontWeight: 900, bgcolor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }} />}
              </Box>

              {hasResults && (
                <Box sx={{ maxHeight: 420, overflowY: 'auto', py: 1 }}>
                  {results.devices.length > 0 && (
                    <>
                      <Typography variant="caption" sx={{ px: 3, py: 1.5, display: 'block', color: ORANGE, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.6rem' }}>HARDWARE NODES</Typography>
                      {results.devices.map(d => <ResultItem key={d.imei} icon={<DevicesIcon fontSize="small" />} primary={d.imei} secondary={`${d.deviceModel} • ${d.status.toUpperCase()}`} color={ORANGE} onClick={() => handleNavigate('device', d)} />)}
                    </>
                  )}
                  {results.schedules.length > 0 && (
                    <>
                      <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.03)' }} />
                      <Typography variant="caption" sx={{ px: 3, py: 1.5, display: 'block', color: '#3B82F6', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.6rem' }}>ORCHESTRATION CYCLES</Typography>
                      {results.schedules.map(s => <ResultItem key={s._id} icon={<ScheduleIcon fontSize="small" />} primary={s.name} secondary={`v${s.fromVersionCode} → v${s.toVersionCode} • ${s.status.toUpperCase()}`} color="#3B82F6" onClick={() => handleNavigate('schedule', s)} />)}
                    </>
                  )}
                  {results.versions.length > 0 && (
                    <>
                      <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.03)' }} />
                      <Typography variant="caption" sx={{ px: 3, py: 1.5, display: 'block', color: '#10B981', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.6rem' }}>FIRMWARE REGISTRY</Typography>
                      {results.versions.map(v => <ResultItem key={v._id} icon={<UpdateIcon fontSize="small" />} primary={`v${v.versionName} (${v.versionCode})`} secondary={v.isActive ? 'OPERATIONAL' : 'DEPRECATED'} color="#10B981" onClick={() => handleNavigate('version', v)} />)}
                    </>
                  )}
                </Box>
              )}

              {query.length > 1 && !loading && !hasResults && (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                  <SearchIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.03)', mb: 2 }} />
                  <Typography sx={{ color: 'rgba(255,255,255,0.2)', fontWeight: 600 }}>Zero matches for identifier: <span style={{ color: '#fff' }}>"{query}"</span></Typography>
                </Box>
              )}

              {!query && (
                <Box sx={{ px: 3, py: 3, bgcolor: 'rgba(255,255,255,0.01)' }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.2)', fontWeight: 800, display: 'block', mb: 2, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.65rem' }}>QUICK NAVIGATION</Typography>
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    {[ {l: 'FLEET LEDGER', p: '/devices', c: ORANGE}, {l: 'ORCHESTRATION', p: '/schedules', c: '#3B82F6'}, {l: 'REGISTRY', p: '/versions', c: '#10B981'} ].map(item => (
                      <Chip key={item.l} label={item.l} size="small" onClick={() => { navigate(item.p); onClose(); }} sx={{ cursor: 'pointer', bgcolor: alpha(item.c, 0.1), color: item.c, fontWeight: 900, border: `1px solid ${alpha(item.c, 0.2)}`, '&:hover': { bgcolor: alpha(item.c, 0.2) }, fontSize: '0.65rem' }} />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}

export default SearchBar;