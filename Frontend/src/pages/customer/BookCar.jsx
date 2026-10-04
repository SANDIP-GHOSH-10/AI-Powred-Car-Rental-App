import { useContext, useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { DateCalendar, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import Chip from "@mui/material/Chip";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import SettingsIcon from "@mui/icons-material/Settings";
import PaymentIcon from "@mui/icons-material/Payment";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CreditCardIcon from "@mui/icons-material/CreditCard";

import api from "../../api/axios.js";
import { AuthContext } from "../../context/Auth.jsx";
import { AppContext } from "../../context/AppContext.jsx";
import { useToast } from "../../components/ToastProvider.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import StatusChip from "../../components/StatusChip.jsx";
import Loader from "../../components/Loader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { openRazorpayCheckout } from "../../components/payment/RazorpayCheckout.jsx";

// ---- Design tokens: a road-trip palette (deep route-navy + sunset amber) ----
// kept local to this page so the booking flow reads as a distinct, considered
// moment rather than another generic dashboard card.
const INK = "#152238";
const INK_SOFT = "#33445E";
const AMBER = "#DD7A2E";
const AMBER_DARK = "#B85F1D";
const SURFACE = "#FBFAF6";
const HAIRLINE = "#E5E0D6";
const TEXT_MUTED = "#5C6472";

export default function BookCar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const {
    createBooking,
    createPaymentOrder,
    verifyPayment,
    checkCarAvailability,
    clearAvailability,
    fetchBookedDates,
    bookedDates,
    availability,
    availabilityLoading,
  } = useContext(AppContext);
  const { showSuccess, showError } = useToast();

  const [car, setCar] = useState(null);
  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    pickupLocation: "",
    dropLocation: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("ONLINE");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];
  const today = dayjs().startOf("day");
  const bookedRanges = useMemo(() => bookedDates?.[id] || [], [bookedDates, id]);

  useEffect(() => {
    if (id && !bookedDates?.[id]) {
      fetchBookedDates(id);
    }
  }, [id, bookedDates, fetchBookedDates]);

  const fetchCar = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/cars/${id}`);
      setCar(response.data.car || response.data);
    } catch (err) {
      console.error("Error fetching car:", err);
      setError(err.response?.data?.error || "Unable to fetch car details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCar();
  }, [id]);

  useEffect(() => {
    return () => {
      clearAvailability();
    };
  }, [clearAvailability]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "startDate" || name === "endDate") {
      clearAvailability();
      setError("");
    }
  };

  const handleCalendarDateSelection = (selectedDate) => {
    if (!selectedDate || !selectedDate.isValid()) return;

    const selectedValue = selectedDate.format("YYYY-MM-DD");
    const blocked = bookedRanges.some((booking) => {
      if (!booking?.startDate || !booking?.endDate) return false;
      const start = dayjs(booking.startDate).startOf("day");
      const end = dayjs(booking.endDate).startOf("day");
      const value = dayjs(selectedValue).startOf("day");
      return value.isBetween(start, end, "day", "[]");
    });

    if (blocked) {
      setError("This date is already blocked for this car. Please choose another date.");
      return;
    }

    if (!form.startDate || (form.startDate && form.endDate)) {
      setForm((prev) => ({
        ...prev,
        startDate: selectedValue,
        endDate: "",
      }));
      clearAvailability();
      setError("");
      return;
    }

    const currentStart = dayjs(form.startDate).startOf("day");
    const candidate = dayjs(selectedValue).startOf("day");

    if (candidate.isBefore(currentStart)) {
      setForm((prev) => ({
        ...prev,
        startDate: selectedValue,
        endDate: "",
      }));
      clearAvailability();
      setError("");
      return;
    }

    const nextStart = form.startDate;
    const nextEnd = selectedValue;

    if (isRangeCrossingBlockedDate(nextStart, nextEnd)) {
      setError("This date range crosses a booked period. Please choose a different range.");
      setForm((prev) => ({
        ...prev,
        endDate: "",
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      endDate: selectedValue,
    }));
    clearAvailability();
    setError("");
  };

  const shouldDisableCalendarDate = (day) => {
    if (day.isBefore(today, "day")) return true;

    return bookedRanges.some((booking) => {
      if (!booking?.startDate || !booking?.endDate) return false;
      const start = dayjs(booking.startDate).startOf("day");
      const end = dayjs(booking.endDate).startOf("day");
      return day.isBetween(start, end, "day", "[]");
    }) || (Boolean(form.startDate) && !Boolean(form.endDate) && day.isBefore(dayjs(form.startDate), "day"));
  };

  const isRangeCrossingBlockedDate = (startValue, endValue) => {
    if (!startValue || !endValue) return false;

    const rangeStart = dayjs(startValue).startOf("day");
    const rangeEnd = dayjs(endValue).startOf("day");

    return bookedRanges.some((booking) => {
      if (!booking?.startDate || !booking?.endDate) return false;
      const bookingStart = dayjs(booking.startDate).startOf("day");
      const bookingEnd = dayjs(booking.endDate).startOf("day");
      return rangeStart.isBefore(bookingEnd) && rangeEnd.isAfter(bookingStart);
    });
  };

  // Date validations
  const isStartDateValid = Boolean(form.startDate && form.startDate >= todayStr);
  const isEndDateAfterStart = Boolean(
    form.startDate && form.endDate && new Date(form.endDate) > new Date(form.startDate)
  );
  const isSameDate = Boolean(
    form.startDate && form.endDate && form.startDate === form.endDate
  );
  const isEndDateBeforeStart = Boolean(
    form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)
  );

  const isRangeBlockedByBooking = useMemo(() => {
    if (!form.startDate || !form.endDate) return false;
    return !bookedRanges.every((booking) => {
      if (!booking?.startDate || !booking?.endDate) return true;
      const bookingStart = dayjs(booking.startDate).startOf("day");
      const bookingEnd = dayjs(booking.endDate).startOf("day");
      const rangeStart = dayjs(form.startDate).startOf("day");
      const rangeEnd = dayjs(form.endDate).startOf("day");
      return !(rangeStart.isBefore(bookingEnd) && rangeEnd.isAfter(bookingStart));
    });
  }, [bookedRanges, form.startDate, form.endDate]);

  const calculateDays = () => {
    if (!form.startDate || !form.endDate) return 0;
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const diff = end.getTime() - start.getTime();
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const numberOfDays = calculateDays();
  const pricePerDay = Number(car?.pricePerDay || 0);
  const totalAmount = numberOfDays * pricePerDay;

  const areDatesValid = isStartDateValid && isEndDateAfterStart;
  const isCarBookable = car && car.status === "AVAILABLE" && car.isActive !== false;

  const handleCheckAvailability = async () => {
    if (!form.startDate) {
      setError("Please select a pickup date.");
      return;
    }
    if (!form.endDate) {
      setError("Please select a return date.");
      return;
    }
    if (isSameDate) {
      setError("Return date must be at least one day after pickup date.");
      return;
    }
    if (isEndDateBeforeStart) {
      setError("Return date must be strictly after the pickup date.");
      return;
    }
    if (isRangeBlockedByBooking) {
      setError("This date range crosses a booked period. Please choose another date range.");
      return;
    }

    setError("");
    await checkCarAvailability(id, form.startDate, form.endDate);
  };

  const currentAvailability =
    availability &&
    availability.carId === id &&
    availability.startDate === form.startDate &&
    availability.endDate === form.endDate
      ? availability
      : null;

  const isBookingDisabled =
    !isCarBookable ||
    !areDatesValid ||
    !form.pickupLocation.trim() ||
    !currentAvailability ||
    !currentAvailability.available ||
    availabilityLoading ||
    submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.startDate) {
      setError("Please choose a pickup date.");
      return;
    }

    if (!form.endDate) {
      setError("Please choose a return date.");
      return;
    }

    if (new Date(form.endDate) <= new Date(form.startDate)) {
      setError("Return date must be after the pickup date.");
      return;
    }

    if (isRangeBlockedByBooking) {
      setError("This date range crosses a booked period. Please select another date range.");
      return;
    }

    if (!form.pickupLocation.trim()) {
      setError("Please enter a valid pickup location.");
      return;
    }

    if (!isCarBookable) {
      setError("This vehicle is currently unavailable for booking.");
      return;
    }

    try {
      setSubmitting(true);

      const bookingData = {
        car: id,
        startDate: form.startDate,
        endDate: form.endDate,
        pickupLocation: form.pickupLocation.trim(),
        dropLocation: form.dropLocation ? form.dropLocation.trim() : "",
        paymentMethod: paymentMethod,
      };

      // ==========================================
      // FLOW 1: CASH ON DELIVERY / PAY AT PICKUP
      // ==========================================
      if (paymentMethod === "COD") {
        setProcessingMessage("Creating booking reservation...");
        const response = await createBooking(bookingData);
        const msg = response.data?.message || "Booking confirmed with Pay at Pickup!";
        showSuccess(msg);
        setTimeout(() => {
          navigate("/customer/bookings");
        }, 1200);
        return;
      }

      // ==========================================
      // FLOW 2: RAZORPAY ONLINE PAYMENT
      // ==========================================
      setProcessingMessage("Creating booking reservation...");
      const bookingResponse = await createBooking(bookingData);
      const createdBooking = bookingResponse.data?.booking || bookingResponse.data;

      if (!createdBooking || !createdBooking._id) {
        throw new Error("Failed to initialize booking for payment.");
      }

      setProcessingMessage("Initializing Razorpay secure payment gateway...");
      const orderData = await createPaymentOrder(createdBooking._id);

      if (!orderData || !orderData.orderId) {
        throw new Error("Unable to create Razorpay payment order.");
      }

      // Open Razorpay Checkout modal
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
        description: `Rental for ${car.brand} ${car.model} (${numberOfDays} ${numberOfDays === 1 ? "day" : "days"})`,
        onSuccess: async (paymentResponse) => {
          try {
            setProcessingMessage("Verifying payment signature...");
            const verificationPayload = {
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              bookingId: createdBooking._id,
            };

            const verifyResult = await verifyPayment(verificationPayload);

            showSuccess("Payment verified! Your booking is confirmed.");
            navigate("/customer/payment-success", {
              state: {
                booking: verifyResult.booking || createdBooking,
                paymentId: paymentResponse.razorpay_payment_id,
                orderId: paymentResponse.razorpay_order_id,
                amount: createdBooking.totalAmount || totalAmount,
                carName: `${car.brand} ${car.model}`,
                startDate: form.startDate,
                endDate: form.endDate,
                pickupLocation: form.pickupLocation,
                paymentMethod: "ONLINE",
              },
            });
          } catch (verifyErr) {
            console.error("Verification error:", verifyErr);
            setError(
              verifyErr.response?.data?.error ||
                "Payment was received by Razorpay, but verification failed. Please check My Bookings or contact support."
            );
            setSubmitting(false);
            setProcessingMessage("");
          }
        },
        onDismiss: () => {
          setSubmitting(false);
          setProcessingMessage("");
          setError(
            "Payment window was closed. Your booking is reserved with payment pending. You can complete the payment anytime from My Bookings."
          );
        },
        onError: (gatewayError) => {
          console.error("Razorpay error:", gatewayError);
          setSubmitting(false);
          setProcessingMessage("");
          setError(
            gatewayError.description ||
              gatewayError.message ||
              "Payment gateway error. Please try again."
          );
        },
      });
    } catch (err) {
      console.error("Error in booking/payment process:", err);
      const status = err.response?.status;
      const backendError = err.response?.data?.error;
      const validationErrors = err.response?.data?.errors;

      if (status === 409) {
        setError(
          backendError ||
            "This vehicle was just reserved by another customer for these dates. Please choose different dates."
        );
        clearAvailability();
      } else if (backendError) {
        setError(backendError);
      } else if (validationErrors && validationErrors.length > 0) {
        setError(validationErrors[0].msg);
      } else {
        setError(err.message || "Error processing booking reservation.");
      }

      setSubmitting(false);
      setProcessingMessage("");
    }
  };

  if (loading) {
    return <Loader message="Loading booking details..." minHeight="60vh" />;
  }

  if (!car) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <EmptyState
          title="Vehicle Not Found"
          description="The vehicle you wish to book could not be located."
          actionText="Back to Cars"
          actionLink="/cars"
          actionIcon={<ArrowBackIcon />}
        />
      </Container>
    );
  }

  const imgUrl =
    car.images?.[0]?.url ||
    (typeof car.images?.[0] === "string" ? car.images[0] : null);

  return (
    <Box sx={{ bgcolor: SURFACE, minHeight: "100%" }}>
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        {/* Page Header */}
        <PageHeader
          title="Book Your Car"
          subtitle="Choose your rental dates, select a payment option, and confirm your booking"
          breadcrumbs={[
            { label: "Home", to: "/" },
            { label: "Cars", to: "/cars" },
            { label: `${car.brand} ${car.model}`, to: `/cars/${car._id}` },
            { label: "Book Car" },
          ]}
          action={
            <Button
              component={RouterLink}
              to={`/cars/${id}`}
              startIcon={<ArrowBackIcon />}
              variant="outlined"
              sx={{
                borderRadius: 2,
                fontWeight: 700,
                borderColor: HAIRLINE,
                color: INK,
                "&:hover": { borderColor: INK, bgcolor: "rgba(21,34,56,0.04)" },
              }}
            >
              Vehicle Details
            </Button>
          }
        />

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3.5, borderRadius: 2, fontWeight: 500 }}
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3.5, borderRadius: 2, fontWeight: 600 }}>
            {success}
          </Alert>
        )}

        {!isCarBookable && (
          <Alert severity="warning" sx={{ mb: 3.5, borderRadius: 2, fontWeight: 600 }}>
            This car is currently unavailable for booking (Status: {car.status}).
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* ==================================================
              LEFT COLUMN: VEHICLE OVERVIEW CARD
          ================================================== */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${HAIRLINE}`,
                overflow: "hidden",
                bgcolor: "#FFFFFF",
                position: { md: "sticky" },
                top: { md: 90 },
              }}
            >
              {imgUrl ? (
                <CardMedia
                  component="img"
                  height="220"
                  image={imgUrl}
                  alt={`${car.brand} ${car.model}`}
                  sx={{ objectFit: "cover" }}
                />
              ) : (
                <Box
                  sx={{
                    height: 220,
                    bgcolor: INK,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <DirectionsCarIcon sx={{ fontSize: 64, color: "rgba(255,255,255,0.35)" }} />
                </Box>
              )}

              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: INK }}>
                      {car.brand} {car.model}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.25, color: TEXT_MUTED }}>
                      {car.year} · {car.type || "Self-Drive"}
                    </Typography>
                  </Box>
                  <StatusChip status={car.status} />
                </Box>

                {/* Specs Pills */}
                <Stack direction="row" spacing={1} useFlexGap sx={{ my: 2, flexWrap: "wrap" }}>
                  {car.transmission && (
                    <Chip
                      size="small"
                      icon={<SettingsIcon sx={{ fontSize: 16 }} />}
                      label={car.transmission}
                      sx={{ borderRadius: 1.5, bgcolor: "rgba(21,34,56,0.05)", color: INK_SOFT, fontWeight: 600 }}
                    />
                  )}
                  {car.fuelType && (
                    <Chip
                      size="small"
                      icon={<LocalGasStationIcon sx={{ fontSize: 16 }} />}
                      label={car.fuelType}
                      sx={{ borderRadius: 1.5, bgcolor: "rgba(21,34,56,0.05)", color: INK_SOFT, fontWeight: 600 }}
                    />
                  )}
                  {car.seats && (
                    <Chip
                      size="small"
                      icon={<EventSeatIcon sx={{ fontSize: 16 }} />}
                      label={`${car.seats} Seats`}
                      sx={{ borderRadius: 1.5, bgcolor: "rgba(21,34,56,0.05)", color: INK_SOFT, fontWeight: 600 }}
                    />
                  )}
                </Stack>

                {car.location?.city && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: TEXT_MUTED, mb: 2 }}>
                    <LocationOnIcon sx={{ fontSize: 18, color: AMBER_DARK }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {car.location.city}, {car.location.state}
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 2, borderColor: HAIRLINE }} />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                    borderRadius: 2.5,
                    bgcolor: INK,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "rgba(255,255,255,0.65)" }}>
                    Daily rate
                  </Typography>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="h5" component="span" sx={{ fontWeight: 800, color: "#FFFFFF" }}>
                      ₹{pricePerDay.toLocaleString("en-IN")}
                    </Typography>
                    <Typography variant="caption" sx={{ ml: 0.5, color: "rgba(255,255,255,0.55)" }}>
                      / day
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: 2.5, display: "flex", alignItems: "center", gap: 1.25 }}>
                  <ShieldOutlinedIcon sx={{ fontSize: 18, color: AMBER_DARK }} />
                  <Typography variant="caption" sx={{ fontWeight: 500, color: TEXT_MUTED }}>
                    Verified vehicle · Razorpay-encrypted payments · Full host support
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* ==================================================
              RIGHT COLUMN: DATE INPUTS, PAYMENT & SUMMARY
          ================================================== */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 4 },
                borderRadius: 3,
                border: `1px solid ${HAIRLINE}`,
                bgcolor: "#FFFFFF",
              }}
            >
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={3.5}>
                  {/* 1. Booking Dates Section */}
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <CalendarMonthIcon sx={{ color: AMBER_DARK, fontSize: 24 }} />
                      <Typography variant="h6" sx={{ fontWeight: 800, color: INK }}>
                        Booking dates
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2.5, color: TEXT_MUTED }}>
                      Tap a date for pickup, then a second date for your return
                    </Typography>

                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        border: `1px solid ${HAIRLINE}`,
                        borderRadius: 2.5,
                        background: SURFACE,
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5, flexWrap: "wrap", gap: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: TEXT_MUTED }}>
                          Pickup and return calendar
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => {
                            if (id) fetchBookedDates(id, true);
                          }}
                          disabled={availabilityLoading || !id}
                          sx={{ fontWeight: 700, color: AMBER_DARK }}
                        >
                          Refresh booked dates
                        </Button>
                      </Box>

                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateCalendar
                          value={form.endDate ? dayjs(form.endDate) : form.startDate ? dayjs(form.startDate) : null}
                          onChange={handleCalendarDateSelection}
                          disabled={!isCarBookable || submitting}
                          minDate={today}
                          shouldDisableDate={shouldDisableCalendarDate}
                          sx={{
                            width: "100%",
                            maxWidth: 430,
                            mx: "auto",
                            "& .MuiPickersDay-root.Mui-selected": {
                              backgroundColor: `${INK} !important`,
                            },
                            "& .MuiPickersDay-today": {
                              borderColor: `${AMBER} !important`,
                            },
                            ".MuiPickersDay-root.Mui-disabled": {
                              backgroundColor: "#EAE7DD",
                              color: "#9AA0A8",
                              opacity: 1,
                            },
                          }}
                        />
                      </LocalizationProvider>

                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 2, alignItems: "center" }}>
                        {[
                          { label: "Available", color: "#3E9B5E" },
                          { label: "Booked", color: "#B8B2A3" },
                          { label: "Selected", color: INK },
                          { label: "Today", color: AMBER },
                        ].map((item) => (
                          <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                backgroundColor: item.color,
                              }}
                            />
                            <Typography variant="caption" sx={{ fontWeight: 600, color: TEXT_MUTED }}>
                              {item.label}
                            </Typography>
                          </Box>
                        ))}
                      </Box>

                      {form.startDate || form.endDate ? (
                        <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, backgroundColor: "#fff", border: `1px solid ${HAIRLINE}` }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: TEXT_MUTED, display: "block" }}>
                            Selected range
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5, color: INK }}>
                            {form.startDate ? new Date(`${form.startDate}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                            {form.endDate ? ` → ${new Date(`${form.endDate}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}` : form.startDate ? " → Select return date" : ""}
                          </Typography>
                        </Box>
                      ) : null}
                    </Paper>
                  </Box>

                  {/* 2. Availability Live Indicator */}
                  {areDatesValid && isCarBookable && (
                    <Box sx={{ p: 2, bgcolor: SURFACE, borderRadius: 2.5, border: `1px solid ${HAIRLINE}` }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 600, display: "block", color: TEXT_MUTED }}>
                            Live availability status
                          </Typography>
                          {availabilityLoading ? (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                              <CircularProgress size={16} sx={{ color: AMBER_DARK }} />
                              <Typography variant="body2" sx={{ fontWeight: 600, color: INK }}>
                                Checking availability...
                              </Typography>
                            </Box>
                          ) : currentAvailability ? (
                            currentAvailability.available ? (
                              <Chip
                                size="small"
                                icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                                label="Available for selected dates"
                                sx={{ fontWeight: 700, mt: 0.5, bgcolor: "#E4F3E8", color: "#276B41" }}
                              />
                            ) : (
                              <Chip
                                size="small"
                                icon={<CancelIcon sx={{ fontSize: 16 }} />}
                                label="Not available for selected dates"
                                color="error"
                                sx={{ fontWeight: 700, mt: 0.5 }}
                              />
                            )
                          ) : (
                            <Typography variant="body2" sx={{ mt: 0.5, color: TEXT_MUTED }}>
                              Check the dates before you book
                            </Typography>
                          )}
                        </Box>

                        <Button
                          variant={currentAvailability ? "outlined" : "contained"}
                          size="small"
                          onClick={handleCheckAvailability}
                          disabled={availabilityLoading}
                          startIcon={
                            availabilityLoading ? (
                              <CircularProgress size={14} color="inherit" />
                            ) : (
                              <EventAvailableIcon />
                            )
                          }
                          sx={{
                            fontWeight: 700,
                            borderRadius: 2,
                            ...(currentAvailability
                              ? { borderColor: INK, color: INK, "&:hover": { borderColor: INK, bgcolor: "rgba(21,34,56,0.04)" } }
                              : { bgcolor: INK, "&:hover": { bgcolor: "#0E1830" } }),
                          }}
                        >
                          {availabilityLoading ? "Checking..." : currentAvailability ? "Re-check availability" : "Check availability"}
                        </Button>
                      </Box>

                      {currentAvailability && !currentAvailability.available && (
                        <Alert severity="error" sx={{ mt: 1.5, py: 0.5, borderRadius: 2 }}>
                          {currentAvailability.message || "This car is already booked for these dates. Please select different dates."}
                        </Alert>
                      )}
                    </Box>
                  )}

                  <Divider sx={{ borderColor: HAIRLINE }} />

                  {/* 3. Location Details */}
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: INK }}>
                      Pickup &amp; drop-off location
                    </Typography>
                    <Stack spacing={2.5}>
                      <TextField
                        required
                        fullWidth
                        id="pickupLocation"
                        name="pickupLocation"
                        label="Pickup location"
                        placeholder="e.g. Airport, Railway Station, or Landmark Address"
                        value={form.pickupLocation}
                        onChange={handleChange}
                        disabled={!isCarBookable || submitting}
                        helperText="Specify where you wish to pick up the vehicle"
                        slotProps={{ input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOnIcon fontSize="small" sx={{ color: TEXT_MUTED }} />
                            </InputAdornment>
                          ),
                        }}}
                      />

                      <TextField
                        fullWidth
                        id="dropLocation"
                        name="dropLocation"
                        label="Drop-off location (optional)"
                        placeholder="Same as pickup location if left blank"
                        value={form.dropLocation}
                        onChange={handleChange}
                        disabled={!isCarBookable || submitting}
                        helperText="Optional alternate return location"
                        slotProps={{ input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOnIcon fontSize="small" sx={{ color: TEXT_MUTED }} />
                            </InputAdornment>
                          ),
                        }}}
                      />
                    </Stack>
                  </Box>

                  <Divider sx={{ borderColor: HAIRLINE }} />

                  {/* 4. Payment Method Selection Section */}
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PaymentIcon sx={{ color: AMBER_DARK, fontSize: 24 }} />
                        <Typography variant="h6" sx={{ fontWeight: 800, color: INK }}>
                          Payment method
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: TEXT_MUTED }}>
                        <LockOutlinedIcon sx={{ fontSize: 16 }} />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          256-bit secure
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2.5, color: TEXT_MUTED }}>
                      Choose your preferred payment method
                    </Typography>

                    <RadioGroup
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      name="paymentMethod"
                    >
                      <Stack spacing={2}>
                        {/* Option 1: Pay Online (Razorpay) */}
                        <Paper
                          elevation={0}
                          onClick={() => !submitting && setPaymentMethod("ONLINE")}
                          sx={{
                            p: 2.5,
                            borderRadius: 2.5,
                            border: paymentMethod === "ONLINE" ? `2px solid ${INK}` : `1px solid ${HAIRLINE}`,
                            bgcolor: paymentMethod === "ONLINE" ? "rgba(21, 34, 56, 0.03)" : "#FFFFFF",
                            cursor: submitting ? "not-allowed" : "pointer",
                            transition: "border-color 0.15s ease",
                            "&:hover": {
                              borderColor: INK,
                            },
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                              <Radio
                                checked={paymentMethod === "ONLINE"}
                                value="ONLINE"
                                disabled={submitting}
                                sx={{
                                  p: 0.5,
                                  mt: 0.25,
                                  color: HAIRLINE,
                                  "&.Mui-checked": { color: INK },
                                }}
                              />
                              <Box>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: INK }}>
                                    Pay online
                                  </Typography>
                                  <Chip
                                    label="Razorpay secure"
                                    size="small"
                                    sx={{ fontWeight: 700, height: 20, fontSize: "0.7rem", bgcolor: INK, color: "#fff" }}
                                  />
                                </Box>
                                <Typography variant="body2" sx={{ mt: 0.5, color: TEXT_MUTED }}>
                                  Pay securely using cards, UPI, netbanking, or digital wallets
                                </Typography>
                              </Box>
                            </Box>
                            <CreditCardIcon sx={{ color: INK, fontSize: 28, display: { xs: "none", sm: "block" } }} />
                          </Box>
                        </Paper>

                        {/* Option 2: Cash on Delivery / Pay at Pickup */}
                        <Paper
                          elevation={0}
                          onClick={() => !submitting && setPaymentMethod("COD")}
                          sx={{
                            p: 2.5,
                            borderRadius: 2.5,
                            border: paymentMethod === "COD" ? `2px solid ${AMBER_DARK}` : `1px solid ${HAIRLINE}`,
                            bgcolor: paymentMethod === "COD" ? "rgba(221, 122, 46, 0.05)" : "#FFFFFF",
                            cursor: submitting ? "not-allowed" : "pointer",
                            transition: "border-color 0.15s ease",
                            "&:hover": {
                              borderColor: AMBER_DARK,
                            },
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                              <Radio
                                checked={paymentMethod === "COD"}
                                value="COD"
                                disabled={submitting}
                                sx={{
                                  p: 0.5,
                                  mt: 0.25,
                                  color: HAIRLINE,
                                  "&.Mui-checked": { color: AMBER_DARK },
                                }}
                              />
                              <Box>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: INK }}>
                                    Pay at pickup (COD)
                                  </Typography>
                                  <Chip
                                    label="Zero advance"
                                    size="small"
                                    sx={{ fontWeight: 700, height: 20, fontSize: "0.7rem", bgcolor: AMBER, color: "#fff" }}
                                  />
                                </Box>
                                <Typography variant="body2" sx={{ mt: 0.5, color: TEXT_MUTED }}>
                                  Pay the full rental fee directly to the host when you collect the keys
                                </Typography>
                              </Box>
                            </Box>
                            <LocalAtmIcon sx={{ color: AMBER_DARK, fontSize: 28, display: { xs: "none", sm: "block" } }} />
                          </Box>
                        </Paper>
                      </Stack>
                    </RadioGroup>
                  </Box>

                  <Divider sx={{ borderColor: HAIRLINE }} />

                  {/* 5. Booking Summary — presented as a ticket stub, in keeping with a rental handoff */}
                  <Box
                    sx={{
                      borderRadius: 3,
                      border: `1px solid ${HAIRLINE}`,
                      overflow: "hidden",
                      bgcolor: SURFACE,
                    }}
                  >
                    <Box
                      sx={{
                        px: 3,
                        py: 1.75,
                        borderBottom: `1px solid ${HAIRLINE}`,
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: INK }}>
                        Booking summary
                      </Typography>
                      <Typography variant="caption" sx={{ color: TEXT_MUTED }}>
                        {car.brand} {car.model}
                      </Typography>
                    </Box>

                    <Box sx={{ px: 3, py: 2.5 }}>
                      {areDatesValid && numberOfDays > 0 ? (
                        <Stack spacing={1.5}>
                          {/* Row: price per day */}
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="body2" sx={{ color: TEXT_MUTED }}>Price per day</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: INK }}>
                              ₹{pricePerDay.toLocaleString("en-IN")}
                            </Typography>
                          </Box>

                          {/* Row: rental days */}
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="body2" sx={{ color: TEXT_MUTED }}>Rental days</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: INK }}>
                              {numberOfDays} {numberOfDays === 1 ? "day" : "days"}
                            </Typography>
                          </Box>

                          {/* Row: payment method */}
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="body2" sx={{ color: TEXT_MUTED }}>Payment</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: INK }}>
                              {paymentMethod === "ONLINE" ? "Pay online" : "Pay at pickup"}
                            </Typography>
                          </Box>

                          {/* Row: availability */}
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="body2" sx={{ color: TEXT_MUTED }}>Availability</Typography>
                            {currentAvailability?.available ? (
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#276B41" }}>
                                <CheckCircleIcon sx={{ fontSize: 14 }} />
                                <Typography variant="caption" sx={{ fontWeight: 700 }}>Confirmed</Typography>
                              </Box>
                            ) : (
                              <Typography variant="caption" sx={{ fontWeight: 600, color: TEXT_MUTED }}>
                                Check above
                              </Typography>
                            )}
                          </Box>

                          {/* perforated ticket seam */}
                          <Box sx={{ position: "relative", my: 0.5 }}>
                            <Box sx={{ borderTop: `2px dashed ${HAIRLINE}` }} />
                            <Box sx={{ position: "absolute", left: -27, top: -11, width: 22, height: 22, borderRadius: "50%", bgcolor: "#FFFFFF", border: `1px solid ${HAIRLINE}` }} />
                            <Box sx={{ position: "absolute", right: -27, top: -11, width: 22, height: 22, borderRadius: "50%", bgcolor: "#FFFFFF", border: `1px solid ${HAIRLINE}` }} />
                          </Box>

                          {/* Total — emphasized */}
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 0.5 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: INK }}>
                              Total amount
                            </Typography>
                            <Box sx={{ textAlign: "right" }}>
                              <Typography variant="h4" sx={{ fontWeight: 900, color: AMBER_DARK, lineHeight: 1.1 }}>
                                ₹{totalAmount.toLocaleString("en-IN")}
                              </Typography>
                              <Typography variant="caption" sx={{ color: TEXT_MUTED }}>
                                ₹{pricePerDay.toLocaleString("en-IN")} &times; {numberOfDays}{" "}
                                {numberOfDays === 1 ? "day" : "days"}
                              </Typography>
                            </Box>
                          </Box>
                        </Stack>
                      ) : (
                        <Box sx={{ py: 2, textAlign: "center" }}>
                          <Typography variant="body2" sx={{ color: TEXT_MUTED }}>
                            Select valid pickup and return dates to see the rental total.
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* Submit / Pay Button */}
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isBookingDisabled}
                    startIcon={
                      submitting ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : paymentMethod === "ONLINE" ? (
                        <PaymentIcon />
                      ) : (
                        <LocalAtmIcon />
                      )
                    }
                    sx={{
                      py: 1.6,
                      fontWeight: 800,
                      fontSize: "1.05rem",
                      borderRadius: 2.5,
                      bgcolor: paymentMethod === "ONLINE" ? INK : AMBER_DARK,
                      "&:hover": {
                        bgcolor: paymentMethod === "ONLINE" ? "#0E1830" : "#9C4E17",
                      },
                      "&.Mui-disabled": {
                        bgcolor: "#DDD8CC",
                        color: "#8B8779",
                      },
                    }}
                  >
                    {submitting
                      ? processingMessage || "Processing..."
                      : !areDatesValid
                      ? "Select valid dates"
                      : !currentAvailability || !currentAvailability.available
                      ? "Check availability to book"
                      : paymentMethod === "ONLINE"
                      ? `Pay ₹${totalAmount.toLocaleString("en-IN")} with Razorpay`
                      : `Confirm booking (pay ₹${totalAmount.toLocaleString("en-IN")} at pickup)`}
                  </Button>

                  {submitting && processingMessage && (
                    <Typography
                      variant="caption"
                      sx={{ textAlign: "center", fontWeight: 600, display: "block", color: TEXT_MUTED }}
                    >
                      🔒 {processingMessage}
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}





























// import { useContext, useEffect, useMemo, useState } from "react";
// import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
// import dayjs from "dayjs";
// import { DateCalendar, LocalizationProvider } from "@mui/x-date-pickers";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import Container from "@mui/material/Container";
// import Grid from "@mui/material/Grid";
// import Box from "@mui/material/Box";
// import Typography from "@mui/material/Typography";
// import Button from "@mui/material/Button";
// import Card from "@mui/material/Card";
// import CardMedia from "@mui/material/CardMedia";
// import CardContent from "@mui/material/CardContent";
// import Paper from "@mui/material/Paper";
// import TextField from "@mui/material/TextField";
// import Stack from "@mui/material/Stack";
// import Divider from "@mui/material/Divider";
// import Alert from "@mui/material/Alert";
// import CircularProgress from "@mui/material/CircularProgress";
// import InputAdornment from "@mui/material/InputAdornment";
// import Chip from "@mui/material/Chip";
// import Radio from "@mui/material/Radio";
// import RadioGroup from "@mui/material/RadioGroup";
// import FormControlLabel from "@mui/material/FormControlLabel";

// import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// import EventAvailableIcon from "@mui/icons-material/EventAvailable";
// import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
// import LocationOnIcon from "@mui/icons-material/LocationOn";
// import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import CancelIcon from "@mui/icons-material/Cancel";
// import BookOnlineIcon from "@mui/icons-material/BookOnline";
// import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
// import EventSeatIcon from "@mui/icons-material/EventSeat";
// import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
// import SettingsIcon from "@mui/icons-material/Settings";
// import PaymentIcon from "@mui/icons-material/Payment";
// import LocalAtmIcon from "@mui/icons-material/LocalAtm";
// import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
// import CreditCardIcon from "@mui/icons-material/CreditCard";

// import api from "../../api/axios.js";
// import { AuthContext } from "../../context/Auth.jsx";
// import { AppContext } from "../../context/AppContext.jsx";
// import { useToast } from "../../components/ToastProvider.jsx";
// import PageHeader from "../../components/PageHeader.jsx";
// import StatusChip from "../../components/StatusChip.jsx";
// import Loader from "../../components/Loader.jsx";
// import EmptyState from "../../components/EmptyState.jsx";
// import { openRazorpayCheckout } from "../../components/payment/RazorpayCheckout.jsx";

// export default function BookCar() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { user } = useContext(AuthContext);

//   const {
//     createBooking,
//     createPaymentOrder,
//     verifyPayment,
//     checkCarAvailability,
//     clearAvailability,
//     fetchBookedDates,
//     bookedDates,
//     availability,
//     availabilityLoading,
//   } = useContext(AppContext);
//   const { showSuccess, showError } = useToast();

//   const [car, setCar] = useState(null);
//   const [form, setForm] = useState({
//     startDate: "",
//     endDate: "",
//     pickupLocation: "",
//     dropLocation: "",
//   });

//   const [paymentMethod, setPaymentMethod] = useState("ONLINE");
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [processingMessage, setProcessingMessage] = useState("");
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   const todayStr = new Date().toISOString().split("T")[0];
//   const today = dayjs().startOf("day");
//   const bookedRanges = useMemo(() => bookedDates?.[id] || [], [bookedDates, id]);

//   useEffect(() => {
//     if (id && !bookedDates?.[id]) {
//       fetchBookedDates(id);
//     }
//   }, [id, bookedDates, fetchBookedDates]);

//   const fetchCar = async () => {
//     setLoading(true);
//     try {
//       const response = await api.get(`/cars/${id}`);
//       setCar(response.data.car || response.data);
//     } catch (err) {
//       console.error("Error fetching car:", err);
//       setError(err.response?.data?.error || "Unable to fetch car details.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCar();
//   }, [id]);

//   useEffect(() => {
//     return () => {
//       clearAvailability();
//     };
//   }, [clearAvailability]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }));

//     if (name === "startDate" || name === "endDate") {
//       clearAvailability();
//       setError("");
//     }
//   };

//   const handleCalendarDateSelection = (selectedDate) => {
//     if (!selectedDate || !selectedDate.isValid()) return;

//     const selectedValue = selectedDate.format("YYYY-MM-DD");
//     const blocked = bookedRanges.some((booking) => {
//       if (!booking?.startDate || !booking?.endDate) return false;
//       const start = dayjs(booking.startDate).startOf("day");
//       const end = dayjs(booking.endDate).startOf("day");
//       const value = dayjs(selectedValue).startOf("day");
//       return value.isBetween(start, end, "day", "[]");
//     });

//     if (blocked) {
//       setError("This date is already blocked for this car. Please choose another date.");
//       return;
//     }

//     if (!form.startDate || (form.startDate && form.endDate)) {
//       setForm((prev) => ({
//         ...prev,
//         startDate: selectedValue,
//         endDate: "",
//       }));
//       clearAvailability();
//       setError("");
//       return;
//     }

//     const currentStart = dayjs(form.startDate).startOf("day");
//     const candidate = dayjs(selectedValue).startOf("day");

//     if (candidate.isBefore(currentStart)) {
//       setForm((prev) => ({
//         ...prev,
//         startDate: selectedValue,
//         endDate: "",
//       }));
//       clearAvailability();
//       setError("");
//       return;
//     }

//     const nextStart = form.startDate;
//     const nextEnd = selectedValue;

//     if (isRangeCrossingBlockedDate(nextStart, nextEnd)) {
//       setError("This date range crosses a booked period. Please choose a different range.");
//       setForm((prev) => ({
//         ...prev,
//         endDate: "",
//       }));
//       return;
//     }

//     setForm((prev) => ({
//       ...prev,
//       endDate: selectedValue,
//     }));
//     clearAvailability();
//     setError("");
//   };

//   const shouldDisableCalendarDate = (day) => {
//     if (day.isBefore(today, "day")) return true;

//     return bookedRanges.some((booking) => {
//       if (!booking?.startDate || !booking?.endDate) return false;
//       const start = dayjs(booking.startDate).startOf("day");
//       const end = dayjs(booking.endDate).startOf("day");
//       return day.isBetween(start, end, "day", "[]");
//     }) || (Boolean(form.startDate) && !Boolean(form.endDate) && day.isBefore(dayjs(form.startDate), "day"));
//   };

//   const isRangeCrossingBlockedDate = (startValue, endValue) => {
//     if (!startValue || !endValue) return false;

//     const rangeStart = dayjs(startValue).startOf("day");
//     const rangeEnd = dayjs(endValue).startOf("day");

//     return bookedRanges.some((booking) => {
//       if (!booking?.startDate || !booking?.endDate) return false;
//       const bookingStart = dayjs(booking.startDate).startOf("day");
//       const bookingEnd = dayjs(booking.endDate).startOf("day");
//       return rangeStart.isBefore(bookingEnd) && rangeEnd.isAfter(bookingStart);
//     });
//   };

//   // Date validations
//   const isStartDateValid = Boolean(form.startDate && form.startDate >= todayStr);
//   const isEndDateAfterStart = Boolean(
//     form.startDate && form.endDate && new Date(form.endDate) > new Date(form.startDate)
//   );
//   const isSameDate = Boolean(
//     form.startDate && form.endDate && form.startDate === form.endDate
//   );
//   const isEndDateBeforeStart = Boolean(
//     form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)
//   );

//   const isRangeBlockedByBooking = useMemo(() => {
//     if (!form.startDate || !form.endDate) return false;
//     return !bookedRanges.every((booking) => {
//       if (!booking?.startDate || !booking?.endDate) return true;
//       const bookingStart = dayjs(booking.startDate).startOf("day");
//       const bookingEnd = dayjs(booking.endDate).startOf("day");
//       const rangeStart = dayjs(form.startDate).startOf("day");
//       const rangeEnd = dayjs(form.endDate).startOf("day");
//       return !(rangeStart.isBefore(bookingEnd) && rangeEnd.isAfter(bookingStart));
//     });
//   }, [bookedRanges, form.startDate, form.endDate]);

//   const calculateDays = () => {
//     if (!form.startDate || !form.endDate) return 0;
//     const start = new Date(form.startDate);
//     const end = new Date(form.endDate);
//     const diff = end.getTime() - start.getTime();
//     if (diff <= 0) return 0;
//     return Math.ceil(diff / (1000 * 60 * 60 * 24));
//   };

//   const numberOfDays = calculateDays();
//   const pricePerDay = Number(car?.pricePerDay || 0);
//   const totalAmount = numberOfDays * pricePerDay;

//   const areDatesValid = isStartDateValid && isEndDateAfterStart;
//   const isCarBookable = car && car.status === "AVAILABLE" && car.isActive !== false;

//   const handleCheckAvailability = async () => {
//     if (!form.startDate) {
//       setError("Please select a pickup date.");
//       return;
//     }
//     if (!form.endDate) {
//       setError("Please select a return date.");
//       return;
//     }
//     if (isSameDate) {
//       setError("Return date must be at least one day after pickup date.");
//       return;
//     }
//     if (isEndDateBeforeStart) {
//       setError("Return date must be strictly after the pickup date.");
//       return;
//     }
//     if (isRangeBlockedByBooking) {
//       setError("This date range crosses a booked period. Please choose another date range.");
//       return;
//     }

//     setError("");
//     await checkCarAvailability(id, form.startDate, form.endDate);
//   };

//   const currentAvailability =
//     availability &&
//     availability.carId === id &&
//     availability.startDate === form.startDate &&
//     availability.endDate === form.endDate
//       ? availability
//       : null;

//   const isBookingDisabled =
//     !isCarBookable ||
//     !areDatesValid ||
//     !form.pickupLocation.trim() ||
//     !currentAvailability ||
//     !currentAvailability.available ||
//     availabilityLoading ||
//     submitting;

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");

//     if (!form.startDate) {
//       setError("Please choose a pickup date.");
//       return;
//     }

//     if (!form.endDate) {
//       setError("Please choose a return date.");
//       return;
//     }

//     if (new Date(form.endDate) <= new Date(form.startDate)) {
//       setError("Return date must be after the pickup date.");
//       return;
//     }

//     if (isRangeBlockedByBooking) {
//       setError("This date range crosses a booked period. Please select another date range.");
//       return;
//     }

//     if (!form.pickupLocation.trim()) {
//       setError("Please enter a valid pickup location.");
//       return;
//     }

//     if (!isCarBookable) {
//       setError("This vehicle is currently unavailable for booking.");
//       return;
//     }

//     try {
//       setSubmitting(true);

//       const bookingData = {
//         car: id,
//         startDate: form.startDate,
//         endDate: form.endDate,
//         pickupLocation: form.pickupLocation.trim(),
//         dropLocation: form.dropLocation ? form.dropLocation.trim() : "",
//         paymentMethod: paymentMethod,
//       };

//       // ==========================================
//       // FLOW 1: CASH ON DELIVERY / PAY AT PICKUP
//       // ==========================================
//       if (paymentMethod === "COD") {
//         setProcessingMessage("Creating booking reservation...");
//         const response = await createBooking(bookingData);
//         const msg = response.data?.message || "Booking confirmed with Pay at Pickup!";
//         showSuccess(msg);
//         setTimeout(() => {
//           navigate("/customer/bookings");
//         }, 1200);
//         return;
//       }

//       // ==========================================
//       // FLOW 2: RAZORPAY ONLINE PAYMENT
//       // ==========================================
//       setProcessingMessage("Creating booking reservation...");
//       const bookingResponse = await createBooking(bookingData);
//       const createdBooking = bookingResponse.data?.booking || bookingResponse.data;

//       if (!createdBooking || !createdBooking._id) {
//         throw new Error("Failed to initialize booking for payment.");
//       }

//       setProcessingMessage("Initializing Razorpay secure payment gateway...");
//       const orderData = await createPaymentOrder(createdBooking._id);

//       if (!orderData || !orderData.orderId) {
//         throw new Error("Unable to create Razorpay payment order.");
//       }

//       // Open Razorpay Checkout modal
//       await openRazorpayCheckout({
//         orderId: orderData.orderId,
//         amount: orderData.amount,
//         currency: orderData.currency || "INR",
//         keyId: orderData.keyId,
//         prefill: {
//           name: user?.name || "",
//           email: user?.email || "",
//           contact: user?.phoneNumber || "",
//         },
//         name: "AI Car Rental",
//         description: `Rental for ${car.brand} ${car.model} (${numberOfDays} ${numberOfDays === 1 ? "day" : "days"})`,
//         onSuccess: async (paymentResponse) => {
//           try {
//             setProcessingMessage("Verifying payment signature...");
//             const verificationPayload = {
//               razorpay_order_id: paymentResponse.razorpay_order_id,
//               razorpay_payment_id: paymentResponse.razorpay_payment_id,
//               razorpay_signature: paymentResponse.razorpay_signature,
//               bookingId: createdBooking._id,
//             };

//             const verifyResult = await verifyPayment(verificationPayload);

//             showSuccess("Payment verified! Your booking is confirmed.");
//             navigate("/customer/payment-success", {
//               state: {
//                 booking: verifyResult.booking || createdBooking,
//                 paymentId: paymentResponse.razorpay_payment_id,
//                 orderId: paymentResponse.razorpay_order_id,
//                 amount: createdBooking.totalAmount || totalAmount,
//                 carName: `${car.brand} ${car.model}`,
//                 startDate: form.startDate,
//                 endDate: form.endDate,
//                 pickupLocation: form.pickupLocation,
//                 paymentMethod: "ONLINE",
//               },
//             });
//           } catch (verifyErr) {
//             console.error("Verification error:", verifyErr);
//             setError(
//               verifyErr.response?.data?.error ||
//                 "Payment was received by Razorpay, but verification failed. Please check My Bookings or contact support."
//             );
//             setSubmitting(false);
//             setProcessingMessage("");
//           }
//         },
//         onDismiss: () => {
//           setSubmitting(false);
//           setProcessingMessage("");
//           setError(
//             "Payment window was closed. Your booking is reserved with payment pending. You can complete the payment anytime from My Bookings."
//           );
//         },
//         onError: (gatewayError) => {
//           console.error("Razorpay error:", gatewayError);
//           setSubmitting(false);
//           setProcessingMessage("");
//           setError(
//             gatewayError.description ||
//               gatewayError.message ||
//               "Payment gateway error. Please try again."
//           );
//         },
//       });
//     } catch (err) {
//       console.error("Error in booking/payment process:", err);
//       const status = err.response?.status;
//       const backendError = err.response?.data?.error;
//       const validationErrors = err.response?.data?.errors;

//       if (status === 409) {
//         setError(
//           backendError ||
//             "This vehicle was just reserved by another customer for these dates. Please choose different dates."
//         );
//         clearAvailability();
//       } else if (backendError) {
//         setError(backendError);
//       } else if (validationErrors && validationErrors.length > 0) {
//         setError(validationErrors[0].msg);
//       } else {
//         setError(err.message || "Error processing booking reservation.");
//       }

//       setSubmitting(false);
//       setProcessingMessage("");
//     }
//   };

//   if (loading) {
//     return <Loader message="Loading booking details..." minHeight="60vh" />;
//   }

//   if (!car) {
//     return (
//       <Container maxWidth="md" sx={{ py: 8 }}>
//         <EmptyState
//           title="Vehicle Not Found"
//           description="The vehicle you wish to book could not be located."
//           actionText="Back to Cars"
//           actionLink="/cars"
//           actionIcon={<ArrowBackIcon />}
//         />
//       </Container>
//     );
//   }

//   const imgUrl =
//     car.images?.[0]?.url ||
//     (typeof car.images?.[0] === "string" ? car.images[0] : null);

//   return (
//     <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
//       {/* Page Header */}
//       <PageHeader
//         title="Book Your Car"
//         subtitle="Choose your rental dates, select a payment option, and confirm your booking"
//         breadcrumbs={[
//           { label: "Home", to: "/" },
//           { label: "Cars", to: "/cars" },
//           { label: `${car.brand} ${car.model}`, to: `/cars/${car._id}` },
//           { label: "Book Car" },
//         ]}
//         action={
//           <Button
//             component={RouterLink}
//             to={`/cars/${id}`}
//             startIcon={<ArrowBackIcon />}
//             variant="outlined"
//           >
//             Vehicle Details
//           </Button>
//         }
//       />

//       {error && (
//         <Alert
//           severity="error"
//           sx={{ mb: 3.5, borderRadius: 2.5, fontWeight: 500 }}
//           onClose={() => setError("")}
//         >
//           {error}
//         </Alert>
//       )}

//       {success && (
//         <Alert severity="success" sx={{ mb: 3.5, borderRadius: 2.5, fontWeight: 600 }}>
//           {success}
//         </Alert>
//       )}

//       {!isCarBookable && (
//         <Alert severity="warning" sx={{ mb: 3.5, borderRadius: 2.5, fontWeight: 600 }}>
//           This car is currently unavailable for booking (Status: {car.status}).
//         </Alert>
//       )}

//       <Grid container spacing={4}>
//         {/* ==================================================
//             LEFT COLUMN: VEHICLE OVERVIEW CARD
//         ================================================== */}
//         <Grid size={{ xs: 12, md: 5 }}>
//           <Card
//             elevation={0}
//             sx={{
//               borderRadius: 4,
//               border: "1px solid #E2E8F0",
//               overflow: "hidden",
//               bgcolor: "#FFFFFF",
//               position: { md: "sticky" },
//               top: { md: 90 },
//             }}
//           >
//             {imgUrl ? (
//               <CardMedia
//                 component="img"
//                 height="220"
//                 image={imgUrl}
//                 alt={`${car.brand} ${car.model}`}
//                 sx={{ objectFit: "cover" }}
//               />
//             ) : (
//               <Box
//                 sx={{
//                   height: 220,
//                   bgcolor: "#F1F5F9",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                 }}
//               >
//                 <DirectionsCarIcon sx={{ fontSize: 64, opacity: 0.4 }} />
//               </Box>
//             )}

//             <CardContent sx={{ p: 3 }}>
//               <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
//                 <Box>
//                   <Typography variant="h5" sx={{ fontWeight: 800 }}>
//                     {car.brand} {car.model}
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mt: 0.25 }}>
//                     {car.year} • {car.type || "Self-Drive"}
//                   </Typography>
//                 </Box>
//                 <StatusChip status={car.status} />
//               </Box>

