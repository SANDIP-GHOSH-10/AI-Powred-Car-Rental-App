import { useState, useContext } from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";

import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import logo from "../assets/logo.png";
import HomeIcon from "@mui/icons-material/Home";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import PeopleIcon from "@mui/icons-material/People";
import TimeToLeaveIcon from "@mui/icons-material/TimeToLeave";
import AddBoxIcon from "@mui/icons-material/AddBox";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

import { AuthContext } from "../context/Auth.jsx";

export default function Navbar() {
  const { isLoggedIn, user, handleLogout } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const onLogout = () => {
    handleUserMenuClose();
    handleLogout();
  };

  // Determine roles
  const roles = Array.isArray(user?.roles)
    ? user.roles
    : user?.role
    ? [user.role]
    : [];

  const isCustomer = roles.includes("CUSTOMER");
  const isHost = roles.includes("HOST");
  const isAdmin = roles.includes("ADMIN");

  const isActive = (path) => {
    if (path === "/" && location.pathname !== "/") return false;
    return location.pathname === path || (path !== "/" && location.pathname.startsWith(path));
  };

  // Navigation Items per role
  const getNavLinks = () => {
    if (!isLoggedIn) {
      return [
        { label: "Home", path: "/", icon: <HomeIcon fontSize="small" /> },
        { label: "Cars", path: "/cars", icon: <DirectionsCarIcon fontSize="small" /> },
      ];
    }

    if (isAdmin) {
      return [
        { label: "Dashboard", path: "/admin", icon: <DashboardIcon fontSize="small" /> },
        { label: "Users", path: "/admin/users", icon: <PeopleIcon fontSize="small" /> },
        { label: "Cars", path: "/admin/cars", icon: <TimeToLeaveIcon fontSize="small" /> },
        { label: "Bookings", path: "/admin/bookings", icon: <AssessmentIcon fontSize="small" /> },
      ];
    }

    if (isHost && !isCustomer) {
      return [
        { label: "Dashboard", path: "/host", icon: <DashboardIcon fontSize="small" /> },
        { label: "My Cars", path: "/host/cars", icon: <DirectionsCarIcon fontSize="small" /> },
        { label: "Bookings", path: "/host/bookings", icon: <BookOnlineIcon fontSize="small" /> },
      ];
    }

    if (isHost && isCustomer) {
      return [
        { label: "Home", path: "/", icon: <HomeIcon fontSize="small" /> },
        { label: "Cars", path: "/cars", icon: <DirectionsCarIcon fontSize="small" /> },
        { label: "My Bookings", path: "/customer/bookings", icon: <BookOnlineIcon fontSize="small" /> },
        { label: "Host Portal", path: "/host", icon: <DashboardIcon fontSize="small" /> },
      ];
    }

    // Default Customer
    return [
      { label: "Home", path: "/", icon: <HomeIcon fontSize="small" /> },
      { label: "Browse Cars", path: "/cars", icon: <DirectionsCarIcon fontSize="small" /> },
      { label: "AI Car Finder", path: "/customer/ai-search", icon: <AutoAwesomeIcon fontSize="small" />, isAI: true },
      { label: "Dashboard", path: "/customer", icon: <DashboardIcon fontSize="small" /> },
      { label: "My Bookings", path: "/customer/bookings", icon: <BookOnlineIcon fontSize="small" /> },
    ];
  };

  const navLinks = getNavLinks();

  const drawer = (
    <Box sx={{ width: 280, p: 2, display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Brand Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Box
          component={RouterLink}
          to="/"
          onClick={handleDrawerToggle}
          sx={{ display: "inline-flex", textDecoration: "none" }}
        >
          <Box
            component="img"
            src={logo}
            alt="AI Car Rental"
            sx={{
              height: 44,
              width: "auto",
              objectFit: "contain",
              display: "block",
            }}
          />
        </Box>
        <IconButton onClick={handleDrawerToggle} aria-label="Close menu" size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* User Info if logged in */}
      {isLoggedIn && user && (
        <Box sx={{ p: 2, mb: 2, bgcolor: "#F1F5F9", borderRadius: 2.5 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36, fontWeight: 700 }}>
              {user.name ? user.name[0].toUpperCase() : "U"}
            </Avatar>
            <Box sx={{ overflow: "hidden" }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
                {user.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap display="block">
                {user.email}
              </Typography>
            </Box>
          </Stack>
          <Box sx={{ mt: 1, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            {roles.map((role) => (
              <Chip key={role} label={role} size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: "0.65rem" }} />
            ))}
          </Box>
        </Box>
      )}

      <Divider sx={{ my: 1 }} />

      {/* Nav list */}
      <List sx={{ flexGrow: 1 }}>
        {navLinks.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              onClick={handleDrawerToggle}
              selected={isActive(item.path)}
              sx={{
                borderRadius: 2,
                "&.Mui-selected": {
                  bgcolor: "rgba(30, 58, 138, 0.08)",
                  color: "primary.main",
                  fontWeight: 700,
                  "& .MuiListItemIcon-root": { color: "primary.main" },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: "text.secondary" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} slotProps={{ primary: { sx: { fontWeight: 600, fontSize: "0.95rem" } } }} />
            </ListItemButton>
          </ListItem>
        ))}

        {isLoggedIn && (
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={RouterLink}
              to="/profile"
              onClick={handleDrawerToggle}
              selected={isActive("/profile")}
              sx={{
                borderRadius: 2,
                "&.Mui-selected": {
                  bgcolor: "rgba(30, 58, 138, 0.08)",
                  color: "primary.main",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: "text.secondary" }}>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="My Profile" slotProps={{ primary: { sx: { fontWeight: 600, fontSize: "0.95rem" } } }} />
            </ListItemButton>
          </ListItem>
        )}
      </List>

      <Divider sx={{ my: 1 }} />

      {/* Mobile Auth actions */}
      <Box sx={{ pt: 1 }}>
        {isLoggedIn ? (
          <Button
            variant="outlined"
            color="error"
            fullWidth
            startIcon={<LogoutIcon />}
            onClick={() => {
              handleDrawerToggle();
              handleLogout();
            }}
          >
            Logout
          </Button>
        ) : (
          <Stack spacing={1.5}>
            <Button
              component={RouterLink}
              to="/login"
              variant="outlined"
              color="primary"
              fullWidth
              startIcon={<LoginIcon />}
              onClick={handleDrawerToggle}
            >
              Sign In
            </Button>
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<HowToRegIcon />}
              onClick={handleDrawerToggle}
            >
              Register
            </Button>
          </Stack>
        )}
      </Box>
    </Box>
  );

  return (
    <AppBar position="sticky" elevation={0}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 } }}>
          {/* Brand Logo */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              textDecoration: "none",
              mr: { xs: 1, md: 4 },
              flexShrink: 0,
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="AI Car Rental"
              sx={{
                height: { xs: 38, sm: 44, md: 48 },
                width: "auto",
                objectFit: "contain",
                display: "block",
              }}
            />
          </Box>

          {/* Desktop Navigation Links */}
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1 }}>
            {navLinks.map((item) =>
              item.isAI ? (
                <Button
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{
                    fontWeight: 700,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    background: isActive(item.path)
                      ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                      : "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.12))",
                    color: "primary.main",
                    "&:hover": {
                      background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))",
                    },
                    ...(isActive(item.path) && { color: "#fff" }),
                  }}
                >
                  {item.label}
                </Button>
              ) : (
                <Button
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{
                    color: isActive(item.path) ? "primary.main" : "text.secondary",
                    fontWeight: isActive(item.path) ? 700 : 600,
                    bgcolor: isActive(item.path) ? "rgba(30, 58, 138, 0.08)" : "transparent",
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    "&:hover": {
                      bgcolor: "rgba(30, 58, 138, 0.04)",
                      color: "primary.main",
                    },
                  }}
                >
                  {item.label}
                </Button>
              )
            )}
          </Box>


          {/* Desktop Auth Controls */}
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1.5 }}>
            {!isLoggedIn ? (
              <>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  color="primary"
                  size="medium"
                  startIcon={<LoginIcon />}
                >
                  Sign In
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  color="primary"
                  size="medium"
                  startIcon={<HowToRegIcon />}
                >
                  Register
                </Button>
              </>
            ) : (
              <>
                <Chip
                  avatar={
                    <Avatar sx={{ bgcolor: "primary.dark", color: "#FFF", fontWeight: 700 }}>
                      {user?.name ? user.name[0].toUpperCase() : "U"}
                    </Avatar>
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                      {user?.name?.split(" ")[0] || "User"}
                    </Typography>
                  }
                  onClick={handleUserMenuOpen}
                  variant="outlined"
                  sx={{
                    py: 2.2,
                    px: 0.5,
                    borderRadius: 3,
                    borderColor: "#E2E8F0",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "#F1F5F9" },
                  }}
                />

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleUserMenuClose}
                  onClick={handleUserMenuClose}
                  slotProps={{
                    paper: {
                      sx: {
                        mt: 1.5,
                        minWidth: 200,
                        borderRadius: 3,
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                  <MenuItem component={RouterLink} to="/dashboard">
                    <ListItemIcon>
                      <DashboardIcon fontSize="small" />
                    </ListItemIcon>
                    Dashboard
                  </MenuItem>
                  <MenuItem component={RouterLink} to="/profile">
                    <ListItemIcon>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    My Profile
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={onLogout} sx={{ color: "error.main" }}>
                    <ListItemIcon sx={{ color: "error.main" }}>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>

          {/* Mobile Menu Icon */}
          <Box sx={{ display: { xs: "flex", md: "none" }, ml: "auto" }}>
            <IconButton
              size="large"
              aria-label="open mobile navigation"
              edge="start"
              color="inherit"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
}