import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import { checkSchema } from "express-validator";

import configureDB from "./config/db.js";

// Controllers
import usersCtrl from "./app/controllers/users-controller.js";
import customersCtrl from "./app/controllers/customer-controller.js";
import hostsCtrl from "./app/controllers/host-controller.js";
import carsCtrl from "./app/controllers/car-controller.js";
import bookingsCtrl from "./app/controllers/booking-controller.js";
import adminsCtrl from "./app/controllers/admin-controller.js";
import paymentsCtrl from "./app/controllers/payment-controller.js";
import aiCtrl from "./app/controllers/ai-controller.js";

// Middleware
import authenticate from "./app/middlewares/authentication.js";
import authorize from "./app/middlewares/authorization.js";
import upload from "./app/middlewares/multer.js";

// Validations
import {
  userRegisterSchema,
  userLoginSchema,
  userUpdateSchema,
} from "./app/validations/user-validation-schema.js";

import {
  customerCreateSchema,
  customerUpdateSchema,
} from "./app/validations/customer-validation-schema.js";

import {
  hostCreateSchema,
  hostUpdateSchema,
} from "./app/validations/host-validation-schema.js";

import {
  carCreateSchema,
  carUpdateSchema,
} from "./app/validations/car-validation-schema.js";

import {
  bookingCreateSchema,
  bookingUpdateSchema,
} from "./app/validations/booking-validation-schema.js";

const app = express();

// =====================================================
// CONFIGURATION
// =====================================================

const port = process.env.PORT || 3500;

console.log("Server process cwd:", process.cwd());

// =====================================================
// DATABASE
// =====================================================

configureDB();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use((req, res, next) => {
  console.log(
    "Incoming request:",
    req.method,
    req.path
  );

  next();
});

app.use(express.json());

app.use(cors());

// =====================================================
// HOME
// =====================================================

app.get("/", (req, res) => {
  res.json({
    message: "AI-Powered Car Rental API",
  });
});

// =====================================================
// USER / AUTH ROUTES
// =====================================================

// Register
app.post(
  "/register",
  checkSchema(userRegisterSchema),
  usersCtrl.register
);

// Login
app.post(
  "/login",
  checkSchema(userLoginSchema),
  usersCtrl.login
);

// Logged-in user profile
app.get(
  "/profile",
  authenticate,
  usersCtrl.profile
);

// Update logged-in user profile
app.patch(
  "/profile",
  authenticate,
  checkSchema(userUpdateSchema),
  usersCtrl.updateProfile
);

// Check email availability
app.get(
  "/check-field",
  usersCtrl.checkField
);

// =====================================================
// CUSTOMER ROUTES
// =====================================================

// Create customer profile
app.post(
  "/customers",
  authenticate,
  authorize("CUSTOMER"),
  checkSchema(customerCreateSchema),
  customersCtrl.create
);

// Get customer profile
app.get(
  "/customers/profile",
  authenticate,
  authorize("CUSTOMER"),
  customersCtrl.profile
);

// Update customer profile
app.patch(
  "/customers/profile",
  authenticate,
  authorize("CUSTOMER"),
  checkSchema(customerUpdateSchema),
  customersCtrl.update
);

// =====================================================
// HOST ROUTES
// =====================================================

// Become a host / create host profile
app.post(
  "/hosts",
  authenticate,
  authorize("CUSTOMER"),
  checkSchema(hostCreateSchema),
  hostsCtrl.create
);

// Get host profile
app.get(
  "/hosts/profile",
  authenticate,
  authorize("HOST"),
  hostsCtrl.profile
);

// Update host profile
app.patch(
  "/hosts/profile",
  authenticate,
  authorize("HOST"),
  checkSchema(hostUpdateSchema),
  hostsCtrl.update
);

// =====================================================
// CAR ROUTES
// =====================================================

// Get all available cars (public)
app.get(
  "/cars",
  carsCtrl.list
);

