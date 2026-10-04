import { useContext } from "react";
import { Link as RouterLink } from "react-router-dom";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";

import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import TimeToLeaveIcon from "@mui/icons-material/TimeToLeave";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import BookOnlineIcon from "@mui/icons-material/BookOnline";

import { AuthContext } from "../context/Auth.jsx";
import PageHeader from "./PageHeader.jsx";

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return null;
  }

  const roles = Array.isArray(user.roles)
    ? user.roles
    : user.role
    ? [user.role]
    : [];

  const isCustomer = roles.includes("CUSTOMER");
  const isHost = roles.includes("HOST");
  const isAdmin = roles.includes("ADMIN");

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <PageHeader
        title="Account Central"
        subtitle="Manage your profile, switch roles, and launch your dedicated workspaces."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Dashboard" }]}
      />

      {/* User Welcome Card */}
      <Card
        sx={{
          p: { xs: 3, sm: 4 },
          mb: 5,
          borderRadius: 4,
          background: "linear-gradient(135deg, #1E3A8A 0%, #172554 100%)",
          color: "#FFFFFF",
        }}
      >
        <Grid container spacing={3} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, sm: "auto" }}>
            <Avatar
              sx={{
                width: 72,
                height: 72,
                bgcolor: "secondary.main",
                color: "#FFFFFF",
                fontSize: "1.8rem",
                fontWeight: 800,
                boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
              }}
            >
              {user.name ? user.name[0].toUpperCase() : "U"}
            </Avatar>
          </Grid>
          <Grid size={{ xs: 12, sm: "grow" }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
              Welcome, {user.name}
            </Typography>
            <Typography variant="body2" sx={{ color: "#CBD5E1", mb: 1.5 }}>
              {user.email}
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
              {roles.map((r) => (
                <Chip
                  key={r}
                  label={r}
                  size="small"
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.15)",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                  }}
                />
              ))}
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: "auto" }}>
            <Button
              component={RouterLink}
              to="/profile"
              variant="outlined"
              sx={{
                color: "#FFFFFF",
                borderColor: "rgba(255, 255, 255, 0.4)",
                "&:hover": { borderColor: "#FFFFFF", bgcolor: "rgba(255,255,255,0.08)" },
              }}
              startIcon={<PersonIcon />}
            >
              View Full Profile
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Available Portals Grid */}
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
        Your Dedicated Workspaces
      </Typography>

      <Grid container spacing={3.5}>
        {/* Customer Portal */}
        {isCustomer && (
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: 3.5,
                p: 1,
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    bgcolor: "rgba(30, 58, 138, 0.08)",
                    color: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <BookOnlineIcon fontSize="medium" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                  Customer Portal
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Browse active cars, create new reservations, and view current booking statuses.
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  component={RouterLink}
                  to="/customer"
                  variant="contained"
                  color="primary"
                  fullWidth
                  endIcon={<ArrowForwardIcon />}
                >
                  Launch Customer Hub
                </Button>
              </CardActions>
            </Card>
          </Grid>
        )}

        {/* Host Portal */}
        {isHost && (
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: 3.5,
                p: 1,
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    bgcolor: "rgba(245, 158, 11, 0.12)",
                    color: "warning.dark",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <TimeToLeaveIcon fontSize="medium" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                  Host Fleet Manager
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  List new vehicles, manage availability, review incoming booking requests, and track income.
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  component={RouterLink}
                  to="/host"
                  variant="contained"
                  color="secondary"
                  fullWidth
                  endIcon={<ArrowForwardIcon />}
                >
                  Launch Host Portal
                </Button>
              </CardActions>
            </Card>
          </Grid>
        )}

        {/* Admin Console */}
        {isAdmin && (
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: 3.5,
                p: 1,
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    bgcolor: "rgba(16, 185, 129, 0.12)",
                    color: "success.dark",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <AdminPanelSettingsIcon fontSize="medium" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                  Admin Control Center
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Full administrative authority: approve cars, manage users, modify reservations, and view revenue.
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  component={RouterLink}
                  to="/admin"
                  variant="contained"
                  color="success"
                  fullWidth
                  endIcon={<ArrowForwardIcon />}
                >
                  Launch Admin Console
                </Button>
              </CardActions>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}
