//carcreate validation
export const carCreateSchema = {
  brand: {
    exists: {
      errorMessage: "Car brand is required",
    },
    notEmpty: {
      errorMessage: "Car brand cannot be empty",
    },
    trim: true,
    isLength: {
      options: {
        min: 2,
        max: 50,
      },
      errorMessage: "Brand must be between 2 and 50 characters",
    },
  },

  model: {
    exists: {
      errorMessage: "Car model is required",
    },
    notEmpty: {
      errorMessage: "Car model cannot be empty",
    },
    trim: true,
    isLength: {
      options: {
        min: 1,
        max: 50,
      },
      errorMessage: "Model must be between 1 and 50 characters",
    },
  },

  year: {
    exists: {
      errorMessage: "Car year is required",
    },
    isInt: {
      options: {
        min: 1900,
        max: new Date().getFullYear() + 1,
      },
      errorMessage: "Invalid car year",
    },
    toInt: true,
  },

  type: {
    exists: {
      errorMessage: "Car type is required",
    },
    isIn: {
      options: [[
        "HATCHBACK",
        "SEDAN",
        "SUV",
        "MUV",
        "COUPE",
        "CONVERTIBLE",
        "LUXURY",
      ]],
      errorMessage: "Invalid car type",
    },
  },

  transmission: {
    exists: {
      errorMessage: "Transmission type is required",
    },
    isIn: {
      options: [["MANUAL", "AUTOMATIC"]],
      errorMessage: "Invalid transmission type",
    },
  },

  fuelType: {
    exists: {
      errorMessage: "Fuel type is required",
    },
    isIn: {
      options: [["PETROL", "DIESEL", "ELECTRIC", "HYBRID"]],
      errorMessage: "Invalid fuel type",
    },
  },

  seats: {
    exists: {
      errorMessage: "Number of seats is required",
    },
    isInt: {
      options: {
        min: 1,
        max: 20,
      },
      errorMessage: "Seats must be between 1 and 20",
    },
    toInt: true,
  },

  pricePerDay: {
    exists: {
      errorMessage: "Price per day is required",
    },
    isFloat: {
      options: {
        min: 0,
      },
      errorMessage: "Price must be a valid positive number",
    },
    toFloat: true,
  },

  "location.city": {
    exists: {
      errorMessage: "City is required",
    },
    notEmpty: {
      errorMessage: "City cannot be empty",
    },
    trim: true,
  },

  "location.state": {
    exists: {
      errorMessage: "State is required",
    },
    notEmpty: {
      errorMessage: "State cannot be empty",
    },
    trim: true,
  },

  "location.pincode": {
    optional: true,
    trim: true,
    matches: {
      options: /^[0-9]{6}$/,
      errorMessage: "Pincode must be a valid 6-digit number",
    },
  },


  description: {
    optional: true,
    trim: true,
    isLength: {
      options: {
        max: 1000,
      },
      errorMessage: "Description cannot exceed 1000 characters",
    },
  },

  features: {
    optional: true,
    isArray: {
      errorMessage: "Features must be an array",
    },
  },

  registrationNumber: {
    exists: {
      errorMessage: "Registration number is required",
    },
    notEmpty: {
      errorMessage: "Registration number cannot be empty",
    },
    trim: true,
    toUpperCase: true,
    isLength: {
      options: {
        min: 5,
        max: 20,
      },
      errorMessage:
        "Registration number must be between 5 and 20 characters",
    },
  },
};


// =====================================================
// UPDATE CAR VALIDATION
// =====================================================

export const carUpdateSchema = {
  brand: {
    optional: true,
    trim: true,
    isLength: {
      options: {
        min: 2,
        max: 50,
      },
      errorMessage: "Brand must be between 2 and 50 characters",
    },
  },

  model: {
    optional: true,
    trim: true,
    isLength: {
      options: {
        min: 1,
        max: 50,
      },
      errorMessage: "Model must be between 1 and 50 characters",
    },
  },

  year: {
    optional: true,
    isInt: {
      options: {
        min: 1900,
        max: new Date().getFullYear() + 1,
      },
      errorMessage: "Invalid car year",
    },
    toInt: true,
  },

  type: {
    optional: true,
    isIn: {
      options: [[
        "HATCHBACK",
        "SEDAN",
        "SUV",
        "MUV",
        "COUPE",
        "CONVERTIBLE",
        "LUXURY",
      ]],
      errorMessage: "Invalid car type",
    },
  },

  transmission: {
    optional: true,
    isIn: {
      options: [["MANUAL", "AUTOMATIC"]],
      errorMessage: "Invalid transmission type",
    },
  },

  fuelType: {
    optional: true,
    isIn: {
      options: [["PETROL", "DIESEL", "ELECTRIC", "HYBRID"]],
      errorMessage: "Invalid fuel type",
    },
  },

  seats: {
    optional: true,
    isInt: {
      options: {
        min: 1,
        max: 20,
      },
      errorMessage: "Seats must be between 1 and 20",
    },
    toInt: true,
  },

  pricePerDay: {
    optional: true,
    isFloat: {
      options: {
        min: 0,
      },
      errorMessage: "Price must be a valid positive number",
    },
    toFloat: true,
  },

  "location.city": {
    optional: true,
    trim: true,
    isLength: {
      options: {
        min: 2,
        max: 50,
      },
      errorMessage: "City must be between 2 and 50 characters",
    },
  },

  "location.state": {
    optional: true,
    trim: true,
    isLength: {
      options: {
        min: 2,
        max: 50,
      },
      errorMessage: "State must be between 2 and 50 characters",
    },
  },

  "location.pincode": {
    optional: true,
    trim: true,
    matches: {
      options: /^[0-9]{6}$/,
      errorMessage: "Pincode must be a valid 6-digit number",
    },
  },


  description: {
    optional: true,
    trim: true,
    isLength: {
      options: {
        max: 1000,
      },
      errorMessage: "Description cannot exceed 1000 characters",
    },
  },

  features: {
    optional: true,
    isArray: {
      errorMessage: "Features must be an array",
    },
  },

  registrationNumber: {
    optional: true,
    trim: true,
    toUpperCase: true,
    isLength: {
      options: {
        min: 5,
        max: 20,
      },
      errorMessage:
        "Registration number must be between 5 and 20 characters",
    },
  },
};