// Check car availability for date range (public)
app.get(
  "/cars/:id/availability",
  bookingsCtrl.checkAvailability
);

// Get blocked dates for a car (customer/host only)
app.get(
  "/cars/:carId/booked-dates",
  authenticate,
  authorize("CUSTOMER", "HOST"),
  bookingsCtrl.getBookedDates
);

// Get single car (public)
app.get(
  "/cars/:id",
  carsCtrl.show
);

// Add car
app.post(
  "/cars",
  authenticate,
  authorize("HOST"),
  upload.array("images", 10),
  checkSchema(carCreateSchema),
  carsCtrl.create
);

// Get logged-in host's cars
app.get(
  "/my-cars",
  authenticate,
  authorize("HOST"),
  carsCtrl.myCars
);

// Update own car
app.patch(
  "/cars/:id",
  authenticate,
  authorize("HOST"),
  upload.array("images", 10),
  checkSchema(carUpdateSchema),
  carsCtrl.update
);

// Toggle car availability (HOST)
app.patch(
  "/cars/:id/status",
  authenticate,
  authorize("HOST"),
  carsCtrl.updateStatus
);

// Delete own car
app.delete(
  "/cars/:id",
  authenticate,
  authorize("HOST"),
  carsCtrl.delete
);

// =====================================================
// BOOKING ROUTES
// =====================================================

// Create booking
app.post(
  "/bookings",
  authenticate,
  authorize("CUSTOMER"),
  checkSchema(bookingCreateSchema),
  bookingsCtrl.create
);

// Get customer's bookings
app.get(
  "/bookings",
  authenticate,
  authorize("CUSTOMER"),
  bookingsCtrl.list
);

// Alias for frontend: GET /bookings/my-bookings
app.get(
  "/bookings/my-bookings",
  authenticate,
  authorize("CUSTOMER"),
  bookingsCtrl.list
);

// Host bookings (frontend expects /bookings/host)
app.get(
  "/bookings/host",
  authenticate,
  authorize("HOST"),
  bookingsCtrl.hostList
);

// Host update booking status (confirm/reject/complete)
app.patch(
  "/bookings/:id/status",
  authenticate,
  authorize("HOST"),
  bookingsCtrl.updateStatus
);

// Get single booking
app.get(
  "/bookings/:id",
  authenticate,
  authorize("CUSTOMER"),
  bookingsCtrl.show
);

// Update booking
app.patch(
  "/bookings/:id",
  authenticate,
  authorize("CUSTOMER"),
  checkSchema(bookingUpdateSchema),
  bookingsCtrl.update
);

// Cancel booking
app.patch(
  "/bookings/:id/cancel",
  authenticate,
  authorize("CUSTOMER"),
  bookingsCtrl.cancel
);

// =====================================================
// PAYMENT ROUTES (RAZORPAY & COD)
// =====================================================

// Create Razorpay Order
app.post(
  "/payments/create-order",
  authenticate,
  authorize("CUSTOMER"),
  paymentsCtrl.createOrder
);

// Verify Razorpay Payment Signature
app.post(
  "/payments/verify",
  authenticate,
  authorize("CUSTOMER"),
  paymentsCtrl.verifyPayment
);

// Get Logged-in Customer Payments
app.get(
  "/payments/my-payments",
  authenticate,
  authorize("CUSTOMER"),
  paymentsCtrl.myPayments
);

// Get Single Payment Details
app.get(
  "/payments/:id",
  authenticate,
  paymentsCtrl.show
);

// Admin: Get all payments
app.get(
  "/admin/payments",
  authenticate,
  authorize("ADMIN"),
  paymentsCtrl.adminPayments
);

// =====================================================
// ADMIN ROUTES
// =====================================================

// Get all users
app.get(
  "/admin/users",
  authenticate,
  authorize("ADMIN"),
  adminsCtrl.users
);

