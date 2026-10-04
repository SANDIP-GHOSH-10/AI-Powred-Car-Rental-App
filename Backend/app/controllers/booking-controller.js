import Car from "../models/car-model.js";
import Booking from "../models/booking-models.js"; 
import { validationResult } from "express-validator";

const bookingsCtrl = {};

const normalizeDateOnly = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  const dateValue = String(value).trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return null;
  }

  const [year, month, day] = dateValue.split("-").map(Number);

  return new Date(year, month - 1, day);
};

const formatDateOnly = (value) => {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getBookingOverlapQuery = ({ carId, startDate, endDate, excludeBookingId = null }) => {
  const start = normalizeDateOnly(startDate);
  const end = normalizeDateOnly(endDate);

  if (!(start instanceof Date) || !(end instanceof Date) || end <= start) {
    return null;
  }

  const query = {
    car: carId,
    status: { $in: ["PENDING", "CONFIRMED"] },
    startDate: { $lt: end },
    endDate: { $gt: start },
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  return query;
};

const findBlockingBooking = async ({ carId, startDate, endDate, excludeBookingId = null }) => {
  const query = getBookingOverlapQuery({ carId, startDate, endDate, excludeBookingId });

  if (!query) {
    return null;
  }

  return Booking.findOne(query);
};

const getNumberOfDays = (startDate, endDate) => {
  const start = normalizeDateOnly(startDate);
  const end = normalizeDateOnly(endDate);

  if (!(start instanceof Date) || !(end instanceof Date)) {
    return 0;
  }

  const totalMs = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(totalMs / (1000 * 60 * 60 * 24)));
};

// =====================================================
// GET BOOKED DATES FOR CAR
// =====================================================

bookingsCtrl.getBookedDates = async (req, res) => {
  try {
    const { carId } = req.params;

    if (!carId) {
      return res.status(400).json({
        error: "Car id is required",
      });
    }

    const bookings = await Booking.find({
      car: carId,
      status: { $in: ["PENDING", "CONFIRMED"] },
    })
      .select("startDate endDate status")
      .sort({ startDate: 1 });

    const bookedDates = bookings.map((booking) => ({
      startDate: formatDateOnly(booking.startDate),
      endDate: formatDateOnly(booking.endDate),
      status: booking.status,
    }));

    return res.status(200).json({
      success: true,
      bookedDates,
    });
  } catch (error) {
    console.log("Error fetching booked dates:", error);

    return res.status(500).json({
      error: "Error fetching booked dates",
    });
  }
};

// =====================================================
// CREATE BOOKING
// =====================================================

bookingsCtrl.create = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  const {
    car,
    carId,
    startDate,
    endDate,
    pickupLocation,
    dropLocation,
    paymentMethod,
  } = req.body;

  const carRef = car || carId;

  try {
    const start = normalizeDateOnly(startDate);
    const end = normalizeDateOnly(endDate);

    if (!(start instanceof Date) || !(end instanceof Date)) {
      return res.status(400).json({
        error: "Invalid date format",
      });
    }

    if (end <= start) {
      return res.status(400).json({
        error: "End date must be after start date",
      });
    }

    const selectedCar = await Car.findById(carRef);

    if (!selectedCar) {
      return res.status(404).json({
        error: "Car not found",
      });
    }

    if (!selectedCar.isActive || selectedCar.status !== "AVAILABLE") {
      return res.status(400).json({
        error: "This car is currently unavailable for booking",
      });
    }

    const existingBooking = await findBlockingBooking({
      carId: selectedCar._id,
      startDate: start,
      endDate: end,
    });

    if (existingBooking) {
      return res.status(409).json({
        error: "This car has already been booked for the selected dates",
      });
    }

    const numberOfDays = getNumberOfDays(start, end);
    const pricePerDay = selectedCar.pricePerDay;
    const totalAmount = numberOfDays * pricePerDay;

    const booking = new Booking({
      customer: req.userId,
      car: selectedCar._id,
      startDate: start,
      endDate: end,
      pickupLocation,
      dropLocation,
      numberOfDays,
      pricePerDay,
      totalAmount,
      status: "PENDING",
      paymentMethod: paymentMethod === "ONLINE" ? "ONLINE" : "COD",
      paymentStatus: "PENDING",
    });

    await booking.save();
    await booking.populate("car", "brand model year type pricePerDay images location");

    return res.status(201).json({
      success: true,
      booking,
      message: "Booking created successfully",
    });
  } catch (error) {
    console.log(
      "Error creating booking:",
      error
    );

    return res.status(500).json({
      error: "Error creating booking",
    });
  }
};