//               {/* Specs Pills */}
//               <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ my: 2 }}>
//                 {car.transmission && (
//                   <Chip
//                     size="small"
//                     icon={<SettingsIcon fontSize="small" />}
//                     label={car.transmission}
//                     variant="outlined"
//                     sx={{ borderRadius: 1.5 }}
//                   />
//                 )}
//                 {car.fuelType && (
//                   <Chip
//                     size="small"
//                     icon={<LocalGasStationIcon fontSize="small" />}
//                     label={car.fuelType}
//                     variant="outlined"
//                     sx={{ borderRadius: 1.5 }}
//                   />
//                 )}
//                 {car.seats && (
//                   <Chip
//                     size="small"
//                     icon={<EventSeatIcon fontSize="small" />}
//                     label={`${car.seats} Seats`}
//                     variant="outlined"
//                     sx={{ borderRadius: 1.5 }}
//                   />
//                 )}
//               </Stack>

//               {car.location?.city && (
//                 <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "text.secondary", mb: 2 }}>
//                   <LocationOnIcon fontSize="small" color="primary" />
//                   <Typography variant="body2" sx={{ fontWeight: 500 }}>
//                     {car.location.city}, {car.location.state}
//                   </Typography>
//                 </Box>
//               )}

//               <Divider sx={{ my: 2 }} />

