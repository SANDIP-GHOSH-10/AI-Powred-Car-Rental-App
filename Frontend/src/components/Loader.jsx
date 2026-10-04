import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";

export default function Loader({
  message = "Loading...",
  fullPage = false,
  variant = "circular",
  size = 44,
  minHeight = "40vh",
}) {
  if (variant === "linear") {
    return (
      <Box sx={{ width: "100%", my: 2 }}>
        <LinearProgress color="primary" />
        {message && (
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mt: 1.5, fontWeight: 500 }}
          >
            {message}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: fullPage ? "80vh" : minHeight,
        width: "100%",
        p: 3,
      }}
    >
      <CircularProgress
        size={size}
        thickness={4}
        sx={{
          color: "primary.main",
          mb: message ? 2 : 0,
        }}
      />
      {message && (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontWeight: 500, letterSpacing: "0.01em" }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
}
