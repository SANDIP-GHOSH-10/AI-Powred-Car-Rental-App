import { useContext, useState, useMemo, useEffect } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Pagination from "@mui/material/Pagination";
import { Link as RouterLink } from "react-router-dom";

import SearchIcon from "@mui/icons-material/Search";
import TimeToLeaveIcon from "@mui/icons-material/TimeToLeave";
import SecurityIcon from "@mui/icons-material/Security";
import BoltIcon from "@mui/icons-material/Bolt";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PaymentIcon from "@mui/icons-material/Payment";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import RefreshIcon from "@mui/icons-material/Refresh";

import { AppContext } from "../../context/AppContext.jsx";
import CarCard from "../../components/CarCard.jsx";
import SectionHeader from "../../components/SectionHeader.jsx";
import HowItWorksCard from "../../components/HowItWorksCard.jsx";
import FeatureCard from "../../components/FeatureCard.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { CarCardSkeleton } from "../../components/SkeletonLoader.jsx";

const CARS_PER_PAGE = 3;

export default function Home() {
  const { cars, carsLoading, fetchCars } = useContext(AppContext);
  const [featuredPage, setFeaturedPage] = useState(1);

  // Filter available cars for the featured section
  const availableCars = useMemo(() => {
    return cars.filter((c) => c.status === "AVAILABLE");
  }, [cars]);

  // Frontend pagination calculation
  const totalFeaturedPages = Math.ceil(availableCars.length / CARS_PER_PAGE) || 1;

  // Reset page if car count shrinks and exceeds current page
  useEffect(() => {
    if (featuredPage > totalFeaturedPages && totalFeaturedPages > 0) {
      setFeaturedPage(1);
    }
  }, [availableCars.length, totalFeaturedPages, featuredPage]);

  const paginatedFeaturedCars = useMemo(() => {
    const startIdx = (featuredPage - 1) * CARS_PER_PAGE;
    return availableCars.slice(startIdx, startIdx + CARS_PER_PAGE);
  }, [availableCars, featuredPage]);

  const handleFeaturedPageChange = (event, value) => {
    setFeaturedPage(value);
  };

  // How It Works Steps Data (4 distinct side-by-side steps)
  const steps = [
    {
      stepNumber: "01",
      icon: <SearchIcon sx={{ fontSize: 28 }} />,
      title: "Search Car",
      description: "Browse verified sedans, SUVs, and hatchbacks tailored to your budget and travel style.",
    },
    {
      stepNumber: "02",
      icon: <CalendarMonthIcon sx={{ fontSize: 28 }} />,
      title: "Select Dates",
      description: "Pick your schedule with real-time AI date conflict detection for zero booking overlaps.",
    },
    {
      stepNumber: "03",
      icon: <PaymentIcon sx={{ fontSize: 28 }} />,
      title: "Book Car",
      description: "Reserve with transparent pricing, instant host approval tracking, and zero hidden costs.",
    },
    {
      stepNumber: "04",
      icon: <DirectionsCarIcon sx={{ fontSize: 28 }} />,
      title: "Drive Away",
      description: "Pick up your sanitized vehicle and experience total self-drive freedom across the country.",
    },
  ];

  // Why Choose Features (2x2 Grid)
  const features = [
    {
      icon: <BoltIcon sx={{ fontSize: 28 }} />,
      title: "AI-Powered Search",
      description: "Smart booking verification protects you against date clashes and ensures fleet readiness.",
      badge: "Smart AI",
    },
    {
      icon: <LocalOfferIcon sx={{ fontSize: 28 }} />,
      title: "Best Price Guarantee",
      description: "Transparent daily rental rates with instant breakdowns and zero hidden charges at checkout.",
      badge: "Best Value",
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 28 }} />,
      title: "Verified Cars & Hosts",
      description: "Every listed car passes strict document checks and inspection before being made available.",
      badge: "100% Verified",
    },
    {
      icon: <SupportAgentIcon sx={{ fontSize: 28 }} />,
      title: "Flexible Booking & 24/7 Support",
      description: "Enjoy flexible trip adjustments with round-the-clock roadside and customer support.",
      badge: "24/7 Care",
    },
  ];

  const popularLocations = [
    "Kolkata",
    "Mumbai",
    "Delhi NCR",
    "Bangalore",
    "Hyderabad",
    "Goa",
    "Pune",
    "Chennai",
  ];

  return (
    <Box>
      {/* ==================================================
          1. HERO SECTION
      ================================================== */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 60%, #1E40AF 100%)",
          color: "#FFFFFF",
          pt: { xs: 8, md: 12 },
          pb: { xs: 10, md: 14 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow Spheres */}
        <Box
          sx={{
            position: "absolute",
            top: -120,
            right: -100,
            width: 450,
            height: 450,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0) 70%)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -90,
            left: -80,
            width: 350,
            height: 350,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245, 158, 11, 0.22) 0%, rgba(245, 158, 11, 0) 70%)",
            pointerEvents: "none",
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={6} sx={{ alignItems: "center" }}>
            {/* Left Hero Text */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack direction="row" spacing={1} sx={{ mb: 2.5, alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                <Chip
                  icon={<VerifiedUserIcon sx={{ fontSize: "1rem !important", color: "#F59E0B !important" }} />}
                  label="Verified Self-Drive Fleet"
                  sx={{
                    bgcolor: "rgba(245, 158, 11, 0.18)",
                    color: "#FDE68A",
                    fontWeight: 700,
                    border: "1px solid rgba(245, 158, 11, 0.35)",
                    px: 1,
                  }}
                />
                <Chip
                  label="Instant Live Availability"
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.12)",
                    color: "#FFFFFF",
                    fontWeight: 600,
                  }}
                />
              </Stack>

              <Typography
                variant="h1"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "2.5rem", sm: "3.25rem", md: "3.75rem" },
                  lineHeight: 1.15,
                  mb: 2.5,
                  letterSpacing: "-0.02em",
                }}
              >
                Rent Your <Box component="span" sx={{ color: "#F59E0B" }}>Perfect Car</Box> Anytime, Anywhere
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  color: "#CBD5E1",
                  fontWeight: 400,
                  lineHeight: 1.6,
                  mb: 4,
                  maxWidth: 580,
                  fontSize: { xs: "1rem", md: "1.15rem" },
                }}
              >
                Explore wide collections of verified cars from reliable local hosts. Flexible dates, instant availability check, and seamless self-drive booking.
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                <Button
                  component={RouterLink}
                  to="/cars"
                  variant="contained"
                  color="secondary"
                  size="large"
                  startIcon={<SearchIcon />}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    py: 1.6,
                    px: 3.5,
                    fontSize: "1rem",
                    fontWeight: 700,
                    boxShadow: "0 10px 25px rgba(245, 158, 11, 0.35)",
                  }}
                >
                  Browse Cars
                </Button>
                <Button
                  component={RouterLink}
                  to="/host/cars/add"
                  variant="outlined"
                  size="large"
                  startIcon={<TimeToLeaveIcon />}
                  sx={{
                    py: 1.6,
                    px: 3.5,
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "#FFFFFF",
                    borderColor: "rgba(255, 255, 255, 0.4)",
                    "&:hover": {
                      borderColor: "#FFFFFF",
                      bgcolor: "rgba(255, 255, 255, 0.08)",
                    },
                  }}
                >
                  Become a Host
                </Button>
              </Stack>
            </Grid>

            {/* Right Hero Trust Guarantee Card */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, sm: 3.5 },
                  borderRadius: 4,
                  bgcolor: "rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(255, 255, 255, 0.16)",
                  color: "#FFFFFF",
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, fontFamily: "Outfit, Inter, sans-serif" }}>
                  Why Travelers Choose Us
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                    <CheckCircleOutlineIcon sx={{ color: "#10B981", mt: 0.2 }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#FFFFFF" }}>
                        Verified Car Documents & Host Inspections
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#CBD5E1" }}>
                        Every vehicle is vetted for safety, cleanliness, and roadworthiness.
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                    <CheckCircleOutlineIcon sx={{ color: "#10B981", mt: 0.2 }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#FFFFFF" }}>
                        Real-Time AI Date Validation
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#CBD5E1" }}>
                        Instant schedule checks guarantee zero double-bookings.
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                    <CheckCircleOutlineIcon sx={{ color: "#10B981", mt: 0.2 }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#FFFFFF" }}>
                        Sanitized Cars & Flexible Pickup
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#CBD5E1" }}>
                        Convenient citywide pickup locations and flexible self-drive options.
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                    <CheckCircleOutlineIcon sx={{ color: "#10B981", mt: 0.2 }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#FFFFFF" }}>
                        Transparent Pricing & 24/7 Support
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#CBD5E1" }}>
                        No hidden surprises at checkout and emergency assistance always on standby.
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ==================================================
          2. FEATURED CARS SECTION (3 per row, with pagination)
      ================================================== */}
      <Box sx={{ bgcolor: "#FFFFFF", py: { xs: 7, md: 10 }, borderBottom: "1px solid #E2E8F0" }}>
        <Container maxWidth="lg">
          <SectionHeader
            overline="POPULAR FLEET"
            title="Explore Our Featured Cars"
            subtitle="Choose from top-rated, sanitized, and verified vehicles ready for your next self-drive journey."
            action={
              <Button
                component={RouterLink}
                to="/cars"
                variant="outlined"
                color="primary"
                endIcon={<ArrowForwardIcon />}
                sx={{ fontWeight: 700 }}
              >
                View All Cars ({cars.length})
              </Button>
            }
          />

          {carsLoading ? (
            <CarCardSkeleton count={3} />
          ) : availableCars.length === 0 ? (
            <EmptyState
              title="No Featured Cars Available"
              description="There are currently no available cars in our featured fleet. Check back soon or refresh."
              actionText="Refresh Fleet"
              onAction={fetchCars}
              actionIcon={<RefreshIcon />}
            />
          ) : (
            <>
              {/* Exactly 3 cards in one row on desktop */}
              <Grid container spacing={3.5} sx={{ alignItems: "stretch" }}>
                {paginatedFeaturedCars.map((car) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={car._id}>
                    <CarCard car={car} variant="vertical" />
                  </Grid>
                ))}
              </Grid>

              {/* Frontend Pagination (3 cars per page) */}
              {totalFeaturedPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 5 }}>
                  <Pagination
                    count={totalFeaturedPages}
                    page={featuredPage}
                    onChange={handleFeaturedPageChange}
                    color="primary"
                    size="large"
                    shape="rounded"
                  />
                </Box>
              )}
            </>
          )}
        </Container>
      </Box>

      {/* ==================================================
          3. HOW IT WORKS (4 steps side-by-side)
      ================================================== */}
      <Box sx={{ bgcolor: "#F8FAFC", py: { xs: 7, md: 10 } }}>
        <Container maxWidth="lg">
          <SectionHeader
            overline="SIMPLE PROCESS"
            title="How It Works"
            subtitle="Rent your car in 4 easy steps with our hassle-free, automated booking system."
            align="center"
          />

          {/* 4 columns on desktop, 2 on tablet, 1 on mobile */}
          <Grid container spacing={3.5} sx={{ alignItems: "stretch" }}>
            {steps.map((step, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={step.stepNumber}>
                <HowItWorksCard
                  stepNumber={step.stepNumber}
                  icon={step.icon}
                  title={step.title}
                  description={step.description}
                  isLast={index === steps.length - 1}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ==================================================
          4. WHY CHOOSE AI CAR RENTAL (Side-by-side 40/60 layout)
      ================================================== */}
      <Box sx={{ bgcolor: "#FFFFFF", py: { xs: 7, md: 10 }, borderTop: "1px solid #E2E8F0" }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 5, md: 6 }} sx={{ alignItems: "center" }}>
            {/* Left Side (~40% on desktop) */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Typography
                variant="overline"
                sx={{
                  color: "primary.main",
                  fontWeight: 800,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  fontSize: "0.78rem",
                  display: "inline-block",
                  mb: 0.5,
                }}
              >
                THE AI ADVANTAGE
              </Typography>
              <Typography
                variant="h3"
                component="h2"
                sx={{
                  fontWeight: 800,
                  color: "text.primary",
                  letterSpacing: "-0.02em",
                  fontSize: { xs: "1.85rem", sm: "2.3rem", md: "2.6rem" },
                  lineHeight: 1.2,
                  mb: 2,
                }}
              >
                Why Choose <Box component="span" sx={{ color: "primary.main" }}>AI Car Rental?</Box>
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ fontSize: { xs: "0.95rem", md: "1.05rem" }, lineHeight: 1.7, mb: 4 }}
              >
                We blend smart AI validation with a premium fleet of verified cars and trusted local hosts to provide you with the most seamless self-drive car rental experience.
              </Typography>

              {/* Supporting Highlight Box */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3.5,
                  bgcolor: "rgba(30, 58, 138, 0.04)",
                  border: "1px solid #DBEAFE",
                }}
              >
                <Stack spacing={1.5}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <CheckCircleOutlineIcon sx={{ color: "primary.main" }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                      Zero Double-Booking Guarantee
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <CheckCircleOutlineIcon sx={{ color: "primary.main" }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                      Doorstep Delivery & Flexible Pickup Points
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <CheckCircleOutlineIcon sx={{ color: "primary.main" }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                      100% Transparent Billing With Instant Invoice
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            {/* Right Side: 2x2 Feature Grid (~60% on desktop) */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Grid container spacing={2.5}>
                {features.map((feature, i) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={i}>
                    <FeatureCard
                      icon={feature.icon}
                      title={feature.title}
                      description={feature.description}
                      badge={feature.badge}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ==================================================
          5. POPULAR LOCATIONS
      ================================================== */}
      <Box sx={{ bgcolor: "#F8FAFC", py: { xs: 6, md: 8 }, borderTop: "1px solid #E2E8F0" }}>
        <Container maxWidth="lg">
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, textAlign: "center" }}>
            Popular Rental Locations
          </Typography>
          <Stack
            direction="row"
            spacing={1.5}
            useFlexGap
            sx={{ flexWrap: "wrap", justifyContent: "center" }}
          >
            {popularLocations.map((loc) => (
              <Chip
                key={loc}
                icon={<LocationOnIcon sx={{ fontSize: "1.05rem" }} />}
                label={loc}
                component={RouterLink}
                to="/cars"
                clickable
                variant="outlined"
                sx={{
                  px: 1.5,
                  py: 2.2,
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  borderRadius: 3,
                  bgcolor: "#FFFFFF",
                  borderColor: "#CBD5E1",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "primary.main",
                    color: "#FFFFFF",
                    borderColor: "primary.main",
                    "& .MuiChip-icon": { color: "#FFFFFF" },
                  },
                }}
              />
            ))}
          </Stack>
        </Container>
      </Box>

      {/* ==================================================
          6. BOTTOM CALL TO ACTION
      ================================================== */}
      <Container maxWidth="lg" sx={{ py: { xs: 7, md: 9 } }}>
        <Card
          elevation={0}
          sx={{
            background: "linear-gradient(135deg, #1E3A8A 0%, #172554 100%)",
            color: "#FFFFFF",
            p: { xs: 4, sm: 6 },
            borderRadius: 4,
            textAlign: "center",
            boxShadow: "0 20px 40px rgba(30, 58, 138, 0.25)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: "1.75rem", sm: "2.35rem" } }}>
            Ready to Start Your Journey?
          </Typography>
          <Typography variant="body1" sx={{ color: "#CBD5E1", maxWidth: 520, mx: "auto", mb: 4, fontSize: "1.05rem" }}>
            Explore verified cars at unbeatable daily prices. Book in seconds and drive with complete confidence and safety.
          </Typography>
          <Button
            component={RouterLink}
            to="/cars"
            variant="contained"
            color="secondary"
            size="large"
            sx={{
              px: 4.5,
              py: 1.6,
              fontSize: "1.05rem",
              fontWeight: 700,
              boxShadow: "0 10px 25px rgba(245, 158, 11, 0.4)",
            }}
          >
            Find a Car Now
          </Button>
        </Card>
      </Container>
    </Box>
  );
}