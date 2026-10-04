import User from "../models/user-model.js";
import Host from "../models/host-model.js";
import Car from "../models/car-model.js";
import Booking from "../models/booking-models.js";

const adminsCtrl = {};


// =====================================================
// GET ALL USERS
// =====================================================

adminsCtrl.users = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.log(
      "Error fetching users:",
      error
    );

    return res.status(500).json({
      error: "Error fetching users",
    });
  }
};


// =====================================================
// GET SINGLE USER
// =====================================================

adminsCtrl.user = async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(
      "Error fetching user:",
      error
    );

    return res.status(500).json({
      error: "Error fetching user",
    });
  }
};


// =====================================================
// ACTIVATE / DEACTIVATE USER
// =====================================================

adminsCtrl.updateUserStatus = async (
  req,
  res
) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        error: "isActive must be a boolean",
      });
    }

    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Prevent admin from accidentally
    // deactivating themselves
    if (
      user._id.toString() ===
      req.userId.toString()
    ) {
      return res.status(400).json({
        error:
          "You cannot change your own account status",
      });
    }

    user.isActive = isActive;

    await user.save();

    return res.status(200).json({
      success: true,
      message: isActive
        ? "User activated successfully"
        : "User deactivated successfully",
    });
  } catch (error) {
    console.log(
      "Error updating user status:",
      error
    );

    return res.status(500).json({
      error: "Error updating user status",
    });
  }
};


// =====================================================
// GET ALL HOSTS
// =====================================================

adminsCtrl.hosts = async (req, res) => {
  try {
    const hosts = await Host.find()
      .populate(
        "user",
        "name email roles isActive"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: hosts.length,
      hosts,
    });
  } catch (error) {
    console.log(
      "Error fetching hosts:",
      error
    );

    return res.status(500).json({
      error: "Error fetching hosts",
    });
  }
};


// =====================================================
// GET PENDING CARS
// =====================================================

adminsCtrl.pendingCars = async (
  req,
  res
) => {
  try {
    const cars = await Car.find({
      status: "PENDING",
      isActive: true,
    })
      .populate(
        "host",
        "name email"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: cars.length,
      cars,
    });
  } catch (error) {
    console.log(
      "Error fetching pending cars:",
      error
    );

    return res.status(500).json({
      error: "Error fetching pending cars",
    });
  }
};


// =====================================================
// APPROVE CAR
// =====================================================

adminsCtrl.approveCar = async (
  req,
  res
) => {
  try {
    const car = await Car.findById(
      req.params.id
    );

    if (!car) {
      return res.status(404).json({
        error: "Car not found",
      });
    }

    if (car.status !== "PENDING") {
      return res.status(400).json({
        error: "Car is not pending approval",
      });
    }

    car.status = "AVAILABLE";

    await car.save();

    return res.status(200).json({
      success: true,
      car,
      message: "Car approved successfully",
    });
  } catch (error) {
    console.log(
      "Error approving car:",
      error
    );

    return res.status(500).json({
      error: "Error approving car",
    });
  }
};


// =====================================================
// REJECT CAR
// =====================================================

adminsCtrl.rejectCar = async (
  req,
  res
) => {
  try {
    const car = await Car.findById(
      req.params.id
    );

    if (!car) {
      return res.status(404).json({
        error: "Car not found",
      });
    }

    if (car.status !== "PENDING") {
      return res.status(400).json({
        error: "Car is not pending approval",
      });
    }

    car.status = "REJECTED";

    await car.save();

    return res.status(200).json({
      success: true,
      car,
      message: "Car rejected successfully",
    });
  } catch (error) {
    console.log(
      "Error rejecting car:",
      error
    );

    return res.status(500).json({
      error: "Error rejecting car",
    });
  }
};


// =====================================================
// GET ALL CARS
// =====================================================

adminsCtrl.cars = async (req, res) => {
  try {
    const cars = await Car.find()
      .populate(
        "host",
        "name email"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: cars.length,
      cars,
    });
  } catch (error) {
    console.log(
      "Error fetching all cars:",
      error
    );

    return res.status(500).json({
      error: "Error fetching all cars",
    });
  }
};


// =====================================================
// GET ALL BOOKINGS
// =====================================================

adminsCtrl.bookings = async (
  req,
  res
) => {
  try {
    const bookings = await Booking.find()
      .populate(
        "customer",
        "name email"
      )
      .populate({
        path: "car",
        select: "brand model registrationNumber host images",
        populate: {
          path: "host",
          select: "name email",
        },
      })
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
      "Error fetching all bookings:",
      error
    );

    return res.status(500).json({
      error: "Error fetching all bookings",
    });
  }
};


// =====================================================
// UPDATE BOOKING STATUS
// =====================================================

adminsCtrl.updateBookingStatus = async (
  req,
  res
) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "PENDING",
      "CONFIRMED",
      "CANCELLED",
      "COMPLETED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid booking status",
      });
    }

    const booking = await Booking.findById(
      req.params.id
    );

    if (!booking) {
      return res.status(404).json({
        error: "Booking not found",
      });
    }

    booking.status = status;

    await booking.save();

    return res.status(200).json({
      success: true,
      booking,
      message:
        "Booking status updated successfully",
    });
  } catch (error) {
    console.log(
      "Error updating booking status:",
      error
    );

    return res.status(500).json({
      error: "Error updating booking status",
    });
  }
};


export default adminsCtrl;