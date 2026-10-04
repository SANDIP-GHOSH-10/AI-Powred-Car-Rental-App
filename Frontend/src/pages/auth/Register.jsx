import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
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

import PersonOutlineIcon from "@mui/icons-material/PersonOutlineOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import TimeToLeaveIcon from "@mui/icons-material/TimeToLeave";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import api from "../../api/axios.js";
import logo from "../../assets/logo.png";

// ─── Promotional panel content ────────────────────────────────────────────────
const BENEFITS = [
  "List your car and earn passively",
  "AI-powered pricing & smart recommendations",
  "Secure booking and fast payouts",
];

// ─── Role definitions (ADMIN intentionally excluded) ─────────────────────────
const ROLES = [
  {
    value: "CUSTOMER",
    label: "Customer",
    subtitle: "Rent cars for your trips",
    icon: PersonIcon,
  },
  {
    value: "HOST",
    label: "Host",
    subtitle: "List your car and earn",
    icon: TimeToLeaveIcon,
  },
];

// ─── Shared promo panel styles ────────────────────────────────────────────────
const promoPanelSx = {
  display: { xs: "none", md: "flex" },
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "flex-start",
  width: { md: "42%", lg: "40%" },
  flexShrink: 0,
  px: { md: 6, lg: 8 },
  py: 8,
  background: "linear-gradient(150deg, #0F2461 0%, #1E3A8A 55%, #1D4ED8 100%)",
  position: "relative",
  overflow: "hidden",
};

