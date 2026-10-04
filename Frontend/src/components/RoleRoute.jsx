import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/Auth.jsx";

export default function RoleRoute({
  allowedRoles,
  children,
}) {
  const { user } = useContext(AuthContext);

  // User should already be authenticated
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /*
    Our project supports multiple roles.

    Example:

    user.roles = ["CUSTOMER", "HOST"]

    allowedRoles = ["HOST"]

    Result:
    HOST is present -> access allowed
  */

  const userRoles = Array.isArray(user.roles)
    ? user.roles
    : user.role
      ? [user.role]
      : [];


  const hasPermission = allowedRoles.some(
    (role) => userRoles.includes(role)
  );


  if (!hasPermission) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }


  return children;
}

























// import { Navigate } from "react-router-dom";
// import { useContext } from "react";

// import { AuthContext } from "../context/Auth.jsx";


// export default function RoleRoute({
//   allowedRoles,
//   children,
// }) {

//   const { user } =
//     useContext(AuthContext);


//   if (!user) {
//     return (
//       <Navigate
//         to="/login"
//         replace
//       />
//     );
//   }


//   const userRoles =
//     user.roles || [];


//   const hasPermission =
//     userRoles.some((role) =>
//       allowedRoles.includes(role)
//     );


//   if (!hasPermission) {
//     return (
//       <Navigate
//         to="/dashboard"
//         replace
//       />
//     );
//   }


//   return children;
// }