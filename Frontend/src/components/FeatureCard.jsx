import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export default function FeatureCard({ icon, title, description, badge }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        p: { xs: 2.5, sm: 3 },
        borderRadius: 3.5,
        border: "1px solid #E2E8F0",
        bgcolor: "#FFFFFF",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        flexDirection: "column",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px -4px rgba(30, 58, 138, 0.08), 0 4px 6px -2px rgba(30, 58, 138, 0.04)",
          borderColor: "#BFDBFE",
        },
      }}
    >
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 }, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: 2.5,
              bgcolor: "rgba(30, 58, 138, 0.08)",
              color: "primary.main",
            }}
          >
            {icon}
          </Box>
          {badge && (
            <Box
              sx={{
                bgcolor: "rgba(245, 158, 11, 0.12)",
                color: "#D97706",
                fontWeight: 700,
                fontSize: "0.72rem",
                px: 1.2,
                py: 0.4,
                borderRadius: 2,
                border: "1px solid rgba(245, 158, 11, 0.3)",
              }}
            >
              {badge}
            </Box>
          )}
        </Box>

        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 700,
            fontSize: "1.1rem",
            color: "text.primary",
            mb: 1,
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            lineHeight: 1.6,
            fontSize: "0.875rem",
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}
