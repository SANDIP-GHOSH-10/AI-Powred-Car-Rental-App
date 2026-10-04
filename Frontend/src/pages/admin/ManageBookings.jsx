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
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputAdornment from "@mui/material/InputAdornment";
import Pagination from "@mui/material/Pagination";
import CircularProgress from "@mui/material/CircularProgress";

import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BookOnlineIcon from "@mui/icons-material/BookOnline";

import { AppContext } from "../../context/AppContext.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import StatusChip from "../../components/StatusChip.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { TableSkeleton } from "../../components/SkeletonLoader.jsx";

const ITEMS_PER_PAGE = 8;
const BOOKING_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];

export default function ManageBookings() {
  const {
    adminBookings,
    adminBookingsLoading,
    updateBookingStatus,
    error,
  } = useContext(AppContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const filteredBookings = useMemo(() => {
    return adminBookings.filter((b) => {
      const q = searchTerm.toLowerCase();
      const matchQuery =
        b.customer?.name?.toLowerCase().includes(q) ||
        b.customer?.email?.toLowerCase().includes(q) ||
        b.car?.brand?.toLowerCase().includes(q) ||
        b.car?.model?.toLowerCase().includes(q) ||
        b._id?.toLowerCase().includes(q);

      const matchStatus = statusFilter === "ALL" || b.status === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [adminBookings, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE) || 1;
  const paginatedBookings = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredBookings.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBookings, page]);

  const handleStatusChange = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    setFeedback({ type: "", message: "" });

    try {
      await updateBookingStatus(bookingId, newStatus);
      setFeedback({
        type: "success",
        message: `Booking #${bookingId.slice(-6).toUpperCase()} updated to ${newStatus}.`,
      });
    } catch (err) {
      console.error("Error updating booking:", err);
      setFeedback({
        type: "error",
        message: err.response?.data?.error || "Unable to update booking status.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <PageHeader
        title="Manage All Bookings"
        subtitle="Full administrative audit over all customer reservations and fleet rentals."
        breadcrumbs={[{ label: "Admin Console", to: "/admin" }, { label: "Bookings" }]}
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

      {/* Filter & Search Bar */}
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
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: "center" }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by customer, car, or booking ID..."
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
          <TextField
            select
            size="small"
            label="Status Filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="ALL">All Statuses</MenuItem>
            {BOOKING_STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      {/* Bookings Table */}
      {adminBookingsLoading ? (
        <Paper elevation={0} sx={{ p: 3, border: "1px solid #E2E8F0", borderRadius: 3.5 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Booking Ref</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>Trip Dates</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Change Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableSkeleton rows={6} columns={7} />
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          icon={<BookOnlineIcon sx={{ fontSize: 64, color: "text.secondary", opacity: 0.5 }} />}
          title="No Bookings Found"
          description="No reservation records match your search criteria."
          actionText="Clear Search"
          onAction={() => {
            setSearchTerm("");
            setStatusFilter("ALL");
          }}
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
            <Table sx={{ minWidth: 950 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Booking Ref</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>Trip Schedule</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Booking Status</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell align="right">Override Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedBookings.map((b) => (
                  <TableRow key={b._id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        #{b._id.slice(-6).toUpperCase()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(b.createdAt || Date.now()).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {b.customer?.name || "Unknown"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {b.customer?.email || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {b.car?.brand} {b.car?.model}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Host: {b.car?.host?.name || "Host"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(b.startDate).toLocaleDateString()} — {new Date(b.endDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {b.numberOfDays} Days
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "primary.main" }}>
                        ₹{Number(b.totalAmount || 0).toLocaleString("en-IN")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={b.status} />
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5} sx={{ alignItems: "flex-start" }}>
                        <StatusChip status={b.paymentMethod || "COD"} size="small" />
                        <StatusChip status={b.paymentStatus || "PENDING"} size="small" />
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      {updatingId === b._id ? (
                        <CircularProgress size={20} color="primary" />
                      ) : (
                        <FormControl size="small" sx={{ minWidth: 130 }}>
                          <Select
                            value={b.status || ""}
                            onChange={(e) => handleStatusChange(b._id, e.target.value)}
                            sx={{ fontSize: "0.85rem", fontWeight: 600 }}
                          >
                            {BOOKING_STATUSES.map((s) => (
                              <MenuItem key={s} value={s} sx={{ fontSize: "0.85rem" }}>
                                {s}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
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
    </Container>
  );
}