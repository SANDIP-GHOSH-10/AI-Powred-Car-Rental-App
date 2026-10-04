import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import App from "./App.jsx";
import theme from "./theme/theme.js";
import { AuthProvider } from "./context/Auth.jsx";
import { AppProvider } from "./context/AppContext.jsx";
import { ToastProvider } from "./components/ToastProvider.jsx";
import "./index.css";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);
