import Chip from "@mui/material/Chip";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CancelIcon from "@mui/icons-material/Cancel";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PaymentIcon from "@mui/icons-material/Payment";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import ReplayIcon from "@mui/icons-material/Replay";

export default function StatusChip({ status, size = "small", sx = {} }) {
  if (!status) return null;

  const normalized = String(status).toUpperCase();

  const getStatusConfig = () => {
    switch (normalized) {
      // Booking & Car Statuses
      case "AVAILABLE":
        return {
          label: "Available",
          color: "success",
          icon: <CheckCircleIcon fontSize="inherit" />,
          sx: {
            bgcolor: "rgba(16, 185, 129, 0.12)",
            color: "#065F46",
            border: "1px solid #A7F3D0",
            fontWeight: 700,
          },
        };
      case "UNAVAILABLE":
        return {
          label: "Unavailable",
          color: "warning",
          icon: <DoNotDisturbIcon fontSize="inherit" />,
          sx: {
            bgcolor: "rgba(245, 158, 11, 0.12)",
            color: "#92400E",
            border: "1px solid #FDE68A",
            fontWeight: 700,
          },
        };
      case "PENDING":
        return {
          label: "Pending",
          color: "warning",
          icon: <HourglassEmptyIcon fontSize="inherit" />,
          sx: {
            bgcolor: "rgba(249, 115, 22, 0.12)",
            color: "#9A3412",
            border: "1px solid #FED7AA",
            fontWeight: 700,
          },
        };
      case "CONFIRMED":
        return {
          label: "Confirmed",
          color: "success",
          icon: <CheckCircleIcon fontSize="inherit" />,
          sx: {
            bgcolor: "rgba(16, 185, 129, 0.12)",
            color: "#065F46",
            border: "1px solid #A7F3D0",
            fontWeight: 700,
          },
        };
      case "COMPLETED":
        return {
          label: "Completed",
          color: "info",
          icon: <TaskAltIcon fontSize="inherit" />,
          sx: {
            bgcolor: "rgba(14, 165, 233, 0.12)",
            color: "#075985",
            border: "1px solid #BAE6FD",
            fontWeight: 700,
          },
        };
      case "CANCELLED":
        return {
          label: "Cancelled",
          color: "error",
          icon: <CancelIcon fontSize="inherit" />,
          sx: {
            bgcolor: "rgba(239, 68, 68, 0.12)",
            color: "#991B1B",
            border: "1px solid #FECACA",
            fontWeight: 700,
          },
        };
      case "REJECTED":
        return {
          label: "Rejected",
          color: "error",
          icon: <CancelIcon fontSize="inherit" />,
          sx: {
            bgcolor: "rgba(239, 68, 68, 0.12)",
            color: "#991B1B",
            border: "1px solid #FECACA",
            fontWeight: 700,
          },
        };

      // Payment Statuses
      case "PAID":
        return {
          label: "Paid",
          color: "success",
          icon: <CheckCircleIcon fontSize="inherit" />,
          sx: {
            bgcolor: "rgba(16, 185, 129, 0.12)",
            color: "#065F46",
            border: "1px solid #A7F3D0",
            fontWeight: 700,
          },
        };
      case "FAILED":
        return {
          label: "Failed",
          color: "error",
          icon: <CancelIcon fontSize="inherit" />,
          sx: {
            bgcolor: "rgba(239, 68, 68, 0.12)",
            color: "#991B1B",
            border: "1px solid #FECACA",
            fontWeight: 700,
          },
        };
      case "REFUNDED":
        return {
          label: "Refunded",
          color: "info",
          icon: <ReplayIcon fontSize="inherit" />,
          sx: {
            bgcolor: "rgba(124, 58, 237, 0.12)",
            color: "#5B21B6",
            border: "1px solid #DDD6FE",
            fontWeight: 700,
          },
        };

      // Payment Methods
      case "ONLINE":
        return {
          label: "Online (Razorpay)",
          color: "primary",
          icon: <PaymentIcon fontSize="inherit" />,
          sx: {
            bgcolor: "rgba(30, 58, 138, 0.08)",
            color: "#1E3A8A",
            border: "1px solid #BFDBFE",
            fontWeight: 700,
          },
        };
      case "COD":
        return {
          label: "Pay at Pickup",
          color: "warning",
          icon: <LocalAtmIcon fontSize="inherit" />,
          sx: {
            bgcolor: "rgba(217, 119, 6, 0.1)",
            color: "#92400E",
            border: "1px solid #FDE68A",
            fontWeight: 700,
          },
        };

      default:
        return {
          label: status,
          color: "default",
          icon: <InfoOutlinedIcon fontSize="inherit" />,
          sx: {
            bgcolor: "#F1F5F9",
            color: "#334155",
            border: "1px solid #E2E8F0",
            fontWeight: 600,
          },
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Chip
      size={size}
      icon={config.icon}
      label={config.label}
      sx={{
        borderRadius: "8px",
        px: 0.5,
        fontSize: size === "medium" ? "0.85rem" : "0.75rem",
        ...config.sx,
        ...sx,
      }}
    />
  );
}
