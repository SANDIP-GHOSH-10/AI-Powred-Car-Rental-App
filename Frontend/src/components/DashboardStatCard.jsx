import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";

export default function DashboardStatCard({
  title,
  value,
  subtitle,
  icon,
  color = "#1E3A8A",
  bgColor = "rgba(30, 58, 138, 0.08)",
}) {
  return (
    <Card
      sx={{
        height: "100%",
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          borderColor: color,
        },
      }}
    >
      <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}
            >
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary" }}>
              {value}
            </Typography>
          </Box>
          <Avatar
            variant="rounded"
            sx={{
              bgcolor: bgColor,
              color: color,
              width: 52,
              height: 52,
              borderRadius: 3,
            }}
          >
            {icon}
          </Avatar>
        </Box>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
