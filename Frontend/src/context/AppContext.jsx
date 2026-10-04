import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";

import api from "../api/axios.js";
import reducer from "../reducers/app-reducer.js";
import { AuthContext } from "./Auth.jsx";

export const AppContext = createContext();

const initialState = {
  cars: [],
  myCars: [],
  myBookings: [],
  hostBookings: [],
  adminBookings: [],
  adminUsers: [],
  adminCars: [],
  bookedDates: {},

  carsLoading: false,
  myCarsLoading: false,
  bookingsLoading: false,
  hostBookingsLoading: false,
  adminBookingsLoading: false,
  adminUsersLoading: false,
  adminCarsLoading: false,
  bookedDatesLoading: false,

  availability: null,
  availabilityLoading: false,

  payments: [],
  paymentsLoading: false,
  adminPayments: [],
  adminPaymentsLoading: false,
  paymentLoading: false,
  paymentError: null,

  // AI Search state
  aiResults: null,
  aiAlternatives: [],
  aiAnswer: null,
  aiFilters: null,
  aiQuery: "",
  aiMeta: null,
  aiLoading: false,
  aiError: null,

  error: null,
};

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const { user, loading: authLoading } = useContext(AuthContext);

  // ==================================================
  // FETCH PUBLIC CARS
  // ==================================================

  const fetchCars = useCallback(async () => {
    console.log("Fetching public cars...");

    dispatch({
      type: "SET_CARS_LOADING",
      payload: true,
    });

    try {
      const response = await api.get("/cars");

      console.log("GET /cars response:", response.data);

      /*
        Backend can return either:

        {
          cars: [...]
        }

        OR

        [...]
      */

      let cars = [];

      if (Array.isArray(response.data)) {
        cars = response.data;
      } else if (Array.isArray(response.data?.cars)) {
        cars = response.data.cars;
      }

      console.log("Cars extracted from response:", cars);

      dispatch({
        type: "SET_CARS",
        payload: cars,
      });
    } catch (error) {
      console.error("fetchCars error:", error.response?.data || error);

      dispatch({
        type: "SET_ERROR",
        payload:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Error fetching cars",
      });
    } finally {
      dispatch({
        type: "SET_CARS_LOADING",
        payload: false,
      });
    }
  }, []);

  // ==================================================
  // FETCH HOST'S CARS
  // ==================================================

  const fetchMyCars = useCallback(async () => {
    if (authLoading) {
      return;
    }

    /*
      User can have:

      ["CUSTOMER"]

      ["HOST"]

      ["CUSTOMER", "HOST"]
    */

    const isHost = Array.isArray(user?.roles) && user.roles.includes("HOST");

    /*
      Customer should NOT fetch host cars.
    */

    if (!user || !isHost) {
      dispatch({
        type: "SET_MY_CARS",
        payload: [],
      });

      return;
    }

    console.log("Fetching host's cars...");

    dispatch({
      type: "SET_MY_CARS_LOADING",
      payload: true,
    });

    try {
      const response = await api.get("/my-cars");

      console.log("GET /my-cars response:", response.data);

      let myCars = [];

      if (Array.isArray(response.data)) {
        myCars = response.data;
      } else if (Array.isArray(response.data?.cars)) {
        myCars = response.data.cars;
      }

      console.log("Host cars extracted:", myCars);

      dispatch({
        type: "SET_MY_CARS",
        payload: myCars,
      });
    } catch (error) {
      console.error("fetchMyCars error:", error.response?.data || error);

      dispatch({
        type: "SET_ERROR",
        payload:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Error fetching host cars",
      });
    } finally {
      dispatch({
        type: "SET_MY_CARS_LOADING",
        payload: false,
      });
    }
  }, [authLoading, user]);

  // ==================================================
  // CREATE CAR
  // ==================================================

  const createCar = useCallback(
    async (carData) => {
      try {
        const response = await api.post("/cars", carData);

        console.log("POST /cars response:", response.data);

        const newCar = response.data?.car || response.data;

        /*
          Add to host's cars.
        */

        dispatch({
          type: "ADD_MY_CAR",
          payload: newCar,
        });

        /*
          IMPORTANT:

          A newly created car normally has
          status = PENDING.

          Therefore don't automatically
          add it to public cars.

          Customer should only see
          AVAILABLE cars.
        */

        /*
          Re-fetch public cars so that the
          Context stays synchronized.
        */

        await fetchCars();

        return response;
      } catch (error) {
        console.error("createCar error:", error.response?.data || error);

        dispatch({
          type: "SET_ERROR",
          payload:
            error.response?.data?.error ||
            error.response?.data?.message ||
            "Error creating car",
        });

        throw error;
      }
    },
    [fetchCars],
  );

  // ==================================================
  // UPDATE CAR
  // ==================================================

  const updateCar = useCallback(
    async (id, carData) => {
      try {
        console.log("Updating car:", id, carData);

        const response = await api.patch(`/cars/${id}`, carData);

        console.log("PATCH /cars response:", response.data);

        const updatedCar = response.data?.car || response.data;

        /*
          Update host's cars.
        */

        dispatch({
          type: "UPDATE_MY_CAR",
          payload: updatedCar,
        });

        /*
          Re-fetch public cars.

          This is better than blindly adding
          the updated car because its status
          may be PENDING / AVAILABLE etc.
        */

        await fetchCars();

        return response;
      } catch (error) {
        console.error("updateCar error:", error.response?.data || error);

        dispatch({
          type: "SET_ERROR",
          payload:
            error.response?.data?.error ||
            error.response?.data?.message ||
            "Error updating car",
        });

        throw error;
      }
    },
    [fetchCars],
  );

  // ==================================================
  // DELETE CAR
  // ==================================================

  const deleteCar = useCallback(
    async (id) => {
      try {
        const response = await api.delete(`/cars/${id}`);

        console.log("DELETE /cars response:", response.data);

        dispatch({
          type: "REMOVE_MY_CAR",
          payload: id,
        });

        /*
          Refresh public cars.
        */

        await fetchCars();

        return response;
      } catch (error) {
        console.error("deleteCar error:", error.response?.data || error);

        dispatch({
          type: "SET_ERROR",
          payload:
            error.response?.data?.error ||
            error.response?.data?.message ||
            "Error deleting car",
        });

        throw error;
      }
    },
    [fetchCars],
  );

  // ==================================================
  // FETCH MY BOOKINGS (CUSTOMER)
  // ==================================================

  const fetchMyBookings = useCallback(async () => {
    if (authLoading) {
      return;
    }

    const isCustomer =
      Array.isArray(user?.roles) &&
      user.roles.includes("CUSTOMER");

    if (!user || !isCustomer) {
      dispatch({
        type: "SET_MY_BOOKINGS",
        payload: [],
      });

      return;
    }

    console.log("Fetching customer bookings...");

    dispatch({
      type: "SET_BOOKINGS_LOADING",
      payload: true,
    });

    try {
      const response = await api.get("/bookings/my-bookings");

      console.log("GET /bookings/my-bookings response:", response.data);

      const bookings = Array.isArray(response.data?.bookings)
        ? response.data.bookings
        : [];

      dispatch({
        type: "SET_MY_BOOKINGS",
        payload: bookings,
      });
    } catch (error) {
      console.error("fetchMyBookings error:", error.response?.data || error);

      dispatch({
        type: "SET_ERROR",
        payload:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Error fetching bookings",
      });
    } finally {
      dispatch({
        type: "SET_BOOKINGS_LOADING",
        payload: false,
      });
    }
  }, [authLoading, user]);


  // ==================================================
  // FETCH HOST BOOKINGS
  // ==================================================

  const fetchHostBookings = useCallback(async () => {
    if (authLoading) {
      return;
    }

    const isHost =
      Array.isArray(user?.roles) &&
      user.roles.includes("HOST");

    if (!user || !isHost) {
      dispatch({
        type: "SET_HOST_BOOKINGS",
        payload: [],
      });

      return;
    }

    console.log("Fetching host bookings...");

    dispatch({
      type: "SET_HOST_BOOKINGS_LOADING",
      payload: true,
    });

    try {
      const response = await api.get("/bookings/host");

      console.log("GET /bookings/host response:", response.data);

      const bookings = Array.isArray(response.data?.bookings)
        ? response.data.bookings
        : [];

      dispatch({
        type: "SET_HOST_BOOKINGS",
        payload: bookings,
      });
    } catch (error) {
      console.error("fetchHostBookings error:", error.response?.data || error);

      dispatch({
        type: "SET_ERROR",
        payload:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Error fetching host bookings",
      });
    } finally {
      dispatch({
        type: "SET_HOST_BOOKINGS_LOADING",
        payload: false,
      });
    }
  }, [authLoading, user]);


  // ==================================================
  // FETCH ADMIN BOOKINGS
  // ==================================================

  const fetchAdminBookings = useCallback(async () => {
    if (authLoading) {
      return;
    }

    const isAdmin =
      Array.isArray(user?.roles) &&
      user.roles.includes("ADMIN");

    if (!user || !isAdmin) {
      dispatch({
        type: "SET_ADMIN_BOOKINGS",
        payload: [],
      });

      return;
    }

    console.log("Fetching admin bookings...");

    dispatch({
      type: "SET_ADMIN_BOOKINGS_LOADING",
      payload: true,
    });

    try {
      const response = await api.get("/admin/bookings");

      console.log("GET /admin/bookings response:", response.data);

      const bookings = Array.isArray(response.data?.bookings)
        ? response.data.bookings
        : [];

      dispatch({
        type: "SET_ADMIN_BOOKINGS",
        payload: bookings,
      });
    } catch (error) {
      console.error("fetchAdminBookings error:", error.response?.data || error);

      dispatch({
        type: "SET_ERROR",
        payload:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Error fetching admin bookings",
      });
    } finally {
      dispatch({
        type: "SET_ADMIN_BOOKINGS_LOADING",
        payload: false,
      });
    }
  }, [authLoading, user]);


  // ==================================================
  // FETCH SINGLE BOOKING BY ID
  // Returns the booking object directly.
  // Page is responsible for storing it in local state.
  // ==================================================

  const fetchBookingById = useCallback(async (id) => {
    const response = await api.get(`/bookings/${id}`);

    return response.data?.booking || response.data;
  }, []);


  // ==================================================
  // CREATE BOOKING
  // ==================================================

  const fetchBookedDates = useCallback(async (carId, forceRefresh = false) => {
    if (!carId) {
      return [];
    }

    if (!forceRefresh && state.bookedDates?.[carId]) {
      return state.bookedDates[carId];
    }

    dispatch({
      type: "SET_BOOKED_DATES_LOADING",
      payload: true,
    });

    try {
      const response = await api.get(`/cars/${carId}/booked-dates`);
      const bookedDates = Array.isArray(response.data?.bookedDates)
        ? response.data.bookedDates
        : [];

      dispatch({
        type: "SET_BOOKED_DATES",
        payload: { carId, bookedDates },
      });

      return bookedDates;
    } catch (error) {
      console.error("fetchBookedDates error:", error.response?.data || error);

      dispatch({
        type: "SET_ERROR",
        payload:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Error fetching booked dates",
      });

      return [];
    }
  }, [state.bookedDates]);


  const invalidateBookedDates = useCallback((carId) => {
    if (!carId) return;
    dispatch({
      type: "CLEAR_BOOKED_DATES_FOR_CAR",
      payload: carId,
    });
  }, []);


  const createBooking = useCallback(async (bookingData) => {
    try {
      const response = await api.post("/bookings", bookingData);

      console.log("POST /bookings response:", response.data);

      const newBooking = response.data?.booking || response.data;

      dispatch({
        type: "ADD_BOOKING",
        payload: newBooking,
      });

      if (bookingData?.car) {
        await fetchBookedDates(bookingData.car, true);
      }

      return response;
    } catch (error) {
      console.error("createBooking error:", error.response?.data || error);

      dispatch({
        type: "SET_ERROR",
        payload:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Error creating booking",
      });

      throw error;
    }
  }, [fetchBookedDates]);


  // ==================================================
  // CANCEL BOOKING
  // ==================================================

  const cancelBooking = useCallback(async (id) => {
    try {
      const response = await api.patch(`/bookings/${id}/cancel`);

      console.log("PATCH /bookings/:id/cancel response:", response.data);

      const updatedBooking = response.data?.booking || response.data;

      /*
        Update the booking in state — no page reload.
      */

      dispatch({
        type: "UPDATE_BOOKING",
        payload: updatedBooking,
      });

      if (updatedBooking?.car) {
        await fetchBookedDates(
          typeof updatedBooking.car === "string"
            ? updatedBooking.car
            : updatedBooking.car._id,
          true
        );
      }

      return response;
    } catch (error) {
      console.error("cancelBooking error:", error.response?.data || error);

      dispatch({
        type: "SET_ERROR",
        payload:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Error cancelling booking",
      });

      throw error;
    }
  }, []);


  // ==================================================
  // UPDATE BOOKING STATUS (ADMIN)
  // ==================================================

  const updateBookingStatus = useCallback(async (id, status) => {
    try {
      const response = await api.patch(
        `/admin/bookings/${id}/status`,
        { status }
      );

      console.log("PATCH /admin/bookings/:id/status response:", response.data);

      const updatedBooking = response.data?.booking || response.data;

      dispatch({
        type: "UPDATE_BOOKING",
        payload: updatedBooking,
      });

      return response;
    } catch (error) {
      console.error("updateBookingStatus error:", error.response?.data || error);

      dispatch({
        type: "SET_ERROR",
        payload:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Error updating booking status",
      });

      throw error;
    }
  }, []);


  // ==================================================
  // UPDATE CAR STATUS (HOST)
  // Toggle between AVAILABLE and UNAVAILABLE
  // ==================================================

  const updateCarStatus = useCallback(async (id, status) => {
    try {
      const response = await api.patch(
        `/cars/${id}/status`,
        { status }
      );

      console.log("PATCH /cars/:id/status response:", response.data);

      const updatedCar = response.data?.car || response.data;

      dispatch({
        type: "UPDATE_MY_CAR",
        payload: updatedCar,
      });

      // Refresh public cars since availability changed
      await fetchCars();

      return response;
    } catch (error) {
      console.error("updateCarStatus error:", error.response?.data || error);

      dispatch({
        type: "SET_ERROR",
        payload:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Error updating car status",
      });

      throw error;
    }
  }, [fetchCars]);


  // ==================================================
  // UPDATE BOOKING STATUS (HOST)
  // Confirm / Reject / Complete bookings for host's cars
  // ==================================================

  const updateHostBookingStatus = useCallback(async (id, status) => {
    try {
      const response = await api.patch(
        `/bookings/${id}/status`,
        { status }
      );

      console.log("PATCH /bookings/:id/status response:", response.data);

      const updatedBooking = response.data?.booking || response.data;

      dispatch({
        type: "UPDATE_BOOKING",
        payload: updatedBooking,
      });

      const carId =
        typeof updatedBooking?.car === "string"
          ? updatedBooking.car
          : updatedBooking?.car?._id;

      if (carId) {
        await fetchBookedDates(carId, true);
      }

      return response;
    } catch (error) {
      console.error("updateHostBookingStatus error:", error.response?.data || error);

      dispatch({
        type: "SET_ERROR",
        payload:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Error updating booking status",
      });

      throw error;
    }
  }, []);


  // ==================================================
  // FETCH ADMIN USERS
  // ==================================================

  const fetchAdminUsers = useCallback(async () => {
    if (authLoading) {
      return;
    }

    const isAdmin =
      Array.isArray(user?.roles) &&
      user.roles.includes("ADMIN");

    if (!user || !isAdmin) {
      dispatch({
        type: "SET_ADMIN_USERS",
        payload: [],
      });

      return;
    }

    console.log("Fetching admin users...");

    dispatch({
      type: "SET_ADMIN_USERS_LOADING",
      payload: true,
    });

    try {
      const response = await api.get("/admin/users");

      console.log("GET /admin/users response:", response.data);

      const users = Array.isArray(response.data?.users)
        ? response.data.users
        : [];

      dispatch({
        type: "SET_ADMIN_USERS",
        payload: users,
      });
    } catch (error) {
      console.error("fetchAdminUsers error:", error.response?.data || error);

      dispatch({
        type: "SET_ERROR",
        payload:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Error fetching admin users",
      });
    } finally {
      dispatch({
        type: "SET_ADMIN_USERS_LOADING",
        payload: false,
      });
    }
  }, [authLoading, user]);


  // ==================================================
  // FETCH ADMIN CARS (all cars for admin)
  // ==================================================

  const fetchAdminCars = useCallback(async () => {
    if (authLoading) {
      return;
    }

    const isAdmin =
      Array.isArray(user?.roles) &&
      user.roles.includes("ADMIN");

    if (!user || !isAdmin) {
      dispatch({
        type: "SET_ADMIN_CARS",
        payload: [],
      });

      return;
    }

    console.log("Fetching admin cars...");

    dispatch({
      type: "SET_ADMIN_CARS_LOADING",
      payload: true,
    });

    try {
      const response = await api.get("/admin/cars");

      console.log("GET /admin/cars response:", response.data);

      const cars = Array.isArray(response.data?.cars)
        ? response.data.cars
        : [];

      dispatch({
        type: "SET_ADMIN_CARS",
        payload: cars,
      });
    } catch (error) {
      console.error("fetchAdminCars error:", error.response?.data || error);

      dispatch({
        type: "SET_ERROR",
        payload:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Error fetching admin cars",
      });
    } finally {
      dispatch({
        type: "SET_ADMIN_CARS_LOADING",
        payload: false,
      });
    }
  }, [authLoading, user]);


  // ==================================================
  // ADMIN APPROVE CAR
  // ==================================================

  const adminApproveCar = useCallback(async (carId) => {
    try {
      const response = await api.patch(
        `/admin/cars/${carId}/approve`
      );

      console.log("PATCH /admin/cars/:id/approve response:", response.data);

      const updatedCar = response.data?.car || response.data;

      dispatch({
        type: "UPDATE_ADMIN_CAR",
        payload: updatedCar,
      });

      /*
        Also refresh public cars since a new car
        became AVAILABLE.
      */
      await fetchCars();

      return response;
    } catch (error) {
      console.error("adminApproveCar error:", error.response?.data || error);

      dispatch({
        type: "SET_ERROR",
        payload:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Error approving car",
      });

      throw error;
    }
  }, [fetchCars]);


  // ==================================================
  // ADMIN REJECT CAR
  // ==================================================

  const adminRejectCar = useCallback(async (carId) => {
    try {
      const response = await api.patch(
        `/admin/cars/${carId}/reject`
      );

      console.log("PATCH /admin/cars/:id/reject response:", response.data);

      const updatedCar = response.data?.car || response.data;

      dispatch({
        type: "UPDATE_ADMIN_CAR",
        payload: updatedCar,
      });

      return response;
    } catch (error) {
      console.error("adminRejectCar error:", error.response?.data || error);

      dispatch({
        type: "SET_ERROR",
        payload:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Error rejecting car",
      });

      throw error;
    }
  }, []);


  // ==================================================
  // CHECK CAR AVAILABILITY FOR DATE RANGE
  // ==================================================

  const checkCarAvailability = useCallback(async (carId, startDate, endDate) => {
    dispatch({
      type: "SET_AVAILABILITY_LOADING",
      payload: true,
    });

    try {
      const response = await api.get(
        `/cars/${carId}/availability`,
        {
          params: { startDate, endDate },
        }
      );

      console.log("GET /cars/:id/availability response:", response.data);

      const result = {
        carId,
        startDate,
        endDate,
        available: response.data.available,
        message: response.data.message || null,
      };

      dispatch({
        type: "SET_AVAILABILITY",
        payload: result,
      });

      return result;
    } catch (error) {
      console.error("checkCarAvailability error:", error.response?.data || error);

      const result = {
        carId,
        startDate,
        endDate,
        available: false,
        message:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Error checking availability",
      };

      dispatch({
        type: "SET_AVAILABILITY",
        payload: result,
      });

      return result;
    }
  }, []);


  // ==================================================
  // CLEAR AVAILABILITY
  // Reset when dates change so stale data is removed.
  // ==================================================

  const clearAvailability = useCallback(() => {
    dispatch({ type: "CLEAR_AVAILABILITY" });
  }, []);


  // ==================================================
  // FETCH PUBLIC CARS ON APP START
  // ==================================================

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  // ==================================================
  // FETCH HOST CARS
  // ==================================================

  useEffect(() => {
    if (!authLoading) {
      fetchMyCars();
    }
  }, [authLoading, fetchMyCars]);

  // ==================================================
  // FETCH BOOKINGS BASED ON ROLE
  //
  // Runs once after authentication is resolved.
  // Only calls the fetch relevant to the logged-in role.
  // Pages consume context state and do NOT re-fetch
  // on mount — this is the single source of truth.
  // ==================================================

  useEffect(() => {
    if (authLoading) {
      return;
    }

    const roles = Array.isArray(user?.roles) ? user.roles : [];

    if (roles.includes("CUSTOMER")) {
      fetchMyBookings();
    }

    if (roles.includes("HOST")) {
      fetchHostBookings();
    }

    if (roles.includes("ADMIN")) {
      fetchAdminBookings();
      fetchAdminUsers();
      fetchAdminCars();
    }
  }, [authLoading, user, fetchMyBookings, fetchHostBookings, fetchAdminBookings, fetchAdminUsers, fetchAdminCars]);


  // ==================================================
  // PAYMENT FUNCTIONS (RAZORPAY & COD)
  // ==================================================

  const createPaymentOrder = useCallback(async (bookingId) => {
    dispatch({ type: "SET_PAYMENT_LOADING", payload: true });
    dispatch({ type: "SET_PAYMENT_ERROR", payload: null });

    try {
      const response = await api.post("/payments/create-order", { bookingId });
      console.log("POST /payments/create-order response:", response.data);
      return response.data;
    } catch (error) {
      console.error("createPaymentOrder error:", error.response?.data || error);
      const errMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Error creating payment order";
      dispatch({ type: "SET_PAYMENT_ERROR", payload: errMsg });
      throw error;
    } finally {
      dispatch({ type: "SET_PAYMENT_LOADING", payload: false });
    }
  }, []);

  const verifyPayment = useCallback(async (paymentPayload) => {
    dispatch({ type: "SET_PAYMENT_LOADING", payload: true });
    dispatch({ type: "SET_PAYMENT_ERROR", payload: null });

    try {
      const response = await api.post("/payments/verify", paymentPayload);
      console.log("POST /payments/verify response:", response.data);

      const { payment, booking } = response.data;

      // Automatically update local booking in state without full refetch
      if (booking) {
        dispatch({
          type: "UPDATE_BOOKING",
          payload: booking,
        });
      }

      if (payment) {
        dispatch({
          type: "ADD_PAYMENT",
          payload: payment,
        });
      }

      return response.data;
    } catch (error) {
      console.error("verifyPayment error:", error.response?.data || error);
      const errMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Payment verification failed";
      dispatch({ type: "SET_PAYMENT_ERROR", payload: errMsg });
      throw error;
    } finally {
      dispatch({ type: "SET_PAYMENT_LOADING", payload: false });
    }
  }, []);

  const fetchMyPayments = useCallback(async () => {
    dispatch({ type: "SET_PAYMENTS_LOADING", payload: true });
    try {
      const response = await api.get("/payments/my-payments");
      const paymentsList = response.data?.payments || [];
      dispatch({
        type: "SET_PAYMENTS",
        payload: paymentsList,
      });
      return paymentsList;
    } catch (error) {
      console.error("fetchMyPayments error:", error.response?.data || error);
      dispatch({ type: "SET_PAYMENTS_LOADING", payload: false });
      throw error;
    }
  }, []);

  const fetchAdminPayments = useCallback(async () => {
    dispatch({ type: "SET_ADMIN_PAYMENTS_LOADING", payload: true });
    try {
      const response = await api.get("/admin/payments");
      const paymentsList = response.data?.payments || [];
      dispatch({
        type: "SET_ADMIN_PAYMENTS",
        payload: paymentsList,
      });
      return paymentsList;
    } catch (error) {
      console.error("fetchAdminPayments error:", error.response?.data || error);
      dispatch({ type: "SET_ADMIN_PAYMENTS_LOADING", payload: false });
      throw error;
    }
  }, []);


  // ==================================================
  // AI CAR SEARCH (RAG)
  // ==================================================

  const searchCarsWithAI = useCallback(async (prompt) => {
    if (!prompt || !prompt.trim()) return;

    dispatch({ type: "SET_AI_LOADING", payload: true });

    try {
      console.log("[AppContext] AI Search:", prompt);

      const response = await api.post("/ai/search", { prompt: prompt.trim() });

      console.log("[AppContext] AI Search response:", response.data);

      dispatch({
        type: "SET_AI_RESULTS",
        payload: {
          cars: response.data.cars || [],
          alternatives: response.data.alternatives || [],
          answer: response.data.answer || "",
          filters: response.data.filters || null,
          query: response.data.query || prompt,
          meta: response.data.meta || null,
        },
      });
    } catch (error) {
      console.error("[AppContext] AI Search error:", error.response?.data || error);

      const errMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "AI search failed. Please try again.";

      dispatch({ type: "SET_AI_ERROR", payload: errMsg });
    }
  }, []);

  const clearAIResults = useCallback(() => {
    dispatch({ type: "CLEAR_AI_RESULTS" });
  }, []);


  // ==================================================
  // AI CAR SUGGESTION (HOST — Add/Edit Car)
  // ==================================================

  /**
   * Calls POST /ai/car-suggestion to generate features + description
   * for a host's car listing.
   *
   * Suggestions are transient UI state — NOT stored in the reducer.
   * The page component holds them locally and only applies them
   * when the host explicitly clicks "Use Suggestions".
   *
   * @param {Object} carInfo - { brand, model, year, type, transmission, fuelType, seats }
   * @returns {Promise<{ features: string[], description: string }>}
   */
  const generateCarSuggestions = useCallback(async (carInfo) => {
    console.log("[AppContext] generateCarSuggestions:", carInfo);

    const response = await api.post("/ai/car-suggestion", carInfo);

    console.log("[AppContext] car-suggestion response:", response.data);

    // Return suggestions directly — caller handles state and toasts
    return response.data.suggestions;
  }, []);



  const contextValue = {
    ...state,

    // Car functions
    fetchCars,
    fetchMyCars,
    createCar,
    updateCar,
    deleteCar,
    updateCarStatus,

    // Booking functions
    fetchMyBookings,
    fetchHostBookings,
    fetchAdminBookings,
    fetchBookingById,
    fetchBookedDates,
    invalidateBookedDates,
    createBooking,
    cancelBooking,
    updateBookingStatus,
    updateHostBookingStatus,

    // Availability functions
    checkCarAvailability,
    clearAvailability,

    // Admin functions
    fetchAdminUsers,
    fetchAdminCars,
    adminApproveCar,
    adminRejectCar,

    // Payment functions
    createPaymentOrder,
    verifyPayment,
    fetchMyPayments,
    fetchAdminPayments,

    // AI Search functions
    searchCarsWithAI,
    clearAIResults,

    // AI Car Suggestion (Host Add/Edit Car)
    generateCarSuggestions,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}




































