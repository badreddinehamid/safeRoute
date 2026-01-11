/**
 * Material-UI theme configuration for SafeRoute
 */

import { createTheme } from '@mui/material/styles';

export const safeRouteTheme = createTheme({
  palette: {
    primary: {
      main: '#0A2540', // SafeRoute primary blue
      light: '#1F4F7A',
      dark: '#051A2E',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#1F4F7A', // SafeRoute secondary blue
      light: '#4A7BA7',
      dark: '#0F2F4F',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#28A745',
      light: '#5CB85C',
      dark: '#1E7E34',
    },
    error: {
      main: '#DC3545',
      light: '#E57373',
      dark: '#C62828',
    },
    warning: {
      main: '#FFC107',
      light: '#FFD54F',
      dark: '#F57C00',
    },
    info: {
      main: '#00A6FF', // SafeRoute accent blue
      light: '#4FC3F7',
      dark: '#008FCC',
    },
    background: {
      default: '#F9F9F9',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '48px',
      fontWeight: 700,
      lineHeight: 1.2,
      color: '#0A2540',
    },
    h2: {
      fontSize: '36px',
      fontWeight: 700,
      lineHeight: 1.3,
      color: '#0A2540',
    },
    h3: {
      fontSize: '28px',
      fontWeight: 700,
      lineHeight: 1.4,
      color: '#0A2540',
    },
    h4: {
      fontSize: '22px',
      fontWeight: 500,
      lineHeight: 1.4,
      color: '#0A2540',
    },
    h5: {
      fontSize: '18px',
      fontWeight: 500,
      lineHeight: 1.4,
      color: '#0A2540',
    },
    h6: {
      fontSize: '16px',
      fontWeight: 500,
      lineHeight: 1.4,
      color: '#0A2540',
    },
    body1: {
      fontSize: '16px',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '14px',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      borderRadius: '8px',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '10px 24px',
          fontWeight: 500,
          textTransform: 'none',
        },
        contained: {
          boxShadow: '0 2px 8px rgba(10, 37, 64, 0.15)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(10, 37, 64, 0.25)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          padding: '16px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#00A6FF',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#00A6FF',
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
  },
});

