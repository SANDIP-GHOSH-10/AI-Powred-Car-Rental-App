import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export default function HowItWorksCard({ stepNumber, icon, title, description, isLast = false }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        p: { xs: 2.5, sm: 3 },
        borderRadius: 3.5,
        border: "1px solid #E2E8F0",
        bgcolor: "#FFFFFF",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px -4px rgba(30, 58, 138, 0.08), 0 4px 6px -2px rgba(30, 58, 138, 0.04)",
          borderColor: "#BFDBFE",
        },
      }}
    >
      <CardContent
        sx={{
          p: 0,
          "&:last-child": { pb: 0 },
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Step Badge & Icon Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2.5,
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 50,
              height: 50,
              borderRadius: 3,
              bgcolor: "rgba(30, 58, 138, 0.08)",
              color: "primary.main",
            }}
          >
            {icon}
          </Box>

          <Typography
            variant="h3"
            sx={{
              fontFamily: "Outfit, Inter, sans-serif",
              fontWeight: 900,
              fontSize: "1.75rem",
              color: "primary.light",
              opacity: 0.35,
              lineHeight: 1,
            }}
          >
            {stepNumber}
          </Typography>
        </Box>

        {/* Step Title */}
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 700,
            fontSize: "1.15rem",
            color: "text.primary",
            mb: 1,
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>

        {/* Step Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            lineHeight: 1.65,
            fontSize: "0.875rem",
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}
