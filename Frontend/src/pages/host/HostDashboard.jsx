import { useContext } from "react";
import { Link as RouterLink } from "react-router-dom";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";

import TimeToLeaveIcon from "@mui/icons-material/TimeToLeave";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import AddBoxIcon from "@mui/icons-material/AddBox";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";

import { AuthContext } from "../../context/Auth.jsx";
import { AppContext } from "../../context/AppContext.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import DashboardStatCard from "../../components/DashboardStatCard.jsx";
import StatusChip from "../../components/StatusChip.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { StatCardSkeleton } from "../../components/SkeletonLoader.jsx";

export default function HostDashboard() {
  const { user } = useContext(AuthContext);
  const {
    myCars,
    myCarsLoading,
    hostBookings,
    hostBookingsLoading,
  } = useContext(AppContext);

  // Statistics calculation
  const totalCars = myCars.length;
  const totalBookings = hostBookings.length;
  const pendingBookings = hostBookings.filter((b) => b.status === "PENDING").length;
  const confirmedBookings = hostBookings.filter((b) => b.status === "CONFIRMED").length;

  // Received Income only counts PAID bookings
  const receivedIncome = hostBookings
    .filter((b) => b.paymentStatus === "PAID")
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const pendingIncome = hostBookings
    .filter((b) => b.paymentStatus === "PENDING" && !["CANCELLED", "REJECTED"].includes(b.status))
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const recentBookings = hostBookings.slice(0, 5);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <PageHeader
        title={`Host Portal — Welcome, ${user?.name || "Host"}`}
        subtitle="Manage your fleet, approve incoming reservation requests, and track revenue."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Host Dashboard" }]}
        action={
          <Button
            component={RouterLink}
            to="/host/cars/add"
            variant="contained"
            color="primary"
            startIcon={<AddBoxIcon />}
            size="medium"
          >
            Add New Car
          </Button>
        }
      />

      {/* Overview Stat Cards */}
      {myCarsLoading || hostBookingsLoading ? (
        <StatCardSkeleton count={5} />
      ) : (
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <DashboardStatCard
              title="Total Cars"
              value={totalCars}
              subtitle="Listed in fleet"
              icon={<TimeToLeaveIcon />}
              color="#1E3A8A"
              bgColor="rgba(30, 58, 138, 0.08)"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <DashboardStatCard
              title="Total Bookings"
              value={totalBookings}
              subtitle="All-time requests"
              icon={<BookOnlineIcon />}
              color="#3B82F6"
              bgColor="rgba(59, 130, 246, 0.08)"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <DashboardStatCard
              title="Pending"
              value={pendingBookings}
              subtitle="Awaiting response"
              icon={<HourglassEmptyIcon />}
              color="#F97316"
              bgColor="rgba(249, 115, 22, 0.08)"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <DashboardStatCard
              title="Confirmed"
              value={confirmedBookings}
              subtitle="Ready for pickup"
              icon={<CheckCircleIcon />}
              color="#10B981"
              bgColor="rgba(16, 185, 129, 0.08)"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <DashboardStatCard
              title="Received Income"
              value={`₹${receivedIncome.toLocaleString("en-IN")}`}
              subtitle={pendingIncome > 0 ? `+₹${pendingIncome.toLocaleString("en-IN")} pending` : "Paid bookings"}
              icon={<CurrencyRupeeIcon />}
              color="#D97706"
              bgColor="rgba(217, 119, 6, 0.08)"
            />
          </Grid>
        </Grid>
      )}

      {/* Quick Action Navigation */}
      <Card sx={{ mb: 5, p: 3, borderRadius: 3.5, border: "1px solid #E2E8F0" }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: "text.secondary" }}>
          QUICK ACTIONS
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Button
            component={RouterLink}
            to="/host/cars"
            variant="outlined"
            startIcon={<TimeToLeaveIcon />}
          >
            Manage My Cars ({totalCars})
          </Button>
          <Button
            component={RouterLink}
            to="/host/cars/add"
            variant="outlined"
            startIcon={<AddBoxIcon />}
          >
            Add New Vehicle
          </Button>
          <Button
            component={RouterLink}
            to="/host/bookings"
            variant="outlined"
            startIcon={<BookOnlineIcon />}
          >
            Review Car Bookings ({pendingBookings} pending)
          </Button>
        </Stack>
      </Card>

      {/* Recent Bookings Table */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Recent Fleet Bookings
        </Typography>
        {hostBookings.length > 0 && (
          <Button
            component={RouterLink}
            to="/host/bookings"
            endIcon={<ArrowForwardIcon />}
            size="small"
            sx={{ fontWeight: 700 }}
          >
            View All ({hostBookings.length})
          </Button>
        )}
      </Box>

      {recentBookings.length === 0 ? (
        <EmptyState
          icon={<DirectionsCarIcon sx={{ fontSize: 64, color: "text.secondary", opacity: 0.5 }} />}
          title="No Bookings Yet"
          description="Your cars have not received any rental bookings yet. Ensure your vehicles are marked as AVAILABLE."
          actionText="Manage My Cars"
          actionLink="/host/cars"
        />
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 3.5,
            border: "1px solid #E2E8F0",
            overflowX: "auto",
          }}
        >
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Car Reserved</TableCell>
                <TableCell>Schedule</TableCell>
                <TableCell>Total Earnings</TableCell>
                <TableCell>Booking Status</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentBookings.map((booking) => (
                <TableRow key={booking._id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {booking.customer?.name || "Customer"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {booking.customer?.email || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {booking.car?.brand} {booking.car?.model}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {new Date(booking.startDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      to {new Date(booking.endDate).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "primary.main" }}>
                      ₹{Number(booking.totalAmount || 0).toLocaleString("en-IN")}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusChip status={booking.status} />
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5} sx={{ alignItems: "flex-start" }}>
                      <StatusChip status={booking.paymentMethod || "COD"} size="small" />
                      <StatusChip status={booking.paymentStatus || "PENDING"} size="small" />
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      component={RouterLink}
                      to="/host/bookings"
                      size="small"
                      variant="outlined"
                    >
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}