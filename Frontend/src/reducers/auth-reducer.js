export default function reducer(state, action) {

  switch (action.type) {
    case "LOGIN": {
      return {
        ...state,
        isLoggedIn: true,
        user: action.payload,
        loading: false,
      };
    }
    case "LOGOUT": {
      return {
        ...state,
        isLoggedIn: false,
        user: null,
        loading: false,
      };
    }
    case "AUTH_LOADING_COMPLETE": {
      return {
        ...state,
        loading: false,
      };
    }
    default:
      return state;
  }
}

























// export default function reducer(state, action) {
//   switch (action.type) {

//     case "LOGIN":
//       return {
//         ...state,
//         isLoggedIn: true,
//         user: action.payload,
//         loading: false,
//       };

//     case "LOGOUT":
//       return {
//         ...state,
//         isLoggedIn: false,
//         user: null,
//         loading: false,
//       };

//     case "SET_LOADING":
//       return {
//         ...state,
//         loading: action.payload,
//       };

//     default:
//       throw new Error(
//         `Invalid action type: ${action.type}`
//       );
//   }
// }





















//export default reducer = (state, action) => {};

// export default function reducer(state, action) {
//   switch (action.type) {
//     case "LOGIN": {
//       return { ...state, isLoggedIn: true, user: action.payload };
//     }
//     case "LOGOUT": {
//       return { ...state, isLoggedIn: false, user: null };
//     }
//     default: {
//       throw new Error("Invalid action type");
//     }
//   }
// }