// =====================================================
// GET MY BOOKINGS
// =====================================================

bookingsCtrl.list = async (req, res) => {
  try {
    const bookings = await Booking.find({
      customer: req.userId,
    })
      .populate(
        "car",
        "brand model year type pricePerDay images location"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.log(
      "Error fetching bookings:",
      error
    );

    return res.status(500).json({
      error: "Error fetching bookings",
    });
  }
};


// =====================================================
// GET BOOKINGS FOR HOST'S CARS
// =====================================================

bookingsCtrl.hostList = async (req, res) => {
  try {
    // fetch bookings with car populated, then filter by car.host
    const bookings = await Booking.find()
      .populate(
        "car",
        "brand model year type pricePerDay images location host"
      )
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

    const hostBookings = bookings.filter((b) => {
      return b.car && String(b.car.host) === String(req.userId);
    });

    return res.status(200).json({
      success: true,
      count: hostBookings.length,
      bookings: hostBookings,
    });
  } catch (error) {
    console.log("Error fetching host bookings:", error);

    return res.status(500).json({
      error: "Error fetching host bookings",
    });
  }
};


// =====================================================
// GET SINGLE BOOKING
// =====================================================

bookingsCtrl.show = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      customer: req.userId,
    }).populate(
      "car",
      "brand model year type pricePerDay images location"
    );

    if (!booking) {
      return res.status(404).json({
        error: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.log(
      "Error fetching booking:",
      error
    );

    return res.status(500).json({
      error: "Error fetching booking",
    });
  }
};


// =====================================================
// UPDATE BOOKING
// =====================================================

bookingsCtrl.update = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      customer: req.userId,
    });

    if (!booking) {
      return res.status(404).json({
        error: "Booking not found",
      });
    }

    if (
      booking.status === "CANCELLED" ||
      booking.status === "COMPLETED"
    ) {
      return res.status(400).json({
        error: "This booking cannot be updated",
      });
    }

    const startDate =
      req.body.startDate
        ? normalizeDateOnly(req.body.startDate)
        : normalizeDateOnly(booking.startDate);

    const endDate =
      req.body.endDate
        ? normalizeDateOnly(req.body.endDate)
        : normalizeDateOnly(booking.endDate);

    if (!(startDate instanceof Date) || !(endDate instanceof Date) || endDate <= startDate) {
      return res.status(400).json({
        error: "End date must be after start date",
      });
    }

    const conflictingBooking = await findBlockingBooking({
      carId: booking.car,
      startDate,
      endDate,
      excludeBookingId: booking._id,
    });

    if (conflictingBooking) {
      return res.status(409).json({
        error: "This car has already been booked for the selected dates",
      });
    }

    const car = await Car.findById(booking.car);

    if (!car) {
      return res.status(404).json({
        error: "Car not found",
      });
    }

    const numberOfDays = getNumberOfDays(startDate, endDate);

    booking.startDate = startDate;
    booking.endDate = endDate;

    if (
      req.body.pickupLocation !== undefined
    ) {
      booking.pickupLocation =
        req.body.pickupLocation;
    }

    if (
      req.body.dropLocation !== undefined
    ) {
      booking.dropLocation =
        req.body.dropLocation;
    }

    booking.numberOfDays = numberOfDays;

    booking.pricePerDay =
      car.pricePerDay;

    booking.totalAmount =
      numberOfDays * car.pricePerDay;

    await booking.save();

    return res.status(200).json({
      success: true,
      booking,
      message: "Booking updated successfully",
    });
  } catch (error) {
    console.log(
      "Error updating booking:",
      error
    );

    return res.status(500).json({
      error: "Error updating booking",
    });
  }
};