// import {
// 	createContext,
// 	useCallback,
// 	useContext,
// 	useEffect,
// 	useReducer,
// } from "react";

// import api from "../api/axios.js";
// import reducer from "../reducers/app-reducer.js";
// import { AuthContext } from "./Auth.jsx";

// export const AppContext = createContext();

// const initialState = {
// 	cars: [],
// 	myCars: [],
// 	bookings: [],
// 	carsLoading: false,
// 	myCarsLoading: false,
// 	error: null,
// };

// export function AppProvider({ children }) {
// 	const [state, dispatch] = useReducer(reducer, initialState);

// 	const { user, loading: authLoading } = useContext(AuthContext);

// 	// --------------------------------------------------
// 	// Fetch all public cars
// 	// --------------------------------------------------
// 	const fetchCars = useCallback(async () => {
// 		dispatch({
// 			type: "SET_CARS_LOADING",
// 			payload: true,
// 		});

// 		try {
// 			const res = await api.get("/cars");

// 			const data = res.data?.cars ?? res.data ?? [];

// 			dispatch({
// 				type: "SET_CARS",
// 				payload: data,
// 			});

// 			// Clear previous error after successful request
// 			dispatch({
// 				type: "SET_ERROR",
// 				payload: null,
// 			});
// 		} catch (err) {
// 			console.error("fetchCars error:", err);

