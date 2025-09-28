import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#d4af37", // Rich gold
      light: "#f4e87c",
      dark: "#b8860b", // Dark goldenrod
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#2e8b57", // Sea green
      light: "#5cb85c",
      dark: "#1e5b2f",
      contrastText: "#ffffff",
    },
    tertiary: {
      main: "#228b22", // Forest green
      light: "#32cd32",
      dark: "#006400",
      contrastText: "#ffffff",
    },
    error: {
      main: "#ff5252",
    },
    warning: {
      main: "#ffb74d",
    },
    info: {
      main: "#64b5f6",
    },
    success: {
      main: "#4caf50",
    },
    background: {
      default: "#f8f9fa",
      paper: "#ffffff",
      dark: "#212529",
      gradient: {
        primary: "linear-gradient(135deg, #d4af37 0%, #b8860b 100%)",
        secondary: "linear-gradient(135deg, #2e8b57 0%, #228b22 100%)",
        goldGreen: "linear-gradient(135deg, #d4af37 0%, #2e8b57 50%, #228b22 100%)",
        subtle: "linear-gradient(135deg, #f8f9fa 0%, #e8f5e8 100%)",
        card: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
      },
    },
    text: {
      primary: "#212529",
      secondary: "#6c757d",
      disabled: "#adb5bd",
    },
    divider: "rgba(0, 0, 0, 0.08)",
    action: {
      active: "rgba(0, 0, 0, 0.54)",
      hover: "rgba(0, 0, 0, 0.04)",
      selected: "rgba(0, 0, 0, 0.08)",
      disabled: "rgba(0, 0, 0, 0.26)",
      disabledBackground: "rgba(0, 0, 0, 0.12)",
    },
  },

  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  
  typography: {
    fontFamily: "Poppins, sans-serif",
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontSize: "4rem",
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: "-0.01562em",
      "@media (max-width:960px)": {
        fontSize: "3.5rem",
      },
      "@media (max-width:600px)": {
        fontSize: "3rem",
      },
      "@media (max-width:414px)": {
        fontSize: "2.25rem",
      },
    },
    h2: {
      fontSize: "3.5rem",
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: "-0.00833em",
      "@media (max-width:960px)": {
        fontSize: "2.75rem",
      },
      "@media (max-width:662px)": {
        fontSize: "2.25rem",
      },
      "@media (max-width:414px)": {
        fontSize: "2rem",
      },
    },
    h3: {
      fontSize: "2.75rem",
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: "0em",
      "@media (max-width:960px)": {
        fontSize: "2.25rem",
      },
      "@media (max-width:662px)": {
        fontSize: "1.75rem",
      },
      "@media (max-width:414px)": {
        fontSize: "1.5rem",
      },
    },
    h4: {
      fontSize: "2rem",
      fontWeight: 600,
      lineHeight: 1.35,
      letterSpacing: "0.00735em",
      "@media (max-width:960px)": {
        fontSize: "1.5rem",
      },
      "@media (max-width:600px)": {
        fontSize: "1.25rem",
      },
    },
    h5: {
      fontSize: "1.5rem",
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: "0em",
      "@media (max-width:960px)": {
        fontSize: "1.25rem",
      },
      "@media (max-width:600px)": {
        fontSize: "1.1rem",
      },
    },
    h6: {
      fontSize: "1.25rem",
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: "0.0075em",
      "@media (max-width:960px)": {
        fontSize: "1.1rem",
      },
      "@media (max-width:600px)": {
        fontSize: "1rem",
      },
    },
    subtitle1: {
      fontSize: "1.125rem",
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: "0.00938em",
    },
    subtitle2: {
      fontSize: "0.875rem",
      fontWeight: 500,
      lineHeight: 1.57,
      letterSpacing: "0.00714em",
    },
    body1: {
      fontSize: "1rem",
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: "0.00938em",
      "@media (max-width:600px)": {
        fontSize: "0.95rem",
      },
    },
    body2: {
      fontSize: "0.875rem",
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: "0.01071em",
      "@media (max-width:480px)": {
        fontSize: "0.85rem",
      },
    },
    button: {
      fontSize: "0.9375rem",
      fontWeight: 500,
      lineHeight: 1.75,
      letterSpacing: "0.02857em",
      textTransform: "none",
    },
    caption: {
      fontSize: "0.75rem",
      fontWeight: 400,
      lineHeight: 1.66,
      letterSpacing: "0.03333em",
    },
    overline: {
      fontSize: "0.75rem",
      fontWeight: 400,
      lineHeight: 2.66,
      letterSpacing: "0.08333em",
      textTransform: "uppercase",
    },
  },
  
  shape: {
    borderRadius: 12,
  },
  
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          padding: '10px 24px',
          background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
          color: '#ffffff',
          border: '2px solid transparent',
          backgroundClip: 'padding-box',
          transition: 'all 0.3s ease',
          '&:hover': {
            background: 'linear-gradient(135deg, #b8860b 0%, #d4af37 100%)',
            boxShadow: '0 8px 20px rgba(212, 175, 55, 0.3)',
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #b8860b 0%, #d4af37 100%)',
            boxShadow: '0 8px 25px rgba(212, 175, 55, 0.4)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #2e8b57 0%, #228b22 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #228b22 0%, #2e8b57 100%)',
            boxShadow: '0 8px 25px rgba(46, 139, 87, 0.4)',
          },
        },
        outlined: {
          borderWidth: 2,
          borderColor: '#d4af37',
          color: '#d4af37',
          background: 'transparent',
          '&:hover': {
            borderColor: '#b8860b',
            color: '#b8860b',
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(184, 134, 11, 0.1) 100%)',
          },
        },
        text: {
          color: '#2e8b57',
          '&:hover': {
            background: 'linear-gradient(135deg, rgba(46, 139, 87, 0.1) 0%, rgba(34, 139, 34, 0.1) 100%)',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        root: {
          '& .MuiDialog-paper': {
            borderRadius: 16,
          },
        },
      },
      defaultProps: {
        disableRestoreFocus: true,
        keepMounted: false,
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '1.25rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(212, 175, 55, 0.1)',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          border: '1px solid rgba(212, 175, 55, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(212, 175, 55, 0.15)',
            transform: 'translateY(-2px)',
            borderColor: 'rgba(212, 175, 55, 0.2)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          border: '1px solid rgba(212, 175, 55, 0.05)',
        },
        rounded: {
          borderRadius: 16,
        },
        elevation1: {
          boxShadow: '0 2px 12px rgba(212, 175, 55, 0.08)',
        },
        elevation2: {
          boxShadow: '0 4px 16px rgba(212, 175, 55, 0.12)',
        },
        elevation3: {
          boxShadow: '0 6px 20px rgba(212, 175, 55, 0.15)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            border: '2px solid rgba(212, 175, 55, 0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: 'rgba(212, 175, 55, 0.3)',
              boxShadow: '0 4px 12px rgba(212, 175, 55, 0.1)',
            },
            '&.Mui-focused': {
              borderColor: '#d4af37',
              boxShadow: '0 6px 16px rgba(212, 175, 55, 0.2)',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
          boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3)',
          borderBottom: '2px solid rgba(184, 134, 11, 0.3)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
          color: '#ffffff',
          fontWeight: 600,
          border: '2px solid transparent',
          backgroundClip: 'padding-box',
          transition: 'all 0.3s ease',
          '&:hover': {
            background: 'linear-gradient(135deg, #b8860b 0%, #d4af37 100%)',
            boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
            transform: 'translateY(-1px)',
          },
        },
        colorSecondary: {
          background: 'linear-gradient(135deg, #2e8b57 0%, #228b22 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #228b22 0%, #2e8b57 100%)',
            boxShadow: '0 4px 12px rgba(46, 139, 87, 0.3)',
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(212, 175, 55, 0.2)',
          border: '3px solid transparent',
          background: 'linear-gradient(135deg, #d4af37, #b8860b) padding-box, linear-gradient(135deg, #d4af37 0%, #b8860b 100%) border-box',
        },
      },
    },
  },
});

export default theme;