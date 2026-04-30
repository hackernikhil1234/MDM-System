import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  Chip,
  alpha,
} from '@mui/material';

import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Devices as DevicesIcon,
  Update as UpdateIcon,
  Schedule as ScheduleIcon,
  History as HistoryIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  DoneAll as DoneAllIcon,
  DeleteSweep as DeleteSweepIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import SearchBar from './SearchBar';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const ORANGE = '#FF6B35';


const drawerWidth = 270;

function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsEl, setNotificationsEl] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, logout } = useAuth();
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    clearNotifications,
    handleNotificationAction
  } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();


  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleProfileMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleNotificationsOpen = (e) => setNotificationsEl(e.currentTarget);
  const handleMenuClose = () => { setAnchorEl(null); setNotificationsEl(null); };
  const handleLogout = () => { logout(); navigate('/login'); };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Devices', icon: <DevicesIcon />, path: '/devices' },
    { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
    { text: 'Versions', icon: <UpdateIcon />, path: '/versions', adminOnly: true },
    { text: 'Schedules', icon: <ScheduleIcon />, path: '/schedules' },
    { text: 'Audit Trail', icon: <HistoryIcon />, path: '/audit', adminOnly: true },
    { text: 'Users', icon: <GroupIcon />, path: '/users', adminOnly: true },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const filteredMenuItems = menuItems.filter(item =>
    !item.adminOnly || (item.adminOnly && user?.role === 'admin')
  );

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'rgba(13, 13, 20, 0.4)', backdropFilter: 'blur(40px)', borderRight: '1px solid rgba(255, 255, 255, 0.05)' }}>
      {/* Logo */}
      <Box sx={{ px: 3, py: 5, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 30px rgba(255, 107, 53, 0.3)',
            flexShrink: 0,
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <DevicesIcon sx={{ color: '#fff', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              fontSize: '1.2rem',
              color: '#fff',
              lineHeight: 1,
              letterSpacing: '-0.04em',
            }}
          >
            MDM<span style={{ color: '#FF6B35' }}>CORE</span>
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            Infrastructure
          </Typography>
        </Box>
      </Box>


      <Divider sx={{ borderColor: 'rgba(255,255,255,0.03)', mx: 2 }} />

      {/* User card */}
      <Box sx={{ px: 2, py: 4 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': { background: 'rgba(255, 255, 255, 0.05)', transform: 'translateY(-2px)', borderColor: 'rgba(255,255,255,0.1)' },
          }}
          onClick={handleProfileMenuOpen}
        >
          <Avatar
            sx={{
              bgcolor: '#FF6B35',
              width: 40,
              height: 40,
              fontSize: '0.9rem',
              fontWeight: 900,
              boxShadow: '0 8px 20px rgba(255, 107, 53, 0.2)',
              border: '2px solid rgba(255,255,255,0.1)'
            }}
          >
            {user?.name?.charAt(0) || 'A'}
          </Avatar>
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 800, color: '#fff', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {user?.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.2 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10B981', mr: 1, boxShadow: '0 0 10px #10B981' }} />
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: '0.05em' }}>
                {user?.role || 'admin'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>


      {/* Navigation */}
      <Box sx={{ px: 2, py: 1, flex: 1 }}>
        <Typography
          variant="caption"
          sx={{ px: 2.5, color: 'rgba(255,255,255,0.2)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.6rem', display: 'block', mb: 3 }}
        >
          Command Center
        </Typography>
        <List disablePadding>
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.div key={item.text} whileHover={{ x: 5 }} whileTap={{ scale: 0.97 }}>
                <ListItem
                  button
                  onClick={() => { navigate(item.path); setMobileOpen(false); }}
                  sx={{
                    borderRadius: '12px',
                    mb: 1,
                    px: 2.5,
                    py: 1.5,
                    position: 'relative',
                    background: isActive ? 'rgba(255, 107, 53, 0.08)' : 'transparent',
                    border: isActive ? '1px solid rgba(255, 107, 53, 0.15)' : '1px solid transparent',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderColor: 'rgba(255, 255, 255, 0.05)',
                    },
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 38,
                      color: isActive ? '#FF6B35' : 'rgba(255,255,255,0.3)',
                      transition: 'color 0.3s',
                    }}
                  >
                    {React.cloneElement(item.icon, { sx: { fontSize: 22 } })}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.9rem',
                      fontWeight: isActive ? 800 : 600,
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                      letterSpacing: '0.01em',
                      transition: 'color 0.3s',
                    }}
                  />
                </ListItem>
              </motion.div>
            );
          })}
        </List>
      </Box>


      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mx: 2 }} />

      {/* Logout */}
      <List sx={{ px: 2, py: 2 }}>
        <ListItem
          button
          onClick={handleLogout}
          sx={{
            borderRadius: 2.5,
            px: 2,
            py: 1.25,
            color: 'rgba(255,255,255,0.5)',
            '&:hover': {
              background: 'rgba(239, 68, 68, 0.08)',
              color: '#EF4444',
              '& .MuiListItemIcon-root': { color: '#EF4444' },
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Logout System"
            primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600, color: 'inherit' }}
          />
        </ListItem>
      </List>
    </Box>
  );


  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Animated Mesh Background */}
      <div className="mesh-bg" />

      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'rgba(13, 13, 20, 0.4)',
          backdropFilter: 'blur(30px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: 'none',
          color: '#fff',
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 4 }, gap: 2, height: 84 }}>
          <IconButton
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 1, display: { sm: 'none' }, color: 'rgba(255,255,255,0.7)' }}
          >
            <MenuIcon />
          </IconButton>

          {/* Page title */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#fff', fontSize: '1.1rem', letterSpacing: '-0.02em', mb: 0.2 }}>
              {menuItems.find(item => item.path === location.pathname)?.text.toUpperCase() || 'DASHBOARD'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {format(new Date(), 'EEEE, MMMM do')} — SYSTEM STABLE
            </Typography>
          </Box>

          {/* Search */}
          <Tooltip title="Search Ledger (⌘K)">
            <IconButton
              onClick={() => setSearchOpen(true)}
              sx={{
                bgcolor: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.4)',
                borderRadius: '12px',
                px: 2,
                gap: 1.5,
                height: 42,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' },
                transition: 'all 0.2s'
              }}
            >
              <SearchIcon sx={{ fontSize: 18 }} />
              <Typography variant="caption" sx={{ color: 'inherit', fontWeight: 700, display: { xs: 'none', md: 'block' }, letterSpacing: '0.02em' }}>
                Quick Search...
              </Typography>
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Communications">
            <IconButton
              onClick={handleNotificationsOpen}
              sx={{
                bgcolor: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.4)',
                borderRadius: '12px',
                width: 42,
                height: 42,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' },
                transition: 'all 0.2s'
              }}
            >
              <Badge 
                badgeContent={unreadCount} 
                max={9}
                sx={{
                  '& .MuiBadge-badge': {
                    bgcolor: '#FF6B35',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.65rem',
                    boxShadow: '0 0 10px rgba(255, 107, 53, 0.4)'
                  }
                }}
              >
                <NotificationsIcon sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Profile Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 240,
                borderRadius: '16px',
                bgcolor: 'rgba(26, 26, 46, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                overflow: 'hidden',
                p: 1
              }
            }}
          >
            <Box sx={{ px: 2, py: 2, borderBottom: '1px solid rgba(255,255,255,0.05)', mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#fff', fontSize: '0.9rem' }}>{user?.name}</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{user?.email}</Typography>
            </Box>
            <MenuItem onClick={() => { navigate('/settings'); handleMenuClose(); }} sx={{ gap: 2, py: 1.5, borderRadius: '10px', color: 'rgba(255,255,255,0.6)', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', color: '#fff' } }}>
              <SettingsIcon sx={{ fontSize: 18 }} />
              <Typography variant="body2" fontWeight={700}>System Settings</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ gap: 2, py: 1.5, borderRadius: '10px', color: '#EF4444', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.08)' } }}>
              <LogoutIcon sx={{ fontSize: 18 }} />
              <Typography variant="body2" fontWeight={700}>Terminate Session</Typography>
            </MenuItem>
          </Menu>


          {/* Notifications Menu */}
          <Menu
            anchorEl={notificationsEl}
            open={Boolean(notificationsEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                width: 400,
                maxHeight: 520,
                mt: 1.5,
                borderRadius: '20px',
                bgcolor: 'rgba(26, 26, 46, 0.9)',
                backdropFilter: 'blur(30px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                overflow: 'hidden',
              }
            }}
          >
            <Box sx={{ px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(255,255,255,0.02)' }}>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#fff', fontSize: '0.95rem', letterSpacing: '0.02em' }}>
                SIGNAL ALERTS
                {unreadCount > 0 && (
                  <Chip label={unreadCount} size="small" sx={{ ml: 1.5, height: 18, fontSize: '0.65rem', bgcolor: ORANGE, color: '#fff', fontWeight: 900, boxShadow: `0 0 10px ${alpha(ORANGE, 0.4)}` }} />
                )}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Acknowledge All">
                  <IconButton size="small" onClick={markAllAsRead} sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: ORANGE, bgcolor: 'rgba(255,255,255,0.05)' } }}>
                    <DoneAllIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Purge History">
                  <IconButton size="small" onClick={clearNotifications} sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#EF4444', bgcolor: 'rgba(255,255,255,0.05)' } }}>
                    <DeleteSweepIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Box sx={{ maxHeight: 420, overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <Box sx={{ py: 10, textAlign: 'center', px: 4 }}>
                  <NotificationsIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.05)', mb: 2 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Telemetry Stream Silent
                  </Typography>
                </Box>
              ) : (
                notifications.map((notification) => (
                  <MenuItem
                    key={notification.id}
                    onClick={() => { handleNotificationAction(notification); handleMenuClose(); }}
                    sx={{
                      py: 2,
                      px: 3,
                      alignItems: 'flex-start',
                      backgroundColor: notification.read ? 'transparent' : 'rgba(255, 107, 53, 0.03)',
                      borderLeft: notification.read ? '3px solid transparent' : `3px solid ${ORANGE}`,
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        mr: 2,
                        bgcolor:
                          notification.type === 'error' ? alpha('#EF4444', 0.1) :
                          notification.type === 'warning' ? alpha('#F59E0B', 0.1) :
                          notification.type === 'success' ? alpha('#10B981', 0.1) :
                          alpha('#3B82F6', 0.1),
                        flexShrink: 0,
                        border: '1px solid rgba(255,255,255,0.05)'
                      }}
                    >
                      {notification.type === 'error' ? <ErrorIcon sx={{ fontSize: 18, color: '#EF4444' }} /> :
                       notification.type === 'warning' ? <WarningIcon sx={{ fontSize: 18, color: '#F59E0B' }} /> :
                       notification.type === 'success' ? <CheckCircleIcon sx={{ fontSize: 18, color: '#10B981' }} /> :
                       <InfoIcon sx={{ fontSize: 18, color: '#3B82F6' }} />}
                    </Avatar>
                    <Box flex={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#fff', fontSize: '0.85rem' }}>
                          {notification.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.65rem', fontWeight: 700 }}>
                          {format(new Date(notification.timestamp), 'HH:mm')}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', lineHeight: 1.4, fontWeight: 500 }}>
                        {notification.message}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))
              )}
            </Box>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth, 
              bgcolor: 'transparent', 
              border: 'none',
              backgroundImage: 'none'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth, 
              bgcolor: 'transparent', 
              border: 'none',
              backgroundImage: 'none'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>


      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Toolbar />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <Box sx={{ p: { xs: 2, sm: 4, md: 5 } }}>
              {children}
            </Box>
          </motion.div>
        </AnimatePresence>
      </Box>


      <SearchBar open={searchOpen} onClose={() => setSearchOpen(false)} />
    </Box>
  );
}

export default Layout;