// 			dispatch({
// 				type: "SET_ERROR",
// 				payload:
// 					err.response?.data?.error ||
// 					err.response?.data?.message ||
// 					"Error fetching cars",
// 			});
// 		} finally {
// 			dispatch({
// 				type: "SET_CARS_LOADING",
// 				payload: false,
// 			});
// 		}
// 	}, []);

// 	// --------------------------------------------------
// 	// Fetch cars owned by logged-in host
// 	// --------------------------------------------------
// 	const fetchMyCars = useCallback(async () => {
// 		// Don't do anything while authentication is loading
// 		if (authLoading) {
// 			return;
// 		}

// 		// Safely check whether the user is a HOST
// 		const isHost =
// 			Array.isArray(user?.roles) &&
// 			user.roles.includes("HOST");

// 		// User is not logged in or isn't a host
// 		if (!user || !isHost) {
// 			dispatch({
// 				type: "SET_MY_CARS",
// 				payload: [],
// 			});

// 			dispatch({
// 				type: "SET_MY_CARS_LOADING",
// 				payload: false,
// 			});

// 			return;
// 		}

// 		dispatch({
// 			type: "SET_MY_CARS_LOADING",
// 			payload: true,
// 		});

// 		try {
// 			const res = await api.get("/my-cars");

// 			const data = res.data?.cars ?? res.data ?? [];

