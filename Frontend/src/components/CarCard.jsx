import { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import { Link as RouterLink } from "react-router-dom";

import LocationOnIcon from "@mui/icons-material/LocationOn";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import SettingsIcon from "@mui/icons-material/Settings";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutlined";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import BlockIcon from "@mui/icons-material/Block";

import StatusChip from "./StatusChip.jsx";

// -------------------------------------------------------
// SMALL SPEC PILL — icon-in-circle + label
// -------------------------------------------------------
function SpecPill({ icon, label }) {
  if (!label) return null;
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.7,
        bgcolor: "#F8FAFC",
        border: "1px solid #EEF2F6",
        pl: 0.5,
        pr: 1.2,
        py: 0.5,
        borderRadius: 5,
      }}
    >
      <Box
        sx={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          bgcolor: "rgba(30, 58, 138, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Box sx={{ color: "primary.main", fontSize: 13, display: "flex" }}>{icon}</Box>
      </Box>
      <Typography sx={{ fontSize: "0.76rem", fontWeight: 600, color: "#475569" }}>
        {label}
      </Typography>
    </Box>
  );
}

// -------------------------------------------------------
// FIXED-RATIO IMAGE CAROUSEL — shared by both variants
// Auto-advances through a car's photos; pauses on hover.
// -------------------------------------------------------
const AUTO_PLAY_MS = 3200;

