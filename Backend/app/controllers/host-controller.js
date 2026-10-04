import Host from "../models/host-model.js";
import User from "../models/user-model.js";
import { validationResult } from "express-validator";

const hostsCtrl = {};

// =====================================================
// BECOME HOST
// =====================================================

hostsCtrl.create = async (req, res) => {
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

    // Check existing host profile
    const existingHost = await Host.findOne({
      user: req.userId,
    });

    if (existingHost) {
      return res.status(409).json({
        error: "Host profile already exists",
      });
    }

    // Create host profile
    const host = new Host({
      user: req.userId,
      ...req.body,
    });

    await host.save();

    // Add HOST role
    if (!user.roles.includes("HOST")) {
      user.roles.push("HOST");
      await user.save();
    }

    return res.status(201).json({
      success: true,
      host,
      roles: user.roles,
      message: "Host profile created successfully",
    });
  } catch (error) {
    console.log(
      "Error creating host profile:",
      error
    );

    return res.status(500).json({
      error: "Error creating host profile",
    });
  }
};


// =====================================================
// GET HOST PROFILE
// =====================================================

hostsCtrl.profile = async (req, res) => {
  try {
    const host = await Host.findOne({
      user: req.userId,
    }).populate(
      "user",
      "name email roles"
    );

    if (!host) {
      return res.status(404).json({
        error: "Host profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      host,
    });
  } catch (error) {
    console.log(
      "Error fetching host profile:",
      error
    );

    return res.status(500).json({
      error: "Error fetching host profile",
    });
  }
};


// =====================================================
// UPDATE HOST PROFILE
// =====================================================

hostsCtrl.update = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  try {
    const host = await Host.findOne({
      user: req.userId,
    });

    if (!host) {
      return res.status(404).json({
        error: "Host profile not found",
      });
    }

    Object.assign(host, req.body);

    await host.save();

    return res.status(200).json({
      success: true,
      host,
      message: "Host profile updated successfully",
    });
  } catch (error) {
    console.log(
      "Error updating host profile:",
      error
    );

    return res.status(500).json({
      error: "Error updating host profile",
    });
  }
};


export default hostsCtrl;