// 			dispatch({
// 				type: "SET_MY_CARS",
// 				payload: data,
// 			});

// 			// Clear previous error after successful request
// 			dispatch({
// 				type: "SET_ERROR",
// 				payload: null,
// 			});
// 		} catch (err) {
// 			console.error("fetchMyCars error:", err);

// 			dispatch({
// 				type: "SET_ERROR",
// 				payload:
// 					err.response?.data?.error ||
// 					err.response?.data?.message ||
// 					"Error fetching host cars",
// 			});
// 		} finally {
// 			dispatch({
// 				type: "SET_MY_CARS_LOADING",
// 				payload: false,
// 			});
// 		}
// 	}, [authLoading, user]);

// 	// --------------------------------------------------
// 	// Create car
// 	// --------------------------------------------------
// 	const createCar = useCallback(async (carData) => {
// 		try {
// 			const res = await api.post("/cars", carData);

// 			const newCar = res.data?.car ?? res.data;

// 			// Add to host's cars
// 			dispatch({
// 				type: "ADD_MY_CAR",
// 				payload: newCar,
// 			});

// 			// Also add/update public cars list if your reducer supports it
// 			dispatch({
// 				type: "ADD_CAR",
// 				payload: newCar,
// 			});

// 			return res;
// 		} catch (err) {
// 			console.error("createCar error:", err);

