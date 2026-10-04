/**
 * MyBookings.jsx
 *
 * Customer "My Bookings" page.
 * Premium card redesign — fixed car image, rich booking info, status chips.
 * Toast feedback on cancel (success/error).
 */

import { useContext, useState, useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Pagination from "@mui/material/Pagination";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SearchIcon from "@mui/icons-material/Search";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import SettingsIcon from "@mui/icons-material/Settings";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import { AppContext } from "../../context/AppContext.jsx";
import { useToast } from "../../components/ToastProvider.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import StatusChip from "../../components/StatusChip.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import { CarCardSkeleton } from "../../components/SkeletonLoader.jsx";

const ITEMS_PER_PAGE = 6;

// -------------------------------------------------------
// BOOKING CARD
// -------------------------------------------------------

function BookingCard({ booking, onCancelClick }) {
  const car = booking.car;

  const imgUrl =
    car?.images?.[0]?.url ||
    (typeof car?.images?.[0] === "string" ? car.images[0] : null);

  const canCancel =
    booking.status === "PENDING" || booking.status === "CONFIRMED";

  const locationText = [car?.location?.city, car?.location?.state]
    .filter(Boolean)
    .join(", ");

  const formattedStart = booking.startDate
    ? new Date(booking.startDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
  const formattedEnd = booking.endDate
    ? new Date(booking.endDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  const bookedOn = booking.createdAt
    ? new Date(booking.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  const pricePerDay = Number(car?.pricePerDay || 0);
  const totalAmount = Number(booking.totalAmount || 0);
  const days = booking.numberOfDays || 0;

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3.5,
        border: "1px solid #E2E8F0",
        overflow: "hidden",
        transition: "all 0.22s ease",
        "&:hover": {
          boxShadow: "0 8px 32px rgba(15,23,42,0.10)",
          borderColor: "#CBD5E1",
          transform: "translateY(-2px)",
        },
      }}
    >
      {/* ── Car Image (fixed 200px, object-fit cover) ── */}
      <Box sx={{ position: "relative", height: 200, flexShrink: 0 }}>
        {imgUrl ? (
          <Box
            component="img"
            src={imgUrl}
            alt={`${car?.brand} ${car?.model}`}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <Box
            sx={{
              height: "100%",
              bgcolor: "#F1F5F9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DirectionsCarIcon sx={{ fontSize: 64, color: "#CBD5E1" }} />
          </Box>
        )}

        {/* Status badge over image */}
        <Box sx={{ position: "absolute", top: 10, left: 10 }}>
          <StatusChip status={booking.status} size="medium" />
        </Box>

        {/* Booking ID badge */}
        <Box
          sx={{
            position: "absolute",
            bottom: 10,
            right: 10,
            bgcolor: "rgba(0,0,0,0.55)",
            borderRadius: 1.5,
            px: 1,
            py: 0.25,
          }}
        >
          <Typography
            sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#fff", letterSpacing: "0.04em" }}
          >
            #{booking._id.slice(-6).toUpperCase()}
          </Typography>
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2.5, display: "flex", flexDirection: "column", gap: 0 }}>
        {/* Car name + year */}
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 0.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.25 }}>
            {car?.brand} {car?.model}
          </Typography>
          {car?.year && (
            <Chip
              label={car.year}
              size="small"
              sx={{ fontSize: "0.7rem", fontWeight: 700, bgcolor: "#F1F5F9", color: "#475569", height: 20 }}
            />
          )}
        </Box>

        {/* Spec chips */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1.5 }}>
          {car?.type && (
            <Chip
              icon={<DirectionsCarIcon sx={{ fontSize: "14px !important" }} />}
              label={car.type}
              size="small"
              variant="outlined"
              sx={{ fontSize: "0.68rem", height: 22 }}
            />
          )}
          {car?.transmission && (
            <Chip
              icon={<SettingsIcon sx={{ fontSize: "14px !important" }} />}
              label={car.transmission}
              size="small"
              variant="outlined"
              sx={{ fontSize: "0.68rem", height: 22 }}
            />
          )}
          {car?.fuelType && (
            <Chip
              icon={<LocalGasStationIcon sx={{ fontSize: "14px !important" }} />}
              label={car.fuelType}
              size="small"
              variant="outlined"
              sx={{ fontSize: "0.68rem", height: 22 }}
            />
          )}
          {car?.seats && (
            <Chip
              icon={<EventSeatIcon sx={{ fontSize: "14px !important" }} />}
              label={`${car.seats} seats`}
              size="small"
              variant="outlined"
              sx={{ fontSize: "0.68rem", height: 22 }}
            />
          )}
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Dates */}
        <Stack spacing={0.75} sx={{ mb: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
            <CalendarMonthIcon fontSize="small" color="primary" sx={{ fontSize: 16, mt: "2px", flexShrink: 0 }} />
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 600 }}>
                Rental Period
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formattedStart} &rarr; {formattedEnd}
                <Box
                  component="span"
                  sx={{
                    ml: 1,
                    px: 1,
                    py: 0.15,
                    bgcolor: "primary.50",
                    color: "primary.main",
                    borderRadius: 1,
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    border: "1px solid",
                    borderColor: "primary.100",
                  }}
                >
                  {days} {days === 1 ? "day" : "days"}
                </Box>
              </Typography>
            </Box>
          </Box>

          {locationText && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <LocationOnIcon sx={{ fontSize: 16, color: "text.secondary", flexShrink: 0 }} />
              <Typography variant="body2" color="text.secondary" noWrap>
                {locationText}
              </Typography>
            </Box>
          )}

          {bookedOn && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AccessTimeIcon sx={{ fontSize: 14, color: "text.disabled", flexShrink: 0 }} />
              <Typography variant="caption" color="text.disabled">
                Booked on {bookedOn}
              </Typography>
            </Box>
          )}
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        {/* Price breakdown */}
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: "#F8FAFC",
            border: "1px solid #E2E8F0",
            mb: 1.5,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              ₹{pricePerDay.toLocaleString("en-IN")}/day &times; {days} days
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
              ₹{totalAmount.toLocaleString("en-IN")}
            </Typography>
          </Box>
          <Divider sx={{ my: 0.75 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              {booking.paymentStatus === "PAID" ? "Amount Paid" : "Total Due"}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 900, color: "primary.main", fontSize: "1.05rem" }}
            >
              ₹{totalAmount.toLocaleString("en-IN")}
            </Typography>
          </Box>
        </Paper>

        {/* Payment chips */}
        <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mb: 1 }}>
          <StatusChip status={booking.paymentMethod || "COD"} size="small" />
          <StatusChip status={booking.paymentStatus || "PENDING"} size="small" />
        </Box>

        {/* Reg number if available */}
        {car?.registrationNumber && (
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Reg: {car.registrationNumber}
          </Typography>
        )}
      </CardContent>

      <Divider />

      {/* Actions */}
      <Box sx={{ p: 2, display: "flex", gap: 1 }}>
        <Button
          component={RouterLink}
          to={`/customer/bookings/${booking._id}`}
          variant="outlined"
          size="small"
          startIcon={<VisibilityIcon />}
          fullWidth
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
        >
          View Details
        </Button>
        {canCancel && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<CancelOutlinedIcon />}
            fullWidth
            onClick={() => onCancelClick(booking._id)}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            Cancel
          </Button>
        )}
      </Box>
    </Card>
  );
}

