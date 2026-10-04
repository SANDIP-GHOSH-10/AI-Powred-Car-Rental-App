import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Stack from "@mui/material/Stack";

export function CarCardSkeleton({ count = 3 }) {
  return (
    <Grid container spacing={3.5}>
      {Array.from(new Array(count)).map((_, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
          <Card
            elevation={0}
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderRadius: 4,
              border: "1px solid #E2E8F0",
              overflow: "hidden",
            }}
          >
            {/* Image — matches CarCard's fixed 16/11 aspect-ratio box */}
            <Box sx={{ width: "100%", aspectRatio: "16 / 11", bgcolor: "#EEF2F7" }}>
              <Skeleton variant="rectangular" width="100%" height="100%" animation="wave" />
            </Box>

            {/* Floating price chip — matches the overlap on the real card */}
            <Box sx={{ px: 2.5, mt: "-20px", position: "relative", zIndex: 3, display: "flex", justifyContent: "flex-end" }}>
              <Skeleton variant="rounded" width={78} height={38} sx={{ borderRadius: 3 }} />
            </Box>

            <CardContent sx={{ flexGrow: 1, px: 2.5, pt: 1.25, pb: 2.5 }}>
              {/* Title + meta row */}
              <Skeleton variant="text" width="65%" height={30} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="45%" height={18} sx={{ mb: 1.75 }} />

              {/* Location */}
              <Skeleton variant="text" width="50%" height={18} sx={{ mb: 1.75 }} />

              {/* Spec pills */}
              <Box sx={{ display: "flex", gap: 1 }}>
                <Skeleton variant="rounded" width={72} height={26} sx={{ borderRadius: 5 }} />
                <Skeleton variant="rounded" width={60} height={26} sx={{ borderRadius: 5 }} />
                <Skeleton variant="rounded" width={68} height={26} sx={{ borderRadius: 5 }} />
              </Box>
            </CardContent>

            <CardActions sx={{ px: 2.5, pb: 2.5, pt: 0, display: "block" }}>
              <Skeleton variant="rounded" width="100%" height={44} sx={{ borderRadius: 2.5 }} />
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export function HorizontalCarCardSkeleton({ count = 4 }) {
  return (
    <Stack spacing={3}>
      {Array.from(new Array(count)).map((_, index) => (
        <Card
          key={index}
          elevation={0}
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            borderRadius: 4,
            border: "1px solid #E2E8F0",
            overflow: "hidden",
          }}
        >
          {/* Image skeleton — matches CarCard's aspect-ratio box (16/10 on mobile, 4/3 on sm+) */}
          <Box
            sx={{
              width: { xs: "100%", sm: "38%", md: "35%" },
              minWidth: { sm: 240, md: 280 },
              aspectRatio: { xs: "16 / 10", sm: "4 / 3" },
              flexShrink: 0,
            }}
          >
            <Skeleton variant="rectangular" width="100%" height="100%" animation="wave" />
          </Box>

          {/* Details skeleton (right side) */}
          <CardContent sx={{ flexGrow: 1, p: { xs: 2.5, sm: 3 }, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                <Box sx={{ width: "60%" }}>
                  <Skeleton variant="text" width="80%" height={32} />
                  <Skeleton variant="text" width="40%" height={20} />
                </Box>
                <Skeleton variant="text" width={80} height={32} />
              </Box>

              <Skeleton variant="text" width="30%" height={20} sx={{ mb: 2 }} />

              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <Skeleton variant="rounded" width={80} height={26} sx={{ borderRadius: 5 }} />
                <Skeleton variant="rounded" width={80} height={26} sx={{ borderRadius: 5 }} />
                <Skeleton variant="rounded" width={80} height={26} sx={{ borderRadius: 5 }} />
              </Box>
            </div>

            <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 1, borderTop: "1px solid #F1F5F9" }}>
              <Skeleton variant="rounded" width={140} height={40} sx={{ borderRadius: 2.5 }} />
            </Box>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

export function StatCardSkeleton({ count = 4 }) {
  return (
    <Grid container spacing={2.5}>
      {Array.from(new Array(count)).map((_, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
          <Card sx={{ p: 2.5, borderRadius: 3.5, border: "1px solid #E2E8F0" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Box sx={{ width: "70%" }}>
                <Skeleton variant="text" width="80%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="60%" height={38} />
              </Box>
              <Skeleton variant="circular" width={48} height={48} />
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <>
      {Array.from(new Array(rows)).map((_, rIndex) => (
        <TableRow key={rIndex}>
          {Array.from(new Array(columns)).map((_, cIndex) => (
            <TableCell key={cIndex}>
              <Skeleton variant="text" height={24} animation="wave" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}















// import Grid from "@mui/material/Grid";
// import Card from "@mui/material/Card";
// import CardContent from "@mui/material/CardContent";
// import Skeleton from "@mui/material/Skeleton";
// import Box from "@mui/material/Box";
// import TableRow from "@mui/material/TableRow";
// import TableCell from "@mui/material/TableCell";
// import Stack from "@mui/material/Stack";

// export function CarCardSkeleton({ count = 3 }) {
//   return (
//     <Grid container spacing={3.5}>
//       {Array.from(new Array(count)).map((_, index) => (
//         <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
//           <Card
//             elevation={0}
//             sx={{
//               height: "100%",
//               display: "flex",
//               flexDirection: "column",
//               borderRadius: 4,
//               border: "1px solid #E2E8F0",
//               overflow: "hidden",
//             }}
//           >
//             <Skeleton variant="rectangular" height={210} animation="wave" />
//             <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
//               <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
//                 <Skeleton variant="text" width="60%" height={32} />
//                 <Skeleton variant="rounded" width={70} height={24} />
//               </Box>
//               <Skeleton variant="text" width="40%" height={20} sx={{ mb: 2 }} />

//               <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
//                 <Skeleton variant="rounded" width={65} height={24} />
//                 <Skeleton variant="rounded" width={65} height={24} />
//                 <Skeleton variant="rounded" width={65} height={24} />
//               </Box>

//               <Skeleton variant="rectangular" height={1} sx={{ my: 1.5 }} />

//               <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
//                 <Skeleton variant="text" width="35%" height={28} />
//                 <Skeleton variant="rounded" width={110} height={38} />
//               </Box>
//             </CardContent>
//           </Card>
//         </Grid>
//       ))}
//     </Grid>
//   );
// }

// export function HorizontalCarCardSkeleton({ count = 4 }) {
//   return (
//     <Stack spacing={3}>
//       {Array.from(new Array(count)).map((_, index) => (
//         <Card
//           key={index}
//           elevation={0}
//           sx={{
//             display: "flex",
//             flexDirection: { xs: "column", sm: "row" },
//             borderRadius: 4,
//             border: "1px solid #E2E8F0",
//             overflow: "hidden",
//             minHeight: { sm: 200 },
//           }}
//         >
//           {/* Image skeleton (left 35%) */}
//           <Box sx={{ width: { xs: "100%", sm: "35%" }, minWidth: { sm: 240 }, minHeight: { xs: 200, sm: 220 } }}>
//             <Skeleton
//               variant="rectangular"
//               width="100%"
//               height="100%"
//               animation="wave"
//               sx={{ minHeight: { xs: 200, sm: 220 } }}
//             />
//           </Box>

//           {/* Details skeleton (right 65%) */}
//           <CardContent sx={{ flexGrow: 1, p: { xs: 2.5, sm: 3 }, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
//             <div>
//               <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
//                 <Box sx={{ width: "60%" }}>
//                   <Skeleton variant="text" width="80%" height={32} />
//                   <Skeleton variant="text" width="40%" height={20} />
//                 </Box>
//                 <Skeleton variant="text" width={80} height={32} />
//               </Box>

//               <Skeleton variant="text" width="30%" height={20} sx={{ mb: 2 }} />

//               <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
//                 <Skeleton variant="rounded" width={80} height={26} />
//                 <Skeleton variant="rounded" width={80} height={26} />
//                 <Skeleton variant="rounded" width={80} height={26} />
//               </Box>
//             </div>

//             <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 1, borderTop: "1px solid #F1F5F9" }}>
//               <Skeleton variant="rounded" width={140} height={40} />
//             </Box>
//           </CardContent>
//         </Card>
//       ))}
//     </Stack>
//   );
// }

// export function StatCardSkeleton({ count = 4 }) {
//   return (
//     <Grid container spacing={2.5}>
//       {Array.from(new Array(count)).map((_, index) => (
//         <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
//           <Card sx={{ p: 2.5, borderRadius: 3.5, border: "1px solid #E2E8F0" }}>
//             <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
//               <Box sx={{ width: "70%" }}>
//                 <Skeleton variant="text" width="80%" height={20} sx={{ mb: 1 }} />
//                 <Skeleton variant="text" width="60%" height={38} />
//               </Box>
//               <Skeleton variant="circular" width={48} height={48} />
//             </Box>
//           </Card>
//         </Grid>
//       ))}
//     </Grid>
//   );
// }

// export function TableSkeleton({ rows = 5, columns = 5 }) {
//   return (
//     <>
//       {Array.from(new Array(rows)).map((_, rIndex) => (
//         <TableRow key={rIndex}>
//           {Array.from(new Array(columns)).map((_, cIndex) => (
//             <TableCell key={cIndex}>
//               <Skeleton variant="text" height={24} animation="wave" />
//             </TableCell>
//           ))}
//         </TableRow>
//       ))}
//     </>
//   );
// }
