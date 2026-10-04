import { useContext, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";

import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import TimeToLeaveIcon from "@mui/icons-material/TimeToLeave";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PaymentIcon from "@mui/icons-material/Payment";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";

import { AuthContext } from "../../context/Auth.jsx";
import { AppContext } from "../../context/AppContext.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import DashboardStatCard from "../../components/DashboardStatCard.jsx";
import StatusChip from "../../components/StatusChip.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import { StatCardSkeleton } from "../../components/SkeletonLoader.jsx";

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const {
    adminUsers,
    adminUsersLoading,
    adminCars,
    adminCarsLoading,
    adminBookings,
    adminBookingsLoading,
    adminApproveCar,
    adminRejectCar,
    error,
  } = useContext(AppContext);

  const [actionDialog, setActionDialog] = useState({
    open: false,
    carId: null,
    type: "", // "APPROVE" or "REJECT"
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const isLoading = adminUsersLoading || adminCarsLoading || adminBookingsLoading;

  // Platform Metrics
  const totalUsers = adminUsers.length;
  const totalCustomers = adminUsers.filter(
    (u) => Array.isArray(u.roles) && u.roles.includes("CUSTOMER")
  ).length;
  const totalHosts = adminUsers.filter(
    (u) => Array.isArray(u.roles) && u.roles.includes("HOST")
  ).length;

  const totalCars = adminCars.length;
  const pendingCars = adminCars.filter((c) => c.status === "PENDING").length;
  const availableCars = adminCars.filter((c) => c.status === "AVAILABLE").length;

  const totalBookings = adminBookings.length;
  const confirmedBookings = adminBookings.filter((b) => b.status === "CONFIRMED").length;
  const pendingBookings = adminBookings.filter((b) => b.status === "PENDING").length;

  // Payment & Revenue Calculations
  const paidBookings = adminBookings.filter((b) => b.paymentStatus === "PAID");
  const totalRevenue = paidBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const onlineRevenue = adminBookings
    .filter((b) => b.paymentMethod === "ONLINE" && b.paymentStatus === "PAID")
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const codRevenue = adminBookings
    .filter((b) => b.paymentMethod === "COD" && b.paymentStatus === "PAID")
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const successfulPaymentsCount = paidBookings.length;
  const pendingPaymentsCount = adminBookings.filter((b) => b.paymentStatus === "PENDING").length;
  const failedPaymentsCount = adminBookings.filter((b) => b.paymentStatus === "FAILED").length;

  const pendingCarsList = adminCars.filter((c) => c.status === "PENDING");
  const recentBookings = adminBookings.slice(0, 6);
  const recentUsers = adminUsers.slice(0, 5);

  const handleOpenDialog = (carId, type) => {
    setActionDialog({
      open: true,
      carId,
      type,
    });
  };

  const handleConfirmCarAction = async () => {
    const { carId, type } = actionDialog;
    if (!carId || !type) return;

    setActionLoading(true);
    setFeedback({ type: "", message: "" });

    try {
      if (type === "APPROVE") {
        await adminApproveCar(carId);
        setFeedback({ type: "success", message: "Vehicle approved and made AVAILABLE to customers." });
      } else {
        await adminRejectCar(carId);
        setFeedback({ type: "success", message: "Vehicle listing rejected." });
      }
      setActionDialog((prev) => ({ ...prev, open: false }));
    } catch (err) {
      console.error("Car action error:", err);
      setFeedback({
        type: "error",
        message: err.response?.data?.error || `Unable to ${type.toLowerCase()} car.`,
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <PageHeader
        title={`Admin Console — ${user?.name || "Administrator"}`}
        subtitle="Full system control over users, fleet approvals, reservation statuses, and revenue."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Admin Console" }]}
      />

      {feedback.message && (
        <Alert
          severity={feedback.type === "success" ? "success" : "error"}
          sx={{ mb: 3 }}
          onClose={() => setFeedback({ type: "", message: "" })}
        >
          {feedback.message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Main KPI Stat Cards */}
      {isLoading ? (
        <StatCardSkeleton count={4} />
      ) : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <DashboardStatCard
              title="Platform Users"
              value={totalUsers}
              subtitle={`${totalCustomers} Customers • ${totalHosts} Hosts`}
              icon={<PeopleIcon />}
              color="#1E3A8A"
              bgColor="rgba(30, 58, 138, 0.08)"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <DashboardStatCard
              title="Vehicle Fleet"
              value={totalCars}
              subtitle={`${availableCars} Available • ${pendingCars} Pending`}
              icon={<TimeToLeaveIcon />}
              color="#0EA5E9"
              bgColor="rgba(14, 165, 233, 0.08)"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <DashboardStatCard
              title="Total Bookings"
              value={totalBookings}
              subtitle={`${confirmedBookings} Confirmed • ${pendingBookings} Pending`}
              icon={<BookOnlineIcon />}
              color="#10B981"
              bgColor="rgba(16, 185, 129, 0.08)"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <DashboardStatCard
              title="Total Revenue (Paid)"
              value={`₹${totalRevenue.toLocaleString("en-IN")}`}
              subtitle={`${successfulPaymentsCount} Paid Transactions`}
              icon={<CurrencyRupeeIcon />}
              color="#F59E0B"
              bgColor="rgba(245, 158, 11, 0.08)"
            />
          </Grid>
        </Grid>
      )}

      {/* Payment & Financial Breakdown Cards */}
      <Card sx={{ mb: 5, p: 3, borderRadius: 3.5, border: "1px solid #E2E8F0" }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2.5, color: "text.secondary" }}>
          PAYMENT & REVENUE OVERVIEW
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ p: 2, bgcolor: "rgba(30, 58, 138, 0.04)", borderRadius: 2.5, border: "1px solid #BFDBFE" }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                ONLINE REVENUE (RAZORPAY)
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#1E3A8A", mt: 0.5 }}>
                ₹{onlineRevenue.toLocaleString("en-IN")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Verified Online Payments
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ p: 2, bgcolor: "rgba(217, 119, 6, 0.04)", borderRadius: 2.5, border: "1px solid #FDE68A" }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                COD REVENUE (PAID AT PICKUP)
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#D97706", mt: 0.5 }}>
                ₹{codRevenue.toLocaleString("en-IN")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Collected at Pickup
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ p: 2, bgcolor: "rgba(16, 185, 129, 0.04)", borderRadius: 2.5, border: "1px solid #A7F3D0" }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                SUCCESSFUL PAYMENTS
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#065F46", mt: 0.5 }}>
                {successfulPaymentsCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Completed & Verified
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ p: 2, bgcolor: "rgba(249, 115, 22, 0.04)", borderRadius: 2.5, border: "1px solid #FED7AA" }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                PENDING / FAILED
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#9A3412", mt: 0.5 }}>
                {pendingPaymentsCount} <Typography component="span" variant="caption" color="text.secondary">pending</Typography> • {failedPaymentsCount} <Typography component="span" variant="caption" color="error.main">failed</Typography>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Awaiting Checkout or Rejected
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Admin Quick Action Shortcuts */}
      <Card sx={{ mb: 5, p: 3, borderRadius: 3.5, border: "1px solid #E2E8F0" }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: "text.secondary" }}>
          ADMINISTRATIVE MODULES
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Button
            component={RouterLink}
            to="/admin/users"
            variant="outlined"
            startIcon={<PeopleIcon />}
          >
            Manage Users ({totalUsers})
          </Button>
          <Button
            component={RouterLink}
            to="/admin/cars"
            variant="outlined"
            startIcon={<TimeToLeaveIcon />}
          >
            Manage Cars ({totalCars})
          </Button>
          <Button
            component={RouterLink}
            to="/admin/bookings"
            variant="outlined"
            startIcon={<BookOnlineIcon />}
          >
            Manage Bookings ({totalBookings})
          </Button>
        </Stack>
      </Card>

      {/* Pending Car Approvals Section */}
      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Pending Vehicle Approvals
            </Typography>
            <Chip
              label={pendingCarsList.length}
              size="small"
              color={pendingCarsList.length > 0 ? "warning" : "default"}
              sx={{ fontWeight: 700 }}
            />
          </Stack>
          {adminCars.length > 0 && (
            <Button component={RouterLink} to="/admin/cars" endIcon={<ArrowForwardIcon />} size="small">
              View All Cars
            </Button>
          )}
        </Box>

        {pendingCarsList.length === 0 ? (
          <Paper elevation={0} sx={{ p: 4, textAlign: "center", borderRadius: 3.5, border: "1px solid #E2E8F0" }}>
            <CheckCircleIcon sx={{ fontSize: 48, color: "success.main", mb: 1, opacity: 0.8 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              All Caught Up!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              There are no pending vehicle listing approvals at this moment.
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3.5, border: "1px solid #E2E8F0" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>Host</TableCell>
                  <TableCell>Rate</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell align="right">Decision</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingCarsList.map((car) => (
                  <TableRow key={car._id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {car.brand} {car.model} ({car.year})
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Reg: {car.registrationNumber || "N/A"} • {car.transmission}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {car.host?.name || "Host"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {car.host?.email || "No email"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "primary.main" }}>
                        ₹{Number(car.pricePerDay || 0).toLocaleString("en-IN")}/day
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(car.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleOpenDialog(car._id, "APPROVE")}
                          disabled={actionLoading}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<CancelIcon />}
                          onClick={() => handleOpenDialog(car._id, "REJECT")}
                          disabled={actionLoading}
                        >
                          Reject
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Two Column Layout: Recent Bookings & Payments, Users */}
      <Grid container spacing={4}>
        {/* Recent Bookings with Payment Status */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Recent Bookings & Payments Audit
            </Typography>
            <Button component={RouterLink} to="/admin/bookings" size="small" endIcon={<ArrowForwardIcon />}>
              Manage Bookings
            </Button>
          </Box>
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3.5, border: "1px solid #E2E8F0", overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell>Car</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentBookings.map((b) => (
                  <TableRow key={b._id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {b.customer?.name || "Customer"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        #{b._id.slice(-6).toUpperCase()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        {b.car?.brand} {b.car?.model}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.main" }}>
                        ₹{Number(b.totalAmount || 0).toLocaleString("en-IN")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.25} sx={{ alignItems: "flex-start" }}>
                        <StatusChip status={b.paymentMethod || "COD"} size="small" />
                        <StatusChip status={b.paymentStatus || "PENDING"} size="small" />
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={b.status} size="small" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Recent Users */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Recent Registered Users
            </Typography>
            <Button component={RouterLink} to="/admin/users" size="small" endIcon={<ArrowForwardIcon />}>
              Manage Users
            </Button>
          </Box>
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3.5, border: "1px solid #E2E8F0", overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Roles</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentUsers.map((u) => (
                  <TableRow key={u._id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {u.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {u.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap" }}>
                        {Array.isArray(u.roles) &&
                          u.roles.map((r) => (
                            <Chip key={r} label={r} size="small" variant="outlined" sx={{ fontSize: "0.65rem", height: 20 }} />
                          ))}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={actionDialog.open}
        title={actionDialog.type === "APPROVE" ? "Approve Car Listing" : "Reject Car Listing"}
        content={
          actionDialog.type === "APPROVE"
            ? "Are you sure you want to approve this vehicle? It will immediately become AVAILABLE in customer searches."
            : "Are you sure you want to reject this vehicle listing?"
        }
        confirmText={actionDialog.type === "APPROVE" ? "Approve Vehicle" : "Reject Vehicle"}
        confirmColor={actionDialog.type === "APPROVE" ? "success" : "error"}
        loading={actionLoading}
        onConfirm={handleConfirmCarAction}
        onClose={() => setActionDialog((prev) => ({ ...prev, open: false }))}
      />
    </Container>
  );
}