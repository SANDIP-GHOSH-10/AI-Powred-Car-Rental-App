import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
    },

    roles: {
      type: [String],
      enum: ["CUSTOMER", "HOST", "ADMIN"],
      default: ["CUSTOMER"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);

export default User;














// import { Schema, model } from "mongoose";

// const userSchema = new Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//       minlength: 2,
//       maxlength: 50,
//     },

//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },

//     password: {
//       type: String,
//       required: true,
//       select: false,
//     },

//     role: {
//       type: String,
//       enum: ["user", "admin"],
//       default: "user",
//     },

//     hostStatus: {
//       type: String,
//       enum: ["none", "pending", "approved", "rejected"],
//       default: "none",
//     },

//     phone: {
//       type: String,
//       trim: true,
//       default: "",
//     },

//     profileImage: {
//       type: String,
//       default: "",
//     },

//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const User = model("User", userSchema);

// export default User;























// import { Schema, model } from "mongoose";

// const userSchema = new Schema({
//     email: String,
//     password : String
// },{timestamps:true})

// const User = model("User", userSchema);

// export default User;