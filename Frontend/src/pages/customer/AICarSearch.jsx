/**
 * AICarSearch.jsx
 *
 * Customer-facing AI-powered natural-language car search page.
 *
 * Features:
 *  - Large prompt input with animated send button
 *  - Filter chips showing what AI understood
 *  - AI recommendation text
 *  - Exact match car cards
 *  - Alternative suggestions (clearly distinguished)
 *  - Book Now / View Details integration with existing booking flow
 *  - Skeleton loading, error states, empty state
 *  - Fully responsive (Material UI)
 */

import { useState, useContext } from "react";
import { Link as RouterLink } from "react-router-dom";

// MUI
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Skeleton from "@mui/material/Skeleton";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

// Icons
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import SettingsIcon from "@mui/icons-material/Settings";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseIcon from "@mui/icons-material/Close";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import PersonIcon from "@mui/icons-material/Person";

import { AppContext } from "../../context/AppContext.jsx";

// -------------------------------------------------------
// EXAMPLE PROMPTS
// -------------------------------------------------------

const EXAMPLE_PROMPTS = [
  "I need an automatic SUV in Kolkata under ₹3000 per day",
  "I need a 7-seater car for a family trip near Kolkata",
  "I need an electric car for 3 days",
  "I need a cheap automatic car in Kolkata from 10 September to 15 September",
];

// -------------------------------------------------------
// FILTER CHIP LABELS
// -------------------------------------------------------

function getFilterChips(filters) {
  if (!filters) return [];
  const chips = [];

  if (filters.type) chips.push({ label: filters.type, icon: <DirectionsCarIcon fontSize="small" /> });
  if (filters.transmission) chips.push({ label: filters.transmission, icon: <SettingsIcon fontSize="small" /> });
  if (filters.fuelType) chips.push({ label: filters.fuelType, icon: <LocalGasStationIcon fontSize="small" /> });
  if (filters.seats) chips.push({ label: `${filters.seats}+ Seats`, icon: <EventSeatIcon fontSize="small" /> });
  if (filters.location) chips.push({ label: filters.location, icon: <LocationOnIcon fontSize="small" /> });
  if (filters.maxPricePerDay) chips.push({ label: `Under ₹${filters.maxPricePerDay}/day`, icon: <CurrencyRupeeIcon fontSize="small" /> });
  if (filters.duration) chips.push({ label: `${filters.duration} Days`, icon: <CalendarMonthIcon fontSize="small" /> });
  if (filters.startDate) chips.push({ label: `From ${filters.startDate}`, icon: <CalendarMonthIcon fontSize="small" /> });
  if (filters.endDate) chips.push({ label: `To ${filters.endDate}`, icon: <CalendarMonthIcon fontSize="small" /> });

  return chips;
}

// -------------------------------------------------------
// MARKDOWN RENDERER (lightweight, no external lib)
// -------------------------------------------------------

function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split("\n");
  const elements = [];
  let key = 0;

  const parseLine = (line) => {
    // Parse **bold** inline
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} style={{ fontWeight: 700, color: "inherit" }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) {
      elements.push(<Box key={key++} sx={{ height: 6 }} />);
    } else if (/^[-*]\s/.test(line)) {
      elements.push(
        <Box key={key++} sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 0.5 }}>
          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "primary.main", mt: "7px", flexShrink: 0 }} />
          <Typography variant="body2" sx={{ lineHeight: 1.75, color: "text.primary" }}>
            {parseLine(line.replace(/^[-*]\s/, ""))}
          </Typography>
        </Box>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\.\s/)[1];
      elements.push(
        <Box key={key++} sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, mb: 0.5 }}>
          <Box sx={{ minWidth: 22, height: 22, borderRadius: "50%", bgcolor: "primary.main", display: "flex", alignItems: "center", justifyContent: "center", mt: "1px", flexShrink: 0 }}>
            <Typography sx={{ fontSize: "0.65rem", fontWeight: 800, color: "white", lineHeight: 1 }}>{num}</Typography>
          </Box>
          <Typography variant="body2" sx={{ lineHeight: 1.75, color: "text.primary" }}>
            {parseLine(line.replace(/^\d+\.\s/, ""))}
          </Typography>
        </Box>
      );
    } else {
      elements.push(
        <Typography key={key++} variant="body2" sx={{ lineHeight: 1.8, color: "text.primary", mb: 0.25 }}>
          {parseLine(line)}
        </Typography>
      );
    }
  }
  return elements;
}


