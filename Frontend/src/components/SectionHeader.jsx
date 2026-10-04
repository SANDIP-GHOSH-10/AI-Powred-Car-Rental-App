import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function SectionHeader({
  overline,
  title,
  subtitle,
  align = "center",
  action,
  sx = {},
}) {
  const isCentered = align === "center";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: isCentered && !action ? "column" : "row" },
        justifyContent: isCentered && !action ? "center" : "space-between",
        alignItems: isCentered && !action ? "center" : { xs: "flex-start", sm: "flex-end" },
        textAlign: isCentered && !action ? "center" : "left",
        mb: { xs: 4, md: 5 },
        gap: 2,
        ...sx,
      }}
    >
      <Box sx={{ maxWidth: isCentered && !action ? 680 : 600 }}>
        {overline && (
          <Typography
            variant="overline"
            sx={{
              display: "inline-block",
              color: "primary.main",
              fontWeight: 800,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              fontSize: "0.78rem",
              mb: 0.5,
            }}
          >
            {overline}
          </Typography>
        )}
        {title && (
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 800,
              color: "text.primary",
              letterSpacing: "-0.02em",
              fontSize: { xs: "1.75rem", sm: "2.15rem", md: "2.5rem" },
              lineHeight: 1.2,
              mb: subtitle ? 1 : 0,
            }}
          >
            {title}
          </Typography>
        )}
        {subtitle && (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              fontSize: { xs: "0.95rem", md: "1.05rem" },
              lineHeight: 1.6,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {action && (
        <Box sx={{ flexShrink: 0, alignSelf: { xs: "flex-start", sm: "flex-end" } }}>
          {action}
        </Box>
      )}
    </Box>
  );
}
