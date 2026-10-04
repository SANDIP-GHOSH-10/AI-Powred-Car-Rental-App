import { useState, useContext } from "react";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LoginIcon from "@mui/icons-material/Login";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";

import { AuthContext } from "../../context/Auth.jsx";
import api from "../../api/axios.js";
import logo from "../../assets/logo.png";

// ─── Promotional panel content ───────────────────────────────────────────────
const BENEFITS = [
  "Wide range of cars for every trip",
  "Easy, secure, and instant booking",
  "Flexible rental options tailored to you",
];

// ─── Shared promo panel styles ────────────────────────────────────────────────
const promoPanelSx = {
  display: { xs: "none", md: "flex" },
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "flex-start",
  width: { md: "44%", lg: "42%" },
  flexShrink: 0,
  px: { md: 6, lg: 8 },
  py: 8,
  background: "linear-gradient(150deg, #0F2461 0%, #1E3A8A 55%, #1D4ED8 100%)",
  position: "relative",
  overflow: "hidden",
};

// ─── Decorative blob ─────────────────────────────────────────────────────────
function DecorativeBlobs() {
  return (
    <>
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          top: -100,
          right: -100,
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.045)",
          pointerEvents: "none",
        }}
      />
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          bottom: -140,
          left: -80,
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.03)",
          pointerEvents: "none",
        }}
      />
    </>
  );
}

// ─── Brand lockup — uses the official PNG logo ────────────────────────────────
// light=true → white panel (logo on white: shown directly)
// light=false → dark navy panel (logo in a white rounded container)
function BrandLockup({ light = false }) {
  return (
    <Box sx={{ mb: light ? 4 : 6 }}>
      <Box
        component="img"
        src={logo}
        alt="AI Car Rental"
        sx={{
          height: light ? 48 : 56,
          width: "auto",
          objectFit: "contain",
          display: "block",
          // On dark backgrounds wrap with white rounded bg
          ...(light
            ? {}
            : {
                bgcolor: "#FFFFFF",
                borderRadius: 2,
                p: 0.75,
              }),
        }}
      />
    </Box>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Login() {
  const { handleLogin } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Authentication logic — unchanged ─────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/login", { email, password });
      const { user, token, message } = response.data;

      if (user && token) {
        handleLogin(user, token);
        return;
      }

      setError(message || "Invalid credentials provided.");
    } catch (err) {
      console.error("Login error:", err);
      const backendError = err.response?.data?.error;
      const validationErrors = err.response?.data?.errors;

      if (backendError) {
        setError(backendError);
      } else if (validationErrors && validationErrors.length > 0) {
        setError(validationErrors[0].msg);
      } else {
        setError(
          err.response?.data?.message ||
            "Error logging in. Please check credentials."
        );
      }
    } finally {
      setLoading(false);
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <Box
      sx={{
        minHeight: "85vh",
        display: "flex",
        bgcolor: "background.default",
      }}
    >
      {/* ── LEFT PROMOTIONAL PANEL (desktop only) ── */}
      <Box sx={promoPanelSx}>
        <DecorativeBlobs />

        <BrandLockup light={false} />

        <Typography
          variant="h2"
          sx={{
            color: "#FFFFFF",
            fontWeight: 800,
            fontSize: { md: "2rem", lg: "2.5rem" },
            lineHeight: 1.2,
            mb: 2,
            letterSpacing: "-0.02em",
          }}
        >
          Your journey
          <br />
          starts here.
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: "rgba(255,255,255,0.72)",
            mb: 5,
            lineHeight: 1.75,
            maxWidth: 340,
          }}
        >
          Sign in to access your bookings, discover cars, and get
          AI-powered recommendations for your next trip.
        </Typography>

        <Stack spacing={2.25}>
          {BENEFITS.map((benefit) => (
            <Box
              key={benefit}
              sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
            >
              <CheckCircleOutlineOutlinedIcon
                sx={{ color: "#60A5FA", fontSize: 20, flexShrink: 0 }}
              />
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}
              >
                {benefit}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* ── RIGHT FORM PANEL ── */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 3, sm: 5, md: 6, lg: 8 },
          py: { xs: 5, md: 6 },
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 420 }}>
          {/* Mobile brand header */}
          <Box sx={{ display: { xs: "block", md: "none" }, mb: 4 }}>
            <BrandLockup light={true} />
          </Box>

          {/* Page heading */}
          <Typography
            component="h1"
            variant="h3"
            sx={{
              fontWeight: 800,
              color: "text.primary",
              mb: 0.75,
              fontSize: { xs: "1.65rem", sm: "1.9rem" },
              letterSpacing: "-0.02em",
            }}
          >
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Sign in to your account to continue
          </Typography>

          {/* Error alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Sign-in form — logic unchanged */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2.5}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={
                            showPassword
                              ? "Hide password"
                              : "Show password"
                          }
                          onClick={() =>
                            setShowPassword((prev) => !prev)
                          }
                          edge="end"
                          size="small"
                        >
                          {showPassword ? (
                            <VisibilityOff fontSize="small" />
                          ) : (
                            <Visibility fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                startIcon={!loading && <LoginIcon />}
                sx={{ py: 1.5, fontWeight: 700, fontSize: "0.95rem", mt: 0.5 }}
              >
                {loading ? (
                  <CircularProgress size={22} color="inherit" />
                ) : (
                  "Sign In"
                )}
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.disabled" sx={{ px: 1 }}>
              OR
            </Typography>
          </Divider>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center" }}
          >
            Don&apos;t have an account?{" "}
            <RouterLink
              to="/register"
              style={{
                color: "#1E3A8A",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Create an account
            </RouterLink>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