//               <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
//                 <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
//                   Daily Rental Rate
//                 </Typography>
//                 <Box sx={{ textAlign: "right" }}>
//                   <Typography variant="h5" component="span" sx={{ fontWeight: 800, color: "primary.main" }}>
//                     ₹{pricePerDay.toLocaleString("en-IN")}
//                   </Typography>
//                   <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
//                     / day
//                   </Typography>
//                 </Box>
//               </Box>

//               <Box sx={{ mt: 2.5, p: 1.5, bgcolor: "#F8FAFC", borderRadius: 2, display: "flex", alignItems: "center", gap: 1.25 }}>
//                 <ShieldOutlinedIcon color="primary" fontSize="small" />
//                 <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
//                   100% Verified Vehicle • Razorpay Encrypted Payments • Full Host Support
//                 </Typography>
//               </Box>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* ==================================================
//             RIGHT COLUMN: DATE INPUTS, PAYMENT & SUMMARY
//         ================================================== */}
//         <Grid size={{ xs: 12, md: 7 }}>
//           <Paper
//             elevation={0}
//             sx={{
//               p: { xs: 2.5, sm: 4 },
//               borderRadius: 4,
//               border: "1px solid #E2E8F0",
//               bgcolor: "#FFFFFF",
//             }}
//           >
//             <Box component="form" onSubmit={handleSubmit} noValidate>
//               <Stack spacing={3.5}>
//                 {/* 1. Booking Dates Section */}
//                 <Box>
//                   <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
//                     <CalendarMonthIcon sx={{ color: "primary.main", fontSize: 24 }} />
//                     <Typography variant="h6" sx={{ fontWeight: 800 }}>
//                       Booking Dates
//                     </Typography>
//                   </Box>
//                   <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
//                     Choose your rental start and return dates
//                   </Typography>

