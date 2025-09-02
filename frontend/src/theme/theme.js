import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#3a86ff", // Modern blue
      light: "#ffffff",
      dark: "#2667cc", // Darker blue
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#ff006e", // Vibrant pink
      light: "#ffb3d9",
      dark: "#c1004e",
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
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          padding: '8px 20px',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
          },
        },
        outlined: {
          borderWidth: 1.5,
          '&:hover': {
            borderWidth: 1.5,
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
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          overflow: 'hidden',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 16,
        },
        elevation1: {
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        },
        elevation2: {
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

export default theme;