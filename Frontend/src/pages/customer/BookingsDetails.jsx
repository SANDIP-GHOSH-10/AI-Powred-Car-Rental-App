import { useEffect, useState, useContext } from "react";
import { Link as RouterLink, useParams, useNavigate } from "react-router-dom";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PaymentIcon from "@mui/icons-material/Payment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { AuthContext } from "../../context/Auth.jsx";
import { AppContext } from "../../context/AppContext.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import StatusChip from "../../components/StatusChip.jsx";
import Loader from "../../components/Loader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import { openRazorpayCheckout } from "../../components/payment/RazorpayCheckout.jsx";

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { fetchBookingById, cancelBooking, createPaymentOrder, verifyPayment } =
    useContext(AppContext);

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payMessage, setPayMessage] = useState("");
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadBooking();
  }, [id]);

  const loadBooking = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchBookingById(id);
      setBooking(data);
    } catch (err) {
      console.error("Error fetching booking:", err);
      setError(err.response?.data?.error || "Unable to fetch booking details.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    setCancelling(true);
    setError("");

    try {
      const response = await cancelBooking(id);
      setBooking(
        response.data?.booking || {
          ...booking,
          status: "CANCELLED",
        }
      );
      setDialogOpen(false);
    } catch (err) {
      console.error("Error cancelling booking:", err);
      setError(err.response?.data?.error || "Unable to cancel booking.");
    } finally {
      setCancelling(false);
    }
  };

  const handlePayNow = async () => {
    if (!booking) return;

    setError("");
    setPaying(true);
    setPayMessage("Initializing Razorpay checkout...");

    try {
      const orderData = await createPaymentOrder(booking._id);

      await openRazorpayCheckout({
        orderId: orderData.orderId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        keyId: orderData.keyId,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phoneNumber || "",
        },
        name: "AI Car Rental",
        description: `Booking #${booking._id.slice(-6).toUpperCase()} Payment`,
        onSuccess: async (paymentResponse) => {
          try {
            setPayMessage("Verifying payment signature...");
            const verifyRes = await verifyPayment({
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              bookingId: booking._id,
            });

            navigate("/customer/payment-success", {
              state: {
                booking: verifyRes.booking || booking,
                paymentId: paymentResponse.razorpay_payment_id,
                orderId: paymentResponse.razorpay_order_id,
                amount: booking.totalAmount,
                carName: `${booking.car?.brand} ${booking.car?.model}`,
                startDate: booking.startDate,
                endDate: booking.endDate,
                pickupLocation: booking.pickupLocation,
                paymentMethod: "ONLINE",
              },
            });
          } catch (verifyErr) {
            console.error("Payment verification error:", verifyErr);
            setError(
              verifyErr.response?.data?.error ||
                "Payment was successful, but signature verification failed. Please contact support."
            );
            setPaying(false);
            setPayMessage("");
          }
        },
        onDismiss: () => {
          setPaying(false);
          setPayMessage("");
        },
        onError: (err) => {
          console.error("Razorpay error:", err);
          setPaying(false);
          setPayMessage("");
          setError(err.description || err.message || "Payment gateway error.");
        },
      });
    } catch (err) {
      console.error("Payment order error:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to initiate payment. Please try again."
      );
      setPaying(false);
      setPayMessage("");
    }
  };

  if (loading) {
    return <Loader message="Loading booking details..." minHeight="60vh" />;
  }

  if (error && !booking) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          component={RouterLink}
          to="/customer/bookings"
          startIcon={<ArrowBackIcon />}
          variant="outlined"
        >
          Back to My Bookings
        </Button>
      </Container>
    );
  }

  if (!booking) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <EmptyState
          title="Booking Not Found"
          description="The booking reference ID does not exist or has been removed."
          actionText="Back to My Bookings"
          actionLink="/customer/bookings"
          actionIcon={<ArrowBackIcon />}
        />
      </Container>
    );
  }

  const car = booking.car;
  const imgUrl =
    car?.images?.[0]?.url ||
    (typeof car?.images?.[0] === "string" ? car.images[0] : null);

  const canCancel =
    booking.status === "PENDING" || booking.status === "CONFIRMED";

  const canPayOnline =
    booking.paymentMethod === "ONLINE" &&
    booking.paymentStatus !== "PAID" &&
    booking.status !== "CANCELLED" &&
    booking.status !== "REJECTED";

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
      <PageHeader
        title={`Booking #${booking._id.slice(-8).toUpperCase()}`}
        subtitle={`Created on ${new Date(booking.createdAt || Date.now()).toLocaleDateString()}`}
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "My Bookings", to: "/customer/bookings" },
          { label: "Booking Details" },
        ]}
        action={
          <Button
            component={RouterLink}
            to="/customer/bookings"
            startIcon={<ArrowBackIcon />}
            variant="outlined"
          >
            My Bookings
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Left Column: Car Overview */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card
            sx={{
              borderRadius: 3.5,
              border: "1px solid #E2E8F0",
              overflow: "hidden",
            }}
          >
            {imgUrl ? (
              <CardMedia
                component="img"
                height="240"
                image={imgUrl}
                alt={`${car?.brand} ${car?.model}`}
                sx={{ objectFit: "cover" }}
              />
            ) : (
              <Box
                sx={{
                  height: 240,
                  bgcolor: "#F1F5F9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <DirectionsCarIcon sx={{ fontSize: 64, opacity: 0.4 }} />
              </Box>
            )}

            <Box sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                {car?.brand} {car?.model}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {car?.year} • {car?.transmission} • {car?.fuelType} • {car?.seats} Seats
              </Typography>

              {car?.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                  {car.description}
                </Typography>
              )}

              {car?._id && (
                <Button
                  component={RouterLink}
                  to={`/cars/${car._id}`}
                  variant="outlined"
                  fullWidth
                  size="small"
                >
                  View Vehicle Listing
                </Button>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Right Column: Reservation Details & Bill Breakdown */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: 3.5,
              border: "1px solid #E2E8F0",
              bgcolor: "#FFFFFF",
            }}
          >
            {/* Status & ID Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  CURRENT STATUS
                </Typography>
                <Box sx={{ mt: 0.5, display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                  <StatusChip status={booking.status} size="medium" />
                  <StatusChip status={booking.paymentMethod || "COD"} size="medium" />
                  <StatusChip status={booking.paymentStatus || "PENDING"} size="medium" />
                </Box>
              </Box>
              <ReceiptLongIcon color="primary" sx={{ fontSize: 32, opacity: 0.8 }} />
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Schedule Info */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              Trip Schedule & Location
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ p: 2, bgcolor: "#F8FAFC", borderRadius: 2.5, border: "1px solid #F1F5F9" }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    START DATE (PICKUP)
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5 }}>
                    {new Date(booking.startDate).toLocaleDateString("en-IN", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ p: 2, bgcolor: "#F8FAFC", borderRadius: 2.5, border: "1px solid #F1F5F9" }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    END DATE (DROP-OFF)
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5 }}>
                    {new Date(booking.endDate).toLocaleDateString("en-IN", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </Typography>
                </Box>
              </Grid>

              {booking.pickupLocation && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ p: 2, bgcolor: "#F8FAFC", borderRadius: 2.5, border: "1px solid #F1F5F9" }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      PICKUP LOCATION
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                      {booking.pickupLocation}
                    </Typography>
                  </Box>
                </Grid>
              )}

              {booking.dropLocation && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ p: 2, bgcolor: "#F8FAFC", borderRadius: 2.5, border: "1px solid #F1F5F9" }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      DROP LOCATION
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                      {booking.dropLocation}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>

            <Divider sx={{ mb: 3 }} />

            {/* Pricing & Payment Summary */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              Pricing & Payment Breakdown
            </Typography>
            <Stack spacing={1.5} sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Duration
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {booking.numberOfDays} Days
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Rate Per Day
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  ₹{Number(booking.pricePerDay || 0).toLocaleString("en-IN")}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Payment Method
                </Typography>
                <StatusChip status={booking.paymentMethod || "COD"} size="small" />
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Payment Status
                </Typography>
                <StatusChip status={booking.paymentStatus || "PENDING"} size="small" />
              </Box>
              <Divider />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Total Amount
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "primary.main" }}>
                  ₹{Number(booking.totalAmount || 0).toLocaleString("en-IN")}
                </Typography>
              </Box>
            </Stack>

            {/* Pay Now Button (if online and pending) */}
            {canPayOnline && (
              <Box sx={{ pt: 1, pb: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  startIcon={
                    paying ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <PaymentIcon />
                    )
                  }
                  onClick={handlePayNow}
                  disabled={paying}
                  sx={{ py: 1.5, fontWeight: 800, borderRadius: 2.5 }}
                >
                  {paying
                    ? payMessage || "Opening Razorpay..."
                    : `Pay ₹${Number(booking.totalAmount || 0).toLocaleString("en-IN")} Online Now`}
                </Button>
              </Box>
            )}

            {/* Cancel Action Button */}
            {canCancel && (
              <Box sx={{ pt: 1 }}>
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  size="large"
                  startIcon={<CancelOutlinedIcon />}
                  onClick={() => setDialogOpen(true)}
                  disabled={cancelling || paying}
                  sx={{ py: 1.4, fontWeight: 700 }}
                >
                  {cancelling ? "Processing Cancellation..." : "Cancel This Booking"}
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={dialogOpen}
        title="Cancel Reservation"
        content="Are you sure you want to cancel this booking reservation? This action cannot be reversed."
        confirmText="Confirm Cancellation"
        confirmColor="error"
        loading={cancelling}
        onConfirm={handleConfirmCancel}
        onClose={() => setDialogOpen(false)}
      />
    </Container>
  );
}