// 			dispatch({
// 				type: "SET_ERROR",
// 				payload:
// 					err.response?.data?.error ||
// 					err.response?.data?.message ||
// 					"Error creating car",
// 			});

// 			throw err;
// 		}
// 	}, []);

// 	// --------------------------------------------------
// 	// Update car
// 	// --------------------------------------------------
// 	const updateCar = useCallback(async (id, carData) => {
// 		try {
// 			const res = await api.patch(`/cars/${id}`, carData);

// 			const updatedCar = res.data?.car ?? res.data;

// 			dispatch({
// 				type: "UPDATE_MY_CAR",
// 				payload: updatedCar,
// 			});

// 			// Also update public cars list
// 			dispatch({
// 				type: "UPDATE_CAR",
// 				payload: updatedCar,
// 			});

// 			return res;
// 		} catch (err) {
// 			console.error("updateCar error:", err);

// 			dispatch({
// 				type: "SET_ERROR",
// 				payload:
// 					err.response?.data?.error ||
// 					err.response?.data?.message ||
// 					"Error updating car",
// 			});

// 			throw err;
// 		}
// 	}, []);

// 	// --------------------------------------------------
// 	// Delete car
// 	// --------------------------------------------------
// 	const deleteCar = useCallback(async (id) => {
// 		try {
// 			const res = await api.delete(`/cars/${id}`);

