import { Routes, Route } from "react-router-dom";
import { useContext } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Link as RouterLink } from "react-router-dom";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import HomeIcon from "@mui/icons-material/Home";

import { AuthContext } from "./context/Auth.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Loader from "./components/Loader.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import RoleRoute from "./components/RoleRoute.jsx";

// Auth Pages
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";

// Common Pages
import Dashboard from "./components/Dashboard.jsx";
import Profile from "./components/Profile.jsx";

// Public Pages
import Home from "./pages/public/Home.jsx";
import Cars from "./pages/public/Cars.jsx";
import CarDetails from "./pages/public/CarDetails.jsx";

// Customer Pages
import CustomerDashboard from "./pages/customer/CustomerDashboard.jsx";
import BookCar from "./pages/customer/BookCar.jsx";
import MyBookings from "./pages/customer/MyBookings.jsx";
import BookingDetails from "./pages/customer/BookingsDetails.jsx";
import PaymentSuccess from "./pages/customer/PaymentSuccess.jsx";
import AICarSearch from "./pages/customer/AICarSearch.jsx";

// Host Pages
import HostDashboard from "./pages/host/HostDashboard.jsx";
import MyCars from "./pages/host/MyCars.jsx";
import AddCar from "./pages/host/AddCar.jsx";
import EditCar from "./pages/host/EditCar.jsx";
import HostBookings from "./pages/host/HostBookings.jsx";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import ManageUsers from "./pages/admin/ManageUsers.jsx";
import ManageCars from "./pages/admin/ManageCars.jsx";
import ManageBookings from "./pages/admin/ManageBookings.jsx";

export default function App() {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return <Loader message="Initializing AI Car Rental..." fullPage />;
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "background.default" }}>
      {/* NAVBAR */}
      <Navbar />

      {/* MAIN CONTENT AREA */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/cars/:id" element={<CarDetails />} />

          {/* AUTH ROUTES */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* COMMON PROTECTED ROUTES */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          {/* CUSTOMER ROUTES */}
          <Route
            path="/customer"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["CUSTOMER"]}>
                  <CustomerDashboard />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/customer/book/:id"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["CUSTOMER"]}>
                  <BookCar />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/customer/bookings"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["CUSTOMER"]}>
                  <MyBookings />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/customer/bookings/:id"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["CUSTOMER"]}>
                  <BookingDetails />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/customer/payment-success"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["CUSTOMER"]}>
                  <PaymentSuccess />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/customer/ai-search"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["CUSTOMER"]}>
                  <AICarSearch />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          {/* HOST ROUTES */}
          <Route
            path="/host"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["HOST"]}>
                  <HostDashboard />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/host/cars"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["HOST"]}>
                  <MyCars />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/host/cars/add"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["HOST"]}>
                  <AddCar />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/host/cars/edit/:id"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["HOST"]}>
                  <EditCar />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/host/bookings"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["HOST"]}>
                  <HostBookings />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          {/* ADMIN ROUTES */}
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["ADMIN"]}>
                  <AdminDashboard />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["ADMIN"]}>
                  <ManageUsers />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/cars"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["ADMIN"]}>
                  <ManageCars />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["ADMIN"]}>
                  <ManageBookings />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          {/* 404 FALLBACK */}
          <Route
            path="*"
            element={
              <Container maxWidth="sm" sx={{ py: 10, textAlign: "center" }}>
                <ErrorOutlineOutlinedIcon sx={{ fontSize: 72, color: "text.secondary", mb: 2, opacity: 0.5 }} />
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                  404
                </Typography>
                <Typography variant="h5" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                  Page Not Found
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  The page you are looking for might have been moved or does not exist.
                </Typography>
                <Button
                  component={RouterLink}
                  to="/"
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<HomeIcon />}
                >
                  Back to Home
                </Button>
              </Container>
            }
          />
        </Routes>
      </Box>

      {/* FOOTER */}
      <Footer />
    </Box>
  );
}

