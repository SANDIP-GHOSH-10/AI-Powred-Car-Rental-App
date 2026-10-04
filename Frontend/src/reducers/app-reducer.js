export default function reducer(state, action) {
    switch (action.type) {

        // ==================================================
        // PUBLIC CARS
        // ==================================================

        case "SET_CARS":
            return {
                ...state,
                cars: action.payload,
                carsLoading: false,
                error: null,
            };


        case "SET_CARS_LOADING":
            return {
                ...state,
                carsLoading: action.payload,
            };


        // ==================================================
        // HOST CARS
        // ==================================================

        case "SET_MY_CARS":
            return {
                ...state,
                myCars: action.payload,
                myCarsLoading: false,
                error: null,
            };


        case "SET_MY_CARS_LOADING":
            return {
                ...state,
                myCarsLoading: action.payload,
            };


        // ==================================================
        // ERROR
        // ==================================================

        case "SET_ERROR":
            return {
                ...state,
                error: action.payload,
            };


        // ==================================================
        // ADD HOST CAR
        // ==================================================

        case "ADD_MY_CAR":
            return {
                ...state,

                myCars: [
                    action.payload,
                    ...state.myCars,
                ],
            };


        // ==================================================
        // UPDATE HOST CAR
        // ==================================================

        case "UPDATE_MY_CAR":
            return {
                ...state,

                myCars: state.myCars.map(
                    (car) =>
                        car._id === action.payload._id
                            ? action.payload
                            : car
                ),
            };


        // ==================================================
        // REMOVE HOST CAR
        // ==================================================

        case "REMOVE_MY_CAR":
            return {
                ...state,

                myCars: state.myCars.filter(
                    (car) =>
                        car._id !== action.payload
                ),
            };


        // ==================================================
        // PUBLIC CAR - ADD
        // ==================================================

        case "ADD_CAR":
            return {
                ...state,

                cars: [
                    action.payload,
                    ...state.cars,
                ],
            };


        // ==================================================
        // PUBLIC CAR - UPDATE
        // ==================================================

        case "UPDATE_CAR":
            return {
                ...state,

                cars: state.cars.map(
                    (car) =>
                        car._id === action.payload._id
                            ? action.payload
                            : car
                ),
            };


        // ==================================================
        // PUBLIC CAR - REMOVE
        // ==================================================

        case "REMOVE_CAR":
            return {
                ...state,

                cars: state.cars.filter(
                    (car) =>
                        car._id !== action.payload
                ),
            };


        // ==================================================
        // MY BOOKINGS (CUSTOMER)
        // ==================================================

        case "SET_MY_BOOKINGS":
            return {
                ...state,
                myBookings: action.payload,
                bookingsLoading: false,
                error: null,
            };


        case "SET_BOOKINGS_LOADING":
            return {
                ...state,
                bookingsLoading: action.payload,
            };


        // ==================================================
        // HOST BOOKINGS
        // ==================================================

        case "SET_HOST_BOOKINGS":
            return {
                ...state,
                hostBookings: action.payload,
                hostBookingsLoading: false,
                error: null,
            };


        case "SET_HOST_BOOKINGS_LOADING":
            return {
                ...state,
                hostBookingsLoading: action.payload,
            };


        // ==================================================
        // ADMIN BOOKINGS
        // ==================================================

        case "SET_ADMIN_BOOKINGS":
            return {
                ...state,
                adminBookings: action.payload,
                adminBookingsLoading: false,
                error: null,
            };


        case "SET_ADMIN_BOOKINGS_LOADING":
            return {
                ...state,
                adminBookingsLoading: action.payload,
            };


        // ==================================================
        // ADD BOOKING (customer creates booking)
        // ==================================================

        case "ADD_BOOKING":
            return {
                ...state,
                myBookings: [
                    action.payload,
                    ...state.myBookings,
                ],
            };


        // ==================================================
        // UPDATE BOOKING (cancel / status change)
        // Safely updates across all three booking slices.
        // If the booking isn't in a slice, map() is a no-op.
        // ==================================================

        case "UPDATE_BOOKING":
            return {
                ...state,

                myBookings: state.myBookings.map(
                    (b) =>
                        b._id === action.payload._id
                            ? action.payload
                            : b
                ),

                hostBookings: state.hostBookings.map(
                    (b) =>
                        b._id === action.payload._id
                            ? action.payload
                            : b
                ),

                adminBookings: state.adminBookings.map(
                    (b) =>
                        b._id === action.payload._id
                            ? action.payload
                            : b
                ),
            };


        // ==================================================
        // REMOVE BOOKING
        // ==================================================

        case "REMOVE_BOOKING":
            return {
                ...state,

                myBookings: state.myBookings.filter(
                    (b) =>
                        b._id !== action.payload
                ),
            };


        // ==================================================
        // ADMIN USERS
        // ==================================================

        case "SET_ADMIN_USERS":
            return {
                ...state,
                adminUsers: action.payload,
                adminUsersLoading: false,
                error: null,
            };


        case "SET_ADMIN_USERS_LOADING":
            return {
                ...state,
                adminUsersLoading: action.payload,
            };


        // ==================================================
        // ADMIN CARS
        // ==================================================

        case "SET_ADMIN_CARS":
            return {
                ...state,
                adminCars: action.payload,
                adminCarsLoading: false,
                error: null,
            };


        case "SET_ADMIN_CARS_LOADING":
            return {
                ...state,
                adminCarsLoading: action.payload,
            };


        // ==================================================
        // UPDATE SINGLE ADMIN CAR (approve / reject)
        // ==================================================

        case "UPDATE_ADMIN_CAR":
            return {
                ...state,

                adminCars: state.adminCars.map(
                    (car) =>
                        car._id === action.payload._id
                            ? action.payload
                            : car
                ),
            };


        // ==================================================
        // AVAILABILITY CHECK
        // ==================================================

        case "SET_AVAILABILITY":
            return {
                ...state,
                availability: action.payload,
                availabilityLoading: false,
            };


        case "SET_BOOKED_DATES":
            return {
                ...state,
                bookedDates: {
                    ...state.bookedDates,
                    [action.payload.carId]: action.payload.bookedDates,
                },
                bookedDatesLoading: false,
            };


        case "SET_BOOKED_DATES_LOADING":
            return {
                ...state,
                bookedDatesLoading: action.payload ? true : false,
            };


        case "CLEAR_BOOKED_DATES_FOR_CAR":
            return {
                ...state,
                bookedDates: {
                    ...state.bookedDates,
                    [action.payload]: [],
                },
            };


        case "SET_AVAILABILITY_LOADING":
            return {
                ...state,
                availabilityLoading: action.payload,
            };


        case "CLEAR_AVAILABILITY":
            return {
                ...state,
                availability: null,
                availabilityLoading: false,
            };


        // ==================================================
        // PAYMENTS (CUSTOMER & ADMIN)
        // ==================================================

        case "SET_PAYMENTS":
            return {
                ...state,
                payments: action.payload,
                paymentsLoading: false,
                paymentError: null,
            };

        case "SET_PAYMENTS_LOADING":
            return {
                ...state,
                paymentsLoading: action.payload,
            };

        case "SET_PAYMENT_LOADING":
            return {
                ...state,
                paymentLoading: action.payload,
            };

        case "SET_PAYMENT_ERROR":
            return {
                ...state,
                paymentError: action.payload,
                paymentLoading: false,
            };

        case "ADD_PAYMENT":
            return {
                ...state,
                payments: [
                    action.payload,
                    ...(state.payments || []),
                ],
                paymentLoading: false,
                paymentError: null,
            };

        case "UPDATE_PAYMENT":
            return {
                ...state,
                payments: (state.payments || []).map((p) =>
                    p._id === action.payload._id ? action.payload : p
                ),
                adminPayments: (state.adminPayments || []).map((p) =>
                    p._id === action.payload._id ? action.payload : p
                ),
                paymentLoading: false,
            };

        case "SET_ADMIN_PAYMENTS":
            return {
                ...state,
                adminPayments: action.payload,
                adminPaymentsLoading: false,
                paymentError: null,
            };

        case "SET_ADMIN_PAYMENTS_LOADING":
            return {
                ...state,
                adminPaymentsLoading: action.payload,
            };


        // ==================================================
        // AI SEARCH
        // ==================================================

        case "SET_AI_LOADING":
            return {
                ...state,
                aiLoading: action.payload,
                // Clear previous error when starting new search
                aiError: action.payload ? null : state.aiError,
            };

        case "SET_AI_RESULTS":
            return {
                ...state,
                aiResults: action.payload.cars,
                aiAlternatives: action.payload.alternatives,
                aiAnswer: action.payload.answer,
                aiFilters: action.payload.filters,
                aiQuery: action.payload.query,
                aiMeta: action.payload.meta,
                aiLoading: false,
                aiError: null,
            };

        case "SET_AI_ERROR":
            return {
                ...state,
                aiError: action.payload,
                aiLoading: false,
            };

        case "CLEAR_AI_RESULTS":
            return {
                ...state,
                aiResults: null,
                aiAlternatives: [],
                aiAnswer: null,
                aiFilters: null,
                aiQuery: "",
                aiMeta: null,
                aiError: null,
                aiLoading: false,
            };

        // ==================================================
        // DEFAULT
        // ==================================================

        default:
            return state;
    }
}



































// export default function reducer(state, action) {
//   switch (action.type) {
//     case "SET_CARS":
//       return { ...state, cars: action.payload, carsLoading: false };

//     case "SET_MY_CARS":
//       return { ...state, myCars: action.payload, myCarsLoading: false };

//     case "SET_ERROR":
//       return { ...state, error: action.payload, carsLoading: false, myCarsLoading: false };

//     case "SET_CARS_LOADING":
//       return { ...state, carsLoading: action.payload };

//     case "SET_MY_CARS_LOADING":
//       return { ...state, myCarsLoading: action.payload };

//     case "ADD_MY_CAR":
//       return { ...state, myCars: [action.payload, ...state.myCars] };

//     case "UPDATE_MY_CAR":
//       return {
//         ...state,
//         myCars: state.myCars.map((c) => (c._id === action.payload._id ? action.payload : c)),
//       };

//     case "REMOVE_MY_CAR":
//       return { ...state, myCars: state.myCars.filter((c) => c._id !== action.payload) };

//     default:
//       return state;
//   }
// }
