// =====================================================
// CREATE HOST VALIDATION
// =====================================================

export const hostCreateSchema = {
  phone: {
    optional: true,

    trim: true,

    isMobilePhone: {
      options: ["en-IN"],
      errorMessage: "Invalid phone number",
    },
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
// UPDATE HOST VALIDATION
// =====================================================

export const hostUpdateSchema = {
  phone: {
    optional: true,

    trim: true,

    isMobilePhone: {
      options: ["en-IN"],
      errorMessage: "Invalid phone number",
    },
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