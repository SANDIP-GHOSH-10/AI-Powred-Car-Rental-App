import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Link as RouterLink } from "react-router-dom";
import DirectionsCarFilledOutlinedIcon from "@mui/icons-material/DirectionsCarFilledOutlined";

export default function EmptyState({
  icon = <DirectionsCarFilledOutlinedIcon sx={{ fontSize: 64, color: "text.secondary", opacity: 0.6 }} />,
  title = "No Items Found",
  description = "There are currently no records to display.",
  actionText,
  actionLink,
  onAction,
  actionIcon,
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 4, sm: 6 },
        textAlign: "center",
        borderRadius: 4,
        border: "1px dashed #CBD5E1",
        backgroundColor: "#FFFFFF",
        my: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
        {icon}
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 460, mb: 3 }}>
        {description}
      </Typography>
      {actionText && (actionLink || onAction) && (
        <Button
          variant="contained"
          color="primary"
          size="large"
          component={actionLink ? RouterLink : "button"}
          to={actionLink}
          onClick={onAction}
          startIcon={actionIcon}
          sx={{ px: 3.5, py: 1.2 }}
        >
          {actionText}
        </Button>
      )}
    </Paper>
  );
}
