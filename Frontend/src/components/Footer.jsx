import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import { Link as RouterLink } from "react-router-dom";
import logo from "../assets/logo.png";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SecurityIcon from "@mui/icons-material/Security";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#0F172A",
        color: "#94A3B8",
        pt: { xs: 6, md: 8 },
        pb: 4,
        mt: "auto",
        borderTop: "1px solid #1E293B",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Brand & Description */}
          <Grid size={{ xs: 12, md: 4 }}>
          <Box
            component={RouterLink}
            to="/"
            sx={{ display: "inline-flex", mb: 2, textDecoration: "none" }}
          >
            <Box
              component="img"
              src={logo}
              alt="AI Car Rental"
              sx={{
                height: 52,
                width: "auto",
                objectFit: "contain",
                display: "block",
                borderRadius: 2,
                bgcolor: "#FFFFFF",
                p: 0.5,
              }}
            />
          </Box>
            <Typography variant="body2" sx={{ lineHeight: 1.7, mb: 3, maxWidth: 320 }}>
              Premium AI-powered car rental platform. Experience verified self-drive vehicles, instant bookings, and seamless host fleet management.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <SecurityIcon sx={{ fontSize: 18, color: "#10B981" }} />
              <Typography variant="caption" sx={{ color: "#E2E8F0", fontWeight: 500 }}>
                100% Verified Fleet & Safe Travel
              </Typography>
            </Stack>
          </Grid>

          {/* Quick Links */}
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Typography variant="subtitle2" sx={{ color: "#FFFFFF", fontWeight: 700, mb: 2.5 }}>
              Explore
            </Typography>
            <Stack spacing={1.5}>
              <Link component={RouterLink} to="/" color="inherit" underline="hover" variant="body2">
                Home
              </Link>
              <Link component={RouterLink} to="/cars" color="inherit" underline="hover" variant="body2">
                Browse Cars
              </Link>
              <Link component={RouterLink} to="/login" color="inherit" underline="hover" variant="body2">
                Sign In
              </Link>
              <Link component={RouterLink} to="/register" color="inherit" underline="hover" variant="body2">
                Register
              </Link>
            </Stack>
          </Grid>

          {/* For Customers & Hosts */}
          <Grid size={{ xs: 6, sm: 4, md: 3 }}>
            <Typography variant="subtitle2" sx={{ color: "#FFFFFF", fontWeight: 700, mb: 2.5 }}>
              Portals
            </Typography>
            <Stack spacing={1.5}>
              <Link component={RouterLink} to="/customer" color="inherit" underline="hover" variant="body2">
                Customer Dashboard
              </Link>
              <Link component={RouterLink} to="/customer/bookings" color="inherit" underline="hover" variant="body2">
                My Bookings
              </Link>
              <Link component={RouterLink} to="/host" color="inherit" underline="hover" variant="body2">
                Host Portal
              </Link>
              <Link component={RouterLink} to="/host/cars/add" color="inherit" underline="hover" variant="body2">
                Host a Car
              </Link>
            </Stack>
          </Grid>

          {/* Contact Information */}
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <Typography variant="subtitle2" sx={{ color: "#FFFFFF", fontWeight: 700, mb: 2.5 }}>
              Contact & Support
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                <LocationOnIcon fontSize="small" sx={{ color: "primary.light", mt: 0.2 }} />
                <Typography variant="body2">
                  Kolkata, West Bengal, India
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <PhoneIcon fontSize="small" sx={{ color: "primary.light" }} />
                <Typography variant="body2">
                  +91 (033) 8800-RENT-CAR
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <EmailIcon fontSize="small" sx={{ color: "primary.light" }} />
                <Typography variant="body2">
                  support@aicarrental.com
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: "#1E293B", my: 3 }} />

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          <Typography variant="caption" color="text.secondary">
            © {currentYear} AI-Powered Car Rental. All rights reserved.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Designed with Material UI for high-performance car mobility.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