// 			dispatch({
// 				type: "REMOVE_MY_CAR",
// 				payload: id,
// 			});

// 			// Also remove from public cars list
// 			dispatch({
// 				type: "REMOVE_CAR",
// 				payload: id,
// 			});

// 			return res;
// 		} catch (err) {
// 			console.error("deleteCar error:", err);

// 			dispatch({
// 				type: "SET_ERROR",
// 				payload:
// 					err.response?.data?.error ||
// 					err.response?.data?.message ||
// 					"Error deleting car",
// 			});

// 			throw err;
// 		}
// 	}, []);

// 	// --------------------------------------------------
// 	// Fetch public cars when AppProvider mounts
// 	// --------------------------------------------------
// 	useEffect(() => {
// 		fetchCars();
// 	}, [fetchCars]);

// 	// --------------------------------------------------
// 	// Fetch host cars after authentication finishes
// 	// --------------------------------------------------
// 	useEffect(() => {
// 		if (!authLoading) {
// 			fetchMyCars();
// 		}
// 	}, [authLoading, fetchMyCars]);

// 	// --------------------------------------------------
// 	// Context value
// 	// --------------------------------------------------
// 	const contextValue = {
// 		...state,
// 		fetchCars,
// 		fetchMyCars,
// 		createCar,
// 		updateCar,
// 		deleteCar,
// 	};

