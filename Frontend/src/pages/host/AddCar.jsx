import { useState, useEffect, useContext } from "react";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
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
import AddBoxIcon from "@mui/icons-material/AddBox";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import BuildIcon from "@mui/icons-material/Build";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";

import { AppContext } from "../../context/AppContext.jsx";
import { useToast } from "../../components/ToastProvider.jsx";
import PageHeader from "../../components/PageHeader.jsx";

const CAR_TYPES = ["HATCHBACK", "SEDAN", "SUV", "MUV", "COUPE", "CONVERTIBLE", "LUXURY"];
const TRANSMISSION_TYPES = ["MANUAL", "AUTOMATIC"];
const FUEL_TYPES = ["PETROL", "DIESEL", "ELECTRIC", "HYBRID"];

export default function AddCar() {
  const navigate = useNavigate();
  const { createCar, generateCarSuggestions } = useContext(AppContext);
  const { showSuccess, showError } = useToast();
  const [isDragging, setIsDragging] = useState(false);

  // AI suggestion local state — ON by default on AddCar
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null); // { features: [], description: "" }

  const [form, setForm] = useState({
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    type: "",
    transmission: "",
    fuelType: "",
    seats: 5,
    pricePerDay: "",
    city: "",
    state: "",
    pincode: "",
    description: "",
    features: "",
    registrationNumber: "",
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewItems, setPreviewItems] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      previewItems.forEach((item) => {
        if (item.url) URL.revokeObjectURL(item.url);
      });
    };
  }, [previewItems]);

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

  const handleFileChange = (e) => {
    setError("");
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const totalCount = selectedFiles.length + files.length;
    if (totalCount > 10) {
      setError("Maximum 10 images allowed per vehicle listing.");
      return;
    }

    const newPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setSelectedFiles((prev) => [...prev, ...files]);
    setPreviewItems((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveFile = (index) => {
    const target = previewItems[index];
    if (target && target.url) {
      URL.revokeObjectURL(target.url);
    }
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(f.type)
    );
    if (files.length === 0) {
      showError("Please drop valid image files (JPEG, PNG, WEBP).");
      return;
    }
    // Reuse existing handleFileChange logic via synthetic event-like object
    const totalCount = selectedFiles.length + files.length;
    if (totalCount > 10) {
      setError("Maximum 10 images allowed per vehicle listing.");
      return;
    }
    setError("");
    const newPreviews = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setSelectedFiles((prev) => [...prev, ...files]);
    setPreviewItems((prev) => [...prev, ...newPreviews]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Registration number validation
    const regTrimmed = form.registrationNumber.trim().toUpperCase();
    if (!regTrimmed) {
      setError("Registration number is required and cannot be empty.");
      return;
    }

    if (regTrimmed.length < 5 || regTrimmed.length > 20) {
      setError("Registration number must be between 5 and 20 characters.");
      return;
    }

    if (!form.brand.trim()) {
      setError("Car brand is required.");
      return;
    }

    if (!form.model.trim()) {
      setError("Car model is required.");
      return;
    }

    if (!form.type) {
      setError("Car body type is required.");
      return;
    }

    if (!form.transmission) {
      setError("Transmission type is required.");
      return;
    }

    if (!form.fuelType) {
      setError("Fuel type is required.");
      return;
    }

    if (!form.pricePerDay || Number(form.pricePerDay) <= 0) {
      setError("Please provide a valid price per day.");
      return;
    }

    if (!form.city.trim() || !form.state.trim()) {
      setError("City and State locations are required.");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("brand", form.brand.trim());
      formData.append("model", form.model.trim());
      formData.append("year", form.year);
      formData.append("type", form.type);
      formData.append("transmission", form.transmission);
      formData.append("fuelType", form.fuelType);
      formData.append("seats", form.seats);
      formData.append("pricePerDay", form.pricePerDay);
      formData.append("location.city", form.city.trim());
      formData.append("location.state", form.state.trim());
      if (form.pincode) {
        formData.append("location.pincode", form.pincode.trim());
      }
      formData.append("description", form.description.trim());
      formData.append("registrationNumber", regTrimmed);

      if (form.features) {
        const feats = form.features
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean);
        feats.forEach((feat) => formData.append("features", feat));
      }

      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      await createCar(formData);
      showSuccess("Car listed successfully! It's now pending admin approval.");
      navigate("/host/cars");
    } catch (err) {
      console.error("Error adding car:", err);
      const backendError = err.response?.data?.error;
      const validationErrors = err.response?.data?.errors;

      if (backendError) {
        setError(backendError);
        showError(backendError);
      } else if (validationErrors && validationErrors.length > 0) {
        setError(validationErrors[0].msg);
        showError(validationErrors[0].msg);
      } else {
        const msg = "Unable to add car. Please verify all required fields.";
        setError(msg);
        showError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      {/* Page Header */}
      <PageHeader
        title="Add Your Car"
        subtitle="Add your vehicle details to list it"
        breadcrumbs={[
          { label: "Host Dashboard", to: "/host" },
          { label: "My Cars", to: "/host/cars" },
          { label: "Add Car" },
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
          {/* ==================================================
              SECTION 1: BASIC INFORMATION
          ================================================== */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <DirectionsCarIcon sx={{ color: "primary.main", fontSize: 24 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
                Basic Information
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Specify the manufacturer, model line, and manufacturing year of your vehicle.
            </Typography>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  id="brand"
                  label="Brand"
                  name="brand"
                  placeholder="e.g. Toyota, Hyundai, Mahindra"
                  value={form.brand}
                  onChange={handleChange}
                  helperText="Enter the vehicle make or manufacturer"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  id="model"
                  label="Model"
                  name="model"
                  placeholder="e.g. Fortuner, Creta, Thar"
                  value={form.model}
                  onChange={handleChange}
                  helperText="Enter the specific vehicle model name"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  id="year"
                  type="number"
                  label="Year"
                  name="year"
                  placeholder="e.g. 2024"
                  value={form.year}
                  onChange={handleChange}
                  inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
                  helperText="Manufacturing or model year"
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
                  helperText="Select the vehicle body style"
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

          {/* ==================================================
              SECTION 2: VEHICLE SPECIFICATIONS
          ================================================== */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <BuildIcon sx={{ color: "primary.main", fontSize: 22 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
                Vehicle Specifications
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Choose the transmission mode, fuel category, and seating capacity.
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
                  helperText="Manual or Automatic transmission"
                >
                  <MenuItem value="" disabled>Select Transmission</MenuItem>
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
                  helperText="Select the primary engine fuel"
                >
                  <MenuItem value="" disabled>Select Fuel Type</MenuItem>
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
                  placeholder="e.g. 5 or 7"
                  value={form.seats}
                  onChange={handleChange}
                  inputProps={{ min: 1, max: 20 }}
                  helperText="Total passenger seating capacity"
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* ==================================================
              SECTION 3: PRICING
          ================================================== */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <CurrencyRupeeIcon sx={{ color: "primary.main", fontSize: 24 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
                Pricing
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Set your daily rental rate for customer self-drive bookings.
            </Typography>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  id="pricePerDay"
                  type="number"
                  label="Price Per Day"
                  name="pricePerDay"
                  placeholder="e.g. 2500"
                  value={form.pricePerDay}
                  onChange={handleChange}
                  inputProps={{ min: 0 }}
                  helperText="Daily rental rate charged to customers"
                  slotProps={{ input: {
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* ==================================================
              SECTION 4: LOCATION
          ================================================== */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <LocationOnIcon sx={{ color: "primary.main", fontSize: 24 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
                Location
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Where is the car stationed for customer pickup and return?
            </Typography>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  id="city"
                  label="City"
                  name="city"
                  placeholder="e.g. Kolkata"
                  value={form.city}
                  onChange={handleChange}
                  helperText="Primary city where the vehicle is located"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  id="state"
                  label="State"
                  name="state"
                  placeholder="e.g. West Bengal"
                  value={form.state}
                  onChange={handleChange}
                  helperText="State or Union Territory"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  id="pincode"
                  label="Pincode"
                  name="pincode"
                  placeholder="e.g. 700001"
                  value={form.pincode}
                  onChange={handleChange}
                  inputProps={{ maxLength: 6 }}
                  helperText="Optional 6-digit postal code"
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* ==================================================
              SECTION 5: CAR DETAILS
          ================================================== */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <InfoOutlinedIcon sx={{ color: "primary.main", fontSize: 24 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
                Car Details
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Provide key amenities and a helpful description to attract more renters.
            </Typography>

            {/* ---- AI Auto Suggestions Panel ---- */}
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
                      Generate features &amp; description from your car details
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

              {/* Generate button — only visible when toggle is ON */}
              {aiEnabled && (
                <Box sx={{ mt: 2 }}>
                  {!aiSuggestions && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      Enter <strong>Brand</strong> and <strong>Model</strong> above, then click Generate.
                      The more fields you fill, the more accurate the suggestion.
                    </Typography>
                  )}
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
                          const msg = err.response?.data?.error ||
                            "Unable to generate AI suggestions. You can continue manually or try again.";
                          showError(msg);
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

                  {/* Suggestions Preview */}
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
                      {/* Suggested Features (Exactly 5, flex-wrap responsive layout) */}
                      {aiSuggestions.features.length > 0 && (
                        <Box sx={{ mb: 2.5, width: "100%", overflow: "hidden" }}>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 800, color: "primary.main", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", mb: 1 }}
                          >
                            SUGGESTED FEATURES (5 KEY FEATURES)
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
                        </Box>
                      )}

                      {/* Suggested Description */}
                      {aiSuggestions.description && (
                        <Box sx={{ mb: 2.5, width: "100%", overflow: "hidden" }}>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 800, color: "primary.main", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", mb: 1 }}
                          >
                            SUGGESTED DESCRIPTION
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
                        </Box>
                      )}

                      {/* Use Suggestions button */}
                      <Alert
                        severity="info"
                        sx={{ mb: 2, fontSize: "0.825rem", py: 0.5, bgcolor: "#E0F2FE", border: "1px solid #BAE6FD" }}
                        icon={false}
                      >
                        Review the suggestions above. Click <strong>Use Suggestions</strong> to copy them into your form below. You can still edit both fields before submitting.
                      </Alert>
                      <Button
                        variant="contained"
                        color="primary"
                        size="medium"
                        disabled={aiLoading}
                        onClick={() => {
                          if (aiSuggestions.features.length > 0) {
                            setForm((prev) => ({
                              ...prev,
                              features: aiSuggestions.features.join(", "),
                            }));
                          }
                          if (aiSuggestions.description) {
                            setForm((prev) => ({
                              ...prev,
                              description: aiSuggestions.description.slice(0, 1000),
                            }));
                          }
                          showSuccess("AI suggestions applied to form! You can edit them below before saving.");
                        }}
                        sx={{ fontWeight: 700, px: 2.5 }}
                      >
                        Use Suggestions
                      </Button>
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
                  label="Features"
                  name="features"
                  placeholder="e.g. AC, Bluetooth, Sunroof, GPS Navigation, 360 Camera, Airbags"
                  value={form.features}
                  onChange={handleChange}
                  helperText="Enter key vehicle features separated by commas"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={7}
                  maxRows={14}
                  id="description"
                  label="Description"
                  name="description"
                  placeholder="Describe your vehicle's condition, luggage capacity, driving comfort, pickup rules, special features, and anything useful for renters…"
                  value={form.description}
                  onChange={handleChange}
                  inputProps={{ maxLength: 1000 }}
                  helperText={`${form.description.length}/1000 characters — a good description boosts booking rates`}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* ==================================================
              SECTION 6: IMAGES
          ================================================== */}
          {/* ==================================================
    SECTION 6: IMAGES
================================================== */}
<Box>
  <Box
    sx={{
      display: "flex",
      alignItems: { xs: "flex-start", sm: "center" },
      justifyContent: "space-between",
      gap: 2,
      mb: 1,
      flexDirection: { xs: "column", sm: "row" },
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <PhotoLibraryIcon sx={{ color: "primary.main", fontSize: 24 }} />
      <Typography
        variant="h6"
        sx={{ fontWeight: 800, color: "text.primary" }}
      >
        Images
      </Typography>
    </Box>

    <Chip
      label={`${selectedFiles.length} / 10 Selected`}
      size="small"
      color={selectedFiles.length > 0 ? "primary" : "default"}
      sx={{ fontWeight: 600 }}
    />
  </Box>

  <Typography
    variant="body2"
    color="text.secondary"
    sx={{
      mb: 3,
      maxWidth: 720,
      lineHeight: 1.6,
    }}
  >
    Upload clear exterior and interior photos of the vehicle (JPG, PNG,
    WEBP). The first image will be used as the primary cover.
  </Typography>

  {/* Upload Area */}
  <Paper
    elevation={0}
    sx={{
      p: { xs: 3, sm: 4.5 },
      minHeight: { xs: 210, sm: 240 },
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      border: "2px dashed",
      borderColor: isDragging ? "primary.main" : "#CBD5E1",
      borderRadius: 3.5,
      bgcolor: isDragging
        ? "rgba(99,102,241,0.05)"
        : "#F8FAFC",
      cursor: "pointer",
      transition: "all 0.2s ease-in-out",
      position: "relative",
      "&:hover": {
        borderColor: "primary.main",
        bgcolor: "rgba(30, 58, 138, 0.03)",
      },
    }}
    component="label"
    onDragOver={handleDragOver}
    onDragLeave={handleDragLeave}
    onDrop={handleDrop}
  >
    <input
      type="file"
      multiple
      accept="image/jpeg,image/jpg,image/png,image/webp"
      onChange={handleFileChange}
      style={{ display: "none" }}
    />

    <Box>
      <CloudUploadIcon
        sx={{
          fontSize: { xs: 44, sm: 52 },
          color: isDragging ? "primary.main" : "#94A3B8",
          mb: 1.5,
          transition: "color 0.2s",
        }}
      />

      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 700,
          color: isDragging ? "primary.main" : "text.primary",
        }}
      >
        {isDragging ? "Drop images here" : "Upload Car Images"}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mt: 0.75,
          lineHeight: 1.5,
        }}
      >
        {isDragging
          ? "Release to add images"
          : "Drag & drop images here, or click to browse from your device."}
      </Typography>

      <Typography
        variant="caption"
        color="text.disabled"
        sx={{
          display: "block",
          mt: 1.25,
        }}
      >
        Supported: JPEG, PNG, WEBP &bull; Max 10 files
      </Typography>
    </Box>
  </Paper>

  {/* Previews */}
  {previewItems.length > 0 ? (
    <Box sx={{ mt: 4 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700 }}
        >
          Selected Image Previews
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
        >
          {selectedFiles.length} image
          {selectedFiles.length !== 1 ? "s" : ""}
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 1.5, sm: 2 }}>
        {previewItems.map((item, index) => (
          <Grid size={{ xs: 6, sm: 4, md: 3 }} key={index}>
            <Card
              elevation={0}
              sx={{
                position: "relative",
                borderRadius: 2.5,
                overflow: "hidden",
                border: "1px solid #E2E8F0",
                height: { xs: 115, sm: 130 },
                bgcolor: "#F8FAFC",
              }}
            >
              <img
                src={item.url}
                alt={`Preview ${index + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />

              {index === 0 && (
                <Chip
                  label="Cover"
                  size="small"
                  color="primary"
                  sx={{
                    position: "absolute",
                    top: 7,
                    left: 7,
                    height: 21,
                    fontSize: "0.68rem",
                    fontWeight: 700,
                  }}
                />
              )}

              <Tooltip title="Remove photo">
                <IconButton
                  size="small"
                  onClick={() => handleRemoveFile(index)}
                  sx={{
                    position: "absolute",
                    top: 5,
                    right: 5,
                    bgcolor: "rgba(0,0,0,0.65)",
                    color: "#FFFFFF",
                    "&:hover": {
                      bgcolor: "error.main",
                    },
                  }}
                  aria-label={`Remove photo ${index + 1}`}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  ) : (
    <Box
      sx={{
        mt: 2.5,
        px: 2,
        py: 1.5,
        bgcolor: "#F8FAFC",
        borderRadius: 2,
        border: "1px solid #F1F5F9",
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ lineHeight: 1.5 }}
      >
        💡 No images selected yet. Adding high-quality photos
        significantly boosts booking rates.
      </Typography>
    </Box>
  )}
</Box>


          <Divider />

          {/* ==================================================
              SECTION 7: REGISTRATION
          ================================================== */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <ConfirmationNumberIcon sx={{ color: "primary.main", fontSize: 24 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
                Registration
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Official government vehicle license plate number for verification.
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
                  helperText="Enter your vehicle registration number."
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

          {/* ==================================================
              FORM ACTIONS
          ================================================== */}
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
              startIcon={
                submitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <AddBoxIcon />
                )
              }
              sx={{ px: 4, py: 1.2, fontWeight: 700 }}
            >
              {submitting ? "Adding Car..." : "Add Car"}
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