//                   <Paper
//                     elevation={0}
//                     sx={{
//                       p: 2,
//                       border: "1px solid #E2E8F0",
//                       borderRadius: 3,
//                       background: "#F8FAFC",
//                     }}
//                   >
//                     <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5, flexWrap: "wrap", gap: 1 }}>
//                       <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.secondary" }}>
//                         Select pickup and return dates
//                       </Typography>
//                       <Button
//                         size="small"
//                         variant="text"
//                         onClick={() => {
//                           if (id) fetchBookedDates(id, true);
//                         }}
//                         disabled={availabilityLoading || !id}
//                       >
//                         Refresh booked dates
//                       </Button>
//                     </Box>

//                     <LocalizationProvider dateAdapter={AdapterDayjs}>
//                       <DateCalendar
//                         value={form.endDate ? dayjs(form.endDate) : form.startDate ? dayjs(form.startDate) : null}
//                         onChange={handleCalendarDateSelection}
//                         disabled={!isCarBookable || submitting}
//                         minDate={today}
//                         shouldDisableDate={shouldDisableCalendarDate}
//                         sx={{
//                           width: "100%",
//                           maxWidth: 430,
//                           mx: "auto",
//                           ".MuiPickersDay-root.Mui-disabled": {
//                             backgroundColor: "#E2E8F0",
//                             color: "#64748B",
//                             opacity: 1,
//                           },
//                         }}
//                       />
//                     </LocalizationProvider>

