import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/Auth.jsx";

export default function PrivateRoute({
  children,
}) {
  const {
    isLoggedIn,
    loading,
  } = useContext(AuthContext);


  // Wait until authentication check is completed
  if (loading) {
    return (
      <div>
        <h2>
          Checking authentication...
        </h2>
      </div>
    );
  }


  // User is not logged in
  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  return children;
}





























// import { Navigate } from "react-router-dom";
// import { useContext } from "react";

// import { AuthContext } from "../context/Auth.jsx";


// export default function PrivateRoute({
//   children,
// }) {

//   const {
//     isLoggedIn,
//     loading,
//   } = useContext(AuthContext);


//   if (loading) {
//     return (
//       <div>
//         <h2>Loading...</h2>
//       </div>
//     );
//   }


//   if (!isLoggedIn) {
//     return (
//       <Navigate
//         to="/login"
//         replace
//       />
//     );
//   }


//   return children;
// }

























// import { Navigate } from "react-router-dom"
// import { useContext } from "react";
// import { AuthContext } from "../context/Auth.jsx";
// export default function PrivateRoute(props) {
//     const {user} = useContext(AuthContext);
//     if(localStorage.getItem("token") && user){
//         return props.children;
//     }else{
//         return < Navigate to = "/login" replace />
//     }
// }










// // import { Navigate } from "react-router-dom"
// // export default function PrivateRoute(props) {
// //     const id =localStorage.getItem("id");
// //     if(id){
// //         return props.children;
// //     }else{
// //         return < Navigate to = "/login" replace />
// //     }
// // }