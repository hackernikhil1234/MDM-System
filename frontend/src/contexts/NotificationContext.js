import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { updates, schedules } from '../services/api';
import SocketService from '../services/socket';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // ── Persist to localStorage ─────────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mdm_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setNotifications(parsed);
          setUnreadCount(parsed.filter((n) => !n.read).length);
        }
      }
    } catch (e) {
      console.warn('[Notifications] Failed to load from localStorage:', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('mdm_notifications', JSON.stringify(notifications));
      setUnreadCount(notifications.filter((n) => !n.read).length);
    } catch (e) {
      console.warn('[Notifications] Failed to persist to localStorage:', e);
    }
  }, [notifications]);

  // ── API Polling ─────────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const newNotifications = [];

      // Pending approvals
      const schedulesRes = await schedules.getAll({ status: 'pending_approval', limit: 5 });
      (schedulesRes.data?.schedules || []).forEach((schedule) => {
        newNotifications.push({
          id: `pending-${schedule._id}`,
          type: 'warning',
          title: 'Approval Required',
          message: `"${schedule.name}" is awaiting your sign-off`,
          timestamp: new Date(schedule.createdAt).toISOString(),
          read: false,
          actionable: true,
          action: 'approve',
          data: { scheduleId: schedule._id },
        });
      });

      // In-progress campaigns
      const activeRes = await schedules.getAll({ status: 'in_progress', limit: 3 });
      (activeRes.data?.schedules || []).forEach((schedule) => {
        newNotifications.push({
          id: `progress-${schedule._id}`,
          type: 'info',
          title: 'Rollout Active',
          message: `"${schedule.name}" — ${schedule.stats?.completedDevices || 0}/${schedule.stats?.totalDevices || 0} units updated`,
          timestamp: new Date(schedule.updatedAt || schedule.createdAt).toISOString(),
          read: false,
          actionable: true,
          action: 'view',
          data: { scheduleId: schedule._id },
        });
      });

      setNotifications((prev) => {
        const existingIds = new Set(prev.map((n) => n.id));
        const uniqueNew = newNotifications.filter((n) => !existingIds.has(n.id));
        return [...uniqueNew, ...prev].slice(0, 25);
      });
    } catch (error) {
      // Silently fail — notifications are non-critical
      console.warn('[Notifications] API fetch failed:', error?.message);
    }
  }, [user]);

  // ── WebSocket Integration ───────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);

    // Connect socket safely
    try {
      const token = localStorage.getItem('token');
      if (token && !SocketService.socket?.connected) {
        SocketService.connect(token);
      }
    } catch (err) {
      console.warn('[Notifications] Socket connect failed:', err);
    }

    const handleAdminCommand = (data) => {
      try {
        setNotifications((prev) =>
          [
            {
              id: `ws-${Date.now()}`,
              type: 'warning',
              title: 'Admin Command Broadcast',
              message: `Action "${data?.action || 'unknown'}" on device ···${String(data?.targetImei || '').slice(-4)}`,
              timestamp: data?.timestamp || new Date().toISOString(),
              read: false,
              actionable: false,
            },
            ...prev,
          ].slice(0, 25)
        );
      } catch (e) {
        console.warn('[Notifications] Socket handler error:', e);
      }
    };

    try {
      SocketService.subscribe('admin_command', handleAdminCommand);
    } catch (err) {
      console.warn('[Notifications] Socket subscribe failed:', err);
    }

    return () => {
      clearInterval(interval);
      try {
        SocketService.unsubscribe('admin_command', handleAdminCommand);
      } catch (e) { /* non-fatal */ }
    };
  }, [user, fetchNotifications]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const markAsRead = (id) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const markAllAsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('mdm_notifications');
  };

  const addNotification = (notification) => {
    setNotifications((prev) =>
      [{ id: `manual-${Date.now()}`, read: false, timestamp: new Date().toISOString(), ...notification }, ...prev].slice(0, 25)
    );
  };

  const handleNotificationAction = (notification) => {
    markAsRead(notification.id);
    switch (notification.action) {
      case 'approve':
        window.location.href = `/schedules?id=${notification.data?.scheduleId}`;
        break;
      case 'view':
        if (notification.data?.deviceImei) {
          window.location.href = `/devices?imei=${notification.data.deviceImei}`;
        } else if (notification.data?.scheduleId) {
          window.location.href = `/schedules?id=${notification.data.scheduleId}`;
        }
        break;
      default:
        break;
    }
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    addNotification,
    handleNotificationAction,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;