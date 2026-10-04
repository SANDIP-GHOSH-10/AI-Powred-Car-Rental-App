import jwt from "jsonwebtoken";

export default function authenticate(
  req,
  res,
  next
) {

  const authHeader =
    req.header("Authorization");


  const token =
    authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;


  if (!token) {

    return res.status(401).json({
      error: "No token provided",
    });

  }


  try {

    const tokenData =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );


    req.userId =
      tokenData.userId;


    req.roles =
      tokenData.roles || [];


    next();

  } catch (error) {

    console.log(
      "Error verifying token",
      error
    );


    return res.status(401).json({
      error: "Invalid token",
    });

  }

}
























// import jwt from "jsonwebtoken";

// export default function authenticate(req, res, next) {
//     const authHeader = req.header("Authorization");

//     const token = authHeader?.startsWith("Bearer ")
//         ? authHeader.slice(7)
//         : authHeader;

//     if (!token) {
//         return res.status(401).json({
//             error: "No token provided",
//         });
//     }

//     try {
//         const tokenData = jwt.verify(
//             token,
//             process.env.JWT_SECRET
//         );

//         // Store authenticated user's ID
//         req.userId = tokenData.userId;

//         // Store authenticated user's roles
//         req.roles = tokenData.roles || [];

//         next();
//     } catch (error) {
//         console.log(
//             "Error verifying token:",
//             error.message
//         );

//         return res.status(401).json({
//             error: "Invalid or expired token",
//         });
//     }
// }





















// import jwt from "jsonwebtoken";

// export default function authenticate(req, res, next) {
//     const authHeader = req.header("Authorization");
//     const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

//     if (!token) {
//         return res.status(401).json({ error: "No token provided" });
//     }

//     try {
//         const tokenData = jwt.verify(token, process.env.JWT_SECRET);
//         req.userId = tokenData.userId;
//         next();
//     } catch (error) {
//         console.log("Error verifying token", error);
//         res.status(401).json({ error: "Invalid token" });
//     }
// }