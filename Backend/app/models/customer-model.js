import { Schema, model } from "mongoose";

const customerSchema = new Schema(
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

    dateOfBirth: {
      type: Date,
    },

    drivingLicenseNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },

    drivingLicenseVerified: {
      type: Boolean,
      default: false,
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
  },
  {
    timestamps: true,
  }
);

const Customer = model("Customer", customerSchema);

export default Customer;