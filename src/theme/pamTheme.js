import { createTheme } from '@mui/material/styles';

const pamTheme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
      light: '#8fa4f1',
      dark: '#4a5fd8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#764ba2',
      light: '#9a7bb8',
      dark: '#5a3a7a',
      contrastText: '#ffffff',
    },
    success: {
      main: '#4CAF50',
      light: '#66BB6A',
      dark: '#388E3C',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#FF9800',
      light: '#FFB74D',
      dark: '#F57C00',
      contrastText: '#ffffff',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
      contrastText: '#ffffff',
    },
    background: {
      default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      paper: 'rgba(255, 255, 255, 0.95)',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 700,
      fontSize: '1.75rem',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '12px 24px',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
          },
        },
        containedSuccess: {
          background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
            boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
          },
        },
        containedWarning: {
          background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #F57C00 0%, #E65100 100%)',
            boxShadow: '0 6px 20px rgba(255, 152, 0, 0.4)',
          },
        },
        containedError: {
          background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)',
            boxShadow: '0 6px 20px rgba(244, 67, 54, 0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 15,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 15,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            background: 'rgba(255, 255, 255, 0.9)',
            '& fieldset': {
              borderColor: 'rgba(102, 126, 234, 0.2)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(102, 126, 234, 0.4)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#667eea',
            },
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 600,
            border: 'none',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          padding: '15px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            background: 'rgba(102, 126, 234, 0.05)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backdropFilter: 'blur(10px)',
        },
      },
    },
  },
});

export default pamTheme; 