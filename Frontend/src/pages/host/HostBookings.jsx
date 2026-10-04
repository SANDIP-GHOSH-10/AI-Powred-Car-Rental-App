import { useContext, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";

import { AppContext } from "../../context/AppContext.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import StatusChip from "../../components/StatusChip.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import { TableSkeleton } from "../../components/SkeletonLoader.jsx";

export default function HostBookings() {
  const { hostBookings, hostBookingsLoading, updateHostBookingStatus } = useContext(AppContext);

  const [updatingId, setUpdatingId] = useState(null);
  const [dialogConfig, setDialogConfig] = useState({
    open: false,
    bookingId: null,
    status: "",
    title: "",
    content: "",
    confirmColor: "primary",
  });
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const handleOpenAction = (bookingId, status) => {
    let title = "Update Booking Status";
    let content = "Are you sure you want to change the status of this booking?";
    let confirmColor = "primary";

    if (status === "CONFIRMED") {
      title = "Confirm Booking Request";
      content = "Are you sure you want to approve and confirm this booking request?";
      confirmColor = "success";
    } else if (status === "CANCELLED") {
      title = "Reject / Cancel Booking";
      content = "Are you sure you want to reject or cancel this reservation?";
      confirmColor = "error";
    } else if (status === "COMPLETED") {
      title = "Mark as Completed";
      content = "Are you sure the customer has returned the vehicle and the trip is complete?";
      confirmColor = "info";
    }

    setDialogConfig({
      open: true,
      bookingId,
      status,
      title,
      content,
      confirmColor,
    });
  };

  const handleConfirmAction = async () => {
    const { bookingId, status } = dialogConfig;
    if (!bookingId || !status) return;

    setUpdatingId(bookingId);
    setFeedback({ type: "", message: "" });

    try {
      await updateHostBookingStatus(bookingId, status);
      setFeedback({
        type: "success",
        message: `Booking #${bookingId.slice(-6).toUpperCase()} updated to ${status}.`,
      });
      setDialogConfig((prev) => ({ ...prev, open: false }));
    } catch (err) {
      console.error("Error updating booking status:", err);
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
        title="Fleet Bookings"
        subtitle="Review, approve, reject, or complete rental reservations for your vehicles."
        breadcrumbs={[
          { label: "Host Dashboard", to: "/host" },
          { label: "Host Bookings" },
        ]}
        action={
          <Button
            component={RouterLink}
            to="/host"
            startIcon={<ArrowBackIcon />}
            variant="outlined"
          >
            Dashboard
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

      {hostBookingsLoading ? (
        <Paper elevation={0} sx={{ p: 3, border: "1px solid #E2E8F0", borderRadius: 3.5 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Dates</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableSkeleton rows={4} columns={6} />
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : hostBookings.length === 0 ? (
        <EmptyState
          icon={<BookOnlineIcon sx={{ fontSize: 64, color: "text.secondary", opacity: 0.5 }} />}
          title="No Reservations Found"
          description="There are currently no active or historical bookings for your vehicle fleet."
          actionText="View Listed Cars"
          actionLink="/host/cars"
        />
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 3.5,
            border: "1px solid #E2E8F0",
            overflowX: "auto",
          }}
        >
            <Table sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>Customer Contact</TableCell>
                  <TableCell>Schedule (Days)</TableCell>
                  <TableCell>Total Earnings</TableCell>
                  <TableCell>Booking Status</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {hostBookings.map((b) => (
                  <TableRow key={b._id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {b.car?.brand} {b.car?.model}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Ref: #{b._id.slice(-6).toUpperCase()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {b.customer?.name || "Customer"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {b.customer?.email || "No email"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
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
                    {/* Status Action Buttons */}
                    <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                      {b.status === "PENDING" && (
                        <>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => handleOpenAction(b._id, "CONFIRMED")}
                            disabled={updatingId === b._id}
                          >
                            Confirm
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<CancelOutlinedIcon />}
                            onClick={() => handleOpenAction(b._id, "CANCELLED")}
                            disabled={updatingId === b._id}
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {b.status === "CONFIRMED" && (
                        <>
                          <Button
                            variant="contained"
                            color="info"
                            size="small"
                            startIcon={<TaskAltIcon />}
                            onClick={() => handleOpenAction(b._id, "COMPLETED")}
                            disabled={updatingId === b._id}
                          >
                            Complete
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleOpenAction(b._id, "CANCELLED")}
                            disabled={updatingId === b._id}
                          >
                            Cancel
                          </Button>
                        </>
                      )}

                      {b.status !== "PENDING" && b.status !== "CONFIRMED" && (
                        <Typography variant="caption" color="text.secondary">
                          No actions
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={dialogConfig.open}
        title={dialogConfig.title}
        content={dialogConfig.content}
        confirmText="Yes, Proceed"
        confirmColor={dialogConfig.confirmColor}
        loading={updatingId !== null}
        onConfirm={handleConfirmAction}
        onClose={() => setDialogConfig((prev) => ({ ...prev, open: false }))}
      />
    </Container>
  );
}