// Get single user
app.get(
  "/admin/users/:id",
  authenticate,
  authorize("ADMIN"),
  adminsCtrl.user
);

// Activate / deactivate user
app.patch(
  "/admin/users/:id/status",
  authenticate,
  authorize("ADMIN"),
  adminsCtrl.updateUserStatus
);

// Get all hosts
app.get(
  "/admin/hosts",
  authenticate,
  authorize("ADMIN"),
  adminsCtrl.hosts
);

// Get pending cars
app.get(
  "/admin/cars/pending",
  authenticate,
  authorize("ADMIN"),
  adminsCtrl.pendingCars
);

// Approve car
app.patch(
  "/admin/cars/:id/approve",
  authenticate,
  authorize("ADMIN"),
  adminsCtrl.approveCar
);

// Reject car
app.patch(
  "/admin/cars/:id/reject",
  authenticate,
  authorize("ADMIN"),
  adminsCtrl.rejectCar
);

// Get all cars
app.get(
  "/admin/cars",
  authenticate,
  authorize("ADMIN"),
  adminsCtrl.cars
);

// Get all bookings
app.get(
  "/admin/bookings",
  authenticate,
  authorize("ADMIN"),
  adminsCtrl.bookings
);

// Update booking status
app.patch(
  "/admin/bookings/:id/status",
  authenticate,
  authorize("ADMIN"),
  adminsCtrl.updateBookingStatus
);

// =====================================================
// AI ROUTES
// =====================================================

// AI-powered natural-language car search (CUSTOMER only)
app.post(
  "/ai/search",
  authenticate,
  authorize("CUSTOMER"),
  aiCtrl.searchCars
);

// AI-powered car listing suggestions — features + description (HOST only)
app.post(
  "/ai/car-suggestion",
  authenticate,
  authorize("HOST"),
  aiCtrl.carSuggestions
);

// Error handling middleware (e.g., Multer file size / type errors)
app.use((err, req, res, next) => {
  if (err) {
    console.error("Global Error Handler:", err.message);
    return res.status(400).json({
      error: err.message || "An error occurred during request processing",
    });
  }
  next();
});

// =====================================================
// START SERVER
// =====================================================

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

























// import dotenv from "dotenv";
// dotenv.config();

// import cors from "cors";
// import express from "express";
// import { checkSchema } from "express-validator";

// import configureDB from "./config/db.js";

// // Controllers
// import usersCtrl from "/controllers/users-controller.js";
// import customersCtrl from "/controllers/customer-controller.js";
// import hostsCtrl from " /controllers/host-controller.js";
// import carsCtrl from "/controllers/car-controller.js";
// import bookingsCtrl from "controllers/booking-controller.js";
// import adminsCtrl from "/controllers/admin-controller.js";

// // Middleware
// import authenticate from "/middlewares/authentication.js";
// import authorize from "/middlewares/authorization.js";

// // Validations
// import {
//   userRegisterSchema,
//   userLoginSchema,
//   userUpdateSchema,
// } from "/validations/user-validation-schema.js";

// import {
//   customerCreateSchema,
//   customerUpdateSchema,
// } from "/validations/customer-validation-schema.js";

// import {
//   hostCreateSchema,
//   hostUpdateSchema,
// } from "/validations/host-validation-schema.js";

// import {
//   carCreateSchema,
//   carUpdateSchema,
// } from "/validations/car-validation-schema.js";

// import {
//   bookingCreateSchema,
//   bookingUpdateSchema,
// } from "/validations/booking-validation-schema.js";


// const app = express();


// // =====================================================
// // CONFIGURATION
// // =====================================================

// const port = process.env.PORT || 3500;

// console.log("Server process cwd:", process.cwd());


// // =====================================================
// // DATABASE
// // =====================================================

// configureDB();


// // =====================================================
// // MIDDLEWARE
// // =====================================================

