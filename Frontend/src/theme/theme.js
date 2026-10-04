import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1E3A8A", // Deep royal navy
      light: "#3B82F6",
      dark: "#172554",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#F59E0B", // Vibrant amber
      light: "#FBBF24",
      dark: "#D97706",
      contrastText: "#FFFFFF",
    },
    success: {
      main: "#10B981", // Emerald green
      light: "#34D399",
      dark: "#059669",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#EF4444", // Crimson red
      light: "#F87171",
      dark: "#DC2626",
      contrastText: "#FFFFFF",
    },
    warning: {
      main: "#F97316", // Warm orange
      light: "#FB923C",
      dark: "#EA580C",
      contrastText: "#FFFFFF",
    },
    info: {
      main: "#0EA5E9", // Sky blue
      light: "#38BDF8",
      dark: "#0284C7",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F8FAFC", // Soft slate background
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0F172A", // Slate 900
      secondary: "#64748B", // Slate 500
      disabled: "#94A3B8",
    },
    divider: "#E2E8F0",
  },
  typography: {
    fontFamily: [
      "Inter",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
    h1: {
      fontFamily: "Outfit, Inter, sans-serif",
      fontWeight: 800,
      fontSize: "2.5rem",
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
      "@media (min-width:600px)": {
        fontSize: "3.25rem",
      },
    },
    h2: {
      fontFamily: "Outfit, Inter, sans-serif",
      fontWeight: 700,
      fontSize: "2rem",
      lineHeight: 1.25,
      letterSpacing: "-0.015em",
      "@media (min-width:600px)": {
        fontSize: "2.5rem",
      },
    },
    h3: {
      fontFamily: "Outfit, Inter, sans-serif",
      fontWeight: 700,
      fontSize: "1.5rem",
      lineHeight: 1.3,
      "@media (min-width:600px)": {
        fontSize: "1.875rem",
      },
    },
    h4: {
      fontFamily: "Outfit, Inter, sans-serif",
      fontWeight: 600,
      fontSize: "1.25rem",
      lineHeight: 1.4,
    },
    h5: {
      fontFamily: "Outfit, Inter, sans-serif",
      fontWeight: 600,
      fontSize: "1.1rem",
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: "0.95rem",
      lineHeight: 1.5,
    },
    subtitle1: {
      fontSize: "1rem",
      lineHeight: 1.6,
      color: "#64748B",
    },
    subtitle2: {
      fontSize: "0.875rem",
      fontWeight: 500,
      lineHeight: 1.57,
      color: "#64748B",
    },
    body1: {
      fontSize: "0.95rem",
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.57,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
      fontSize: "0.9rem",
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    "none",
    "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
    "0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
    "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)",
    "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
    ...Array(19).fill("0 10px 15px -3px rgba(0, 0, 0, 0.08)"),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "8px 20px",
          boxShadow: "none",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(30, 58, 138, 0.15)",
          },
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)",
          "&:hover": {
            background: "linear-gradient(135deg, #172554 0%, #1D4ED8 100%)",
          },
        },
        containedSecondary: {
          background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
          color: "#FFFFFF",
          "&:hover": {
            background: "linear-gradient(135deg, #D97706 0%, #B45309 100%)",
          },
        },
        outlined: {
          borderWidth: "1.5px",
          "&:hover": {
            borderWidth: "1.5px",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
          border: "1px solid #E2E8F0",
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow: "0 12px 24px -4px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04)",
            transform: "translateY(-2px)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        rounded: {
          borderRadius: 14,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
          fontSize: "0.8rem",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        size: "medium",
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: "#FFFFFF",
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#3B82F6",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          color: "#0F172A",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
          borderBottom: "1px solid #E2E8F0",
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#F1F5F9",
          "& .MuiTableCell-root": {
            fontWeight: 700,
            color: "#334155",
            fontSize: "0.85rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:last-child td, &:last-child th": { border: 0 },
          transition: "background-color 0.15s ease",
          "&:hover": {
            backgroundColor: "#F8FAFC",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "14px 16px",
          borderColor: "#E2E8F0",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 18,
          padding: 8,
        },
      },
    },
  },
});

export default theme;
