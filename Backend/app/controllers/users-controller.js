import User from "../models/user-model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { sendWelcomeEmail } from "../services/email-service.js";

const usersCtrl = {};

// =====================================================
// REGISTER USER
// =====================================================

usersCtrl.register = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  const { name, email, password, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(409).json({
        error: "Email is already registered",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(
      password,
      salt
    );

    // Determine roles: allow CUSTOMER or HOST from public registration
    // Do NOT allow ADMIN via public registration
    let roles = ["CUSTOMER"];

    if (role) {
      const r = String(role).toUpperCase();
      if (r === "HOST") {
        roles = ["HOST"];
      } else if (r === "CUSTOMER") {
        roles = ["CUSTOMER"];
      } else {
        return res.status(400).json({ error: "Invalid role" });
      }
    }

    const user = new User({
      name,
      email,
      password: hashedPassword,
      roles,
    });

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();

    delete userResponse.password;

    // Attempt to send welcome email independently without blocking or rolling back registration
    try {
      await sendWelcomeEmail(user);
    } catch (emailError) {
      console.error(
        "Welcome email could not be sent for:",
        user.email,
        "— Error:",
        emailError.message
      );
    }

    return res.status(201).json({
      success: true,
      user: userResponse,
      message: "User registered successfully",
    });
  } catch (error) {
    console.log("Error registering user:", error);

    // Handle duplicate email race condition
    if (error.code === 11000) {
      return res.status(409).json({
        error: "Email is already registered",
      });
    }

    return res.status(500).json({
      error: "Error registering user",
    });
  }
};


// =====================================================
// LOGIN USER
// =====================================================

usersCtrl.login = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  const { email, password } = req.body;

  try {
    // Find user
    const user = await User.findOne({
      email,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // Check account status
    if (!user.isActive) {
      return res.status(403).json({
        error: "Your account has been deactivated",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // JWT payload
    const tokenData = {
      userId: user._id,
      roles: user.roles,
    };

    // Create JWT
    const token = jwt.sign(
      tokenData,
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // Remove password
    const userResponse = user.toObject();

    delete userResponse.password;

    return res.status(200).json({
      success: true,
      token,
      user: userResponse,
      message: "Login successful",
    });
  } catch (error) {
    console.log("Error logging in user:", error);

    return res.status(500).json({
      error: "Error logging in user",
    });
  }
};


// =====================================================
// GET LOGGED-IN USER PROFILE
// =====================================================

usersCtrl.profile = async (req, res) => {
  try {
    // req.userId should come from auth middleware
    const user = await User.findById(req.userId).select(
      "-password"
    );

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
      "Error fetching user profile:",
      error
    );

    return res.status(500).json({
      error: "Error fetching user profile",
    });
  }
};


// =====================================================
// UPDATE USER PROFILE
// =====================================================

usersCtrl.updateProfile = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  const { name } = req.body;

  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Update only allowed fields
    if (name !== undefined) {
      user.name = name;
    }

    await user.save();

    const userResponse = user.toObject();

    delete userResponse.password;

    return res.status(200).json({
      success: true,
      user: userResponse,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.log(
      "Error updating user profile:",
      error
    );

    return res.status(500).json({
      error: "Error updating user profile",
    });
  }
};


// =====================================================
// CHECK EMAIL AVAILABILITY
// =====================================================

usersCtrl.checkField = async (req, res) => {
  const { field, value } = req.query;

  if (!field || !value) {
    return res.status(400).json({
      error: "Field and value are required",
    });
  }

  // Currently only email checking is supported
  if (field !== "email") {
    return res.status(400).json({
      error: "Invalid field",
    });
  }

  try {
    const email = value.trim().toLowerCase();

    const user = await User.findOne({
      email,
    });

    if (user) {
      return res.status(409).json({
        field,
        success: false,
        message: "Email is already registered",
      });
    }

    return res.status(200).json({
      field,
      success: true,
      message: "Email is available",
    });
  } catch (error) {
    console.log(
      "Error checking field:",
      error
    );

    return res.status(500).json({
      error: "Error checking field",
    });
  }
};


export default usersCtrl;























// import User from "../models/user-model.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import { validationResult } from "express-validator";

// const usersCtrl = {};

// // Register User
// usersCtrl.register = async (req, res) => {
//   const errors = validationResult(req);

//   if (!errors.isEmpty()) {
//     return res.status(400).json({
//       errors: errors.array(),
//     });
//   }

//   const { name, email, password } = req.body;

//   try {
//     // Check if user already exists
//     const existingUser = await User.findOne({ email });

//     if (existingUser) {
//       return res.status(409).json({
//         error: "Email is already registered",
//       });
//     }

//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Create user
//     const user = new User({
//       name,
//       email,
//       password: hashedPassword,
//       role: "user",
//     });

//     await user.save();

//     // Don't send password to frontend
//     const userResponse = user.toObject();
//     delete userResponse.password;

//     res.status(201).json({
//       user: userResponse,
//       message: "User registered successfully",
//     });
//   } catch (error) {
//     console.log("Error registering user:", error);

//     res.status(500).json({
//       error: "Error registering user",
//     });
//   }
// };


// // Login User
// usersCtrl.login = async (req, res) => {
//   const errors = validationResult(req);

//   if (!errors.isEmpty()) {
//     return res.status(400).json({
//       errors: errors.array(),
//     });
//   }

//   const { email, password } = req.body;

//   try {
//     // Find user
//     const user = await User.findOne({ email }).select("+password");

//     if (!user) {
//       return res.status(401).json({
//         error: "Invalid email or password",
//       });
//     }

//     // Compare password
//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(401).json({
//         error: "Invalid email or password",
//       });
//     }

//     // Create JWT
//     const tokenData = {
//       userId: user._id,
//       role: user.role,
//     };

//     const token = jwt.sign(
//       tokenData,
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "1d",
//       }
//     );

//     // Remove password
//     const userResponse = user.toObject();
//     delete userResponse.password;

//     res.status(200).json({
//       token,
//       user: userResponse,
//       message: "Login successful",
//     });
//   } catch (error) {
//     console.log("Error logging in user:", error);

//     res.status(500).json({
//       error: "Error logging in user",
//     });
//   }
// };


// // Get Logged-in User Profile
// usersCtrl.profile = async (req, res) => {
//   try {
//     const user = await User.findById(req.userId).select("-password");

//     if (!user) {
//       return res.status(404).json({
//         error: "User not found",
//       });
//     }

//     res.status(200).json(user);
//   } catch (error) {
//     console.log("Error fetching user profile:", error);

//     res.status(500).json({
//       error: "Error fetching user profile",
//     });
//   }
// };


// // Check Email Availability
// usersCtrl.checkField = async (req, res) => {
//   const { field, value } = req.query;

//   if (!field || !value) {
//     return res.status(400).json({
//       error: "Field and value are required",
//     });
//   }

//   if (field !== "email") {
//     return res.status(400).json({
//       error: "Invalid field",
//     });
//   }

//   try {
//     const user = await User.findOne({
//       email: value.toLowerCase(),
//     });

//     if (user) {
//       return res.status(409).json({
//         field,
//         success: false,
//         message: "Email is already registered",
//       });
//     }

//     res.status(200).json({
//       field,
//       success: true,
//       message: "Email is available",
//     });
//   } catch (error) {
//     console.log("Error checking field:", error);

//     res.status(500).json({
//       error: "Error checking field",
//     });
//   }
// };


// export default usersCtrl;






















// import User from "../models/user-model.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import { validationResult } from "express-validator";

// const usersCtrl = {};

// usersCtrl.register = async (req, res) => {
// const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
//   const { email, password } = req.body;
//   try {
//     const user = new User({ email, password });
//     //hash password
//     const salt = await bcrypt.genSalt();
//     const hash = await bcrypt.hash(password, salt);
//     user.password = hash;
//     await user.save();
//     res.status(201).json({user, message: "User registered successfully"});
//   } catch (error) {
//     console.log("Error registering user", error);
//     res.status(500).json({ error: "Error registering user"});
//   }
// };

// usersCtrl.login = async (req, res) => {
//   const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
//   const { email, password } = req.body; 
//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ error: "Invalid email or password" });
//     }
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ error: "Invalid email or password" });
//     }
//     const tokenData = { userId: user._id };
//     const token = jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: "1h" });
//     res.json({ token : token , user});
//   } catch (error) {
//     console.log("Error logging in user", error);
//     res.status(500).json({ error: "Error logging in user" });
//   }
// };

// usersCtrl.profile = async (req, res) => {
//   // res.json({ message: "User profile" });
//   try {
//     const user = await User.findById(req.userId);
//     res.json(user);
//   } catch (error) {
//     console.log("Error fetching user profile", error);
//     res.status(500).json({ error: "Error fetching user profile" });
//   }
// };

// usersCtrl.checkField = async (req, res) => {
//   const { field, value } = req.query;
//   if(!field || !value) {
//     return res.status(400).json({ error: "Field and value are required" });
//   }
//   let user;
//   if(field == "email") {
//     user = await User.findOne({ email: value });
//   } else {
//     return res.status(400).json({ error: "Invalid field" });
//   }
//   if(user) {
//     return res.status(409).json({field:field, success: false });
//   }
//   res.json({field:field, success: true })
// };

// export default usersCtrl;
