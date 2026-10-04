import crypto from "crypto";
import razorpay from "../../config/razorpay.js";
import Payment from "../models/payment-model.js";
import Booking from "../models/booking-models.js";
import Car from "../models/car-model.js";

const paymentsCtrl = {};

// =====================================================
// CREATE RAZORPAY ORDER
// POST /payments/create-order
// =====================================================
paymentsCtrl.createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        error: "Booking ID is required",
      });
    }

    // 1. Find booking
    const booking = await Booking.findById(bookingId).populate("car");

    if (!booking) {
      return res.status(404).json({
        error: "Booking not found",
      });
    }

    // 2. Verify ownership
    if (String(booking.customer) !== String(req.userId)) {
      return res.status(403).json({
        error: "You are not authorized to make payment for this booking",
      });
    }

    // 3. Verify booking status
    if (booking.status === "CANCELLED" || booking.status === "REJECTED") {
      return res.status(400).json({
        error: `Cannot make payment for a ${booking.status.toLowerCase()} booking`,
      });
    }

    // 4. Verify not already paid
    if (booking.paymentStatus === "PAID") {
      return res.status(400).json({
        error: "Payment already completed for this booking",
      });
    }

    // 5. Verify car availability for the booking dates (prevent double-booking conflict)
    const carId = booking.car._id || booking.car;
    const conflictingBooking = await Booking.findOne({
      _id: { $ne: booking._id },
      car: carId,
      status: { $in: ["PENDING", "CONFIRMED"] },
      startDate: { $lt: booking.endDate },
      endDate: { $gt: booking.startDate },
    });

    if (conflictingBooking) {
      return res.status(409).json({
        error: "Car is no longer available for these dates",
      });
    }

    // 6. Calculate amount strictly on backend
    const car = await Car.findById(carId);
    if (!car || !car.isActive) {
      return res.status(400).json({
        error: "Vehicle is currently unavailable",
      });
    }

    const pricePerDay = car.pricePerDay || booking.pricePerDay;
    const numberOfDays = booking.numberOfDays;
    const finalAmountInRupees = numberOfDays * pricePerDay;

    // Razorpay requires amount in Paise (1 INR = 100 Paise)
    const amountInPaise = Math.round(finalAmountInRupees * 100);

    if (amountInPaise <= 0) {
      return res.status(400).json({
        error: "Invalid booking amount",
      });
    }

    // 7. Create Razorpay order
    const safeReceipt = `rcpt_${booking._id.toString().slice(-8)}_${Date.now().toString().slice(-4)}`;

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: safeReceipt,
    });

    // 8. Create or update Payment record
    let payment = await Payment.findOne({
      booking: booking._id,
      status: "PENDING",
    });

    if (payment) {
      payment.razorpayOrderId = razorpayOrder.id;
      payment.amount = finalAmountInRupees;
      payment.currency = "INR";
      payment.method = "ONLINE";
      await payment.save();
    } else {
      payment = new Payment({
        booking: booking._id,
        customer: req.userId,
        amount: finalAmountInRupees,
        currency: "INR",
        method: "ONLINE",
        status: "PENDING",
        razorpayOrderId: razorpayOrder.id,
      });
      await payment.save();
    }

    // Also update booking paymentMethod to ONLINE
    booking.paymentMethod = "ONLINE";
    await booking.save();

    // 9. Return required order details to frontend (never expose secrets)
    return res.status(200).json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      bookingId: booking._id,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return res.status(500).json({
      error: error.message || "Failed to create payment order",
    });
  }
};

// =====================================================
// VERIFY RAZORPAY PAYMENT
// POST /payments/verify
// =====================================================
paymentsCtrl.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !bookingId
    ) {
      return res.status(400).json({
        error: "Missing required payment verification parameters",
      });
    }

    // 1. Verify booking exists and belongs to user
    const booking = await Booking.findById(bookingId).populate(
      "car",
      "brand model year type pricePerDay images location"
    );

    if (!booking) {
      return res.status(404).json({
        error: "Booking not found",
      });
    }

    if (String(booking.customer) !== String(req.userId)) {
      return res.status(403).json({
        error: "Unauthorized payment verification attempt",
      });
    }

    // 2. Perform HMAC SHA256 signature verification
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    const isSignatureValid = expectedSignature === razorpay_signature;

    // Find associated payment record
    let payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
      booking: booking._id,
    });

    if (!payment) {
      payment = await Payment.findOne({
        booking: booking._id,
        status: "PENDING",
      });
    }

    if (!isSignatureValid) {
      if (payment) {
        payment.status = "FAILED";
        payment.razorpayPaymentId = razorpay_payment_id;
        payment.razorpaySignature = razorpay_signature;
        await payment.save();
      }

      booking.paymentStatus = "FAILED";
      await booking.save();

      return res.status(400).json({
        success: false,
        error: "Payment verification failed: Invalid signature",
      });
    }

    // 3. Signature is valid: Mark Payment and Booking as PAID
    if (payment) {
      payment.status = "PAID";
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.razorpaySignature = razorpay_signature;
      await payment.save();
    } else {
      payment = new Payment({
        booking: booking._id,
        customer: req.userId,
        amount: booking.totalAmount,
        currency: "INR",
        method: "ONLINE",
        status: "PAID",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      });
      await payment.save();
    }

    booking.paymentStatus = "PAID";
    booking.paymentMethod = "ONLINE";
    await booking.save();

    await booking.populate("customer", "name email");

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      payment,
      booking,
    });
  } catch (error) {
    console.error("Error verifying Razorpay payment:", error);
    return res.status(500).json({
      error: "Error verifying payment signature",
    });
  }
};

// =====================================================
// GET LOGGED-IN CUSTOMER'S PAYMENTS
// GET /payments/my-payments
// =====================================================
paymentsCtrl.myPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      customer: req.userId,
    })
      .populate({
        path: "booking",
        populate: {
          path: "car",
          select: "brand model year pricePerDay images location",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("Error fetching my payments:", error);
    return res.status(500).json({
      error: "Error fetching payments",
    });
  }
};

// =====================================================
// GET SINGLE PAYMENT
// GET /payments/:id
// =====================================================
paymentsCtrl.show = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({
        path: "booking",
        populate: {
          path: "car",
          select: "brand model year pricePerDay images location",
        },
      })
      .populate("customer", "name email");

    if (!payment) {
      return res.status(404).json({
        error: "Payment not found",
      });
    }

    // Customer can only view own payment (Admin can view all)
    const isOwner = String(payment.customer._id || payment.customer) === String(req.userId);
    const isAdmin = Array.isArray(req.roles) && req.roles.includes("ADMIN");

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: "Not authorized to view this payment",
      });
    }

    return res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    return res.status(500).json({
      error: "Error fetching payment",
    });
  }
};

// =====================================================
// ADMIN: GET ALL PAYMENTS
// GET /admin/payments
// =====================================================
paymentsCtrl.adminPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("customer", "name email")
      .populate({
        path: "booking",
        populate: {
          path: "car",
          select: "brand model year registrationNumber host images",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("Error fetching admin payments:", error);
    return res.status(500).json({
      error: "Error fetching admin payments",
    });
  }
};

export default paymentsCtrl;
