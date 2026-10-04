import { useContext, useState, useMemo } from "react";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";

import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import RefreshIcon from "@mui/icons-material/Refresh";

import { AppContext } from "../../context/AppContext.jsx";
import CarCard from "../../components/CarCard.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { HorizontalCarCardSkeleton } from "../../components/SkeletonLoader.jsx";

const ITEMS_PER_PAGE = 6;

export default function Cars() {
  const { cars, carsLoading, error, fetchCars } = useContext(AppContext);

  // Client-side search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedFuel, setSelectedFuel] = useState("ALL");
  const [selectedTransmission, setSelectedTransmission] = useState("ALL");
  const [page, setPage] = useState(1);

  // Filter cars locally from AppContext
  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      // Search matching brand, model, city
      const query = searchTerm.toLowerCase().trim();
      const brandMatch = car.brand?.toLowerCase().includes(query);
      const modelMatch = car.model?.toLowerCase().includes(query);
      const cityMatch = car.location?.city?.toLowerCase().includes(query);
      const matchesSearch = !query || brandMatch || modelMatch || cityMatch;

      // Filter matches
      const matchesType = selectedType === "ALL" || car.type === selectedType;
      const matchesFuel = selectedFuel === "ALL" || car.fuelType === selectedFuel;
      const matchesTransmission =
        selectedTransmission === "ALL" || car.transmission === selectedTransmission;

      return matchesSearch && matchesType && matchesFuel && matchesTransmission;
    });
  }, [cars, searchTerm, selectedType, selectedFuel, selectedTransmission]);

  // Frontend pagination
  const totalPages = Math.ceil(filteredCars.length / ITEMS_PER_PAGE) || 1;

  const paginatedCars = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return filteredCars.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCars, page]);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedType("ALL");
    setSelectedFuel("ALL");
    setSelectedTransmission("ALL");
    setPage(1);
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      {/* Header */}
      <PageHeader
        title="Available Rental Cars"
        subtitle={`Discover and book from our verified collection of ${cars.length} vehicles.`}
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Cars" }]}
        action={
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchCars}
            size="medium"
            sx={{ fontWeight: 600 }}
          >
            Refresh Fleet
          </Button>
        }
      />

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 4 }}
          action={
            <Button color="inherit" size="small" onClick={fetchCars}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Filter & Search Bar */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          mb: 4,
          borderRadius: 3.5,
          border: "1px solid #E2E8F0",
          bgcolor: "#FFFFFF",
        }}
      >
        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          {/* Search Input */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by brand, model, city..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              slotProps={{ input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}}
            />
          </Grid>

          {/* Car Type Select */}
          <Grid size={{ xs: 6, sm: 3, md: 2.5 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Car Type"
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="ALL">All Types</MenuItem>
              <MenuItem value="HATCHBACK">Hatchback</MenuItem>
              <MenuItem value="SEDAN">Sedan</MenuItem>
              <MenuItem value="SUV">SUV</MenuItem>
              <MenuItem value="MUV">MUV</MenuItem>
              <MenuItem value="LUXURY">Luxury</MenuItem>
            </TextField>
          </Grid>

          {/* Transmission Select */}
          <Grid size={{ xs: 6, sm: 3, md: 2.5 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Transmission"
              value={selectedTransmission}
              onChange={(e) => {
                setSelectedTransmission(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="ALL">All Transmissions</MenuItem>
              <MenuItem value="MANUAL">Manual</MenuItem>
              <MenuItem value="AUTOMATIC">Automatic</MenuItem>
            </TextField>
          </Grid>

          {/* Fuel Type Select */}
          <Grid size={{ xs: 6, sm: 6, md: 2 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Fuel"
              value={selectedFuel}
              onChange={(e) => {
                setSelectedFuel(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="ALL">All Fuels</MenuItem>
              <MenuItem value="PETROL">Petrol</MenuItem>
              <MenuItem value="DIESEL">Diesel</MenuItem>
              <MenuItem value="ELECTRIC">Electric</MenuItem>
              <MenuItem value="HYBRID">Hybrid</MenuItem>
            </TextField>
          </Grid>

          {/* Reset Filters */}
          <Grid size={{ xs: 6, sm: 6, md: 1 }}>
            <Button
              fullWidth
              size="small"
              variant="text"
              color="inherit"
              onClick={handleResetFilters}
              sx={{ color: "text.secondary", fontWeight: 600, py: 1 }}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Content Area */}
      {carsLoading ? (
        <HorizontalCarCardSkeleton count={4} />
      ) : filteredCars.length === 0 ? (
        <EmptyState
          title="No Cars Available"
          description={
            cars.length === 0
              ? "There are currently no active cars listed in our fleet."
              : "No cars match your search filters. Try clearing your filters or changing search terms."
          }
          actionText={cars.length === 0 ? "Refresh Fleet" : "Reset Filters"}
          onAction={cars.length === 0 ? fetchCars : handleResetFilters}
          actionIcon={<RefreshIcon />}
        />
      ) : (
        <>
          {/* Results Count */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              Showing {paginatedCars.length} of {filteredCars.length} cars
            </Typography>
          </Box>

          {/* Horizontal Cars List (Stack layout for horizontal cards) */}
          <Stack spacing={3}>
            {paginatedCars.map((car) => (
              <CarCard key={car._id} car={car} variant="horizontal" />
            ))}
          </Stack>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
                shape="rounded"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
