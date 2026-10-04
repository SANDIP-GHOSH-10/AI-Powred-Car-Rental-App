import { Schema, model } from "mongoose";

const hostSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    address: {
      street: {
        type: String,
        trim: true,
      },

      city: {
        type: String,
        trim: true,
      },

      state: {
        type: String,
        trim: true,
      },

      country: {
        type: String,
        trim: true,
        default: "India",
      },

      pincode: {
        type: String,
        trim: true,
      },
    },

    verificationStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Host = model("Host", hostSchema);

export default Host;