// ─── Decorative blobs ─────────────────────────────────────────────────────────
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
    <Box sx={{ mb: light ? 4 : 5 }}>
      <Box
        component="img"
        src={logo}
        alt="AI Car Rental"
        sx={{
          height: light ? 48 : 56,
          width: "auto",
          objectFit: "contain",
          display: "block",
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

// ─── Role card component ───────────────────────────────────────────────────────
function RoleCard({ value, label, subtitle, icon: Icon, selected, onSelect }) {
  return (
    <Box
      component="button"
      type="button"
      id={`role-${value.toLowerCase()}`}
      aria-pressed={selected}
      onClick={() => onSelect(value)}
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 0.5,
        p: 2,
        border: "2px solid",
        borderColor: selected ? "primary.main" : "divider",
        borderRadius: 3,
        bgcolor: selected ? "rgba(30, 58, 138, 0.05)" : "background.paper",
        cursor: "pointer",
        transition: "border-color 0.18s ease, background-color 0.18s ease",
        outline: "none",
        textAlign: "left",
        // Reset native button styles
        appearance: "none",
        WebkitAppearance: "none",
        "&:hover": {
          borderColor: selected ? "primary.main" : "primary.light",
          bgcolor: selected
            ? "rgba(30, 58, 138, 0.05)"
            : "rgba(30, 58, 138, 0.025)",
        },
        "&:focus-visible": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: 2,
        },
      }}
    >
      {/* Icon row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          mb: 0.5,
        }}
      >
        <Icon
          sx={{
            color: selected ? "primary.main" : "text.secondary",
            fontSize: 22,
            transition: "color 0.18s",
          }}
        />
        {selected && (
          <CheckCircleIcon sx={{ color: "primary.main", fontSize: 16 }} />
        )}
      </Box>

      {/* Label */}
      <Typography
        variant="body2"
        sx={{
          fontWeight: 700,
          color: selected ? "primary.main" : "text.primary",
          transition: "color 0.18s",
          lineHeight: 1.3,
        }}
      >
        {label}
      </Typography>

      {/* Subtitle */}
      <Typography
        variant="caption"
        sx={{ color: "text.secondary", lineHeight: 1.4 }}
      >
        {subtitle}
      </Typography>
    </Box>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Register() {
  const navigate = useNavigate();

  // ── Core form state — shape unchanged, sent as-is to API ─────────────────
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CUSTOMER",
  });

  // ── UI-only state (confirmPassword not sent to API) ───────────────────────
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ── Feedback state — unchanged ────────────────────────────────────────────
  const [checkErr, setCheckErr] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Client-side password match check (purely UI)
  const passwordMismatch =
    confirmPassword.length > 0 && form.password !== confirmPassword;

  // ── Handlers — logic unchanged ────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (newRole) => {
    setForm((prev) => ({ ...prev, role: newRole }));
  };

  const handleCheck = async (e) => {
    const { name, value } = e.target;
    if (name !== "email" || !value) return;

    try {
      await api.get(
        `/check-field?field=email&value=${encodeURIComponent(value)}`
      );
      setCheckErr("");
    } catch (err) {
      setCheckErr("This email address is already registered.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await api.post("/register", form);
      setSuccess(
        response.data.message ||
          "Registration successful! Redirecting to login..."
      );
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error("Registration error:", err);
      const backendError = err.response?.data?.error;
      const validationErrors = err.response?.data?.errors;

      if (backendError) {
        setError(backendError);
      } else if (validationErrors && validationErrors.length > 0) {
        setError(validationErrors[0].msg);
      } else {
        setError(err.response?.data?.message || "Error registering user.");
      }
    } finally {
      setLoading(false);
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  const isSubmitDisabled =
    loading ||
    Boolean(checkErr) ||
    passwordMismatch ||
    confirmPassword.length === 0;

  return (
    <Box
      sx={{
        minHeight: "85vh",
        display: "flex",
        bgcolor: "background.default",
      }}
    >
      {/* ── LEFT FORM PANEL ── */}
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
          // Subtle scroll on very small viewports
          overflowY: "auto",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 440 }}>
          {/* Mobile brand header */}
          <Box sx={{ display: { xs: "block", md: "none" } }}>
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
            Create your account
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3.5 }}
          >
            Join as a customer to rent, or as a host to earn
          </Typography>

          {/* Feedback alerts */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              {success}
            </Alert>
          )}

          {/* Registration form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2.5}>
              {/* ── Role selector (ADMIN excluded) ── */}
              <Box>
                <Typography
                  component="legend"
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: "text.secondary",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    display: "block",
                    mb: 1.5,
                  }}
                >
                  I want to
                </Typography>
                <Box
                  role="group"
                  aria-label="Account type"
                  sx={{ display: "flex", gap: 1.5 }}
                >
                  {ROLES.map(({ value, label, subtitle, icon }) => (
                    <RoleCard
                      key={value}
                      value={value}
                      label={label}
                      subtitle={subtitle}
                      icon={icon}
                      selected={form.role === value}
                      onSelect={handleRoleChange}
                    />
                  ))}
                </Box>
              </Box>

              {/* Full Name */}
              <TextField
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineIcon color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* Email */}
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleCheck}
                error={Boolean(checkErr)}
                helperText={checkErr}
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

              {/* Password */}
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
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
                            showPassword ? "Hide password" : "Show password"
                          }
                          onClick={() => setShowPassword((prev) => !prev)}
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

              {/* Confirm Password — UI only, not sent to API */}
              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={passwordMismatch}
                helperText={
                  passwordMismatch ? "Passwords do not match" : undefined
                }
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
                            showConfirmPassword
                              ? "Hide confirm password"
                              : "Show confirm password"
                          }
                          onClick={() =>
                            setShowConfirmPassword((prev) => !prev)
                          }
                          edge="end"
                          size="small"
                        >
                          {showConfirmPassword ? (
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

              {/* Submit button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={isSubmitDisabled}
                startIcon={!loading && <HowToRegIcon />}
                sx={{ py: 1.5, fontWeight: 700, fontSize: "0.95rem", mt: 0.5 }}
              >
                {loading ? (
                  <CircularProgress size={22} color="inherit" />
                ) : (
                  `Create ${form.role === "HOST" ? "Host" : "Customer"} Account`
                )}
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ px: 1 }}
            >
              OR
            </Typography>
          </Divider>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center" }}
          >
            Already have an account?{" "}
            <RouterLink
              to="/login"
              style={{
                color: "#1E3A8A",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Sign In
            </RouterLink>
          </Typography>
        </Box>
      </Box>

      {/* ── RIGHT PROMOTIONAL PANEL (desktop only) ── */}
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
          Join our growing
          <br />
          community.
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
          Whether you&apos;re looking to rent the perfect car or earn by
          listing yours, we make it simple and secure.
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
    </Box>
  );
}