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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FFFFFF' }}>
      {/* Logo */}
      <Box sx={{ px: 3, py: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2.5,
            background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(255, 107, 53, 0.35)',
            flexShrink: 0,
          }}
        >
          <DevicesIcon sx={{ color: '#fff', fontSize: 22 }} />
        </Box>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '1.15rem',
              color: '#1A1A2E',
              lineHeight: 1.2,
            }}
            onClick={() => navigate('/')}
          >
            MDM<span style={{ color: '#FF6B35' }}>Portal</span>
          </Typography>
          <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.68rem' }}>
            Device Management
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: '#F3F4F6' }} />

      {/* User card */}
      <Box sx={{ px: 2.5, py: 2.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            borderRadius: 2.5,
            background: 'linear-gradient(135deg, #FFF3EF 0%, #FFEDE5 100%)',
            border: '1px solid rgba(255,107,53,0.15)',
            cursor: 'pointer',
          }}
          onClick={handleProfileMenuOpen}
        >
          <Avatar
            sx={{
              bgcolor: '#FF6B35',
              width: 40,
              height: 40,
              fontSize: '0.95rem',
              fontWeight: 700,
              border: '2px solid rgba(255,107,53,0.3)',
            }}
          >
            {user?.name?.charAt(0) || 'A'}
          </Avatar>
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: '#1A1A2E', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {user?.name}
            </Typography>
            <Chip
              label={user?.role || 'admin'}
              size="small"
              sx={{
                height: 18,
                fontSize: '0.62rem',
                fontWeight: 700,
                bgcolor: '#FF6B35',
                color: '#fff',
                textTransform: 'capitalize',
                mt: 0.3,
              }}
            />
          </Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: '#F3F4F6' }} />

      {/* Navigation */}
      <Box sx={{ px: 1.5, py: 1.5, flex: 1 }}>
        <Typography
          variant="caption"
          sx={{ px: 1.5, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.65rem', display: 'block', mb: 1 }}
        >
          Main Navigation
        </Typography>
        <List disablePadding>
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.div key={item.text} whileHover={{ x: 2 }} transition={{ duration: 0.15 }}>
                <ListItem
                  button
                  onClick={() => { navigate(item.path); setMobileOpen(false); }}
                  sx={{
                    borderRadius: 2.5,
                    mb: 0.5,
                    px: 1.5,
                    py: 1.1,
                    position: 'relative',
                    bgcolor: isActive ? 'rgba(255, 107, 53, 0.08)' : 'transparent',
                    border: isActive ? '1px solid rgba(255, 107, 53, 0.2)' : '1px solid transparent',
                    '&:hover': {
                      bgcolor: isActive ? 'rgba(255, 107, 53, 0.1)' : 'rgba(255, 107, 53, 0.04)',
                    },
                  }}
                >
                  {isActive && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 3,
                        height: '60%',
                        bgcolor: '#FF6B35',
                        borderRadius: '0 4px 4px 0',
                      }}
                    />
                  )}
                  <ListItemIcon
                    sx={{
                      minWidth: 38,
                      color: isActive ? '#FF6B35' : '#9CA3AF',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#FF6B35' : '#374151',
                    }}
                  />
                </ListItem>
              </motion.div>
            );
          })}
        </List>
      </Box>

      <Divider sx={{ borderColor: '#F3F4F6' }} />

      {/* Logout */}
      <List sx={{ px: 1.5, py: 1.5 }}>
        <ListItem
          button
          onClick={handleLogout}
          sx={{
            borderRadius: 2.5,
            px: 1.5,
            py: 1.1,
            color: '#6B7280',
            '&:hover': {
              bgcolor: 'rgba(239, 68, 68, 0.06)',
              color: '#EF4444',
              '& .MuiListItemIcon-root': { color: '#EF4444' },
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 38, color: 'inherit' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500, color: 'inherit' }}
          />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8F9FA' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
          color: '#1A1A2E',
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 }, gap: 1 }}>
          <IconButton
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 1, display: { sm: 'none' }, color: '#6B7280' }}
          >
            <MenuIcon />
          </IconButton>

          {/* Page title */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1A1A2E', fontSize: '1rem' }}>
              {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          </Box>

          {/* Search */}
          <Tooltip title="Search (⌘K)">
            <IconButton
              onClick={() => setSearchOpen(true)}
              sx={{
                bgcolor: '#F8F9FA',
                border: '1px solid #E5E7EB',
                color: '#6B7280',
                borderRadius: 2,
                px: 1.5,
                gap: 1,
                '&:hover': { bgcolor: '#FFF3EF', borderColor: '#FF6B35', color: '#FF6B35' },
              }}
            >
              <SearchIcon fontSize="small" />
              <Typography variant="caption" sx={{ color: 'inherit', fontWeight: 600, display: { xs: 'none', md: 'block' } }}>
                Search...
              </Typography>
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              onClick={handleNotificationsOpen}
              sx={{
                bgcolor: '#F8F9FA',
                border: '1px solid #E5E7EB',
                color: '#6B7280',
                borderRadius: 2,
                '&:hover': { bgcolor: '#FFF3EF', borderColor: '#FF6B35', color: '#FF6B35' },
              }}
            >
              <Badge badgeContent={unreadCount} color="error" max={9}>
                <NotificationsIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Profile */}
          <Tooltip title={user?.name}>
            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{ p: 0.5 }}
            >
              <Avatar
                sx={{
                  bgcolor: '#FF6B35',
                  width: 36,
                  height: 36,
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  border: '2px solid rgba(255,107,53,0.3)',
                }}
              >
                {user?.name?.charAt(0) || 'A'}
              </Avatar>
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
                minWidth: 200,
                borderRadius: 2.5,
                border: '1px solid #E5E7EB',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                overflow: 'hidden',
              }
            }}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #F3F4F6' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1A1A2E' }}>{user?.name}</Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>{user?.email}</Typography>
            </Box>
            <MenuItem onClick={() => { navigate('/settings'); handleMenuClose(); }} sx={{ gap: 1.5, py: 1.2, mt: 0.5 }}>
              <SettingsIcon fontSize="small" sx={{ color: '#9CA3AF' }} />
              <Typography variant="body2" fontWeight={500}>Settings</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ gap: 1.5, py: 1.2, color: '#EF4444', mb: 0.5 }}>
              <LogoutIcon fontSize="small" />
              <Typography variant="body2" fontWeight={500}>Logout</Typography>
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
                width: 380,
                maxHeight: 480,
                mt: 1.5,
                borderRadius: 2.5,
                border: '1px solid #E5E7EB',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                overflow: 'hidden',
              }
            }}
          >
            <Box sx={{ px: 2.5, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F3F4F6' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1A1A2E' }}>
                Notifications
                {unreadCount > 0 && (
                  <Chip label={unreadCount} size="small" sx={{ ml: 1, height: 18, fontSize: '0.65rem', bgcolor: '#FF6B35', color: '#fff', fontWeight: 700 }} />
                )}
              </Typography>
              <Box>
                <Tooltip title="Mark all read">
                  <IconButton size="small" onClick={markAllAsRead} sx={{ mr: 0.5, color: '#9CA3AF', '&:hover': { color: '#FF6B35' } }}>
                    <DoneAllIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Clear all">
                  <IconButton size="small" onClick={clearNotifications} sx={{ color: '#9CA3AF', '&:hover': { color: '#EF4444' } }}>
                    <DeleteSweepIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {notifications.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <NotificationsIcon sx={{ fontSize: 40, color: '#E5E7EB', mb: 1 }} />
                <Typography variant="body2" sx={{ color: '#9CA3AF', fontWeight: 500 }}>
                  All caught up!
                </Typography>
              </Box>
            ) : (
              notifications.map((notification) => {

                return (
                  <MenuItem
                    key={notification.id}
                    onClick={() => { handleNotificationAction(notification); handleMenuClose(); }}
                    sx={{
                      py: 1.5,
                      px: 2,
                      alignItems: 'flex-start',
                      backgroundColor: notification.read ? 'transparent' : 'rgba(255, 107, 53, 0.03)',
                      borderLeft: notification.read ? 'none' : '3px solid #FF6B35',
                      '&:hover': { bgcolor: '#FFF3EF' },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 34,
                        height: 34,
                        mr: 1.5,
                        bgcolor:
                          notification.type === 'error' ? 'rgba(239,68,68,0.1)' :
                          notification.type === 'warning' ? 'rgba(245,158,11,0.1)' :
                          notification.type === 'success' ? 'rgba(16,185,129,0.1)' :
                          'rgba(59,130,246,0.1)',
                        flexShrink: 0,
                      }}
                    >
                      {notification.type === 'error' ? <ErrorIcon fontSize="small" sx={{ color: '#EF4444' }} /> :
                       notification.type === 'warning' ? <WarningIcon fontSize="small" sx={{ color: '#F59E0B' }} /> :
                       notification.type === 'success' ? <CheckCircleIcon fontSize="small" sx={{ color: '#10B981' }} /> :
                       <InfoIcon fontSize="small" sx={{ color: '#3B82F6' }} />}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1A1A2E', fontSize: '0.82rem' }}>
                        {notification.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', lineHeight: 1.5 }}>
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.68rem' }}>
                        {new Date(notification.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                    {!notification.read && (
                      <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#FF6B35', mt: 0.5, flexShrink: 0 }} />
                    )}
                  </MenuItem>
                );
              })
            )}
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
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: '#FFFFFF', border: 'none', boxShadow: '4px 0 24px rgba(0,0,0,0.08)' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: '#FFFFFF', borderRight: '1px solid #E5E7EB' },
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
          bgcolor: '#F8F9FA',
        }}
      >
        <Toolbar />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
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