//                     <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 2, alignItems: "center" }}>
//                       {[
//                         { label: "Available", color: "success" },
//                         { label: "Booked", color: "default" },
//                         { label: "Selected", color: "primary" },
//                         { label: "Today", color: "info" },
//                       ].map((item) => (
//                         <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
//                           <Box
//                             sx={{
//                               width: 12,
//                               height: 12,
//                               borderRadius: "50%",
//                               backgroundColor: item.color === "success" ? "#4caf50" : item.color === "default" ? "#cbd5e1" : item.color === "primary" ? "#1976d2" : "#90caf9",
//                             }}
//                           />
//                           <Typography variant="caption" sx={{ fontWeight: 600 }}>
//                             {item.label}
//                           </Typography>
//                         </Box>
//                       ))}
//                     </Box>

//                     {form.startDate || form.endDate ? (
//                       <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, backgroundColor: "#fff", border: "1px solid #E2E8F0" }}>
//                         <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block" }}>
//                           Selected range
//                         </Typography>
//                         <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>
//                           {form.startDate ? new Date(`${form.startDate}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
//                           {form.endDate ? ` → ${new Date(`${form.endDate}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}` : form.startDate ? " → Select return date" : ""}
//                         </Typography>
//                       </Box>
//                     ) : null}
//                   </Paper>
//                 </Box>

