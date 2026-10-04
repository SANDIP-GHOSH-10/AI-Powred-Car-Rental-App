import fs from "fs";
import Car from "../models/car-model.js";
import Booking from "../models/booking-models.js";
import { validationResult } from "express-validator";
import { uploadToCloudinary, deleteFromCloudinary } from "../../config/cloudinary.js";
import { generateAndSaveEmbedding } from "../services/embedding-service.js";

const carsCtrl = {};

// Helper to safely cleanup local temporary files created by Multer
const cleanupLocalFiles = (files) => {
  if (files && Array.isArray(files)) {
    files.forEach((file) => {
      if (file.path && fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error("Error unlinking local temp file:", file.path, err);
        }
      }
    });
  }
};

// Helper to parse location object from req.body
const getLocation = (body) => {
  if (typeof body.location === "object" && body.location !== null) {
    return body.location;
  }
  if (typeof body.location === "string") {
    try {
      return JSON.parse(body.location);
    } catch (e) {}
  }
  return {
    city: body["location.city"] || body.city || "",
    state: body["location.state"] || body.state || "",
    pincode: body["location.pincode"] || body.pincode || "",
  };
};

// Helper to parse features array from req.body
const getFeatures = (body) => {
  if (Array.isArray(body.features)) return body.features;
  if (typeof body.features === "string") {
    try {
      const parsed = JSON.parse(body.features);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
    return body.features
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);
  }
  return [];
};

// =====================================================
// ADD CAR
// =====================================================

carsCtrl.create = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    cleanupLocalFiles(req.files);
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  const uploadedCloudinaryImages = [];

  try {
    // 1. Upload images to Cloudinary
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.path, "car-rental/cars");
        uploadedCloudinaryImages.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    }

    // Clean up local temp files after Cloudinary upload succeeds
    cleanupLocalFiles(req.files);

    const location = getLocation(req.body);
    const features = getFeatures(req.body);

    const carData = {
      brand: req.body.brand,
      model: req.body.model,
      year: Number(req.body.year),
      type: req.body.type,
      transmission: req.body.transmission,
      fuelType: req.body.fuelType,
      seats: Number(req.body.seats),
      pricePerDay: Number(req.body.pricePerDay),
      location,
      description: req.body.description || "",
      features,
      registrationNumber: req.body.registrationNumber,
      images: uploadedCloudinaryImages,

      // NEVER take host from frontend
      host: req.userId,

      // New cars should be approved by admin
      status: "PENDING",
    };

    const car = new Car(carData);
    await car.save();

    // Generate embedding non-blocking (fire-and-forget)
    // so we don't slow down the host's API response
    generateAndSaveEmbedding(car).catch(() => {});

    return res.status(201).json({
      success: true,
      car,
      message: "Car added successfully",
    });
  } catch (error) {
    console.log("Error adding car:", error);

    // Clean up Cloudinary images if database save fails
    for (const img of uploadedCloudinaryImages) {
      await deleteFromCloudinary(img.public_id).catch(() => {});
    }
    cleanupLocalFiles(req.files);

    return res.status(500).json({
      error: error.message || "Error adding car",
    });
  }
};

// =====================================================
// GET ALL AVAILABLE CARS
// =====================================================

carsCtrl.list = async (req, res) => {
  try {
    const cars = await Car.find({
      status: { $in: ["AVAILABLE", "UNAVAILABLE"] },
      isActive: true,
    })
      .populate("host", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: cars.length,
      cars,
    });
  } catch (error) {
    console.log("Error fetching cars:", error);

    return res.status(500).json({
      error: "Error fetching cars",
    });
  }
};


// =====================================================
// TOGGLE CAR AVAILABILITY (HOST)
// =====================================================

carsCtrl.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Host can ONLY toggle between AVAILABLE and UNAVAILABLE
    if (!["AVAILABLE", "UNAVAILABLE"].includes(status)) {
      return res.status(400).json({
        error: "Invalid status. Must be AVAILABLE or UNAVAILABLE",
      });
    }

    // Ownership check: only the car's host can toggle
    const car = await Car.findOne({
      _id: req.params.id,
      host: req.userId,
    });

    if (!car) {
      return res.status(404).json({
        error: "Car not found or you are not the owner",
      });
    }

    // Only allow toggle if car is currently AVAILABLE or UNAVAILABLE
    // PENDING and REJECTED cars must go through admin approval first
    if (!["AVAILABLE", "UNAVAILABLE"].includes(car.status)) {
      return res.status(400).json({
        error: "Car must be approved before toggling availability",
      });
    }

    car.status = status;
    await car.save();

    return res.status(200).json({
      success: true,
      car,
      message: `Car marked as ${status}`,
    });
  } catch (error) {
    console.log("Error updating car status:", error);

    return res.status(500).json({
      error: "Error updating car status",
    });
  }
};

// =====================================================
// GET SINGLE CAR
// =====================================================

carsCtrl.show = async (req, res) => {
  try {
    const car = await Car.findOne({
      _id: req.params.id,
      isActive: true,
    }).populate("host", "name email");

    if (!car) {
      return res.status(404).json({
        error: "Car not found",
      });
    }

    return res.status(200).json({
      success: true,
      car,
    });
  } catch (error) {
    console.log("Error fetching car:", error);

    return res.status(500).json({
      error: "Error fetching car",
    });
  }
};

// =====================================================
// GET MY CARS
// =====================================================

carsCtrl.myCars = async (req, res) => {
  try {
    const cars = await Car.find({
      host: req.userId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: cars.length,
      cars,
    });
  } catch (error) {
    console.log("Error fetching host cars:", error);

    return res.status(500).json({
      error: "Error fetching host cars",
    });
  }
};

