import { createContext, useEffect, useReducer } from "react";

import { useNavigate } from "react-router-dom";

import api from "../api/axios.js";

import reducer from "../reducers/auth-reducer.js";

export const AuthContext = createContext();

const initialState = {
  isLoggedIn: false,
  user: null,
  loading: true,
};

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [state, dispatch] = useReducer(reducer, initialState);

  // ==========================================
  // CHECK LOGIN WHEN PAGE RELOADS
  // ==========================================

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      dispatch({ type: "AUTH_LOADING_COMPLETE" });
      return;
    }

    // Use configured axios instance so the
    // Authorization header is applied consistently
    api
      .get("/profile")
      .then((response) => {
        // Backend returns { success: true, user }
        const user = response.data.user || response.data;

        console.log("Logged in user:", user);

        dispatch({ type: "LOGIN", payload: user });
      })
      .catch((error) => {
        console.error("Authentication failed:", error);

        localStorage.removeItem("token");

        dispatch({ type: "LOGOUT" });
      });
  }, []);

  // ==========================================
  // LOGIN
  // ==========================================

  const handleLogin = (user, token) => {
    localStorage.setItem("token", token);

    dispatch({
      type: "LOGIN",
      payload: user,
    });

    navigate("/dashboard");
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("token");

    dispatch({
      type: "LOGOUT",
    });

    navigate("/login");
  };

  // ==========================================
  // PAGE RELOAD
  // ==========================================

  const handlePageReload = (user) => {
    dispatch({
      type: "LOGIN",
      payload: user,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        dispatch,
        handleLogin,
        handleLogout,
        handlePageReload,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// import {
//   createContext,
//   useEffect,
//   useReducer,
// } from "react";

// import { useNavigate } from "react-router-dom";

// import api from "../api/axios.js";

// import reducer from "../reducers/auth-reducer.js";

// // Create Context
// export const AuthContext = createContext();

// const initialState = {
//   isLoggedIn: false,
//   user: null,
//   loading: true,
// };

// export function AuthProvider({ children }) {

//   const navigate = useNavigate();

//   const [state, dispatch] = useReducer(
//     reducer,
//     initialState
//   );

//   // ==========================================
//   // CHECK LOGIN WHEN PAGE RELOADS
//   // ==========================================

//   useEffect(() => {

//     const token = localStorage.getItem("token");

//     if (!token) {
//       dispatch({
//         type: "SET_LOADING",
//         payload: false,
//       });

//       return;
//     }

//     api
//       .get("/profile")

//       .then((response) => {

//         console.log(
//           "User profile:",
//           response.data
//         );

//         dispatch({
//           type: "LOGIN",
//           payload: response.data,
//         });

//       })

//       .catch((error) => {

//         console.log(
//           "Session expired or invalid:",
//           error.response?.data
//         );

//         localStorage.removeItem("token");

//         dispatch({
//           type: "LOGOUT",
//         });

//       });

//   }, []);

//   // ==========================================
//   // LOGIN
//   // ==========================================

//   const handleLogin = (user, token) => {

//     localStorage.setItem(
//       "token",
//       token
//     );

//     dispatch({
//       type: "LOGIN",
//       payload: user,
//     });

//     navigate("/dashboard");
//   };

//   // ==========================================
//   // LOGOUT
//   // ==========================================

//   const handleLogout = () => {

//     localStorage.removeItem("token");

//     dispatch({
//       type: "LOGOUT",
//     });

//     navigate("/login");
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         ...state,
//         dispatch,
//         handleLogin,
//         handleLogout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// import { createContext, useReducer } from "react";
// import { useNavigate } from "react-router-dom";
// import reducer from "../reducers/auth-reducer.js";
// //AuthContext

// export const AuthContext = createContext();

// const initialState = {
//   isLoggedIn: false,
//   user: null,
// };

// //AuthProvider

// export function AuthProvider(props) {
//   const navigate = useNavigate();
//   const [state, dispatch] = useReducer(reducer, initialState);
//   console.log("state", state);

//   // useEffect(() => {
//   //   const id = localStorage.getItem("id");
//   //   if (id) {
//   //     const user = users.find((ele) => ele.id == id);
//   //     if (user) {
//   //       dispatch({ type: "LOGIN", payload: user });
//   //     }
//   //   }
//   // },[]);

//   const handleLogin = (user, token) => {
//     dispatch({ type: "LOGIN", payload: user });
//     //localStorage.setItem("id", user.id);
//     localStorage.setItem("token", token);
//     navigate("/dashboard");
//   };

//   const handleLogout = () => {
//     dispatch({ type: "LOGOUT" });
//     //localStorage.removeItem("id");
//     localStorage.removeItem("token");
//     navigate("/login");
//   };
//   const handlePageReload = (user) => {
//     dispatch({ type: "LOGIN", payload: user });
//   };

//   return (
//     <AuthContext.Provider
//       value={{ ...state, dispatch, handleLogin, handleLogout, handlePageReload }}
//     >
//       {props.children}
//     </AuthContext.Provider>
//   );
// }