function AICarCardSkeleton({ count = 3 }) {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
            }}
          >
            <Skeleton variant="rectangular" height={200} animation="wave" />
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Skeleton variant="text" width="60%" height={30} />
                <Skeleton variant="rounded" width={70} height={24} />
              </Box>
              <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
              <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
                <Skeleton variant="rounded" width={65} height={24} />
                <Skeleton variant="rounded" width={65} height={24} />
                <Skeleton variant="rounded" width={65} height={24} />
              </Box>
              <Skeleton variant="text" width="50%" height={28} />
            </CardContent>
            <Divider />
            <CardActions sx={{ p: 2, justifyContent: "flex-end", gap: 1 }}>
              <Skeleton variant="rounded" width={110} height={36} />
              <Skeleton variant="rounded" width={110} height={36} />
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

// -------------------------------------------------------
// AI RESULT CAR CARD
// -------------------------------------------------------

function AICarCard({ car, isAlternative = false }) {
  const mainImg =
    car.images?.[0]?.url ||
    (typeof car.images?.[0] === "string" ? car.images[0] : null);

  const locationText = [car.location?.city, car.location?.state]
    .filter(Boolean)
    .join(", ");

  const isAvailable = car.status === "AVAILABLE";

  const statusColor = {
    AVAILABLE: "success",
    UNAVAILABLE: "warning",
    PENDING: "default",
    REJECTED: "error",
  };

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        border: "1px solid",
        borderColor: isAlternative ? "warning.200" : "divider",
        overflow: "hidden",
        bgcolor: isAlternative ? "warning.50" : "background.paper",
        transition: "all 0.25s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 12px 28px -4px rgba(15,23,42,0.1)",
          borderColor: isAlternative ? "warning.400" : "primary.200",
        },
      }}
    >
      {/* Car image */}
      <Box sx={{ position: "relative" }}>
        {mainImg ? (
          <CardMedia
            component="img"
            height={200}
            image={mainImg}
            alt={`${car.brand} ${car.model}`}
            sx={{ objectFit: "cover" }}
          />
        ) : (
          <Box
            sx={{
              height: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "grey.100",
            }}
          >
            <DirectionsCarIcon sx={{ fontSize: 64, color: "grey.400" }} />
          </Box>
        )}

        {/* Status badge */}
        <Chip
          label={car.status}
          color={statusColor[car.status] || "default"}
          size="small"
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            fontWeight: 700,
            fontSize: "0.7rem",
          }}
        />

        {/* Alternative badge */}
        {isAlternative && (
          <Chip
            label="Close Match"
            color="warning"
            size="small"
            variant="filled"
            sx={{
              position: "absolute",
              top: 10,
              left: 10,
              fontWeight: 700,
              fontSize: "0.7rem",
            }}
          />
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
        {/* Car name + year */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
          <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
            {car.brand} {car.model}
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ ml: 1, flexShrink: 0 }}>
            {car.year}
          </Typography>
        </Box>

        {/* Location */}
        {locationText && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1.5 }}>
            <LocationOnIcon sx={{ fontSize: 14, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              {locationText}
            </Typography>
          </Box>
        )}

        {/* Spec chips */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 2 }}>
          <Chip
            icon={<DirectionsCarIcon />}
            label={car.type}
            size="small"
            variant="outlined"
            sx={{ fontSize: "0.7rem" }}
          />
          <Chip
            icon={<SettingsIcon />}
            label={car.transmission}
            size="small"
            variant="outlined"
            sx={{ fontSize: "0.7rem" }}
          />
          <Chip
            icon={<LocalGasStationIcon />}
            label={car.fuelType}
            size="small"
            variant="outlined"
            sx={{ fontSize: "0.7rem" }}
          />
          <Chip
            icon={<EventSeatIcon />}
            label={`${car.seats} Seats`}
            size="small"
            variant="outlined"
            sx={{ fontSize: "0.7rem" }}
          />
        </Box>

        {/* Features (first 3) */}
        {car.features?.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }}>
            {car.features.slice(0, 3).map((f, i) => (
              <Chip key={i} label={f} size="small" sx={{ fontSize: "0.65rem", bgcolor: "grey.100" }} />
            ))}
            {car.features.length > 3 && (
              <Chip label={`+${car.features.length - 3} more`} size="small" sx={{ fontSize: "0.65rem", bgcolor: "grey.100" }} />
            )}
          </Box>
        )}

        <Divider sx={{ my: 1.5 }} />

        {/* Price */}
        <Typography variant="h6" fontWeight={800} color="primary.main">
          ₹{car.pricePerDay?.toLocaleString("en-IN")}
          <Typography component="span" variant="body2" color="text.secondary" fontWeight={400}>
            {" "}/day
          </Typography>
        </Typography>
      </CardContent>

      <Divider />

      <CardActions sx={{ p: 2, gap: 1 }}>
        <Button
          component={RouterLink}
          to={`/cars/${car._id}`}
          variant="outlined"
          size="small"
          startIcon={<VisibilityIcon />}
          sx={{ flex: 1, borderRadius: 2, textTransform: "none", fontWeight: 600 }}
        >
          View Details
        </Button>

        {isAvailable ? (
          <Button
            component={RouterLink}
            to={`/customer/book/${car._id}`}
            variant="contained"
            size="small"
            startIcon={<BookOnlineIcon />}
            sx={{ flex: 1, borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            Book Now
          </Button>
        ) : (
          <Tooltip title={`This car is currently ${car.status.toLowerCase()}`}>
            <span style={{ flex: 1 }}>
              <Button
                disabled
                variant="contained"
                size="small"
                startIcon={<BookOnlineIcon />}
                fullWidth
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
              >
                Unavailable
              </Button>
            </span>
          </Tooltip>
        )}
      </CardActions>
    </Card>
  );
}