//                 {/* 2. Availability Live Indicator */}
//                 {areDatesValid && isCarBookable && (
//                   <Box sx={{ p: 2, bgcolor: "#F8FAFC", borderRadius: 3, border: "1px solid #E2E8F0" }}>
//                     <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>
//                       <Box>
//                         <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block" }}>
//                           LIVE AVAILABILITY STATUS
//                         </Typography>
//                         {availabilityLoading ? (
//                           <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
//                             <CircularProgress size={16} />
//                             <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.main" }}>
//                               Checking availability...
//                             </Typography>
//                           </Box>
//                         ) : currentAvailability ? (
//                           currentAvailability.available ? (
//                             <Chip
//                               size="small"
//                               icon={<CheckCircleIcon />}
//                               label="Available for selected dates"
//                               color="success"
//                               sx={{ fontWeight: 700, mt: 0.5 }}
//                             />
//                           ) : (
//                             <Chip
//                               size="small"
//                               icon={<CancelIcon />}
//                               label="Not available for selected dates"
//                               color="error"
//                               sx={{ fontWeight: 700, mt: 0.5 }}
//                             />
//                           )
//                         ) : (
//                           <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
//                             Click to verify real-time slot availability
//                           </Typography>
//                         )}
//                       </Box>

//                       <Button
//                         variant={currentAvailability ? "outlined" : "contained"}
//                         color="primary"
//                         size="small"
//                         onClick={handleCheckAvailability}
//                         disabled={availabilityLoading}
//                         startIcon={
//                           availabilityLoading ? (
//                             <CircularProgress size={14} color="inherit" />
//                           ) : (
//                             <EventAvailableIcon />
//                           )
//                         }
//                         sx={{ fontWeight: 600 }}
//                       >
//                         {availabilityLoading ? "Checking..." : currentAvailability ? "Re-check Availability" : "Check Availability"}
//                       </Button>
//                     </Box>

