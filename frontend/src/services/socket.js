import { io } from 'socket.io-client';

// Plain-object singleton — avoids class constructor minification bugs in production builds
const SocketService = {
  socket: null,
  _listeners: {},

  connect(token) {
    if (this.socket && this.socket.connected) return; // already connected

    const SOCKET_URL =
      process.env.REACT_APP_SOCKET_URL ||
      process.env.REACT_APP_API_URL?.replace('/api', '') ||
      'http://localhost:5000';

    try {
      this.socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'], // fallback to polling if WS blocked
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        timeout: 10000,
      });

      this.socket.on('connect', () => {
        console.log('[Socket] Connected to real-time server');
      });

      this.socket.on('connect_error', (err) => {
        console.warn('[Socket] Connection error:', err.message);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('[Socket] Disconnected:', reason);
      });

      // Forward all known server events to registered listeners
      const events = ['update-progress', 'device-status', 'admin_command', 'schedule-update'];
      events.forEach((event) => {
        this.socket.on(event, (data) => this._emit(event, data));
      });
    } catch (err) {
      console.error('[Socket] Failed to initialise:', err);
    }
  },

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  },

  subscribe(event, callback) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(callback);
  },

  unsubscribe(event, callback) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter((cb) => cb !== callback);
  },

  _emit(event, data) {
    (this._listeners[event] || []).forEach((cb) => {
      try { cb(data); } catch (e) { console.error('[Socket] Listener error:', e); }
    });
  },
};

export default SocketService;