// 	return (
// 		<AppContext.Provider value={contextValue}>
// 			{children}
// 		</AppContext.Provider>
// 	);
// }

// import { createContext, useReducer, useEffect, useContext } from "react";
// import api from "../api/axios.js";
// import reducer from "../reducers/app-reducer.js";
// import { AuthContext } from "./Auth.jsx";

// export const AppContext = createContext();

// const initialState = {
// 	cars: [],
// 	myCars: [],
// 	bookings: [],
// 	carsLoading: false,
// 	myCarsLoading: false,
// 	error: null,
// };

// export function AppProvider({ children }) {
// 	const [state, dispatch] = useReducer(reducer, initialState);

// 	const { user, loading: authLoading } = useContext(AuthContext);

// 	// Fetch public cars
// 	const fetchCars = async () => {
// 		dispatch({ type: "SET_CARS_LOADING", payload: true });

// 		try {
// 			const res = await api.get("/cars");
// 			const data = res.data.cars || res.data;
// 			dispatch({ type: "SET_CARS", payload: data });
// 		} catch (err) {
// 			console.error("fetchCars error:", err);
// 			dispatch({ type: "SET_ERROR", payload: err.response?.data?.error || "Error fetching cars" });
// 		}
// 	};

// 	// Fetch host's cars - only when user is a host and auth finished
// 	const fetchMyCars = async () => {
// 		if (authLoading) return;

