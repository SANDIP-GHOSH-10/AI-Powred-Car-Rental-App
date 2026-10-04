import { useContext, useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
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

import LocationOnIcon from "@mui/icons-material/LocationOn";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import SettingsIcon from "@mui/icons-material/Settings";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";

import api from "../../api/axios.js";
import { AuthContext } from "../../context/Auth.jsx";
import StatusChip from "../../components/StatusChip.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import Loader from "../../components/Loader.jsx";
import EmptyState from "../../components/EmptyState.jsx";

// -------------------------------------------------------
// SECTION HEADING — icon-in-circle + title, reused across
// the description and features blocks for a consistent
// visual rhythm with the spec tiles below.
// -------------------------------------------------------
function SectionHeading({ icon, title }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ mb: 2.25, alignItems: "center" }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          bgcolor: "rgba(30, 58, 138, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "primary.main",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", fontSize: "1.1rem" }}>
        {title}
      </Typography>
    </Stack>
  );
}

// -------------------------------------------------------
// SPEC TILE — icon-in-circle + label/value, matches the
// pill language used on CarCard for visual consistency
// -------------------------------------------------------
function SpecTile({ icon, label, value }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        p: 1.5,
        bgcolor: "#F8FAFC",
        borderRadius: 2.5,
        border: "1px solid #F1F5F9",
        height: "100%",
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          bgcolor: "rgba(30, 58, 138, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: "primary.main",
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block" }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }} noWrap>
          {value || "N/A"}
        </Typography>
      </Box>
    </Box>
  );
}