// app.use((req, res, next) => {
//   console.log(
//     "Incoming request:",
//     req.method,
//     req.path
//   );

//   next();
// });

// app.use(express.json());

// app.use(cors());


// // =====================================================
// // HOME
// // =====================================================

// app.get("/", (req, res) => {
//   res.json({
//     message: "AI-Powered Car Rental API",
//   });
// });


// // =====================================================
// // USER / AUTH ROUTES
// // =====================================================

// // Register
// app.post(
//   "/register",
//   checkSchema(userRegisterSchema),
//   usersCtrl.register
// );


// // Login
// app.post(
//   "/login",
//   checkSchema(userLoginSchema),
//   usersCtrl.login
// );


// // Logged-in user profile
// app.get(
//   "/profile",
//   authenticate,
//   usersCtrl.profile
// );


// // Update logged-in user profile
// app.patch(
//   "/profile",
//   authenticate,
//   checkSchema(userUpdateSchema),
//   usersCtrl.updateProfile
// );


// // Check email availability
// app.get(
//   "/check-field",
//   usersCtrl.checkField
// );


// // =====================================================
// // CUSTOMER ROUTES
// // =====================================================

// // Create customer profile
// app.post(
//   "/customers",
//   authenticate,
//   authorize("CUSTOMER"),
//   checkSchema(customerCreateSchema),
//   customersCtrl.create
// );


// // Get customer profile
// app.get(
//   "/customers/profile",
//   authenticate,
//   authorize("CUSTOMER"),
//   customersCtrl.profile
// );


// // Update customer profile
// app.patch(
//   "/customers/profile",
//   authenticate,
//   authorize("CUSTOMER"),
//   checkSchema(customerUpdateSchema),
//   customersCtrl.update
// );


// // =====================================================
// // HOST ROUTES
// // =====================================================

// // Become a host / create host profile
// app.post(
//   "/hosts",
//   authenticate,
//   authorize("CUSTOMER"),
//   checkSchema(hostCreateSchema),
//   hostsCtrl.create
// );


// // Get host profile
// app.get(
//   "/hosts/profile",
//   authenticate,
//   authorize("HOST"),
//   hostsCtrl.profile
// );


// // Update host profile
// app.patch(
//   "/hosts/profile",
//   authenticate,
//   authorize("HOST"),
//   checkSchema(hostUpdateSchema),
//   hostsCtrl.update
// );


// // =====================================================
// // CAR ROUTES
// // =====================================================

// // Get all available cars
// // CUSTOMER, HOST and ADMIN can view cars
// app.get(
//   "/cars",
//   authenticate,
//   authorize("CUSTOMER", "HOST", "ADMIN"),
//   carsCtrl.list
// );


// // Get single car
// app.get(
//   "/cars/:id",
//   authenticate,
//   authorize("CUSTOMER", "HOST", "ADMIN"),
//   carsCtrl.show
// );


// // Add car
// // Only HOST
// app.post(
//   "/cars",
//   authenticate,
//   authorize("HOST"),
//   checkSchema(carCreateSchema),
//   carsCtrl.create
// );


// // Get logged-in host's cars
// app.get(
//   "/my-cars",
//   authenticate,
//   authorize("HOST"),
//   carsCtrl.myCars
// );


// // Update own car
// app.patch(
//   "/cars/:id",
//   authenticate,
//   authorize("HOST"),
//   checkSchema(carUpdateSchema),
//   carsCtrl.update
// );


// // Delete own car
// app.delete(
//   "/cars/:id",
//   authenticate,
//   authorize("HOST"),
//   carsCtrl.delete
// );


// // =====================================================
// // BOOKING ROUTES
// // =====================================================

// // Create booking
// // Only CUSTOMER
// app.post(
//   "/bookings",
//   authenticate,
//   authorize("CUSTOMER"),
//   checkSchema(bookingCreateSchema),
//   bookingsCtrl.create
// );


