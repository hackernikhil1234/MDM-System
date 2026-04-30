import { createTheme, alpha } from '@mui/material/styles';

const ORANGE = '#FF6B35';
const BG_BASE = '#0D0D14';
const BG_PAPER = 'rgba(26, 26, 46, 0.4)';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: ORANGE,
      light: alpha(ORANGE, 0.8),
      dark: '#E55A2B',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
      contrastText: '#ffffff',
    },
    background: {
      default: BG_BASE,
      paper: BG_PAPER,
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.5)',
      disabled: 'rgba(255, 255, 255, 0.3)',
    },
    divider: 'rgba(255, 255, 255, 0.05)',
    action: {
      active: ORANGE,
      hover: 'rgba(255, 255, 255, 0.03)',
      selected: 'rgba(255, 255, 255, 0.06)',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Inter", system-ui, sans-serif',
    h1: { fontWeight: 900, letterSpacing: '-0.04em' },
    h2: { fontWeight: 900, letterSpacing: '-0.04em' },
    h3: { fontWeight: 900, letterSpacing: '-0.03em' },
    h4: { fontWeight: 900, letterSpacing: '-0.02em' },
    h5: { fontWeight: 800, letterSpacing: '-0.02em' },
    h6: { fontWeight: 800, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    body1: { fontWeight: 500, lineHeight: 1.7 },
    body2: { fontWeight: 500, lineHeight: 1.6 },
    button: { fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' },
    caption: { fontWeight: 700, letterSpacing: '0.02em' },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: BG_BASE,
          color: '#ffffff',
          scrollbarWidth: 'thin',
          scrollbarColor: `${alpha(ORANGE, 0.3)} transparent`,
          '&::-webkit-scrollbar': { width: 6, height: 6 },
          '&::-webkit-scrollbar-thumb': { backgroundColor: alpha(ORANGE, 0.2), borderRadius: 10 },
          '&::-webkit-scrollbar-thumb:hover': { backgroundColor: ORANGE },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: BG_PAPER,
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.01)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: 24,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: alpha(ORANGE, 0.3),
            transform: 'translateY(-2px)',
            boxShadow: `0 12px 40px ${alpha(ORANGE, 0.1)}`,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          transition: 'all 0.2s ease',
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${ORANGE} 0%, #E55A2B 100%)`,
          boxShadow: `0 8px 20px ${alpha(ORANGE, 0.3)}`,
          '&:hover': {
            background: `linear-gradient(135deg, #E55A2B 0%, #CC4E22 100%)`,
            boxShadow: `0 12px 28px ${alpha(ORANGE, 0.4)}`,
            transform: 'translateY(-1px)',
          },
        },
        outlinedPrimary: {
          borderColor: alpha(ORANGE, 0.3),
          '&:hover': {
            borderColor: ORANGE,
            backgroundColor: alpha(ORANGE, 0.05),
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 12,
            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.05)' },
            '&:hover fieldset': { borderColor: alpha(ORANGE, 0.3) },
            '&.Mui-focused fieldset': { borderColor: ORANGE, borderWidth: 1 },
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(255, 255, 255, 0.3)',
            fontWeight: 700,
            textTransform: 'uppercase',
            fontSize: '0.7rem',
            letterSpacing: '0.1em',
            '&.Mui-focused': { color: ORANGE },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
          padding: '16px 20px',
        },
        head: {
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          fontSize: '0.65rem',
          color: 'rgba(255, 255, 255, 0.3)',
          backgroundColor: 'transparent',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 900,
          borderRadius: 8,
          fontSize: '0.65rem',
          letterSpacing: '0.05em',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(13, 13, 20, 0.98)',
          borderRadius: 24,
          border: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(255, 255, 255, 0.05)',
        },
      },
    },
  },
});

export default theme;