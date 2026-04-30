import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  alpha,
  Box,
} from '@mui/material';

const ORANGE = '#FF6B35';

function StyledDialog({
  open,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'primary',
  loading = false,
  maxWidth = 'sm',
  fullWidth = true,
  showConfirm = true,
  showCancel = true,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          bgcolor: 'rgba(13, 13, 20, 0.98)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          boxShadow: '0 25px 80px rgba(0,0,0,0.8)',
          color: '#fff',
          backdropFilter: 'blur(20px)',
          overflow: 'hidden',
        }
      }}
    >
      {title && (
        <DialogTitle sx={{ 
          color: '#fff', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          px: 4,
          py: 3,
          fontWeight: 900,
          letterSpacing: '-0.02em',
          fontSize: '1.25rem',
          textTransform: 'uppercase',
        }}>
          {title}
        </DialogTitle>
      )}
      
      <DialogContent sx={{ p: 4 }}>
        <Box sx={{ mt: 1 }}>
          {children}
        </Box>
      </DialogContent>
      
      {(showCancel || showConfirm) && (
        <DialogActions sx={{ 
          p: 3, 
          px: 4,
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          bgcolor: 'rgba(0, 0, 0, 0.2)',
          gap: 2,
        }}>
          {showCancel && (
            <Button 
              onClick={onClose} 
              disabled={loading}
              sx={{ 
                color: 'rgba(255, 255, 255, 0.3)',
                fontWeight: 800,
                fontSize: '0.8rem',
                '&:hover': { 
                  color: '#fff',
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              {cancelText}
            </Button>
          )}
          
          {showConfirm && (
            <Button 
              onClick={onConfirm} 
              variant="contained"
              disabled={loading}
              sx={{
                px: 3,
                py: 1.2,
                borderRadius: '10px',
                fontWeight: 900,
                fontSize: '0.8rem',
                bgcolor: confirmColor === 'error' ? '#EF4444' : 
                        confirmColor === 'success' ? '#10B981' : 
                        confirmColor === 'warning' ? '#F59E0B' : ORANGE,
                boxShadow: confirmColor === 'error' ? `0 8px 20px ${alpha('#EF4444', 0.2)}` :
                          confirmColor === 'success' ? `0 8px 20px ${alpha('#10B981', 0.2)}` :
                          confirmColor === 'warning' ? `0 8px 20px ${alpha('#F59E0B', 0.2)}` : `0 8px 20px ${alpha(ORANGE, 0.2)}`,
                '&:hover': { 
                  bgcolor: confirmColor === 'error' ? '#DC2626' : 
                          confirmColor === 'success' ? '#059669' : 
                          confirmColor === 'warning' ? '#D97706' : '#E55A2B',
                  transform: 'translateY(-1px)',
                },
                '&:disabled': {
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  color: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : confirmText}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
}

export default StyledDialog;