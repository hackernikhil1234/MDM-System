import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to real-time server');
    });

    this.socket.on('update-progress', (data) => {
      this.notifyListeners('update-progress', data);
    });

    this.socket.on('device-status', (data) => {
      this.notifyListeners('device-status', data);
    });

    this.socket.on('admin_command', (data) => {
      // Broadcast WebSocket payloads (e.g., instant locks) across the React app globally
      this.notifyListeners('admin_command', data);
    });

    this.socket.on('schedule-update', (data) => {
      this.notifyListeners('schedule-update', data);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from real-time server');
    });
  }

  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  unsubscribe(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event).filter(cb => cb !== callback);
      this.listeners.set(event, callbacks);
    }
  }

  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
const socketService = new SocketService();
export default socketService;