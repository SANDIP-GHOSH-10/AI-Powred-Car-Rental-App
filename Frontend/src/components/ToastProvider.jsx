/**
 * ToastProvider.jsx
 *
 * Centralized MUI Snackbar/Alert toast system for the entire application.
 *
 * Usage:
 *   import { useToast } from "./ToastProvider";
 *   const { showSuccess, showError, showInfo, showWarning } = useToast();
 *   showSuccess("Car added successfully!");
 *
 * Mounted once in main.jsx — wraps the entire App.
 * No props needed on individual pages.
 */

import { createContext, useCallback, useContext, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Slide from "@mui/material/Slide";

// -------------------------------------------------------
// CONTEXT
// -------------------------------------------------------

export const ToastContext = createContext(null);

// -------------------------------------------------------
// SLIDE TRANSITION
// -------------------------------------------------------

function SlideUp(props) {
  return <Slide {...props} direction="up" />;
}

// -------------------------------------------------------
// PROVIDER
// -------------------------------------------------------

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success", // "success" | "error" | "warning" | "info"
  });

  const show = useCallback((message, severity = "success") => {
    setToast({ open: true, message, severity });
  }, []);

  const showSuccess = useCallback(
    (message) => show(message, "success"),
    [show]
  );
  const showError = useCallback(
    (message) => show(message, "error"),
    [show]
  );
  const showInfo = useCallback(
    (message) => show(message, "info"),
    [show]
  );
  const showWarning = useCallback(
    (message) => show(message, "warning"),
    [show]
  );

  const handleClose = useCallback((_, reason) => {
    if (reason === "clickaway") return;
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showInfo, showWarning }}>
      {children}

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleClose}
        slots={{ transition: SlideUp }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        sx={{ mb: { xs: 7, sm: 2 } }} // extra bottom margin on mobile for nav bar clearance
      >
        <Alert
          onClose={handleClose}
          severity={toast.severity}
          variant="filled"
          elevation={6}
          sx={{
            minWidth: 280,
            maxWidth: 480,
            borderRadius: 2.5,
            fontWeight: 600,
            fontSize: "0.9rem",
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

// -------------------------------------------------------
// HOOK
// -------------------------------------------------------

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return ctx;
}