// -------------------------------------------------------
// FEATURE PILL — custom pill (not MUI Chip) so the label
// can wrap and never overflow its container. MUI Chip sets
// white-space: nowrap on its label internally, which is
// what was pushing long feature names outside the card.
// -------------------------------------------------------
function FeaturePill({ label }) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.85,
        maxWidth: "100%",
        bgcolor: "rgba(30, 58, 138, 0.05)",
        border: "1px solid #DBEAFE",
        borderRadius: 2.5,
        pl: 0.85,
        pr: 1.5,
        py: 0.75,
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          bgcolor: "rgba(30, 58, 138, 0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <CheckCircleIcon sx={{ fontSize: 13, color: "primary.main" }} />
      </Box>
      <Typography
        sx={{
          fontSize: "0.84rem",
          fontWeight: 600,
          color: "#1E293B",
          whiteSpace: "normal",
          wordBreak: "break-word",
          lineHeight: 1.35,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

export default function CarDetails() {
  const { id } = useParams();
  const { user, isLoggedIn } = useContext(AuthContext);

  const [car, setCar] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isCustomer = Array.isArray(user?.roles) && user.roles.includes("CUSTOMER");

  useEffect(() => {
    fetchCar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchCar = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(`/cars/${id}`);
      setCar(response.data.car || response.data);
      setSelectedImageIndex(0);
    } catch (err) {
      console.error("Error fetching car:", err);
      setError(err.response?.data?.error || "Unable to fetch car details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader message="Loading vehicle specifications..." minHeight="60vh" />;
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button component={RouterLink} to="/cars" startIcon={<ArrowBackIcon />} variant="outlined">
          Back to Cars
        </Button>
      </Container>
    );
  }

  if (!car) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <EmptyState
          title="Car Not Found"
          description="The requested car could not be located in our system."
          actionText="Browse Available Cars"
          actionLink="/cars"
          actionIcon={<ArrowBackIcon />}
        />
      </Container>
    );
  }

  // Process Images
  const rawImages = Array.isArray(car.images) ? car.images : [];
  const imageUrls = rawImages
    .map((img) => (typeof img === "string" ? img : img.url))
    .filter(Boolean);

  const activeImageUrl = imageUrls[selectedImageIndex] || imageUrls[0] || null;

  const locationText = [car.location?.city, car.location?.state, car.location?.pincode]
    .filter(Boolean)
    .join(", ");

  const specs = [
    { label: "Manufacturing Year", value: car.year, icon: <CalendarTodayIcon fontSize="small" /> },
    { label: "Transmission", value: car.transmission, icon: <SettingsIcon fontSize="small" /> },
    { label: "Fuel Type", value: car.fuelType, icon: <LocalGasStationIcon fontSize="small" /> },
    { label: "Seating Capacity", value: `${car.seats} Seats`, icon: <EventSeatIcon fontSize="small" /> },
    { label: "Body Type", value: car.type || "Standard", icon: <DirectionsCarIcon fontSize="small" /> },
    { label: "Location", value: locationText || "Flexible Pickup", icon: <LocationOnIcon fontSize="small" /> },
  ];

  return (
    <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
        {/* Header with Breadcrumbs */}
        <PageHeader
          title={`${car.brand} ${car.model}`}
          subtitle={`${car.year} • ${car.type || "Self-Drive Car"}`}
          breadcrumbs={[
            { label: "Home", to: "/" },
            { label: "Cars", to: "/cars" },
            { label: `${car.brand} ${car.model}` },
          ]}
          action={
            <Button
              component={RouterLink}
              to="/cars"
              startIcon={<ArrowBackIcon />}
              variant="outlined"
              size="medium"
              sx={{ bgcolor: "#FFFFFF" }}
            >
              All Cars
            </Button>
          }
        />

        <Grid container spacing={4}>
          {/* ==================================================
              LEFT COLUMN: IMAGE GALLERY
          ================================================== */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card
              sx={{
                borderRadius: 4,
                overflow: "hidden",
                bgcolor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                boxShadow: "0 12px 28px -8px rgba(15, 23, 42, 0.12)",
                mb: 2.5,
              }}
            >
              {activeImageUrl ? (
                <CardMedia
                  component="img"
                  image={activeImageUrl}
                  alt={`${car.brand} ${car.model}`}
                  sx={{
                    width: "100%",
                    height: { xs: 260, sm: 380, md: 460 },
                    objectFit: "cover",
                  }}
                />
              ) : (
                <Box
                  sx={{
                    height: { xs: 260, sm: 380, md: 460 },
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "text.secondary",
                  }}
                >
                  <DirectionsCarIcon sx={{ fontSize: 80, mb: 1, opacity: 0.4 }} />
                  <Typography variant="body1">No preview image available</Typography>
                </Box>
              )}
            </Card>

            {/* Image Thumbnails Strip */}
            {imageUrls.length > 1 && (
              <Stack direction="row" spacing={1.25} sx={{ overflowX: "auto", pb: 1, mb: 0.5 }}>
                {imageUrls.map((url, index) => (
                  <Box
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    role="button"
                    aria-label={`View photo ${index + 1}`}
                    sx={{
                      width: 84,
                      height: 62,
                      borderRadius: 2,
                      overflow: "hidden",
                      cursor: "pointer",
                      flexShrink: 0,
                      border: "2px solid",
                      borderColor: selectedImageIndex === index ? "primary.main" : "transparent",
                      transition: "all 0.2s ease",
                      opacity: selectedImageIndex === index ? 1 : 0.65,
                      "&:hover": { opacity: 1 },
                    }}
                  >
                    <Box
                      component="img"
                      src={url}
                      alt={`Thumbnail ${index + 1}`}
                      sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </Box>
                ))}
              </Stack>
            )}

            {/* Description Section */}
            <Paper
              elevation={0}
              sx={{
                p: 3.5,
                mt: 2.5,
                borderRadius: 3.5,
                border: "1px solid #E2E8F0",
                bgcolor: "#FFFFFF",
                overflow: "hidden",
              }}
            >
              <SectionHeading icon={<DescriptionOutlinedIcon fontSize="small" />} title="Vehicle Description" />
              <Box
                sx={{
                  borderLeft: "3px solid",
                  borderColor: "rgba(245, 158, 11, 0.55)",
                  pl: 2.5,
                }}
              >
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ lineHeight: 1.85, fontSize: "0.98rem" }}
                >
                  {car.description ||
                    "No specific description provided by host. Vehicle is in clean and verified condition."}
                </Typography>
              </Box>
            </Paper>

            {/* Features Section */}
            {Array.isArray(car.features) && car.features.length > 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 3.5,
                  mt: 2.5,
                  borderRadius: 3.5,
                  border: "1px solid #E2E8F0",
                  bgcolor: "#FFFFFF",
                  overflow: "hidden",
                }}
              >
                <SectionHeading icon={<AutoAwesomeOutlinedIcon fontSize="small" />} title="Key Features & Amenities" />
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {car.features.map((feat, idx) => (
                    <FeaturePill key={idx} label={feat} />
                  ))}
                </Box>
              </Paper>
            )}
          </Grid>

          {/* ==================================================
              RIGHT COLUMN: SPECS & BOOKING CARD
          ================================================== */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: 4,
                border: "1px solid #E2E8F0",
                bgcolor: "#FFFFFF",
                boxShadow: "0 12px 28px -10px rgba(15, 23, 42, 0.10)",
                position: { md: "sticky" },
                top: { md: 90 },
              }}
            >
              {/* Price & Status Header */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Rental rate
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: "primary.main" }}>
                      ₹{Number(car.pricePerDay || 0).toLocaleString("en-IN")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      / day
                    </Typography>
                  </Box>
                </Box>
                <StatusChip status={car.status} size="medium" />
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Specifications Grid */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: "text.primary" }}>
                Key Specifications
              </Typography>
              <Grid container spacing={1.5} sx={{ mb: 3 }}>
                {specs.map((item, index) => (
                  <Grid size={{ xs: 6, sm: 4, md: 6 }} key={index}>
                    <SpecTile icon={item.icon} label={item.label} value={item.value} />
                  </Grid>
                ))}
              </Grid>

              {/* Trust Assurance Banner */}
              <Box
                sx={{
                  p: 2,
                  mb: 3,
                  bgcolor: "rgba(16, 185, 129, 0.08)",
                  borderRadius: 2.5,
                  border: "1px solid #A7F3D0",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <ShieldOutlinedIcon sx={{ color: "#059669", fontSize: 28, flexShrink: 0 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#065F46" }}>
                    Verified & Sanitized
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#047857" }}>
                    Includes 24/7 roadside assistance & complete inspection.
                  </Typography>
                </Box>
              </Box>

              {/* Booking CTA Button */}
              {car.status === "AVAILABLE" ? (
                isLoggedIn ? (
                  isCustomer ? (
                    <Button
                      component={RouterLink}
                      to={`/customer/book/${car._id}`}
                      variant="contained"
                      color="secondary"
                      fullWidth
                      size="large"
                      startIcon={<BookOnlineIcon />}
                      sx={{ py: 1.6, fontWeight: 700, fontSize: "1.05rem", borderRadius: 2.5 }}
                    >
                      Proceed to Book Car
                    </Button>
                  ) : (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      You are logged in as a host/admin. Switch to a customer profile to book vehicles.
                    </Alert>
                  )
                ) : (
                  <Stack spacing={1.5}>
                    <Button
                      component={RouterLink}
                      to="/login"
                      variant="contained"
                      color="primary"
                      fullWidth
                      size="large"
                      startIcon={<BookOnlineIcon />}
                      sx={{ py: 1.6, fontWeight: 700, borderRadius: 2.5 }}
                    >
                      Sign In to Book This Car
                    </Button>
                    <Typography variant="caption" color="text.secondary" align="center">
                      New user?{" "}
                      <RouterLink to="/register" style={{ color: "#1E3A8A", fontWeight: 700 }}>
                        Create an account
                      </RouterLink>
                    </Typography>
                  </Stack>
                )
              ) : (
                <Alert severity="warning" sx={{ fontWeight: 600 }}>
                  This vehicle is currently not available for reservation.
                </Alert>
              )}
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}