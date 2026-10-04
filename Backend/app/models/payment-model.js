import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
      trim: true,
    },
    method: {
      type: String,
      enum: ["COD", "ONLINE"],
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "CANCELLED"],
      default: "PENDING",
    },
    razorpayOrderId: {
      type: String,
      trim: true,
    },
    razorpayPaymentId: {
      type: String,
      trim: true,
    },
    razorpaySignature: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ booking: 1, customer: 1, status: 1 });
paymentSchema.index({ razorpayOrderId: 1 });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