// 		// if not a host, clear myCars
// 		if (!user || !user.roles || !user.roles.includes("HOST")) {
// 			dispatch({ type: "SET_MY_CARS", payload: [] });
// 			return;
// 		}

// 		dispatch({ type: "SET_MY_CARS_LOADING", payload: true });

// 		try {
// 			const res = await api.get("/my-cars");
// 			const data = res.data.cars || res.data;
// 			dispatch({ type: "SET_MY_CARS", payload: data });
// 		} catch (err) {
// 			console.error("fetchMyCars error:", err);
// 			dispatch({ type: "SET_ERROR", payload: err.response?.data?.error || "Error fetching host cars" });
// 		}
// 	};

// 	const createCar = async (carData) => {
// 		try {
// 			const res = await api.post("/cars", carData);
// 			const newCar = res.data.car || res.data;
// 			// add to myCars if host
// 			dispatch({ type: "ADD_MY_CAR", payload: newCar });
// 			return res;
// 		} catch (err) {
// 			throw err;
// 		}
// 	};

// 	const updateCar = async (id, carData) => {
// 		try {
// 			const res = await api.patch(`/cars/${id}`, carData);
// 			const updated = res.data.car || res.data;
// 			dispatch({ type: "UPDATE_MY_CAR", payload: updated });
// 			return res;
// 		} catch (err) {
// 			throw err;
// 		}
// 	};

// 	const deleteCar = async (id) => {
// 		try {
// 			const res = await api.delete(`/cars/${id}`);
// 			dispatch({ type: "REMOVE_MY_CAR", payload: id });
// 			return res;
// 		} catch (err) {
// 			throw err;
// 		}
// 	};

// 	useEffect(() => {
// 		fetchCars();
// 	}, []);

// 	useEffect(() => {
// 		// when auth finished, try fetching host cars
// 		if (!authLoading) {
// 			fetchMyCars();
// 		}
// 		// eslint-disable-next-line react-hooks/exhaustive-deps
// 	}, [authLoading, user]);

// 	return (
// 		<AppContext.Provider
// 			value={{
// 				...state,
// 				fetchCars,
// 				fetchMyCars,
// 				createCar,
// 				updateCar,
// 				deleteCar,
// 			}}
// 		>
// 			{children}
// 		</AppContext.Provider>
// 	);
// }