function CarImage({ images = [], alt, aspectRatio, statusNode }) {
  const [index, setIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const count = images.length;

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Reset to the first photo whenever the underlying image set changes
  useEffect(() => {
    setIndex(0);
  }, [images]);

  // Reschedule one step forward after AUTO_PLAY_MS, unless paused
  useEffect(() => {
    if (count < 2 || isHovering || prefersReducedMotion) return undefined;
    const timeoutId = setTimeout(() => {
      setIndex((prev) => (prev + 1) % count);
    }, AUTO_PLAY_MS);
    return () => clearTimeout(timeoutId);
  }, [index, count, isHovering, prefersReducedMotion]);

  return (
    <Box
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      sx={{
        position: "relative",
        width: "100%",
        aspectRatio,
        overflow: "hidden",
        bgcolor: "#EEF2F7",
        flexShrink: 0,
      }}
    >
      {count > 0 ? (
        images.map((src, i) => (
          <Box
            key={`${src}-${i}`}
            component="img"
            src={src}
            alt={i === 0 ? alt : `${alt} — photo ${i + 1}`}
            className="car-card-img"
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: i === index ? 1 : 0,
              transition: "opacity 0.7s ease, transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        ))
      ) : (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "text.secondary",
            bgcolor: "#F1F5F9",
          }}
        >
          <DirectionsCarIcon sx={{ fontSize: 44, mb: 0.5, opacity: 0.35 }} />
          <Typography variant="caption" sx={{ fontWeight: 500 }}>
            No image available
          </Typography>
        </Box>
      )}

      {/* Top scrim so the status badge stays legible on any photo */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(15,23,42,0.32), transparent 45%)",
          pointerEvents: "none",
        }}
      />

      <Box sx={{ position: "absolute", top: 12, left: 12, zIndex: 2 }}>{statusNode}</Box>

      {count > 1 && (
        <>
          <Box
            sx={{
              position: "absolute",
              bottom: 10,
              left: 12,
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              bgcolor: "rgba(15, 23, 42, 0.55)",
              backdropFilter: "blur(4px)",
              color: "#fff",
              px: 1,
              py: 0.35,
              borderRadius: 5,
              pointerEvents: "none",
            }}
          >
            <PhotoLibraryOutlinedIcon sx={{ fontSize: "0.85rem" }} />
            <Typography sx={{ fontSize: "0.7rem", fontWeight: 700 }}>
              {index + 1} / {count}
            </Typography>
          </Box>

          <Box
            sx={{
              position: "absolute",
              bottom: 10,
              right: 12,
              zIndex: 2,
              display: "flex",
              gap: 0.5,
              pointerEvents: "none",
            }}
          >
            {images.map((_, i) => (
              <Box
                key={i}
                sx={{
                  width: i === index ? 14 : 5,
                  height: 5,
                  borderRadius: 4,
                  bgcolor: i === index ? "#F59E0B" : "rgba(255,255,255,0.6)",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}

// -------------------------------------------------------
// HOST STATUS ACTION — one contextual button
// -------------------------------------------------------
function StatusAction({ car, isToggling, onToggleStatus }) {
  if (car.status === "AVAILABLE") {
    return (
      <Button
        variant="outlined"
        color="warning"
        size="small"
        fullWidth
        disabled={isToggling}
        startIcon={<PauseCircleOutlineIcon fontSize="small" />}
        onClick={() => onToggleStatus && onToggleStatus(car._id, "UNAVAILABLE")}
        sx={{ fontWeight: 700, borderRadius: 2.5, py: 0.9 }}
      >
        {isToggling ? "Updating…" : "Pause Listing"}
      </Button>
    );
  }
  if (car.status === "UNAVAILABLE") {
    return (
      <Button
        variant="outlined"
        color="success"
        size="small"
        fullWidth
        disabled={isToggling}
        startIcon={<CheckCircleOutlinedIcon fontSize="small" />}
        onClick={() => onToggleStatus && onToggleStatus(car._id, "AVAILABLE")}
        sx={{ fontWeight: 700, borderRadius: 2.5, py: 0.9 }}
      >
        {isToggling ? "Updating…" : "Activate Listing"}
      </Button>
    );
  }
  if (car.status === "PENDING") {
    return (
      <Button
        variant="text"
        size="small"
        fullWidth
        disabled
        startIcon={<HourglassEmptyIcon fontSize="small" />}
        sx={{ fontWeight: 700, borderRadius: 2.5, py: 0.9, color: "#94A3B8" }}
      >
        Awaiting Admin Approval
      </Button>
    );
  }
  if (car.status === "REJECTED") {
    return (
      <Button
        variant="text"
        size="small"
        fullWidth
        disabled
        startIcon={<BlockIcon fontSize="small" />}
        sx={{ fontWeight: 700, borderRadius: 2.5, py: 0.9, color: "#F87171" }}
      >
        Listing Rejected
      </Button>
    );
  }
  return null;
}

// -------------------------------------------------------
// HOST TOOLBAR — segmented View / Edit / Delete
// -------------------------------------------------------
function HostToolbar({ car, onDelete }) {
  const item = { flex: 1, borderRadius: 0, py: 0.95, fontWeight: 700, fontSize: "0.8rem" };
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "stretch",
        width: "100%",
        border: "1px solid #E2E8F0",
        borderRadius: 2.5,
        overflow: "hidden",
      }}
    >
      <Tooltip title="View vehicle details">
        <Button
          component={RouterLink}
          to={`/cars/${car._id}`}
          startIcon={<VisibilityIcon fontSize="small" />}
          sx={{ ...item, color: "#334155" }}
        >
          View
        </Button>
      </Tooltip>
      <Divider orientation="vertical" flexItem sx={{ borderColor: "#E2E8F0" }} />
      <Tooltip title="Edit vehicle information">
        <Button
          component={RouterLink}
          to={`/host/cars/edit/${car._id}`}
          startIcon={<EditIcon fontSize="small" />}
          sx={{ ...item, color: "primary.main" }}
        >
          Edit
        </Button>
      </Tooltip>
      <Divider orientation="vertical" flexItem sx={{ borderColor: "#E2E8F0" }} />
      <Tooltip title="Delete vehicle listing">
        <Button
          onClick={() => onDelete && onDelete(car._id)}
          aria-label="Delete car"
          sx={{ ...item, flex: "0 0 52px", minWidth: 52, color: "error.main" }}
        >
          <DeleteOutlineIcon fontSize="small" />
        </Button>
      </Tooltip>
    </Box>
  );
}

// -------------------------------------------------------
// MAIN COMPONENT
// -------------------------------------------------------
export default function CarCard({
  car,
  variant = "vertical",
  showHostActions = false,
  onDelete,
  onToggleStatus,
  isToggling = false,
}) {
  if (!car) return null;

  const images = (Array.isArray(car.images) ? car.images : [])
    .map((img) => (typeof img === "string" ? img : img?.url))
    .filter(Boolean);

  const locationText = [car.location?.city, car.location?.state]
    .filter(Boolean)
    .join(", ");

  const isAvailable = car.status === "AVAILABLE";
  const formattedRegNumber = car.registrationNumber
    ? String(car.registrationNumber).trim().toUpperCase()
    : null;

  const priceNode = (
    <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.4, lineHeight: 1 }}>
      <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: "primary.main" }}>
        ₹{Number(car.pricePerDay || 0).toLocaleString("en-IN")}
      </Typography>
      <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", fontWeight: 600 }}>
        /day
      </Typography>
    </Box>
  );

  // ==================================================
  // HORIZONTAL VARIANT (Public Cars page)
  // ==================================================
  if (variant === "horizontal") {
    return (
      <Card
        elevation={0}
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          borderRadius: 4,
          border: "1px solid #E2E8F0",
          overflow: "hidden",
          bgcolor: "#FFFFFF",
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow: "0 12px 28px -4px rgba(15, 23, 42, 0.08), 0 4px 8px -2px rgba(15, 23, 42, 0.04)",
            borderColor: "#CBD5E1",
            transform: "translateY(-2px)",
          },
          "&:hover .car-card-img": { transform: "scale(1.05)" },
        }}
      >
        <Box sx={{ width: { xs: "100%", sm: "38%", md: "35%" }, minWidth: { sm: 240, md: 280 } }}>
          <CarImage
            images={images}
            alt={`${car.brand} ${car.model}`}
            aspectRatio={{ xs: "16 / 10", sm: "4 / 3" }}
            statusNode={<StatusChip status={car.status} />}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            p: { xs: 2.5, sm: 3 },
            justifyContent: "space-between",
          }}
        >
          <div>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 1,
                mb: 1,
              }}
            >
              <Box>
                <Typography
                  variant="h5"
                  component="h3"
                  sx={{
                    fontWeight: 800,
                    color: "text.primary",
                    lineHeight: 1.2,
                    fontSize: { xs: "1.25rem", sm: "1.35rem", md: "1.45rem" },
                  }}
                >
                  {car.brand} {car.model}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 0.5, alignItems: "center" }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {car.year}
                  </Typography>
                  {car.type && (
                    <>
                      <Box component="span" sx={{ color: "text.secondary", fontSize: "0.8rem" }}>•</Box>
                      <Chip
                        label={car.type}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          bgcolor: "rgba(30, 58, 138, 0.06)",
                          color: "primary.main",
                        }}
                      />
                    </>
                  )}
                  {formattedRegNumber && (
                    <>
                      <Box component="span" sx={{ color: "text.secondary", fontSize: "0.8rem" }}>•</Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                          bgcolor: "#F1F5F9",
                          px: 1,
                          py: 0.2,
                          borderRadius: 1,
                          color: "#334155",
                          fontFamily: "monospace",
                        }}
                      >
                        {formattedRegNumber}
                      </Typography>
                    </>
                  )}
                </Stack>
              </Box>

              <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 500, mb: 0.25 }}>
                  Rental rate
                </Typography>
                {priceNode}
              </Box>
            </Box>

            {locationText && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 1, mb: 2, color: "text.secondary" }}>
                <LocationOnIcon fontSize="small" sx={{ color: "primary.main", fontSize: "1.1rem" }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {locationText}
                </Typography>
              </Box>
            )}

            <Stack direction="row" spacing={1} useFlexGap sx={{ mb: 2.5, flexWrap: "wrap" }}>
              <SpecPill icon={<SettingsIcon fontSize="inherit" />} label={car.transmission} />
              <SpecPill icon={<LocalGasStationIcon fontSize="inherit" />} label={car.fuelType} />
              <SpecPill icon={<EventSeatIcon fontSize="inherit" />} label={car.seats ? `${car.seats} Seats` : null} />
            </Stack>
          </div>

          <Divider sx={{ my: 1.5, borderColor: "#F1F5F9" }} />

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "center" },
              gap: 2,
              mt: "auto",
            }}
          >
            <Box sx={{ display: { xs: "flex", sm: "none" }, justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Rental rate
              </Typography>
              {priceNode}
            </Box>

            {!showHostActions ? (
              <Button
                component={RouterLink}
                to={`/cars/${car._id}`}
                variant="contained"
                color="primary"
                size="medium"
                endIcon={<ArrowForwardIcon />}
                disabled={!isAvailable}
                sx={{ py: 1.2, px: 3, fontWeight: 700, borderRadius: 2.5, ml: { sm: "auto" } }}
              >
                {isAvailable ? "View Details" : "Currently Unavailable"}
              </Button>
            ) : (
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ width: { xs: "100%", sm: "auto" } }}>
                <StatusAction car={car} isToggling={isToggling} onToggleStatus={onToggleStatus} />
                <Box sx={{ minWidth: { sm: 200 } }}>
                  <HostToolbar car={car} onDelete={onDelete} />
                </Box>
              </Stack>
            )}
          </Box>
        </Box>
      </Card>
    );
  }

  // ==================================================
  // VERTICAL VARIANT (Dashboard & Fleet Grids)
  // ==================================================
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 4,
        border: "1px solid #E2E8F0",
        overflow: "hidden",
        bgcolor: "#FFFFFF",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 16px 32px -6px rgba(15, 23, 42, 0.10), 0 6px 12px -4px rgba(15, 23, 42, 0.05)",
          borderColor: "#CBD5E1",
        },
        "&:hover .car-card-img": { transform: "scale(1.06)" },
      }}
    >
      <CarImage
        images={images}
        alt={`${car.brand} ${car.model}`}
        aspectRatio="16 / 11"
        statusNode={<StatusChip status={car.status} />}
      />

      {/* Price chip floats over the image/content seam — the one bold move on the card */}
      <Box sx={{ px: 2.5, mt: "-20px", position: "relative", zIndex: 3, display: "flex", justifyContent: "flex-end" }}>
        <Box
          sx={{
            bgcolor: "#FFFFFF",
            borderRadius: 3,
            border: "1px solid #EEF2F6",
            boxShadow: "0 8px 20px -6px rgba(15, 23, 42, 0.22)",
            px: 1.6,
            py: 0.8,
          }}
        >
          {priceNode}
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, px: 2.5, pt: 1.25, pb: 2.5, display: "flex", flexDirection: "column" }}>
        <Box sx={{ mb: 1.25 }}>
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 800,
              fontSize: "1.12rem",
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: "text.primary",
            }}
          >
            {car.brand} {car.model}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.4, alignItems: "center" }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              {car.year}
            </Typography>
            {car.type && (
              <>
                <Box component="span" sx={{ color: "text.secondary", fontSize: "0.8rem" }}>•</Box>
                <Typography variant="body2" color="text.secondary">
                  {car.type}
                </Typography>
              </>
            )}
            {formattedRegNumber && (
              <>
                <Box component="span" sx={{ color: "text.secondary", fontSize: "0.8rem" }}>•</Box>
                <Stack direction="row" spacing={0.4} sx={{ alignItems: "center" }}>
                  <ConfirmationNumberIcon sx={{ fontSize: "0.85rem", color: "primary.main" }} />
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontFamily: "monospace",
                      letterSpacing: "0.04em",
                      color: "#1E293B",
                      fontSize: "0.74rem",
                    }}
                  >
                    {formattedRegNumber}
                  </Typography>
                </Stack>
              </>
            )}
          </Stack>
        </Box>

        {locationText && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mb: 1.5, color: "text.secondary" }}>
            <LocationOnIcon fontSize="small" sx={{ color: "primary.main", fontSize: "1.05rem" }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
              {locationText}
            </Typography>
          </Box>
        )}

        <Stack direction="row" spacing={0.8} useFlexGap sx={{ mb: 2, flexWrap: "wrap" }}>
          <SpecPill icon={<SettingsIcon fontSize="inherit" />} label={car.transmission} />
          <SpecPill icon={<LocalGasStationIcon fontSize="inherit" />} label={car.fuelType} />
          <SpecPill icon={<EventSeatIcon fontSize="inherit" />} label={car.seats ? `${car.seats} Seats` : null} />
        </Stack>

        <Box sx={{ mt: "auto" }} />
      </CardContent>

      <CardActions sx={{ px: 2.5, pb: 2.5, pt: 0, display: "block" }}>
        {!showHostActions ? (
          <Button
            component={RouterLink}
            to={`/cars/${car._id}`}
            variant="contained"
            color="primary"
            fullWidth
            size="medium"
            endIcon={<ArrowForwardIcon />}
            disabled={!isAvailable}
            sx={{ fontWeight: 700, py: 1.1, borderRadius: 2.5 }}
          >
            {isAvailable ? "View Details" : "Currently Unavailable"}
          </Button>
        ) : (
          <Stack spacing={1.1}>
            <StatusAction car={car} isToggling={isToggling} onToggleStatus={onToggleStatus} />
            <HostToolbar car={car} onDelete={onDelete} />
          </Stack>
        )}
      </CardActions>
    </Card>
  );
}
