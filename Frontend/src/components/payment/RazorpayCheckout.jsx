/**
 * Helper to dynamically load the official Razorpay Checkout script once.
 * Returns a promise resolving to true if loaded, false otherwise.
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // If already loaded on the page
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    // Check if script tag already exists
    const existingScript = document.getElementById("razorpay-checkout-script");
    if (existingScript) {
      existingScript.onload = () => resolve(true);
      existingScript.onerror = () => resolve(false);
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-checkout-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      resolve(false);
    };

    document.body.appendChild(script);
  });
};

/**
 * Initiates Razorpay checkout flow with full event callbacks.
 *
 * @param {Object} options
 * @param {string} options.orderId - Razorpay order ID generated on server
 * @param {number} options.amount - Amount in paise
 * @param {string} options.currency - Currency code (INR)
 * @param {string} options.keyId - Razorpay Key ID
 * @param {Object} [options.prefill] - Customer details { name, email, contact }
 * @param {string} [options.name] - Business / App title
 * @param {string} [options.description] - Description shown on checkout
 * @param {Function} options.onSuccess - Callback receiving { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 * @param {Function} options.onDismiss - Callback when customer closes modal without paying
 * @param {Function} options.onError - Callback on checkout failure
 */
export const openRazorpayCheckout = async ({
  orderId,
  amount,
  currency = "INR",
  keyId,
  prefill = {},
  name = "AI Car Rental",
  description = "Car Rental Reservation Payment",
  onSuccess,
  onDismiss,
  onError,
}) => {
  const isLoaded = await loadRazorpayScript();

  if (!isLoaded) {
    const err = new Error("Unable to load payment gateway. Please check your internet connection and try again.");
    if (onError) onError(err);
    return;
  }

  const razorpayOptions = {
    key: keyId,
    amount: amount,
    currency: currency,
    name: name,
    description: description,
    order_id: orderId,
    image: "https://cdn-icons-png.flaticon.com/512/3202/3202926.png",
    handler: function (response) {
      if (onSuccess) {
        onSuccess({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });
      }
    },
    prefill: {
      name: prefill.name || "",
      email: prefill.email || "",
      contact: prefill.contact || "",
    },
    notes: {
      platform: "AI Car Rental",
    },
    theme: {
      color: "#1E3A8A", // Premium deep brand blue
    },
    modal: {
      ondismiss: function () {
        if (onDismiss) {
          onDismiss();
        }
      },
      confirm_close: true,
    },
  };

  try {
    const paymentObject = new window.Razorpay(razorpayOptions);

    paymentObject.on("payment.failed", function (response) {
      console.error("Razorpay payment failed:", response.error);
      if (onError) {
        onError(response.error);
      }
    });

    paymentObject.open();
  } catch (err) {
    console.error("Failed to initialize Razorpay modal:", err);
    if (onError) onError(err);
  }
};

export default {
  loadRazorpayScript,
  openRazorpayCheckout,
};
