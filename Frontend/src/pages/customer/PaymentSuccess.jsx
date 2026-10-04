import { useLocation, Link as RouterLink, useNavigate } from "react-router-dom";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";

import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocationOnIcon from "@mui/icons-material/LocationOn";

import StatusChip from "../../components/StatusChip.jsx";

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};
  const {
    booking,
    paymentId,
    orderId,
    amount,
    carName,
    startDate,
    endDate,
    pickupLocation,
    paymentMethod = "ONLINE",
  } = state;

  const bookingId = booking?._id || state.bookingId || "N/A";
  const displayAmount = amount || booking?.totalAmount || 0;
  const vehicleName =
    carName ||
    (booking?.car?.brand && booking?.car?.model
      ? `${booking.car.brand} ${booking.car.model}`
      : "Rental Vehicle");

  const startFormatted =
    startDate || (booking?.startDate ? new Date(booking.startDate).toLocaleDateString("en-IN") : "—");
  const endFormatted =
    endDate || (booking?.endDate ? new Date(booking.endDate).toLocaleDateString("en-IN") : "—");
  const locationText =
    pickupLocation || booking?.pickupLocation || "Pickup location selected during booking";

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 6 },
          borderRadius: 4,
          border: "1px solid #E2E8F0",
          textAlign: "center",
          bgcolor: "#FFFFFF",
        }}
      >
        {/* Success Icon */}
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            bgcolor: "rgba(16, 185, 129, 0.12)",
            color: "#10B981",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3,
          }}
        >
          <CheckCircleRoundedIcon sx={{ fontSize: 48 }} />
        </Box>

        {/* Title */}
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: "text.primary" }}>
          Payment Successful!
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: "auto" }}>
          Your payment of{" "}
          <Typography component="span" sx={{ fontWeight: 700, color: "primary.main" }}>
            ₹{Number(displayAmount).toLocaleString("en-IN")}
          </Typography>{" "}
          was completed successfully. Your car rental reservation is now confirmed.
        </Typography>

        {/* Receipt / Booking Details Card */}
        <Card
          elevation={0}
          sx={{
            bgcolor: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: 3.5,
            textAlign: "left",
            mb: 4,
            p: { xs: 2.5, sm: 3.5 },
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Transaction Summary
            </Typography>
            <StatusChip status="PAID" />
          </Box>

          <Divider sx={{ mb: 2.5 }} />

          <Grid container spacing={2.5}>
            {/* Booking ID */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block" }}>
                BOOKING ID
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.25 }}>
                {bookingId}
              </Typography>
            </Grid>

            {/* Payment ID / Reference */}
            {paymentId && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block" }}>
                  PAYMENT ID (RAZORPAY)
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.25, color: "primary.main" }}>
                  {paymentId}
                </Typography>
              </Grid>
            )}

            {/* Vehicle */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block" }}>
                VEHICLE
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.25 }}>
                <DirectionsCarIcon fontSize="small" color="primary" />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {vehicleName}
                </Typography>
              </Box>
            </Grid>

            {/* Total Paid */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block" }}>
                TOTAL PAID
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main", mt: 0.25 }}>
                ₹{Number(displayAmount).toLocaleString("en-IN")}
              </Typography>
            </Grid>

            {/* Rental Schedule */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block" }}>
                RENTAL DATES
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.25 }}>
                <CalendarMonthIcon fontSize="small" color="action" />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {startFormatted} → {endFormatted}
                </Typography>
              </Box>
            </Grid>

            {/* Pickup Location */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block" }}>
                PICKUP LOCATION
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.25 }}>
                <LocationOnIcon fontSize="small" color="action" />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {locationText}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Card>

        {/* Action Buttons */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ justifyContent: "center", alignItems: "center" }}
        >
          <Button
            component={RouterLink}
            to="/customer/bookings"
            variant="contained"
            color="primary"
            size="large"
            startIcon={<BookOnlineIcon />}
            sx={{ px: 4, py: 1.2, fontWeight: 700 }}
          >
            View My Bookings
          </Button>

          <Button
            component={RouterLink}
            to="/customer"
            variant="outlined"
            size="large"
            startIcon={<DashboardIcon />}
            sx={{ px: 4, py: 1.2, fontWeight: 700 }}
          >
            Go to Dashboard
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
