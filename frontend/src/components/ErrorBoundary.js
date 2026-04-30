import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Warning as WarningIcon, Refresh as RefreshIcon } from '@mui/icons-material';

const ORANGE = '#FF6B35';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            bgcolor: '#0D0D14',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 3,
            px: 4,
            color: '#fff',
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '20px',
              bgcolor: 'rgba(255,107,53,0.1)',
              border: '1px solid rgba(255,107,53,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <WarningIcon sx={{ fontSize: 36, color: ORANGE }} />
          </Box>

          <Typography
            variant="h4"
            sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}
          >
            System <span style={{ color: ORANGE }}>Exception</span>
          </Typography>

          <Typography
            sx={{ color: 'rgba(255,255,255,0.4)', maxWidth: 480, lineHeight: 1.6, fontWeight: 500 }}
          >
            A runtime error was detected in the application matrix. This has been logged automatically.
          </Typography>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <Box
              sx={{
                bgcolor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 2,
                p: 3,
                maxWidth: 600,
                width: '100%',
                textAlign: 'left',
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: '#EF4444', fontFamily: 'monospace', display: 'block', wordBreak: 'break-all' }}
              >
                {this.state.error.toString()}
              </Typography>
            </Box>
          )}

          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={this.handleReload}
            sx={{
              bgcolor: ORANGE,
              color: '#fff',
              fontWeight: 800,
              px: 4,
              py: 1.5,
              borderRadius: '12px',
              '&:hover': { bgcolor: '#E55A2B' },
            }}
          >
            Reinitialize System
          </Button>

          <Button
            onClick={() => { window.location.href = '/login'; }}
            sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}
          >
            Return to Login
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
