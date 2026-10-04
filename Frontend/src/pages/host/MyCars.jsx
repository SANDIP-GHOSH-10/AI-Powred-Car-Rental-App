import { useContext, useState, useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import AddBoxIcon from "@mui/icons-material/AddBox";
import TimeToLeaveIcon from "@mui/icons-material/TimeToLeave";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";

import { AppContext } from "../../context/AppContext.jsx";
import { useToast } from "../../components/ToastProvider.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import CarCard from "../../components/CarCard.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import { CarCardSkeleton } from "../../components/SkeletonLoader.jsx";

// -------------------------------------------------------
// STAT CARD
// -------------------------------------------------------

function StatCard({ label, count, icon, color }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid #E2E8F0",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        flex: 1,
        minWidth: { xs: "calc(50% - 8px)", sm: "auto" },
        bgcolor: "#FFFFFF",
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          bgcolor: `${color}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Box sx={{ color, fontSize: 20 }}>{icon}</Box>
      </Box>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
          {count}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
      </Box>
    </Paper>
  );
}

// -------------------------------------------------------
// MAIN PAGE
// -------------------------------------------------------

export default function MyCars() {
  const { myCars, myCarsLoading, deleteCar, updateCarStatus } = useContext(AppContext);
  const { showSuccess, showError } = useToast();

  const [togglingId, setTogglingId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fleet stats
  const stats = useMemo(() => ({
    total: myCars.length,
    available: myCars.filter((c) => c.status === "AVAILABLE").length,
    pending: myCars.filter((c) => c.status === "PENDING").length,
    unavailable: myCars.filter((c) => c.status === "UNAVAILABLE").length,
  }), [myCars]);

  const handleOpenDeleteDialog = (carId) => {
    // Store the full car object so we can show its name in the dialog
    const car = myCars.find((c) => c._id === carId);
    setCarToDelete(car || { _id: carId });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!carToDelete?._id) return;
    setDeleteLoading(true);

    try {
      await deleteCar(carToDelete._id);
      setDeleteDialogOpen(false);
      setCarToDelete(null);
      showSuccess("Car deleted successfully.");
    } catch (err) {
      console.error("Error deleting car:", err);
      showError(err.response?.data?.error || "Unable to delete car. Please try again.");
      setDeleteDialogOpen(false);
      setCarToDelete(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleStatus = async (carId, newStatus) => {
    setTogglingId(carId);

    try {
      await updateCarStatus(carId, newStatus);
      showSuccess(`Car availability updated to ${newStatus}.`);
    } catch (err) {
      console.error("Error toggling car status:", err);
      showError(err.response?.data?.error || "Unable to update availability. Please try again.");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <PageHeader
        title="My Cars"
        subtitle="Manage the vehicles you have listed on the platform"
        breadcrumbs={[{ label: "Host Dashboard", to: "/host" }, { label: "My Cars" }]}
        action={
          <Button
            component={RouterLink}
            to="/host/cars/add"
            variant="contained"
            color="primary"
            startIcon={<AddBoxIcon />}
            size="medium"
            sx={{ fontWeight: 700, px: 2.5 }}
          >
            Add New Car
          </Button>
        }
      />

      {/* Fleet Stats */}
      {!myCarsLoading && myCars.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1.5,
            mb: 4,
          }}
        >
          <StatCard
            label="Total Fleet"
            count={stats.total}
            icon={<DirectionsCarIcon fontSize="inherit" />}
            color="#6366f1"
          />
          <StatCard
            label="Available"
            count={stats.available}
            icon={<CheckCircleOutlineIcon fontSize="inherit" />}
            color="#10b981"
          />
          <StatCard
            label="Pending Approval"
            count={stats.pending}
            icon={<HourglassEmptyIcon fontSize="inherit" />}
            color="#f59e0b"
          />
          <StatCard
            label="Unavailable"
            count={stats.unavailable}
            icon={<DoNotDisturbIcon fontSize="inherit" />}
            color="#ef4444"
          />
        </Box>
      )}

      {myCarsLoading ? (
        <CarCardSkeleton count={6} />
      ) : myCars.length === 0 ? (
        <EmptyState
          icon={<TimeToLeaveIcon sx={{ fontSize: 64, color: "text.secondary", opacity: 0.5 }} />}
          title="No Vehicles Added Yet"
          description="You haven't listed any cars on the platform. Add your first car to start earning with self-drive rentals."
          actionText="Add Your First Car"
          actionLink="/host/cars/add"
          actionIcon={<AddBoxIcon />}
        />
      ) : (
        <>
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              Showing {myCars.length} {myCars.length === 1 ? "vehicle" : "vehicles"} in your fleet
            </Typography>
          </Box>
          <Grid container spacing={3.5}>
            {myCars.map((car) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={car._id}>
                <CarCard
                  car={car}
                  showHostActions
                  onDelete={handleOpenDeleteDialog}
                  onToggleStatus={handleToggleStatus}
                  isToggling={togglingId === car._id}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Vehicle Listing"
        content={
          carToDelete?.brand
            ? `Are you sure you want to delete "${carToDelete.brand} ${carToDelete.model}"? This will permanently remove the vehicle from customer search results and cannot be undone.`
            : "Are you sure you want to delete this car listing? This will permanently remove the vehicle from customer search results and cannot be undone."
        }
        confirmText="Delete Vehicle"
        confirmColor="error"
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setDeleteDialogOpen(false);
          setCarToDelete(null);
        }}
      />
    </Container>
  );
}