// =====================================================
// UPDATE CAR
// =====================================================

carsCtrl.update = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    cleanupLocalFiles(req.files);
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  try {
    // IMPORTANT: Search by both car ID and logged-in host ID.
    const car = await Car.findOne({
      _id: req.params.id,
      host: req.userId,
    });

    if (!car) {
      cleanupLocalFiles(req.files);
      return res.status(404).json({
        error: "Car not found or you are not the owner",
      });
    }

    // 1. Handle removal of selected existing images
    if (req.body.removeImages) {
      let toRemove = [];
      if (Array.isArray(req.body.removeImages)) {
        toRemove = req.body.removeImages;
      } else if (typeof req.body.removeImages === "string") {
        try {
          toRemove = JSON.parse(req.body.removeImages);
        } catch (e) {
          toRemove = [req.body.removeImages];
        }
      }

      for (const publicId of toRemove) {
        if (publicId) {
          await deleteFromCloudinary(publicId).catch(() => {});
          car.images = car.images.filter((img) => img.public_id !== publicId);
        }
      }
    }

    // 2. Handle new image uploads
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.path, "car-rental/cars");
        car.images.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
      cleanupLocalFiles(req.files);
    }

    // 3. Update text fields if present
    if (req.body.brand) car.brand = req.body.brand;
    if (req.body.model) car.model = req.body.model;
    if (req.body.year) car.year = Number(req.body.year);
    if (req.body.type) car.type = req.body.type;
    if (req.body.transmission) car.transmission = req.body.transmission;
    if (req.body.fuelType) car.fuelType = req.body.fuelType;
    if (req.body.seats) car.seats = Number(req.body.seats);
    if (req.body.pricePerDay) car.pricePerDay = Number(req.body.pricePerDay);
    if (req.body.description !== undefined) car.description = req.body.description;
    if (req.body.registrationNumber) car.registrationNumber = req.body.registrationNumber;

    if (req.body.location || req.body["location.city"] || req.body.city) {
      const loc = getLocation(req.body);
      car.location = {
        city: loc.city || car.location?.city || "",
        state: loc.state || car.location?.state || "",
        pincode: loc.pincode || car.location?.pincode || "",
      };
    }

    if (req.body.features !== undefined) {
      car.features = getFeatures(req.body);
    }

    await car.save();

    // Regenerate embedding non-blocking after update
    generateAndSaveEmbedding(car).catch(() => {});

    return res.status(200).json({
      success: true,
      car,
      message: "Car updated successfully",
    });
  } catch (error) {
    console.log("Error updating car:", error);
    cleanupLocalFiles(req.files);

    return res.status(500).json({
      error: error.message || "Error updating car",
    });
  }
};

// =====================================================
// DELETE CAR
// =====================================================

carsCtrl.delete = async (req, res) => {
  try {
    const carId = req.params.id;

    // --------------------------------------------------
    // 1. Find the car (separate find so we can give
    //    the correct 404 vs 403 response)
    // --------------------------------------------------
    const car = await Car.findById(carId);

    if (!car) {
      return res.status(404).json({
        error: "Car not found",
      });
    }

    // --------------------------------------------------
    // 2. Ownership check — NEVER trust the frontend.
    //    req.userId comes from the JWT via authenticate middleware.
    // --------------------------------------------------
    if (car.host.toString() !== req.userId.toString()) {
      return res.status(403).json({
        error: "You are not authorized to delete this car",
      });
    }

    // --------------------------------------------------
    // 3. Booking guard — block deletion if the car has
    //    an active upcoming booking.
    //
    //    A booking BLOCKS deletion when:
    //      - status is PENDING or CONFIRMED  (active)
    //      - endDate >= today               (rental not finished)
    //
    //    A booking does NOT block deletion when:
    //      - status is COMPLETED, CANCELLED, or REJECTED
    //      - endDate is in the past (trip already over)
    // --------------------------------------------------
    const today = new Date();
    today.setHours(0, 0, 0, 0); // compare at start of day

    const blockingBooking = await Booking.findOne({
      car: carId,
      status: { $in: ["PENDING", "CONFIRMED"] },
      endDate: { $gte: today },
    });

    if (blockingBooking) {
      return res.status(409).json({
        error:
          "Cannot delete this car because it has an upcoming booking. " +
          "Please wait until the booking period ends or cancel the booking first.",
      });
    }

    // --------------------------------------------------
    // 4. Delete all associated Cloudinary images.
    //    public_id is stored in car.images[] — no URL
    //    parsing needed. Errors are swallowed so that
    //    a Cloudinary hiccup doesn't block DB deletion.
    // --------------------------------------------------
    if (car.images && car.images.length > 0) {
      for (const img of car.images) {
        if (img.public_id) {
          await deleteFromCloudinary(img.public_id).catch((err) => {
            console.error(
              "Cloudinary cleanup failed for",
              img.public_id,
              err.message
            );
          });
        }
      }
    }

    // --------------------------------------------------
    // 5. HARD delete from MongoDB.
    //    This is the root-cause fix: the previous
    //    implementation used a soft delete (isActive=false)
    //    which caused deleted cars to reappear on refresh
    //    because GET /my-cars had no isActive filter.
    // --------------------------------------------------
    await Car.findByIdAndDelete(carId);

    return res.status(200).json({
      success: true,
      message: "Car deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting car:", error);

    return res.status(500).json({
      error: "Error deleting car",
    });
  }
};

export default carsCtrl;