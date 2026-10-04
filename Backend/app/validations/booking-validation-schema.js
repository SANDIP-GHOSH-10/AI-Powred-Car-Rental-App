// =====================================================
// CREATE BOOKING VALIDATION
// =====================================================

export const bookingCreateSchema = {
  car: {
    exists: {
      errorMessage: "Car is required",
    },

    notEmpty: {
      errorMessage: "Car cannot be empty",
    },

    isMongoId: {
      errorMessage: "Invalid car ID",
    },
  },

  startDate: {
    exists: {
      errorMessage: "Start date is required",
    },

    notEmpty: {
      errorMessage: "Start date cannot be empty",
    },

    isISO8601: {
      errorMessage: "Invalid start date",
    },

    custom: {
      options: (value) => {
        const startDate = new Date(value);
        const today = new Date();

        if (startDate < today) {
          throw new Error("Start date cannot be in the past");
        }

        return true;
      },
    },
  },

  endDate: {
    exists: {
      errorMessage: "End date is required",
    },

    notEmpty: {
      errorMessage: "End date cannot be empty",
    },

    isISO8601: {
      errorMessage: "Invalid end date",
    },

    custom: {
      options: (value, { req }) => {
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(value);

        if (endDate <= startDate) {
          throw new Error("End date must be after start date");
        }

        return true;
      },
    },
  },

  pickupLocation: {
    exists: {
      errorMessage: "Pickup location is required",
    },

    notEmpty: {
      errorMessage: "Pickup location cannot be empty",
    },

    trim: true,

    isLength: {
      options: {
        min: 2,
        max: 200,
      },
      errorMessage:
        "Pickup location must be between 2 and 200 characters",
    },
  },

  dropLocation: {
    optional: true,

    trim: true,

    isLength: {
      options: {
        min: 2,
        max: 200,
      },
      errorMessage:
        "Drop location must be between 2 and 200 characters",
    },
  },

  paymentMethod: {
    optional: true,
    isIn: {
      options: [["COD", "ONLINE"]],
      errorMessage: "Payment method must be COD or ONLINE",
    },
  },
};


// =====================================================
// UPDATE BOOKING VALIDATION
// =====================================================

export const bookingUpdateSchema = {
  startDate: {
    optional: true,

    isISO8601: {
      errorMessage: "Invalid start date",
    },

    custom: {
      options: (value) => {
        const startDate = new Date(value);
        const today = new Date();

        if (startDate < today) {
          throw new Error("Start date cannot be in the past");
        }

        return true;
      },
    },
  },

  endDate: {
    optional: true,

    isISO8601: {
      errorMessage: "Invalid end date",
    },

    custom: {
      options: (value, { req }) => {
        if (!req.body.startDate) {
          return true;
        }

        const startDate = new Date(req.body.startDate);
        const endDate = new Date(value);

        if (endDate <= startDate) {
          throw new Error("End date must be after start date");
        }

        return true;
      },
    },
  },

  pickupLocation: {
    optional: true,

    trim: true,

    isLength: {
      options: {
        min: 2,
        max: 200,
      },
      errorMessage:
        "Pickup location must be between 2 and 200 characters",
    },
  },

  dropLocation: {
    optional: true,

    trim: true,

    isLength: {
      options: {
        min: 2,
        max: 200,
      },
      errorMessage:
        "Drop location must be between 2 and 200 characters",
    },
  },
};