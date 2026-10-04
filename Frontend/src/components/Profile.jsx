import { useContext } from "react";
import { Link as RouterLink } from "react-router-dom";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";

import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import BadgeIcon from "@mui/icons-material/Badge";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SecurityIcon from "@mui/icons-material/Security";

import { AuthContext } from "../context/Auth.jsx";
import PageHeader from "./PageHeader.jsx";

export default function Profile() {
  const { user, handleLogout } = useContext(AuthContext);

  if (!user) {
    return null;
  }

  const roles = Array.isArray(user.roles)
    ? user.roles
    : user.role
    ? [user.role]
    : [];

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal credentials, permissions, and account settings."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Profile" }]}
        action={
          <Button
            component={RouterLink}
            to="/dashboard"
            startIcon={<ArrowBackIcon />}
            variant="outlined"
          >
            Dashboard
          </Button>
        }
      />

      <Grid container spacing={4}>
        {/* Left Column: Avatar & Summary */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 4,
              border: "1px solid #E2E8F0",
            }}
          >
            <Avatar
              sx={{
                width: 96,
                height: 96,
                bgcolor: "primary.main",
                color: "#FFFFFF",
                fontSize: "2.5rem",
                fontWeight: 800,
                mx: "auto",
                mb: 2,
                boxShadow: "0 8px 20px rgba(30, 58, 138, 0.25)",
              }}
            >
              {user.name ? user.name[0].toUpperCase() : "U"}
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {user.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {user.email}
            </Typography>

            <Stack direction="row" spacing={1} useFlexGap sx={{ mb: 3, justifyContent: "center", flexWrap: "wrap" }}>
              {roles.map((r) => (
                <Chip
                  key={r}
                  label={r}
                  color={r === "ADMIN" ? "secondary" : r === "HOST" ? "primary" : "default"}
                  variant="outlined"
                  sx={{ fontWeight: 700 }}
                />
              ))}
            </Stack>

            <Button
              variant="outlined"
              color="error"
              fullWidth
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ fontWeight: 700 }}
            >
              Sign Out
            </Button>
          </Card>
        </Grid>

        {/* Right Column: Account Details */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: 4,
              border: "1px solid #E2E8F0",
              bgcolor: "#FFFFFF",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
              Account Information
            </Typography>

            <Stack spacing={3}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <PersonIcon color="primary" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    FULL NAME
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {user.name}
                  </Typography>
                </Box>
              </Box>

              <Divider />

              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <EmailIcon color="primary" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    EMAIL ADDRESS
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {user.email}
                  </Typography>
                </Box>
              </Box>

              <Divider />

              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <BadgeIcon color="primary" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    SYSTEM ROLES
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Stack direction="row" spacing={1}>
                      {roles.map((r) => (
                        <Chip key={r} label={r} size="small" sx={{ fontWeight: 700 }} />
                      ))}
                    </Stack>
                  </Box>
                </Box>
              </Box>

              {user._id && (
                <>
                  <Divider />
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                    <FingerprintIcon color="action" sx={{ mt: 0.5 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        USER IDENTIFIER
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: "monospace", color: "text.secondary" }}>
                        {user._id}
                      </Typography>
                    </Box>
                  </Box>
                </>
              )}
            </Stack>

            <Box
              sx={{
                mt: 4,
                p: 2.5,
                bgcolor: "rgba(16, 185, 129, 0.08)",
                borderRadius: 3,
                border: "1px solid #A7F3D0",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <SecurityIcon sx={{ color: "#059669" }} />
              <Typography variant="caption" sx={{ color: "#065F46", fontWeight: 600 }}>
                Your account is active and protected with secure JWT authentication.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
