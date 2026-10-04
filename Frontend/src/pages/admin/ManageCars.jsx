import { useContext, useState, useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Pagination from "@mui/material/Pagination";
import Avatar from "@mui/material/Avatar";

import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TimeToLeaveIcon from "@mui/icons-material/TimeToLeave";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { AppContext } from "../../context/AppContext.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import StatusChip from "../../components/StatusChip.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import { TableSkeleton } from "../../components/SkeletonLoader.jsx";

const ITEMS_PER_PAGE = 8;

export default function ManageCars() {
  const {
    adminCars,
    adminCarsLoading,
    adminApproveCar,
    adminRejectCar,
    error,
  } = useContext(AppContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [actionDialog, setActionDialog] = useState({ open: false, carId: null, type: "", carName: "" });
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const filteredCars = useMemo(() => {
    return adminCars.filter((c) => {
      const q = searchTerm.toLowerCase();
      return (
        c.brand?.toLowerCase().includes(q) ||
        c.model?.toLowerCase().includes(q) ||
        c.host?.name?.toLowerCase().includes(q) ||
        c.location?.city?.toLowerCase().includes(q)
      );
    });
  }, [adminCars, searchTerm]);

  const totalPages = Math.ceil(filteredCars.length / ITEMS_PER_PAGE) || 1;
  const paginatedCars = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredCars.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCars, page]);

  const handleOpenAction = (car, type) => {
    setActionDialog({
      open: true,
      carId: car._id,
      type,
      carName: `${car.brand} ${car.model}`,
    });
  };

  const handleConfirmAction = async () => {
    const { carId, type, carName } = actionDialog;
    if (!carId || !type) return;

    setActionLoading(true);
    setFeedback({ type: "", message: "" });

    try {
      if (type === "APPROVE") {
        await adminApproveCar(carId);
        setFeedback({ type: "success", message: `${carName} approved successfully.` });
      } else {
        await adminRejectCar(carId);
        setFeedback({ type: "success", message: `${carName} listing rejected.` });
      }
      setActionDialog({ open: false, carId: null, type: "", carName: "" });
    } catch (err) {
      console.error("Car action error:", err);
      setFeedback({
        type: "error",
        message: err.response?.data?.error || `Unable to ${type.toLowerCase()} car.`,
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <PageHeader
        title="Manage Vehicle Fleet"
        subtitle="Review, approve, reject, or inspect all vehicles submitted by platform hosts."
        breadcrumbs={[{ label: "Admin Console", to: "/admin" }, { label: "Cars" }]}
        action={
          <Button
            component={RouterLink}
            to="/admin"
            startIcon={<ArrowBackIcon />}
            variant="outlined"
          >
            Admin Console
          </Button>
        }
      />

      {feedback.message && (
        <Alert
          severity={feedback.type === "success" ? "success" : "error"}
          sx={{ mb: 3 }}
          onClose={() => setFeedback({ type: "", message: "" })}
        >
          {feedback.message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 4,
          borderRadius: 3.5,
          border: "1px solid #E2E8F0",
          bgcolor: "#FFFFFF",
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Search by vehicle brand, model, host, or city..."
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
      </Paper>

      {/* Fleet Table */}
      {adminCarsLoading ? (
        <Paper elevation={0} sx={{ p: 3, border: "1px solid #E2E8F0", borderRadius: 3.5 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>Host Owner</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Rate / Day</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableSkeleton rows={6} columns={6} />
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : filteredCars.length === 0 ? (
        <EmptyState
          icon={<TimeToLeaveIcon sx={{ fontSize: 64, color: "text.secondary", opacity: 0.5 }} />}
          title="No Vehicles Found"
          description="No vehicle records match your search criteria."
          actionText="Clear Search"
          onAction={() => setSearchTerm("")}
        />
      ) : (
        <>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: 3.5,
              border: "1px solid #E2E8F0",
              overflowX: "auto",
            }}
          >
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>Host Owner</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Rate / Day</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedCars.map((car) => {
                  const imgUrl =
                    car.images?.[0]?.url ||
                    (typeof car.images?.[0] === "string" ? car.images[0] : null);

                  return (
                    <TableRow key={car._id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                          {imgUrl ? (
                            <Avatar
                              variant="rounded"
                              src={imgUrl}
                              sx={{ width: 54, height: 40, borderRadius: 2 }}
                            />
                          ) : (
                            <Avatar
                              variant="rounded"
                              sx={{ width: 54, height: 40, borderRadius: 2, bgcolor: "#F1F5F9", color: "text.secondary" }}
                            >
                              <DirectionsCarIcon fontSize="small" />
                            </Avatar>
                          )}
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {car.brand} {car.model}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {car.year} • {car.transmission} • {car.fuelType}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {car.host?.name || "Unknown Host"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {car.host?.email || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {car.location?.city}, {car.location?.state}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                          ₹{Number(car.pricePerDay || 0).toLocaleString("en-IN")}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusChip status={car.status} />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                          <Button
                            component={RouterLink}
                            to={`/cars/${car._id}`}
                            variant="outlined"
                            size="small"
                            startIcon={<VisibilityIcon />}
                          >
                            View
                          </Button>
                          {car.status === "PENDING" && (
                            <>
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                startIcon={<CheckCircleIcon />}
                                onClick={() => handleOpenAction(car, "APPROVE")}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                startIcon={<CancelIcon />}
                                onClick={() => handleOpenAction(car, "REJECT")}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, v) => setPage(v)}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={actionDialog.open}
        title={actionDialog.type === "APPROVE" ? "Approve Vehicle Listing" : "Reject Vehicle Listing"}
        content={`Are you sure you want to ${actionDialog.type === "APPROVE" ? "approve" : "reject"} "${actionDialog.carName}"?`}
        confirmText={actionDialog.type === "APPROVE" ? "Approve Vehicle" : "Reject Vehicle"}
        confirmColor={actionDialog.type === "APPROVE" ? "success" : "error"}
        loading={actionLoading}
        onConfirm={handleConfirmAction}
        onClose={() => setActionDialog({ open: false, carId: null, type: "", carName: "" })}
      />
    </Container>
  );
}
