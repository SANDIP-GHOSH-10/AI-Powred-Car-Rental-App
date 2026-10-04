import { useContext } from "react";
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

import BookOnlineIcon from "@mui/icons-material/BookOnline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import SearchIcon from "@mui/icons-material/Search";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";

import { AuthContext } from "../../context/Auth.jsx";
import { AppContext } from "../../context/AppContext.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import DashboardStatCard from "../../components/DashboardStatCard.jsx";
import StatusChip from "../../components/StatusChip.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { StatCardSkeleton } from "../../components/SkeletonLoader.jsx";

export default function CustomerDashboard() {
  const { user } = useContext(AuthContext);
  const { myBookings, bookingsLoading } = useContext(AppContext);

  // Calculate statistics from myBookings
  const totalBookings = myBookings.length;
  const pendingBookings = myBookings.filter((b) => b.status === "PENDING").length;
  const confirmedBookings = myBookings.filter((b) => b.status === "CONFIRMED").length;
  const completedBookings = myBookings.filter((b) => b.status === "COMPLETED").length;

  const recentBookings = myBookings.slice(0, 5);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <PageHeader
        title={`Welcome back, ${user?.name || "Customer"}`}
        subtitle="Manage your car rentals, check reservation statuses, and book new rides."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Customer Dashboard" }]}
        action={
          <Button
            component={RouterLink}
            to="/cars"
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
            size="medium"
          >
            Browse Available Cars
          </Button>
        }
      />

      {/* Stats Cards */}
      {bookingsLoading ? (
        <StatCardSkeleton count={4} />
      ) : (
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <DashboardStatCard
              title="Total Bookings"
              value={totalBookings}
              subtitle="All reservations made"
              icon={<BookOnlineIcon />}
              color="#1E3A8A"
              bgColor="rgba(30, 58, 138, 0.08)"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <DashboardStatCard
              title="Pending"
              value={pendingBookings}
              subtitle="Awaiting host approval"
              icon={<HourglassEmptyIcon />}
              color="#F97316"
              bgColor="rgba(249, 115, 22, 0.08)"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <DashboardStatCard
              title="Confirmed"
              value={confirmedBookings}
              subtitle="Active & ready reservations"
              icon={<CheckCircleIcon />}
              color="#10B981"
              bgColor="rgba(16, 185, 129, 0.08)"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <DashboardStatCard
              title="Completed"
              value={completedBookings}
              subtitle="Finished road trips"
              icon={<TaskAltIcon />}
              color="#0EA5E9"
              bgColor="rgba(14, 165, 233, 0.08)"
            />
          </Grid>
        </Grid>
      )}

      {/* Quick Action Banner */}
      <Card
        sx={{
          mb: 5,
          p: 3,
          borderRadius: 3.5,
          bgcolor: "#FFFFFF",
          border: "1px solid #E2E8F0",
        }}
      >
        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              Need a car for an upcoming trip?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Find verified SUVs, Sedans, and Hatchbacks available in your city today with zero hidden charges.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { xs: "left", md: "right" } }}>
            <Stack direction="row" spacing={1.5} sx={{ justifyContent: { md: "flex-end" } }}>
              <Button component={RouterLink} to="/cars" variant="contained" color="secondary">
                Search Cars
              </Button>
              <Button component={RouterLink} to="/customer/bookings" variant="outlined">
                View All Bookings
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Card>

      {/* Recent Bookings Section */}
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Recent Bookings
        </Typography>
        {myBookings.length > 0 && (
          <Button
            component={RouterLink}
            to="/customer/bookings"
            endIcon={<ArrowForwardIcon />}
            size="small"
            sx={{ fontWeight: 700 }}
          >
            See All ({myBookings.length})
          </Button>
        )}
      </Box>

      {recentBookings.length === 0 ? (
        <EmptyState
          icon={<DirectionsCarIcon sx={{ fontSize: 64, color: "text.secondary", opacity: 0.5 }} />}
          title="No Bookings Yet"
          description="You haven't reserved any cars yet. Search our fleet to plan your next journey."
          actionText="Browse Available Cars"
          actionLink="/cars"
          actionIcon={<SearchIcon />}
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
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Car Details</TableCell>
                <TableCell>Trip Dates</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentBookings.map((b) => (
                <TableRow key={b._id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {b.car?.brand} {b.car?.model}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {b.car?.year} • {b.car?.transmission}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {new Date(b.startDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      to {new Date(b.endDate).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{b.numberOfDays} Days</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "primary.main" }}>
                      ₹{Number(b.totalAmount || 0).toLocaleString("en-IN")}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusChip status={b.status} />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      component={RouterLink}
                      to={`/customer/bookings/${b._id}`}
                      variant="outlined"
                      size="small"
                    >
                      Details
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