// // Get customer's bookings
// app.get(
//   "/bookings",
//   authenticate,
//   authorize("CUSTOMER"),
//   bookingsCtrl.list
// );


// // Get single booking
// app.get(
//   "/bookings/:id",
//   authenticate,
//   authorize("CUSTOMER"),
//   bookingsCtrl.show
// );


// // Update booking
// app.patch(
//   "/bookings/:id",
//   authenticate,
//   authorize("CUSTOMER"),
//   checkSchema(bookingUpdateSchema),
//   bookingsCtrl.update
// );


// // Cancel booking
// app.patch(
//   "/bookings/:id/cancel",
//   authenticate,
//   authorize("CUSTOMER"),
//   bookingsCtrl.cancel
// );


// // =====================================================
// // ADMIN ROUTES
// // =====================================================

// // Get all users
// app.get(
//   "/admin/users",
//   authenticate,
//   authorize("ADMIN"),
//   adminsCtrl.users
// );


// // Get single user
// app.get(
//   "/admin/users/:id",
//   authenticate,
//   authorize("ADMIN"),
//   adminsCtrl.user
// );


// // Activate / deactivate user
// app.patch(
//   "/admin/users/:id/status",
//   authenticate,
//   authorize("ADMIN"),
//   adminsCtrl.updateUserStatus
// );


// // Get all hosts
// app.get(
//   "/admin/hosts",
//   authenticate,
//   authorize("ADMIN"),
//   adminsCtrl.hosts
// );


// // Get pending cars
// app.get(
//   "/admin/cars/pending",
//   authenticate,
//   authorize("ADMIN"),
//   adminsCtrl.pendingCars
// );


// // Approve car
// app.patch(
//   "/admin/cars/:id/approve",
//   authenticate,
//   authorize("ADMIN"),
//   adminsCtrl.approveCar
// );


// // Reject car
// app.patch(
//   "/admin/cars/:id/reject",
//   authenticate,
//   authorize("ADMIN"),
//   adminsCtrl.rejectCar
// );


// // Get all cars
// app.get(
//   "/admin/cars",
//   authenticate,
//   authorize("ADMIN"),
//   adminsCtrl.cars
// );


// // Get all bookings
// app.get(
//   "/admin/bookings",
//   authenticate,
//   authorize("ADMIN"),
//   adminsCtrl.bookings
// );


// // Update booking status
// app.patch(
//   "/admin/bookings/:id/status",
//   authenticate,
//   authorize("ADMIN"),
//   adminsCtrl.updateBookingStatus
// );


// // =====================================================
// // START SERVER
// // =====================================================

// app.listen(port, () => {
//   console.log(
//     `Server is running on port ${port}`
//   );
// });















// import dotenv from 'dotenv';
// dotenv.config();
// import cors from 'cors'
// import express from 'express';
// import { checkSchema } from 'express-validator';
// import configureDB from './config/db.js';
// import usersCtrl from './app/controllers/users-controller.js';
// import { userRegisterSchema, userLoginSchema } from './app/validations/user-validation-schema.js';
// import { categoryCreateSchema, categoryUpdateSchema } from './app/validations/category-validation-schema.js';
// import authenticate from './app/middlewares/authentication.js';


// const app = express();
// console.log('Server process cwd:', process.cwd());
// app.use((req, res, next) => {
//   console.log('Incoming request:', req.method, req.path);
//   next();
// });
// const port = 3500; 
// app.use(express.json());
// app.use(cors());
// configureDB();
// app.get('/', (req, res) => {
//   res.json({
//     message: 'Home page',
//   });
// });

// app.post('/register', checkSchema(userRegisterSchema), usersCtrl.register);   
// app.post('/login', checkSchema(userLoginSchema), usersCtrl.login);
// app.get('/profile', authenticate, usersCtrl.profile);
// app.get('/check-field', usersCtrl.checkField);



// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });