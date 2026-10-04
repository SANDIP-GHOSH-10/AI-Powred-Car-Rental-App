// =====================================================
// CREATE CUSTOMER VALIDATION
// =====================================================

export const customerCreateSchema = {
  phone: {
    optional: true,

    trim: true,

    isMobilePhone: {
      options: ["en-IN"],
      errorMessage: "Invalid phone number",
    },
  },

  dateOfBirth: {
    optional: true,

    isISO8601: {
      errorMessage: "Invalid date of birth",
    },

    custom: {
      options: (value) => {
        const dateOfBirth = new Date(value);
        const today = new Date();

        if (dateOfBirth >= today) {
          throw new Error("Date of birth must be in the past");
        }

        return true;
      },
    },
  },

  drivingLicenseNumber: {
    optional: true,

    trim: true,

    isLength: {
      options: {
        min: 5,
        max: 30,
      },
      errorMessage:
        "Driving license number must be between 5 and 30 characters",
    },

    matches: {
      options: /^[A-Za-z0-9-]+$/,
      errorMessage: "Invalid driving license number",
    },

    toUpperCase: true,
  },

  "address.street": {
    optional: true,

    trim: true,

    isLength: {
      options: {
        min: 2,
        max: 100,
      },
      errorMessage: "Street must be between 2 and 100 characters",
    },
  },

  "address.city": {
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

  "address.state": {
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

  "address.country": {
    optional: true,

    trim: true,

    isLength: {
      options: {
        min: 2,
        max: 50,
      },
      errorMessage: "Country must be between 2 and 50 characters",
    },
  },

  "address.pincode": {
    optional: true,

    trim: true,

    matches: {
      options: /^[0-9]{6}$/,
      errorMessage: "Pincode must be a valid 6-digit number",
    },
  },
};


// =====================================================
// UPDATE CUSTOMER VALIDATION
// =====================================================

export const customerUpdateSchema = {
  phone: {
    optional: true,

    trim: true,

    isMobilePhone: {
      options: ["en-IN"],
      errorMessage: "Invalid phone number",
    },
  },

  dateOfBirth: {
    optional: true,

    isISO8601: {
      errorMessage: "Invalid date of birth",
    },

    custom: {
      options: (value) => {
        const dateOfBirth = new Date(value);
        const today = new Date();

        if (dateOfBirth >= today) {
          throw new Error("Date of birth must be in the past");
        }

        return true;
      },
    },
  },

  drivingLicenseNumber: {
    optional: true,

    trim: true,

    isLength: {
      options: {
        min: 5,
        max: 30,
      },
      errorMessage:
        "Driving license number must be between 5 and 30 characters",
    },

    matches: {
      options: /^[A-Za-z0-9-]+$/,
      errorMessage: "Invalid driving license number",
    },

    toUpperCase: true,
  },

  "address.street": {
    optional: true,

    trim: true,

    isLength: {
      options: {
        min: 2,
        max: 100,
      },
      errorMessage: "Street must be between 2 and 100 characters",
    },
  },

  "address.city": {
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

  "address.state": {
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

  "address.country": {
    optional: true,

    trim: true,

    isLength: {
      options: {
        min: 2,
        max: 50,
      },
      errorMessage: "Country must be between 2 and 50 characters",
    },
  },

  "address.pincode": {
    optional: true,

    trim: true,

    matches: {
      options: /^[0-9]{6}$/,
      errorMessage: "Pincode must be a valid 6-digit number",
    },
  },
};