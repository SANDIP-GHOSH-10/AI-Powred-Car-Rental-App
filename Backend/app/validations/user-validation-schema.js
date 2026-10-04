import User from "../models/user-model.js";

// Register Validation


export const userRegisterSchema = {
  name: {
    exists: {
      errorMessage: "Name is required",
    },

    notEmpty: {
      errorMessage: "Name cannot be empty",
    },

    trim: true,

    isLength: {
      options: {
        min: 2,
        max: 50,
      },
      errorMessage: "Name must be between 2 and 50 characters",
    },
  },

  email: {
    exists: {
      errorMessage: "Email is required",
    },

    notEmpty: {
      errorMessage: "Email cannot be empty",
    },

    trim: true,

    isEmail: {
      errorMessage: "Invalid email format",
    },

    normalizeEmail: true,

    custom: {
      options: async (value) => {
        const user = await User.findOne({
          email: value,
        });

        if (user) {
          throw new Error("Email already in use");
        }

        return true;
      },
    },
  },

  password: {
    exists: {
      errorMessage: "Password is required",
    },

    notEmpty: {
      errorMessage: "Password cannot be empty",
    },

    isStrongPassword: {
      options: {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0,
      },

      errorMessage:
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number",
    },
  },
  role: {
    optional: true,
    trim: true,
    isIn: {
      options: [["CUSTOMER", "HOST"]],
      errorMessage: "Invalid role",
    },
  },
};
 
// Login Validation 

export const userLoginSchema = {
  email: {
    exists: {
      errorMessage: "Email is required",
    },

    notEmpty: {
      errorMessage: "Email cannot be empty",
    },

    trim: true,

    isEmail: {
      errorMessage: "Invalid email format",
    },

    normalizeEmail: true,
  },

  password: {
    exists: {
      errorMessage: "Password is required",
    },

    notEmpty: {
      errorMessage: "Password cannot be empty",
    },
  },
};

// Update Validation
export const userUpdateSchema = {
  name: {
    optional: true,
    trim: true,
    isLength: {
      options: {
        min: 2,
        max: 50,
      },
      errorMessage: "Name must be between 2 and 50 characters",
    },
  },
};
























// import User from "../models/user-model.js";


// // Register Validation


// export const userRegisterSchema = {
//   name: {
//     exists: {
//       errorMessage: "Name is required",
//     },
//     notEmpty: {
//       errorMessage: "Name cannot be empty",
//     },
//     trim: true,
//     isLength: {
//       options: {
//         min: 2,
//         max: 50,
//       },
//       errorMessage: "Name must be between 2 and 50 characters",
//     },
//   },

//   email: {
//     exists: {
//       errorMessage: "Email is required",
//     },
//     notEmpty: {
//       errorMessage: "Email cannot be empty",
//     },
//     isEmail: {
//       errorMessage: "Invalid email format",
//     },
//     trim: true,
//     normalizeEmail: true,

//     custom: {
//       options: async (value) => {
//         const user = await User.findOne({ email: value });

//         if (user) {
//           throw new Error("Email already in use");
//         }

//         return true;
//       },
//     },
//   },

//   password: {
//     exists: {
//       errorMessage: "Password is required",
//     },
//     notEmpty: {
//       errorMessage: "Password cannot be empty",
//     },
//     isStrongPassword: {
//       options: {
//         minLength: 6,
//         minLowercase: 1,
//         minUppercase: 1,
//         minNumbers: 1,
//         minSymbols: 0,
//       },
//       errorMessage:
//         "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one number",
//     },
//   },
// };
 
// // Login Validation 

// export const userLoginSchema = {
//   email: {
//     exists: {
//       errorMessage: "Email is required",
//     },
//     notEmpty: {
//       errorMessage: "Email cannot be empty",
//     },
//     isEmail: {
//       errorMessage: "Invalid email format",
//     },
//     trim: true,
//     normalizeEmail: true,
//   },

//   password: {
//     exists: {
//       errorMessage: "Password is required",
//     },
//     notEmpty: {
//       errorMessage: "Password cannot be empty",
//     },
//   },
// };















// import User from "../models/user-model.js";

// export const userRegisterSchema = {
//   email: {
//     exists: {
//       errorMessage: "Email is required"
//     },
//     notEmpty: {
//       errorMessage: "Email cannot be empty"
//     },
//     isEmail: {
//       errorMessage: "Invalid email format"
//     },
//     trim: true,
//     normalizeEmail: true,
//     custom: {
//       options: async (value) => {
//         const user = await User.findOne({ email: value });

//         if (user) {
//           throw new Error("Email already in use");
//         }

//         return true;
//       }
//     }
//   },

//   password: {
//     exists: {
//       errorMessage: "Password is required"
//     },
//     notEmpty: {
//       errorMessage: "Password cannot be empty"
//     },

//     isStrongPassword: {
//       options: {
//         minLength: 6,
//         minLowercase: 1,
//         minUppercase: 1,
//         minNumbers: 1,
//         minSymbols: 0
//       },
//       errorMessage:
//         "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one number"
//     }
//   }
// };

// export const userLoginSchema = {
//   email: {
//     exists: {
//       errorMessage: "Email is required"
//     },
//     notEmpty: {
//       errorMessage: "Email cannot be empty"
//     },
//     isEmail: {
//       errorMessage: "Invalid email format"
//     },
//     trim: true,
//     normalizeEmail: true
//   },

//   password: {
//     exists: {
//       errorMessage: "Password is required"
//     },
//     notEmpty: {
//       errorMessage: "Password cannot be empty"
//     }
//   }
// };





















// // import User from "../models/user-model.js";
// // export const userRegisterSchema = {
// //     email: {
// //         exists:{
// //             errorMessage:"Email is required"
// //         },
// //         notEmpty:{
// //             errorMessage:"Email cannot be empty"
// //         },
// //         isEmail:{
// //             errorMessage:"Invalid email format"
// //         },
// //         trim : true,
// //         normalizeEmail : true,
// //         custom : {
// //             options : async (value)=>{ 
// //                 try {
// //                     const user = await User.findOne({email:value});
// //                     if(user){
// //                         throw new Error("Email already in use");
// //                     }
// //                 } catch (err) { 
// //                     throw new Error(err.message);
// //                 }
// //                 return true;
// //             }
// //         }
// //     },
// //     password: {
// //         exists:{
// //             errorMessage:"Password is required"
// //         },
// //         notEmpty:{
// //             errorMessage:"Password cannot be empty"
// //         },
// //         isstrongPassword:{
// //             options:{
// //                 minLength:6,
// //                 minLowercase:1,
// //                 minUppercase:1,
// //                 minNumbers:1,
// //                 minSymbols:0
// //             },
// //             errorMessage:"Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one number"
// //         }

// //     }

// // }


// // export const userLoginSchema = {
// //     email: {
// //         exists:{
// //             errorMessage:"Email is required"
// //         },
// //         notEmpty:{
// //             errorMessage:"Email cannot be empty"
// //         },
// //         isEmail:{
// //             errorMessage:"Invalid email format"
// //         },
// //         trim : true,
// //         normalizeEmail : true
// //     },
// //     password: {
// //         exists:{
// //             errorMessage:"Password is required"
// //         },
// //         notEmpty:{
// //             errorMessage:"Password cannot be empty"
// //         }
// //     }
// // }