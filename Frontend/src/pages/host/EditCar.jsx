import { useEffect, useState, useContext } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import Tooltip from "@mui/material/Tooltip";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import BuildIcon from "@mui/icons-material/Build";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";

import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";

import api from "../../api/axios.js";
import { AppContext } from "../../context/AppContext.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import Loader from "../../components/Loader.jsx";
import EmptyState from "../../components/EmptyState.jsx";

const CAR_TYPES = ["HATCHBACK", "SEDAN", "SUV", "MUV", "COUPE", "CONVERTIBLE", "LUXURY"];
const TRANSMISSION_TYPES = ["MANUAL", "AUTOMATIC"];
const FUEL_TYPES = ["PETROL", "DIESEL", "ELECTRIC", "HYBRID"];

export default function EditCar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateCar, generateCarSuggestions } = useContext(AppContext);

  // AI suggestion local state
  // aiEnabled is OFF by default on Edit — existing data must not be auto-changed
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);

  const [form, setForm] = useState({
    brand: "",
    model: "",
    year: "",
    type: "",
    transmission: "",
    fuelType: "",
    seats: "",
    pricePerDay: "",
    city: "",
    state: "",
    pincode: "",
    description: "",
    features: "",
    registrationNumber: "",
  });

  const [existingImages, setExistingImages] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      newPreviews.forEach((item) => {
        if (item.url) URL.revokeObjectURL(item.url);
      });
    };
  }, [newPreviews]);

  useEffect(() => {
    fetchCar();
  }, [id]);

  const fetchCar = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/cars/${id}`);
      const car = response.data.car || response.data;

      setForm({
        brand: car.brand || "",
        model: car.model || "",
        year: car.year || "",
        type: car.type || "",
        transmission: car.transmission || "",
        fuelType: car.fuelType || "",
        seats: car.seats || "",
        pricePerDay: car.pricePerDay || "",
        city: car.location?.city || "",
        state: car.location?.state || "",
        pincode: car.location?.pincode || "",
        description: car.description || "",
        features: Array.isArray(car.features) ? car.features.join(", ") : "",
        registrationNumber: car.registrationNumber ? car.registrationNumber.toUpperCase() : "",
      });

      setExistingImages(Array.isArray(car.images) ? car.images : []);
    } catch (err) {
      console.error("Error fetching car:", err);
      setError(err.response?.data?.error || "Unable to fetch car details.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "registrationNumber") {
      setForm((prev) => ({
        ...prev,
        registrationNumber: value.toUpperCase(),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleRemoveExistingImage = (public_id) => {
    if (!public_id) return;
    setImagesToRemove((prev) => [...prev, public_id]);
    setExistingImages((prev) => prev.filter((img) => img.public_id !== public_id));
  };

  const handleFileChange = (e) => {
    setError("");
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const totalCount = existingImages.length + newFiles.length + files.length;
    if (totalCount > 10) {
      setError("Maximum 10 images allowed per car listing.");
      return;
    }

    const createdPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setNewFiles((prev) => [...prev, ...files]);
    setNewPreviews((prev) => [...prev, ...createdPreviews]);
  };

  const handleRemoveNewFile = (index) => {
    const target = newPreviews[index];
    if (target && target.url) {
      URL.revokeObjectURL(target.url);
    }
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const regTrimmed = form.registrationNumber ? form.registrationNumber.trim().toUpperCase() : "";
    if (regTrimmed && (regTrimmed.length < 5 || regTrimmed.length > 20)) {
      setError("Registration number must be between 5 and 20 characters.");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      if (form.brand) formData.append("brand", form.brand.trim());
      if (form.model) formData.append("model", form.model.trim());
      if (form.year) formData.append("year", form.year);
      if (form.type) formData.append("type", form.type);
      if (form.transmission) formData.append("transmission", form.transmission);
      if (form.fuelType) formData.append("fuelType", form.fuelType);
      if (form.seats) formData.append("seats", form.seats);
      if (form.pricePerDay) formData.append("pricePerDay", form.pricePerDay);
      if (form.city) formData.append("location.city", form.city.trim());
      if (form.state) formData.append("location.state", form.state.trim());
      if (form.pincode) formData.append("location.pincode", form.pincode.trim());
      formData.append("description", form.description.trim());
      if (regTrimmed) formData.append("registrationNumber", regTrimmed);

      if (form.features) {
        const feats = form.features
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean);
        feats.forEach((feat) => formData.append("features", feat));
      }

      if (imagesToRemove.length > 0) {
        formData.append("removeImages", JSON.stringify(imagesToRemove));
      }

      newFiles.forEach((file) => {
        formData.append("images", file);
      });

      await updateCar(id, formData);
      navigate("/host/cars");
    } catch (err) {
      console.error("Error updating car:", err);
      const backendError = err.response?.data?.error;
      const validationErrors = err.response?.data?.errors;

      if (backendError) {
        setError(backendError);
      } else if (validationErrors && validationErrors.length > 0) {
        setError(validationErrors[0].msg);
      } else {
        setError("Unable to update vehicle details.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader message="Loading vehicle details..." minHeight="60vh" />;
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      <PageHeader
        title={`Edit ${form.brand} ${form.model}`}
        subtitle="Modify vehicle specifications, pricing, location, and images."
        breadcrumbs={[
          { label: "Host Dashboard", to: "/host" },
          { label: "My Cars", to: "/host/cars" },
          { label: "Edit Car" },
        ]}
        action={
          <Button
            component={RouterLink}
            to="/host/cars"
            startIcon={<ArrowBackIcon />}
            variant="outlined"
          >
            My Cars
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3.5, fontWeight: 500 }}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{
          p: { xs: 2.5, sm: 4 },
          borderRadius: 4,
          border: "1px solid #E2E8F0",
          bgcolor: "#FFFFFF",
        }}
      >
        <Stack spacing={4}>
          {/* Section 1: Basic Info */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <DirectionsCarIcon sx={{ color: "primary.main", fontSize: 24 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
                1. Basic Information
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Update vehicle brand, model, manufacturing year, and body style.
            </Typography>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  id="brand"
                  label="Brand"
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  helperText="Vehicle manufacturer"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  id="model"
                  label="Model"
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                  helperText="Vehicle model name"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  id="year"
                  type="number"
                  label="Manufacturing Year"
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  required
                  fullWidth
                  id="type"
                  label="Car Type"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                >
                  <MenuItem value="" disabled>Select Body Type</MenuItem>
                  {CAR_TYPES.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Section 2: Vehicle Specs */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <BuildIcon sx={{ color: "primary.main", fontSize: 22 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
                2. Specifications & Pricing
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Transmission, fuel type, seating capacity, and daily pricing.
            </Typography>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  required
                  fullWidth
                  id="transmission"
                  label="Transmission"
                  name="transmission"
                  value={form.transmission}
                  onChange={handleChange}
                >
                  {TRANSMISSION_TYPES.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  required
                  fullWidth
                  id="fuelType"
                  label="Fuel Type"
                  name="fuelType"
                  value={form.fuelType}
                  onChange={handleChange}
                >
                  {FUEL_TYPES.map((f) => (
                    <MenuItem key={f} value={f}>
                      {f}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  id="seats"
                  type="number"
                  label="Seats"
                  name="seats"
                  value={form.seats}
                  onChange={handleChange}
                  inputProps={{ min: 1, max: 20 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  id="pricePerDay"
                  type="number"
                  label="Price Per Day"
                  name="pricePerDay"
                  value={form.pricePerDay}
                  onChange={handleChange}
                  slotProps={{ input: {
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}}
                  helperText="Daily self-drive rental price"
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Section 3: Location */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <LocationOnIcon sx={{ color: "primary.main", fontSize: 24 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
                3. Location Details
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              City and state where the car is parked for customer handovers.
            </Typography>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  id="city"
                  label="City"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  id="state"
                  label="State"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  id="pincode"
                  label="Pincode"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  inputProps={{ maxLength: 6 }}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Section 4: Image Management */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PhotoLibraryIcon sx={{ color: "primary.main", fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
                  4. Vehicle Photos & Gallery
                </Typography>
              </Box>
              <Chip
                label={`${existingImages.length + newFiles.length} / 10 Images`}
                size="small"
                color={existingImages.length + newFiles.length > 0 ? "primary" : "default"}
                sx={{ fontWeight: 600 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Manage active photos and upload new angles of the vehicle.
            </Typography>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                  Current Photos ({existingImages.length}):
                </Typography>
                <Grid container spacing={2}>
                  {existingImages.map((img, index) => (
                    <Grid size={{ xs: 6, sm: 4, md: 3 }} key={img.public_id || index}>
                      <Card
                        elevation={0}
                        sx={{
                          position: "relative",
                          borderRadius: 2.5,
                          overflow: "hidden",
                          border: "1px solid #E2E8F0",
                          height: 120,
                          bgcolor: "#F8FAFC",
                        }}
                      >
                        <img
                          src={typeof img === "string" ? img : img.url}
                          alt={`Car ${index + 1}`}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <Tooltip title="Remove photo">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveExistingImage(img.public_id)}
                            sx={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              bgcolor: "rgba(0,0,0,0.65)",
                              color: "#FFFFFF",
                              "&:hover": { bgcolor: "error.main" },
                            }}
                            aria-label={`Remove existing photo ${index + 1}`}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Upload Additional Images */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
                textAlign: "center",
                border: "2px dashed #CBD5E1",
                borderRadius: 3.5,
                bgcolor: "#F8FAFC",
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                "&:hover": { borderColor: "primary.main", bgcolor: "rgba(30, 58, 138, 0.03)" },
              }}
              component="label"
            >
              <input
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <CloudUploadIcon sx={{ fontSize: 44, color: "primary.main", mb: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Upload Additional Photos
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Click to add more photos to the vehicle gallery (JPG, PNG, WEBP).
              </Typography>
            </Paper>

            {/* New Image Previews */}
            {newPreviews.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                  New Photos To Upload ({newPreviews.length}):
                </Typography>
                <Grid container spacing={2}>
                  {newPreviews.map((item, index) => (
                    <Grid size={{ xs: 6, sm: 4, md: 3 }} key={index}>
                      <Card
                        elevation={0}
                        sx={{
                          position: "relative",
                          borderRadius: 2.5,
                          overflow: "hidden",
                          border: "1px solid #E2E8F0",
                          height: 120,
                          bgcolor: "#F8FAFC",
                        }}
                      >
                        <img
                          src={item.url}
                          alt={`New ${index + 1}`}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <Tooltip title="Remove photo">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveNewFile(index)}
                            sx={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              bgcolor: "rgba(0,0,0,0.65)",
                              color: "#FFFFFF",
                              "&:hover": { bgcolor: "error.main" },
                            }}
                            aria-label={`Remove new photo ${index + 1}`}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>

          <Divider />

          {/* Section 5: Features & Description */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <InfoOutlinedIcon sx={{ color: "primary.main", fontSize: 24 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
                5. Features &amp; Description
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Highlight amenities and updated description details.
            </Typography>

            {/* ---- AI Auto Suggestions Panel (OFF by default on Edit) ---- */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                mb: 3,
                borderRadius: 3,
                border: "1px solid",
                borderColor: aiEnabled ? "primary.light" : "#E2E8F0",
                bgcolor: aiEnabled ? "rgba(30,58,138,0.03)" : "#FAFAFA",
                transition: "all 0.2s ease",
              }}
            >
              {/* Toggle Row */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AutoFixHighIcon sx={{ color: aiEnabled ? "primary.main" : "text.secondary", fontSize: 22 }} />
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                      AI Auto Suggestions
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Generate new feature &amp; description suggestions (existing data stays unchanged)
                    </Typography>
                  </Box>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={aiEnabled}
                      onChange={(e) => {
                        setAiEnabled(e.target.checked);
                        if (!e.target.checked) setAiSuggestions(null);
                      }}
                      color="primary"
                    />
                  }
                  label={aiEnabled ? "ON" : "OFF"}
                  labelPlacement="start"
                  sx={{ mr: 0, "& .MuiFormControlLabel-label": { fontWeight: 700, fontSize: "0.85rem" } }}
                />
              </Box>

              {aiEnabled && (
                <Box sx={{ mt: 2 }}>
                  <Alert severity="warning" sx={{ mb: 2, fontSize: "0.8rem", py: 0.5 }} icon={false}>
                    Existing features and description will <strong>NOT</strong> be changed automatically.
                    Only click <strong>Use AI Features</strong> or <strong>Use AI Description</strong> if you want to replace them.
                  </Alert>

                  <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: "wrap" }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={aiLoading ? <CircularProgress size={16} color="inherit" /> : <AutoFixHighIcon />}
                      disabled={aiLoading || !form.brand.trim() || !form.model.trim()}
                      onClick={async () => {
                        setAiLoading(true);
                        setAiSuggestions(null);
                        try {
                          const suggestions = await generateCarSuggestions({
                            brand: form.brand.trim(),
                            model: form.model.trim(),
                            year: form.year || null,
                            type: form.type || null,
                            transmission: form.transmission || null,
                            fuelType: form.fuelType || null,
                            seats: form.seats || null,
                          });
                          setAiSuggestions(suggestions);
                        } catch (err) {
                          const msg =
                            err.response?.data?.error ||
                            "Unable to generate AI suggestions. You can continue manually or try again.";
                          setError(msg);
                        } finally {
                          setAiLoading(false);
                        }
                      }}
                      sx={{ fontWeight: 700 }}
                    >
                      {aiLoading ? "Generating suggestions..." : aiSuggestions ? "Regenerate" : "Generate Suggestions"}
                    </Button>
                    {aiSuggestions && (
                      <Button
                        variant="outlined"
                        color="inherit"
                        size="small"
                        disabled={aiLoading}
                        onClick={() => setAiSuggestions(null)}
                        sx={{ fontWeight: 600, color: "text.secondary" }}
                      >
                        Clear
                      </Button>
                    )}
                  </Stack>

                  {/* AI Suggestions Preview — shown separately from existing values */}
                  {aiSuggestions && (
                    <Box
                      sx={{
                        mt: 2.5,
                        p: 2.5,
                        borderRadius: 2.5,
                        border: "1px solid #BFDBFE",
                        bgcolor: "#EFF6FF",
                        width: "100%",
                        maxWidth: "100%",
                        boxSizing: "border-box",
                        overflow: "hidden",
                      }}
                    >
                      {/* AI Suggested Features */}
                      {aiSuggestions.features.length > 0 && (
                        <Box sx={{ mb: 2.5, width: "100%", overflow: "hidden" }}>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 800, color: "primary.main", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", mb: 1 }}
                          >
                            AI SUGGESTED FEATURES (5 KEY FEATURES)
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 1,
                              width: "100%",
                              maxWidth: "100%",
                              overflow: "hidden",
                            }}
                          >
                            {aiSuggestions.features.map((feat, i) => (
                              <Chip
                                key={i}
                                label={feat}
                                size="small"
                                sx={{
                                  fontWeight: 600,
                                  bgcolor: "#DBEAFE",
                                  color: "#1E40AF",
                                  border: "1px solid #93C5FD",
                                  maxWidth: "100%",
                                  height: "auto",
                                  "& .MuiChip-label": {
                                    whiteSpace: "normal",
                                    display: "block",
                                    py: 0.6,
                                    px: 1.2,
                                    wordBreak: "break-word",
                                  },
                                }}
                              />
                            ))}
                          </Box>
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            disabled={aiLoading}
                            sx={{ mt: 1.5, fontWeight: 700 }}
                            onClick={() => {
                              setForm((prev) => ({
                                ...prev,
                                features: aiSuggestions.features.join(", "),
                              }));
                            }}
                          >
                            Use AI Features
                          </Button>
                        </Box>
                      )}

                      {/* AI Suggested Description */}
                      {aiSuggestions.description && (
                        <Box sx={{ width: "100%", overflow: "hidden" }}>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 800, color: "primary.main", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", mb: 1 }}
                          >
                            AI SUGGESTED DESCRIPTION
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#1E293B",
                              lineHeight: 1.7,
                              whiteSpace: "pre-wrap",
                              bgcolor: "#FFFFFF",
                              p: 2,
                              borderRadius: 2,
                              border: "1px solid #BFDBFE",
                              fontSize: "0.88rem",
                              width: "100%",
                              boxSizing: "border-box",
                              wordBreak: "break-word",
                            }}
                          >
                            {aiSuggestions.description}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ mt: 0.75, display: "block", fontWeight: 700, color: "text.secondary", textAlign: "right" }}
                          >
                            {aiSuggestions.description.length} / 1000 characters
                          </Typography>
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            disabled={aiLoading}
                            sx={{ mt: 1.5, fontWeight: 700 }}
                            onClick={() => {
                              setForm((prev) => ({
                                ...prev,
                                description: aiSuggestions.description.slice(0, 1000),
                              }));
                            }}
                          >
                            Use AI Description
                          </Button>
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              )}

            </Paper>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  id="features"
                  label="Features (Comma Separated)"
                  name="features"
                  value={form.features}
                  onChange={handleChange}
                  helperText="AC, Bluetooth, GPS Navigation, Sunroof, etc."
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  id="description"
                  label="Description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  inputProps={{ maxLength: 1000 }}
                  helperText={`${form.description.length}/1000 characters`}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Section 6: Registration Number */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <ConfirmationNumberIcon sx={{ color: "primary.main", fontSize: 24 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
                6. Registration
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Vehicle registration license plate.
            </Typography>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  id="registrationNumber"
                  label="Registration Number"
                  name="registrationNumber"
                  placeholder="WB12AB1234"
                  value={form.registrationNumber}
                  onChange={handleChange}
                  helperText="Vehicle registration number in uppercase."
                  inputProps={{
                    style: { textTransform: "uppercase" },
                    maxLength: 20,
                  }}
                  slotProps={{ input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <ConfirmationNumberIcon color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column-reverse", sm: "row" },
              justifyContent: "flex-end",
              gap: 2,
              pt: 1,
            }}
          >
            <Button
              component={RouterLink}
              to="/host/cars"
              variant="outlined"
              color="inherit"
              size="large"
              sx={{ px: 3, fontWeight: 600, borderColor: "#CBD5E1" }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              sx={{ px: 4, py: 1.2, fontWeight: 700 }}
            >
              {submitting ? "Saving Changes..." : "Save Vehicle Changes"}
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