//                     {currentAvailability && !currentAvailability.available && (
//                       <Alert severity="error" sx={{ mt: 1.5, py: 0.5, borderRadius: 2 }}>
//                         {currentAvailability.message || "This car is already booked for these dates. Please select different dates."}
//                       </Alert>
//                     )}
//                   </Box>
//                 )}

//                 <Divider />

//                 {/* 3. Location Details */}
//                 <Box>
//                   <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
//                     Pickup & Drop-off Location
//                   </Typography>
//                   <Stack spacing={2.5}>
//                     <TextField
//                       required
//                       fullWidth
//                       id="pickupLocation"
//                       name="pickupLocation"
//                       label="Pickup Location"
//                       placeholder="e.g. Airport, Railway Station, or Landmark Address"
//                       value={form.pickupLocation}
//                       onChange={handleChange}
//                       disabled={!isCarBookable || submitting}
//                       helperText="Specify where you wish to pick up the vehicle"
//                       InputProps={{
//                         startAdornment: (
//                           <InputAdornment position="start">
//                             <LocationOnIcon color="action" fontSize="small" />
//                           </InputAdornment>
//                         ),
//                       }}
//                     />

//                     <TextField
//                       fullWidth
//                       id="dropLocation"
//                       name="dropLocation"
//                       label="Drop-off Location (Optional)"
//                       placeholder="Same as pickup location if left blank"
//                       value={form.dropLocation}
//                       onChange={handleChange}
//                       disabled={!isCarBookable || submitting}
//                       helperText="Optional alternate return location"
//                       InputProps={{
//                         startAdornment: (
//                           <InputAdornment position="start">
//                             <LocationOnIcon color="action" fontSize="small" />
//                           </InputAdornment>
//                         ),
//                       }}
//                     />
//                   </Stack>
//                 </Box>

//                 <Divider />

//                 {/* 4. Payment Method Selection Section */}
//                 <Box>
//                   <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
//                     <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                       <PaymentIcon sx={{ color: "primary.main", fontSize: 24 }} />
//                       <Typography variant="h6" sx={{ fontWeight: 800 }}>
//                         Payment Method
//                       </Typography>
//                     </Box>
//                     <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
//                       <LockOutlinedIcon sx={{ fontSize: 16 }} />
//                       <Typography variant="caption" sx={{ fontWeight: 600 }}>
//                         256-Bit Secure
//                       </Typography>
//                     </Box>
//                   </Box>
//                   <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
//                     Choose your preferred payment method
//                   </Typography>

