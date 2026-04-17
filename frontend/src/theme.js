import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#FF6B35',
      light: '#FF8C5A',
      dark: '#E55A2B',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#1A1A2E',
      light: '#2D2D44',
      dark: '#0D0D1A',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#F59E0B',
      light: '#FCD34D',
      dark: '#D97706',
      contrastText: '#ffffff',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
      contrastText: '#ffffff',
    },
    info: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A2E',
      secondary: '#6B7280',
      disabled: '#9CA3AF',
    },
    divider: '#E5E7EB',
    action: {
      active: '#FF6B35',
      hover: 'rgba(255, 107, 53, 0.06)',
      selected: 'rgba(255, 107, 53, 0.12)',
      disabled: '#9CA3AF',
      disabledBackground: '#F3F4F6',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.75rem',
      letterSpacing: '-0.02em',
      color: '#1A1A2E',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.25rem',
      letterSpacing: '-0.01em',
      color: '#1A1A2E',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      color: '#1A1A2E',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.375rem',
      color: '#1A1A2E',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem',
      color: '#1A1A2E',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      color: '#1A1A2E',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      color: '#6B7280',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: '#9CA3AF',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
      color: '#374151',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#6B7280',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.875rem',
      letterSpacing: '0.01em',
    },
    caption: {
      fontSize: '0.75rem',
      color: '#9CA3AF',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04)',
    '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04)',
    '0 20px 25px -5px rgba(0,0,0,0.08), 0 10px 10px -5px rgba(0,0,0,0.03)',
    '0 25px 50px -12px rgba(255, 107, 53, 0.15)',
    ...Array(19).fill('0 25px 50px -12px rgba(255, 107, 53, 0.15)'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F8F9FA',
          scrollbarColor: '#E5E7EB #F8F9FA',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            backgroundColor: '#F8F9FA',
            width: 6,
            height: 6,
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: '#D1D5DB',
            minHeight: 24,
          },
          '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#FF6B35',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 12px 30px rgba(255, 107, 53, 0.12)',
            borderColor: '#FF6B35',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          color: '#1A1A2E',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E5E7EB',
          boxShadow: '4px 0 24px rgba(0,0,0,0.04)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '9px 20px',
          fontSize: '0.875rem',
          fontWeight: 600,
          textTransform: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        contained: {
          background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
          boxShadow: '0 4px 14px rgba(255, 107, 53, 0.35)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(135deg, #E55A2B 0%, #CC4E22 100%)',
            boxShadow: '0 6px 20px rgba(255, 107, 53, 0.45)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderColor: '#FF6B35',
          color: '#FF6B35',
          '&:hover': {
            backgroundColor: 'rgba(255, 107, 53, 0.06)',
            borderColor: '#E55A2B',
          },
        },
        text: {
          color: '#FF6B35',
          '&:hover': {
            backgroundColor: 'rgba(255, 107, 53, 0.06)',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '14px 16px',
          fontSize: '0.875rem',
          borderBottom: '1px solid #F3F4F6',
          color: '#374151',
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#F8F9FA',
          color: '#6B7280',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          borderBottom: '2px solid #E5E7EB',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.15s',
          '&:hover': {
            backgroundColor: '#FFF3EF',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: '0.72rem',
          height: 26,
        },
        colorSuccess: {
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          color: '#059669',
          border: '1px solid rgba(16, 185, 129, 0.25)',
        },
        colorWarning: {
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          color: '#D97706',
          border: '1px solid rgba(245, 158, 11, 0.25)',
        },
        colorError: {
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: '#DC2626',
          border: '1px solid rgba(239, 68, 68, 0.25)',
        },
        colorPrimary: {
          backgroundColor: 'rgba(255, 107, 53, 0.1)',
          color: '#E55A2B',
          border: '1px solid rgba(255, 107, 53, 0.25)',
        },
        colorDefault: {
          backgroundColor: '#F3F4F6',
          color: '#6B7280',
          border: '1px solid #E5E7EB',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          backgroundColor: '#FFF3EF',
          height: 8,
        },
        bar: {
          borderRadius: 6,
          background: 'linear-gradient(90deg, #FF6B35, #FF8C5A)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#FFFFFF',
            '& fieldset': {
              borderColor: '#E5E7EB',
            },
            '&:hover fieldset': {
              borderColor: '#FF6B35',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#FF6B35',
              borderWidth: 2,
            },
            '&.Mui-disabled fieldset': {
              borderColor: '#F3F4F6',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#6B7280', // Slightly darker for better visibility
            '&.Mui-focused': {
              color: '#FF6B35',
            },
          },
          '& .MuiFormHelperText-root': {
            color: '#9CA3AF',
            fontSize: '0.75rem',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#E5E7EB',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#FF6B35',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#FF6B35',
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: '#374151',
          fontSize: '0.875rem',
          fontWeight: 500,
          borderRadius: 8,
          margin: '2px 6px',
          '&:hover': {
            backgroundColor: '#FFF3EF',
            color: '#FF6B35',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(255, 107, 53, 0.1)',
            color: '#FF6B35',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: 'rgba(255, 107, 53, 0.15)',
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
          borderRadius: 20,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid',
        },
        standardSuccess: {
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          color: '#059669',
          borderColor: 'rgba(16, 185, 129, 0.2)',
        },
        standardError: {
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          color: '#DC2626',
          borderColor: 'rgba(239, 68, 68, 0.2)',
        },
        standardWarning: {
          backgroundColor: 'rgba(245, 158, 11, 0.08)',
          color: '#D97706',
          borderColor: 'rgba(245, 158, 11, 0.2)',
        },
        standardInfo: {
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          color: '#2563EB',
          borderColor: 'rgba(59, 130, 246, 0.2)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: '#9CA3AF',
          fontWeight: 500,
          fontSize: '0.875rem',
          textTransform: 'none',
          '&.Mui-selected': {
            color: '#FF6B35',
            fontWeight: 600,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#FF6B35',
          height: 3,
          borderRadius: 3,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1A1A2E',
          fontSize: '0.75rem',
          padding: '8px 12px',
          borderRadius: 8,
          fontWeight: 500,
        },
        arrow: {
          color: '#1A1A2E',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#D1D5DB',
          '&.Mui-checked': {
            color: '#FF6B35',
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: '#D1D5DB',
          '&.Mui-checked': {
            color: '#FF6B35',
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': {
            color: '#FF6B35',
            '& + .MuiSwitch-track': {
              backgroundColor: '#FF6B35',
            },
          },
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          backgroundColor: '#FF6B35',
          color: '#FFFFFF',
          fontWeight: 700,
          fontSize: '0.65rem',
        },
      },
    },
  },
});

export default theme;