// =====================================================
// CANCEL BOOKING
// =====================================================

bookingsCtrl.cancel = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      customer: req.userId,
    });

    if (!booking) {
      return res.status(404).json({
        error: "Booking not found",
      });
    }

    if (
      booking.status === "CANCELLED" ||
      booking.status === "COMPLETED"
    ) {
      return res.status(400).json({
        error: "Booking cannot be cancelled",
      });
    }

    booking.status = "CANCELLED";

    await booking.save();

    return res.status(200).json({
      success: true,
      booking,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.log(
      "Error cancelling booking:",
      error
    );

    return res.status(500).json({
      error: "Error cancelling booking",
    });
  }
};


// =====================================================
// UPDATE BOOKING STATUS (HOST)
// =====================================================

bookingsCtrl.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Host can set: CONFIRMED, CANCELLED (reject), COMPLETED
    const allowedStatuses = ["CONFIRMED", "CANCELLED", "COMPLETED"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status. Must be CONFIRMED, CANCELLED, or COMPLETED",
      });
    }

    const booking = await Booking.findById(req.params.id)
      .populate("car", "host brand model year type pricePerDay images location");

    if (!booking) {
      return res.status(404).json({
        error: "Booking not found",
      });
    }

    // OWNERSHIP CHECK: booking.car.host must match logged-in user
    if (String(booking.car.host) !== String(req.userId)) {
      return res.status(403).json({
        error: "Not authorized to update this booking",
      });
    }

    const allowedTransitions = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["COMPLETED", "CANCELLED"],
    };

    const allowed = allowedTransitions[booking.status];

    if (!allowed || !allowed.includes(status)) {
      return res.status(400).json({
        error: `Cannot change status from ${booking.status} to ${status}`,
      });
    }

    if (status === "CONFIRMED") {
      const conflictingBooking = await findBlockingBooking({
        carId: booking.car._id,
        startDate: booking.startDate,
        endDate: booking.endDate,
        excludeBookingId: booking._id,
      });

      if (conflictingBooking) {
        return res.status(409).json({
          error: "This car has already been booked for the selected dates. Please choose a different booking window.",
        });
      }
    }

    booking.status = status;
    await booking.save();

    // Re-populate customer for frontend display
    await booking.populate("customer", "name email");

    return res.status(200).json({
      success: true,
      booking,
      message: `Booking ${status.toLowerCase()} successfully`,
    });
  } catch (error) {
    console.log("Error updating booking status:", error);

    return res.status(500).json({
      error: "Error updating booking status",
    });
  }
};


// =====================================================
// CHECK CAR AVAILABILITY FOR DATE RANGE
// GET /cars/:id/availability?startDate=...&endDate=...
// =====================================================

bookingsCtrl.checkAvailability = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // ---- 1. Validate dates ----
    if (!startDate || !endDate) {
      return res.status(400).json({
        available: false,
        message: "Both startDate and endDate are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        available: false,
        message: "Invalid date format",
      });
    }

    if (start >= end) {
      return res.status(400).json({
        available: false,
        message: "End date must be after start date",
      });
    }

    // ---- 2. Find the car ----
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        available: false,
        message: "Car not found",
      });
    }

    // ---- 3. Check car status ----
    if (!car.isActive) {
      return res.status(200).json({
        available: false,
        message: "This car is currently inactive",
      });
    }

    if (car.status !== "AVAILABLE") {
      return res.status(200).json({
        available: false,
        message: "This car is currently unavailable for booking",
      });
    }

    const existingBooking = await findBlockingBooking({
      carId: car._id,
      startDate: start,
      endDate: end,
    });

    if (existingBooking) {
      return res.status(200).json({
        available: false,
        message: "This car has already been booked for the selected dates.",
      });
    }

    // ---- 5. Available ----
    return res.status(200).json({
      available: true,
    });
  } catch (error) {
    console.log("Error checking availability:", error);

    return res.status(500).json({
      available: false,
      message: "Error checking availability",
    });
  }
};


export default bookingsCtrl;