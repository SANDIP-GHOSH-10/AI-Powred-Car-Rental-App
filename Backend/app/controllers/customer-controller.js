import Customer from "../models/customer-model.js";
import User from "../models/user-model.js";
import { validationResult } from "express-validator";

const customersCtrl = {};

// =====================================================
// CREATE CUSTOMER PROFILE
// =====================================================

customersCtrl.create = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Check whether customer profile already exists
    const existingCustomer = await Customer.findOne({
      user: req.userId,
    });

    if (existingCustomer) {
      return res.status(409).json({
        error: "Customer profile already exists",
      });
    }

    const customer = new Customer({
      user: req.userId,
      ...req.body,
    });

    await customer.save();

    return res.status(201).json({
      success: true,
      customer,
      message: "Customer profile created successfully",
    });
  } catch (error) {
    console.log(
      "Error creating customer profile:",
      error
    );

    return res.status(500).json({
      error: "Error creating customer profile",
    });
  }
};


// =====================================================
// GET CUSTOMER PROFILE
// =====================================================

customersCtrl.profile = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      user: req.userId,
    }).populate(
      "user",
      "name email roles"
    );

    if (!customer) {
      return res.status(404).json({
        error: "Customer profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    console.log(
      "Error fetching customer profile:",
      error
    );

    return res.status(500).json({
      error: "Error fetching customer profile",
    });
  }
};


// =====================================================
// UPDATE CUSTOMER PROFILE
// =====================================================

customersCtrl.update = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  try {
    const customer = await Customer.findOne({
      user: req.userId,
    });

    if (!customer) {
      return res.status(404).json({
        error: "Customer profile not found",
      });
    }

    // Update only fields coming from request
    Object.assign(customer, req.body);

    await customer.save();

    return res.status(200).json({
      success: true,
      customer,
      message: "Customer profile updated successfully",
    });
  } catch (error) {
    console.log(
      "Error updating customer profile:",
      error
    );

    return res.status(500).json({
      error: "Error updating customer profile",
    });
  }
};


export default customersCtrl;