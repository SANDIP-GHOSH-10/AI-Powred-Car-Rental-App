import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    pickupLocation: {
      type: String,
      required: true,
      trim: true,
    },

    dropLocation: {
      type: String,
      trim: true,
    },

    numberOfDays: {
      type: Number,
      required: true,
      min: 1,
    },

    pricePerDay: {
      type: Number,
      required: true,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "CANCELLED",
        "COMPLETED",
        "REJECTED",
      ],
      default: "PENDING",
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "CANCELLED", "REFUNDED"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to optimize the overlap query used
// during availability checks and booking creation.
bookingSchema.index({ car: 1, status: 1, startDate: 1, endDate: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;