// -------------------------------------------------------
// MAIN PAGE COMPONENT
// -------------------------------------------------------

export default function AICarSearch() {
  const {
    aiResults,
    aiAlternatives,
    aiAnswer,
    aiFilters,
    aiQuery,
    aiMeta,
    aiLoading,
    aiError,
    searchCarsWithAI,
    clearAIResults,
  } = useContext(AppContext);

  const [prompt, setPrompt] = useState("");

  const handleSearch = async () => {
    if (!prompt.trim()) return;
    await searchCarsWithAI(prompt);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSearch();
    }
  };

  const handleExampleClick = (example) => {
    setPrompt(example);
  };

  const handleClear = () => {
    setPrompt("");
    clearAIResults();
  };

  const hasResults = Array.isArray(aiResults);
  const filterChips = getFilterChips(aiFilters);
  const exactCount = aiResults?.length || 0;
  const altCount = aiAlternatives?.length || 0;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0f4ff 0%, #fafbff 50%, #f5f0ff 100%)",
        pt: { xs: 4, md: 6 },
        pb: 10,
      }}
    >
      <Container maxWidth="lg">

        {/* ========== HERO HEADER ========== */}
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "primary.50",
              border: "1px solid",
              borderColor: "primary.200",
              borderRadius: "999px",
              px: 2.5,
              py: 0.75,
              mb: 3,
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 16, color: "primary.main" }} />
            <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ letterSpacing: "0.08em", textTransform: "uppercase" }}>
              AI-Powered Car Finder
            </Typography>
          </Box>

          <Typography
            variant="h3"
            fontWeight={800}
            sx={{
              background: "linear-gradient(135deg, #1a1a2e 0%, #6366f1 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1.5,
              fontSize: { xs: "1.9rem", md: "2.75rem" },
            }}
          >
            Tell us what car you need
          </Typography>

          <Typography variant="h6" color="text.secondary" fontWeight={400} sx={{ maxWidth: 560, mx: "auto" }}>
            Describe your requirements in plain language — our AI will find the best matching cars from our fleet.
          </Typography>
        </Box>

        {/* ========== SEARCH INPUT ========== */}
        <Paper
          elevation={0}
          sx={{
            maxWidth: 760,
            mx: "auto",
            mb: 4,
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 4,
            border: "1.5px solid",
            borderColor: aiLoading ? "primary.400" : "divider",
            background: "#fff",
            boxShadow: aiLoading
              ? "0 0 0 3px rgba(99,102,241,0.15)"
              : "0 4px 24px rgba(0,0,0,0.06)",
            transition: "all 0.3s ease",
          }}
        >
          <TextField
            id="ai-search-prompt"
            multiline
            minRows={3}
            maxRows={6}
            fullWidth
            placeholder='Try: "I need an automatic SUV in Kolkata under ₹3000 per day" or "7-seater family car for this weekend"'
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={aiLoading}
            variant="standard"
            slotProps={{
              input: {
                disableUnderline: true,
                sx: {
                  fontSize: "1.05rem",
                  lineHeight: 1.6,
                  "& textarea": { resize: "none" },
                },
              },
            }}
            sx={{ mb: 2.5 }}
          />

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
            <Typography variant="caption" color="text.disabled" sx={{ display: { xs: "none", sm: "block" } }}>
              Ctrl+Enter to search
            </Typography>

            <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
              {(hasResults || aiError) && (
                <Button
                  variant="text"
                  color="inherit"
                  size="small"
                  startIcon={<CloseIcon />}
                  onClick={handleClear}
                  sx={{ textTransform: "none", color: "text.secondary" }}
                >
                  Clear
                </Button>
              )}
              <Button
                id="ai-search-btn"
                variant="contained"
                size="large"
                onClick={handleSearch}
                disabled={aiLoading || !prompt.trim()}
                startIcon={
                  aiLoading ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <AutoAwesomeIcon />
                  )
                }
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.25,
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: "1rem",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                  },
                  "&:disabled": {
                    background: "grey.200",
                  },
                }}
              >
                {aiLoading ? "Searching..." : "Find Cars"}
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* ========== EXAMPLE PROMPTS ========== */}
        {!hasResults && !aiLoading && (
          <Box sx={{ maxWidth: 760, mx: "auto", mb: 6 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, textAlign: "center" }}>
              <TipsAndUpdatesIcon sx={{ fontSize: 14, verticalAlign: "middle", mr: 0.5 }} />
              Try one of these examples:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
              {EXAMPLE_PROMPTS.map((ex, i) => (
                <Chip
                  key={i}
                  label={ex}
                  onClick={() => handleExampleClick(ex)}
                  variant="outlined"
                  clickable
                  sx={{
                    borderRadius: 3,
                    fontSize: "0.8rem",
                    height: 36,
                    borderColor: "primary.200",
                    color: "primary.700",
                    bgcolor: "primary.50",
                    "&:hover": { bgcolor: "primary.100" },
                    maxWidth: { xs: "100%", sm: "auto" },
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* ========== ERROR STATE ========== */}
        {aiError && (
          <Alert
            severity="error"
            sx={{ maxWidth: 760, mx: "auto", mb: 4, borderRadius: 3 }}
            onClose={handleClear}
          >
            {aiError}
          </Alert>
        )}

        {/* ========== LOADING STATE ========== */}
        {aiLoading && (
          <Box sx={{ maxWidth: 1000, mx: "auto" }}>
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <CircularProgress size={32} sx={{ color: "primary.main", mb: 1.5 }} />
              <Typography variant="body1" color="text.secondary" fontWeight={500}>
                AI is analyzing your request and searching our fleet...
              </Typography>
            </Box>
            <AICarCardSkeleton count={3} />
          </Box>
        )}

        {/* ========== RESULTS ========== */}
        {hasResults && !aiLoading && (
          <Box sx={{ maxWidth: 1100, mx: "auto" }}>

            {/* Filter chips — what AI understood */}
            {filterChips.length > 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  mb: 3,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "primary.100",
                  bgcolor: "primary.50",
                }}
              >
                <Typography variant="body2" fontWeight={700} color="primary.main" sx={{ mb: 1.5 }}>
                  <InfoOutlinedIcon sx={{ fontSize: 14, verticalAlign: "middle", mr: 0.5 }} />
                  AI understood your requirements:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {filterChips.map((chip, i) => (
                    <Chip
                      key={i}
                      icon={chip.icon}
                      label={chip.label}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 600, borderRadius: 2 }}
                    />
                  ))}
                </Box>
              </Paper>
            )}

            {/* AI recommendation text */}
            {aiAnswer && (
              <Box
                sx={{
                  mb: 4,
                  borderRadius: 4,
                  overflow: "hidden",
                  boxShadow: "0 8px 40px rgba(99,102,241,0.13)",
                  border: "1px solid",
                  borderColor: "rgba(99,102,241,0.18)",
                  background: "#fff",
                  position: "relative",
                }}
              >
                {/* Gradient top bar */}
                <Box
                  sx={{
                    background: "linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
                    px: 3,
                    py: 1.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      bgcolor: "rgba(255,255,255,0.2)",
                      backdropFilter: "blur(4px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <AutoAwesomeIcon sx={{ fontSize: 16, color: "white" }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "white", lineHeight: 1.2 }}>
                      AI Recommendation
                    </Typography>
                    <Typography sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.75)", lineHeight: 1 }}>
                      Powered by Gemini · Based on your query
                    </Typography>
                  </Box>
                  {/* Decorative sparkle dots */}
                  <Box sx={{ ml: "auto", display: "flex", gap: 0.5 }}>
                    {[1,2,3].map(i => (
                      <Box key={i} sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: `rgba(255,255,255,${0.3 + i * 0.2})` }} />
                    ))}
                  </Box>
                </Box>

                {/* Content area */}
                <Box
                  sx={{
                    p: { xs: 2.5, md: 3 },
                    background: "linear-gradient(160deg, #fafbff 0%, #ffffff 100%)",
                  }}
                >
                  {/* User query echo */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      mb: 2.5,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1, maxWidth: "80%" }}>
                      <Box
                        sx={{
                          bgcolor: "primary.main",
                          borderRadius: "18px 18px 4px 18px",
                          px: 2,
                          py: 1.25,
                          boxShadow: "0 2px 8px rgba(99,102,241,0.25)",
                        }}
                      >
                        <Typography variant="body2" sx={{ color: "white", fontWeight: 500, lineHeight: 1.5 }}>
                          {aiQuery}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          bgcolor: "primary.100",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          mb: 0.25,
                        }}
                      >
                        <PersonIcon sx={{ fontSize: 16, color: "primary.main" }} />
                      </Box>
                    </Box>
                  </Box>

                  {/* AI response bubble */}
                  <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        mb: 0.25,
                        boxShadow: "0 2px 8px rgba(99,102,241,0.35)",
                      }}
                    >
                      <AutoAwesomeIcon sx={{ fontSize: 15, color: "white" }} />
                    </Box>
                    <Box
                      sx={{
                        bgcolor: "white",
                        border: "1px solid",
                        borderColor: "rgba(99,102,241,0.15)",
                        borderRadius: "18px 18px 18px 4px",
                        px: 2.5,
                        py: 2,
                        maxWidth: "85%",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                      }}
                    >
                      {renderMarkdown(aiAnswer)}
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}

            {/* ====== EXACT MATCHES ====== */}
            <Box sx={{ mb: 5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
                <Typography variant="h5" fontWeight={800}>
                  {exactCount > 0 ? `${exactCount} Exact Match${exactCount !== 1 ? "es" : ""}` : "No Exact Matches"}
                </Typography>
                {exactCount > 0 && (
                  <Chip
                    label={`${exactCount} found`}
                    color="success"
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                )}
              </Box>

              {exactCount === 0 ? (
                <Alert
                  severity="info"
                  icon={<SearchIcon />}
                  sx={{ borderRadius: 3, mb: 2 }}
                >
                  <Typography variant="body2" fontWeight={500}>
                    No cars exactly match all your criteria.
                    {aiMeta?.hasDateFilter && " Some cars may be booked for your selected dates."}
                    {altCount > 0 && " See close alternatives below."}
                  </Typography>
                  {!altCount && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Try increasing your budget, changing the vehicle type, or adjusting dates.
                    </Typography>
                  )}
                </Alert>
              ) : (
                <Grid container spacing={3}>
                  {aiResults.map((car) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={car._id}>
                      <AICarCard car={car} isAlternative={false} />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>

            {/* ====== ALTERNATIVES ====== */}
            {altCount > 0 && (
              <Box>
                <Divider sx={{ mb: 4 }}>
                  <Chip
                    label="Close Alternatives"
                    variant="outlined"
                    color="warning"
                    sx={{ fontWeight: 700, px: 1 }}
                  />
                </Divider>

                <Alert
                  severity="warning"
                  variant="outlined"
                  sx={{ mb: 3, borderRadius: 3, borderColor: "warning.300" }}
                  icon={<InfoOutlinedIcon />}
                >
                  <Typography variant="body2">
                    These cars don't fully match all your requirements but may be helpful alternatives.
                    They may be currently unavailable, have different specs, or be booked for your dates.
                  </Typography>
                </Alert>

                <Grid container spacing={3}>
                  {aiAlternatives.map((car) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={car._id}>
                      <AICarCard car={car} isAlternative={true} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* No results at all */}
            {exactCount === 0 && altCount === 0 && (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <DirectionsCarIcon sx={{ fontSize: 80, color: "grey.300", mb: 2 }} />
                <Typography variant="h5" fontWeight={700} color="text.secondary" sx={{ mb: 1 }}>
                  No cars found
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 420, mx: "auto" }}>
                  We couldn't find any cars matching your requirements. Try adjusting your search.
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleClear}
                  startIcon={<SearchIcon />}
                  sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                >
                  Try a Different Search
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}
