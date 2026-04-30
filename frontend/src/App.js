import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import theme from './theme';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DeviceManagement from './pages/DeviceManagement';
import VersionManagement from './pages/VersionManagement';
import ScheduleManagement from './pages/ScheduleManagement';
import AuditTrail from './pages/AuditTrail';
import Analytics from './pages/Analytics';
import UserManagement from './pages/UserManagement';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Layout from './components/Layout';
import LoadingSkeleton from './components/LoadingSkeleton';
import { useAuth } from './contexts/AuthContext';

// ── Protected Route ────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSkeleton type="dashboard" />;
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== 'admin' && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// ── Wrap a page in Layout + its own ErrorBoundary ─────────────────────────────
const Page = ({ component: Component, requiredRole }) => (
  <ProtectedRoute requiredRole={requiredRole}>
    <Layout>
      <ErrorBoundary>
        <Component />
      </ErrorBoundary>
    </Layout>
  </ProtectedRoute>
);

// ── Route Config ───────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected */}
      <Route path="/dashboard"  element={<Page component={Dashboard} />} />
      <Route path="/devices"    element={<Page component={DeviceManagement} />} />
      <Route path="/analytics"  element={<Page component={Analytics} />} />
      <Route path="/versions"   element={<Page component={VersionManagement} requiredRole="admin" />} />
      <Route path="/schedules"  element={<Page component={ScheduleManagement} />} />
      <Route path="/audit"      element={<Page component={AuditTrail} requiredRole="admin" />} />
      <Route path="/users"      element={<Page component={UserManagement} requiredRole="admin" />} />
      <Route path="/settings"   element={<Page component={Settings} />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <NotificationProvider>
            <Router>
              <AppRoutes />
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;