// -------------------------------------------------------
// MAIN PAGE
// -------------------------------------------------------

export default function MyBookings() {
  const { myBookings, bookingsLoading, cancelBooking } = useContext(AppContext);
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState("ALL");
  const [cancellingId, setCancellingId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [page, setPage] = useState(1);

  // Filter bookings based on activeTab
  const filteredBookings = useMemo(() => {
    if (activeTab === "ALL") return myBookings;
    return myBookings.filter((b) => b.status === activeTab);
  }, [myBookings, activeTab]);

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE) || 1;
  const paginatedBookings = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredBookings.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBookings, page]);

  const handleOpenCancelDialog = (bookingId) => {
    setSelectedBookingId(bookingId);
    setDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBookingId) return;
    setCancellingId(selectedBookingId);

    try {
      await cancelBooking(selectedBookingId);
      setDialogOpen(false);
      showSuccess("Booking cancelled successfully.");
    } catch (error) {
      console.error("Error cancelling booking:", error);
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Unable to cancel booking. Please try again.";
      showError(msg);
      setDialogOpen(false);
    } finally {
      setCancellingId(null);
    }
  };

  // Tab counts
  const tabCounts = {
    ALL: myBookings.length,
    PENDING: myBookings.filter((b) => b.status === "PENDING").length,
    CONFIRMED: myBookings.filter((b) => b.status === "CONFIRMED").length,
    COMPLETED: myBookings.filter((b) => b.status === "COMPLETED").length,
    CANCELLED: myBookings.filter((b) => b.status === "CANCELLED").length,
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <PageHeader
        title="My Bookings"
        subtitle="Track your rental reservations, manage schedules, and review past journeys."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "My Bookings" }]}
        action={
          <Button
            component={RouterLink}
            to="/cars"
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
            size="medium"
          >
            Rent Another Car
          </Button>
        }
      />

      {/* Status Filter Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => {
            setActiveTab(val);
            setPage(1);
          }}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
        >
          {[
            { value: "ALL", label: "All" },
            { value: "PENDING", label: "Pending" },
            { value: "CONFIRMED", label: "Confirmed" },
            { value: "COMPLETED", label: "Completed" },
            { value: "CANCELLED", label: "Cancelled" },
          ].map(({ value, label }) => (
            <Tab
              key={value}
              label={`${label} (${tabCounts[value]})`}
              value={value}
              sx={{ fontWeight: 700 }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Content */}
      {bookingsLoading ? (
        <CarCardSkeleton count={4} />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          icon={<DirectionsCarIcon sx={{ fontSize: 64, color: "text.secondary", opacity: 0.5 }} />}
          title={activeTab === "ALL" ? "You Have No Bookings Yet" : `No ${activeTab.toLowerCase()} bookings`}
          description="Explore our available cars to book your next self-drive experience."
          actionText="Browse Available Cars"
          actionLink="/cars"
          actionIcon={<SearchIcon />}
        />
      ) : (
        <>
          <Grid container spacing={3}>
            {paginatedBookings.map((booking) => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={booking._id}>
                <BookingCard
                  booking={booking}
                  onCancelClick={handleOpenCancelDialog}
                />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, v) => setPage(v)}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={dialogOpen}
        title="Cancel Booking Reservation"
        content="Are you sure you want to cancel this booking? This action cannot be reversed."
        confirmText="Yes, Cancel Booking"
        confirmColor="error"
        loading={cancellingId !== null}
        onConfirm={handleConfirmCancel}
        onClose={() => setDialogOpen(false)}
      />
    </Container>
  );
}