//                   <RadioGroup
//                     value={paymentMethod}
//                     onChange={(e) => setPaymentMethod(e.target.value)}
//                     name="paymentMethod"
//                   >
//                     <Stack spacing={2}>
//                       {/* Option 1: Pay Online (Razorpay) */}
//                       <Paper
//                         elevation={0}
//                         onClick={() => !submitting && setPaymentMethod("ONLINE")}
//                         sx={{
//                           p: 2.5,
//                           borderRadius: 3,
//                           border: paymentMethod === "ONLINE" ? "2px solid #1E3A8A" : "1px solid #E2E8F0",
//                           bgcolor: paymentMethod === "ONLINE" ? "rgba(30, 58, 138, 0.03)" : "#FFFFFF",
//                           cursor: submitting ? "not-allowed" : "pointer",
//                           transition: "all 0.2s ease",
//                           "&:hover": {
//                             borderColor: "#1E3A8A",
//                           },
//                         }}
//                       >
//                         <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
//                           <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
//                             <Radio
//                               checked={paymentMethod === "ONLINE"}
//                               value="ONLINE"
//                               disabled={submitting}
//                               sx={{ p: 0.5, mt: 0.25 }}
//                             />
//                             <Box>
//                               <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
//                                 <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
//                                   Pay Online
//                                 </Typography>
//                                 <Chip
//                                   label="Razorpay Secure"
//                                   size="small"
//                                   color="primary"
//                                   sx={{ fontWeight: 700, height: 20, fontSize: "0.7rem" }}
//                                 />
//                               </Box>
//                               <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
//                                 Pay securely using Credit/Debit Cards, UPI, NetBanking, or Digital Wallets
//                               </Typography>
//                             </Box>
//                           </Box>
//                           <CreditCardIcon sx={{ color: "primary.main", fontSize: 28, display: { xs: "none", sm: "block" } }} />
//                         </Box>
//                       </Paper>

//                       {/* Option 2: Cash on Delivery / Pay at Pickup */}
//                       <Paper
//                         elevation={0}
//                         onClick={() => !submitting && setPaymentMethod("COD")}
//                         sx={{
//                           p: 2.5,
//                           borderRadius: 3,
//                           border: paymentMethod === "COD" ? "2px solid #D97706" : "1px solid #E2E8F0",
//                           bgcolor: paymentMethod === "COD" ? "rgba(217, 119, 6, 0.03)" : "#FFFFFF",
//                           cursor: submitting ? "not-allowed" : "pointer",
//                           transition: "all 0.2s ease",
//                           "&:hover": {
//                             borderColor: "#D97706",
//                           },
//                         }}
//                       >
//                         <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
//                           <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
//                             <Radio
//                               checked={paymentMethod === "COD"}
//                               value="COD"
//                               disabled={submitting}
//                               sx={{
//                                 p: 0.5,
//                                 mt: 0.25,
//                                 color: "#D97706",
//                                 "&.Mui-checked": { color: "#D97706" },
//                               }}
//                             />
//                             <Box>
//                               <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
//                                 <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
//                                   Pay at Pickup (COD)
//                                 </Typography>
//                                 <Chip
//                                   label="Zero Advance"
//                                   size="small"
//                                   color="warning"
//                                   sx={{ fontWeight: 700, height: 20, fontSize: "0.7rem" }}
//                                 />
//                               </Box>
//                               <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
//                                 Pay the full rental fee directly to the host when you collect the car keys
//                               </Typography>
//                             </Box>
//                           </Box>
//                           <LocalAtmIcon sx={{ color: "#D97706", fontSize: 28, display: { xs: "none", sm: "block" } }} />
//                         </Box>
//                       </Paper>
//                     </Stack>
//                   </RadioGroup>
//                 </Box>

//                 <Divider />

//                 {/* 5. Booking Summary Card — Premium */}
//                 <Box
//                   sx={{
//                     borderRadius: 3.5,
//                     border: "1px solid #E2E8F0",
//                     overflow: "hidden",
//                   }}
//                 >
//                   {/* Header */}
//                   <Box
//                     sx={{
//                       px: 3,
//                       py: 1.75,
//                       bgcolor: "#F8FAFC",
//                       borderBottom: "1px solid #E2E8F0",
//                     }}
//                   >
//                     <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "text.primary" }}>
//                       Booking Summary
//                     </Typography>
//                     <Typography variant="caption" color="text.secondary">
//                       {car.brand} {car.model}
//                     </Typography>
//                   </Box>

//                   <Box sx={{ px: 3, py: 2.5 }}>
//                     {areDatesValid && numberOfDays > 0 ? (
//                       <Stack spacing={1.5}>
//                         {/* Row: price per day */}
//                         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                           <Typography variant="body2" color="text.secondary">Price per day</Typography>
//                           <Typography variant="body2" sx={{ fontWeight: 700 }}>
//                             ₹{pricePerDay.toLocaleString("en-IN")}
//                           </Typography>
//                         </Box>

//                         {/* Row: rental days */}
//                         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                           <Typography variant="body2" color="text.secondary">Rental days</Typography>
//                           <Box
//                             sx={{
//                               px: 1.5,
//                               py: 0.25,
//                               bgcolor: "primary.50",
//                               borderRadius: 1,
//                               border: "1px solid",
//                               borderColor: "primary.100",
//                             }}
//                           >
//                             <Typography
//                               variant="body2"
//                               sx={{ fontWeight: 800, color: "primary.main", lineHeight: 1.6 }}
//                             >
//                               {numberOfDays} {numberOfDays === 1 ? "day" : "days"}
//                             </Typography>
//                           </Box>
//                         </Box>

//                         {/* Row: payment method */}
//                         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                           <Typography variant="body2" color="text.secondary">Payment</Typography>
//                           <StatusChip status={paymentMethod} />
//                         </Box>

//                         {/* Row: availability */}
//                         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                           <Typography variant="body2" color="text.secondary">Availability</Typography>
//                           {currentAvailability?.available ? (
//                             <Box
//                               sx={{
//                                 display: "flex",
//                                 alignItems: "center",
//                                 gap: 0.5,
//                                 color: "success.main",
//                               }}
//                             >
//                               <CheckCircleIcon sx={{ fontSize: 14 }} />
//                               <Typography variant="caption" sx={{ fontWeight: 700 }}>Confirmed</Typography>
//                             </Box>
//                           ) : (
//                             <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
//                               Check above
//                             </Typography>
//                           )}
//                         </Box>

//                         <Divider sx={{ my: 0.5 }} />

//                         {/* Total — emphasized */}
//                         <Box
//                           sx={{
//                             display: "flex",
//                             justifyContent: "space-between",
//                             alignItems: "center",
//                             px: 2,
//                             py: 1.5,
//                             borderRadius: 2.5,
//                             background:
//                               "linear-gradient(135deg, rgba(30,58,138,0.07) 0%, rgba(99,102,241,0.07) 100%)",
//                             border: "1px solid rgba(99,102,241,0.15)",
//                           }}
//                         >
//                           <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
//                             Total Amount
//                           </Typography>
//                           <Box sx={{ textAlign: "right" }}>
//                             <Typography
//                               variant="h4"
//                               sx={{ fontWeight: 900, color: "primary.main", lineHeight: 1.1 }}
//                             >
//                               ₹{totalAmount.toLocaleString("en-IN")}
//                             </Typography>
//                             <Typography variant="caption" color="text.secondary">
//                               ₹{pricePerDay.toLocaleString("en-IN")} &times; {numberOfDays}{" "}
//                               {numberOfDays === 1 ? "day" : "days"}
//                             </Typography>
//                           </Box>
//                         </Box>
//                       </Stack>
//                     ) : (
//                       <Box sx={{ py: 2, textAlign: "center" }}>
//                         <Typography variant="body2" color="text.secondary">
//                           Select valid pickup and return dates to see the rental total.
//                         </Typography>
//                       </Box>
//                     )}
//                   </Box>
//                 </Box>

//                 {/* Submit / Pay Button */}
//                 <Button
//                   type="submit"
//                   variant="contained"
//                   color={paymentMethod === "ONLINE" ? "primary" : "secondary"}
//                   size="large"
//                   disabled={isBookingDisabled}
//                   startIcon={
//                     submitting ? (
//                       <CircularProgress size={20} color="inherit" />
//                     ) : paymentMethod === "ONLINE" ? (
//                       <PaymentIcon />
//                     ) : (
//                       <LocalAtmIcon />
//                     )
//                   }
//                   sx={{
//                     py: 1.6,
//                     fontWeight: 800,
//                     fontSize: "1.05rem",
//                     borderRadius: 3,
//                   }}
//                 >
//                   {submitting
//                     ? processingMessage || "Processing..."
//                     : !areDatesValid
//                     ? "Select Valid Dates"
//                     : !currentAvailability || !currentAvailability.available
//                     ? "Check Availability to Book"
//                     : paymentMethod === "ONLINE"
//                     ? `Pay ₹${totalAmount.toLocaleString("en-IN")} with Razorpay`
//                     : `Confirm Booking (Pay ₹${totalAmount.toLocaleString("en-IN")} at Pickup)`}
//                 </Button>

//                 {submitting && processingMessage && (
//                   <Typography
//                     variant="caption"
//                     color="text.secondary"
//                     sx={{ textAlign: "center", fontWeight: 600, display: "block" }}
//                   >
//                     🔒 {processingMessage}
//                   </Typography>
//                 )}
//               </Stack>
//             </Box>
//           </Paper>
//         </Grid>
//       </Grid>
//     </Container>
//   );
// }
