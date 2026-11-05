
export const ERROR_MESSAGES = Object.freeze({
  // General
  FIELDS_REQUIRED: "All fields are required",
  ERROR: "An error occurred",
  SERVER_ERROR: "Internal server error",
  TRY_AGAIN: "Something went wrong. Please try again later.",

  // Authentication
  LOGIN: "Please log in first",
  LOGOUT: "Error logging out",
  USER_NOT_FOUND: "User not found",
  SIGNUP: "User does not exist. Please sign up",
  EMAIL_EXISTS: "Email already exists",
  EMAIL_NOT_FOUND: "Email not found",
  GOOGLE_ACCOUNT: "This account is registered with Google",
  GOOGLE_PASSWORD: "This account is linked with Google. Cannot change password here.",
  PASSWORD_NOT_MATCH: "Password does not match",
  INCORRECT_PASSWORD: "Incorrect password. Use 'Forgot Password' if needed.",
  CREDENTIALS: "Incorrect credentials. If you are using Google login/signup, please use Google login.",
  BLOCKED: "You are blocked by the admin",
  INVALID_OTP: "Invalid OTP. Please try again",
  EMAIL_NOT_IN_SESSION: "Email not found in session",
  OTP_RESEND: "Failed to resend OTP. Please try again",
  EMAIL_ERROR: "Email error",
  INCORRECT_REFERRAL: "Unknown referral code",
  REDIRECT: "Please log in first. Redirecting you in 2 seconds",

  // Address
  ADDRESS_NOT_FOUND: "Address not found",
  NO_ADDRESSES_FOUND: "No addresses found",
  ADDRESS_LIMIT: "You already have too many addresses",
  INVALID_SHIPPING: "Invalid shipping address",
  UPDATE_FAILED: "Update failed",

  // Cart
  CART_EMPTY: "Cart is empty",
  CART_NOT_FOUND: "Cart not found",
  CART_LOGIN: "Please log in to access the cart",
  CART_REMOVE: "Error removing item from cart",
  CART_ADD: "An error occurred while adding the product to the cart. Please try again later.",
  CART_UPDATE: "An error occurred while updating the cart",
  QUANTITY: "Invalid quantity",
  LIMITED_STOCK: "Limited stock available. Please reduce the quantity.",
  OUT_OF_STOCK: "Out of stock",

  // Product & Variant
  PRODUCT_NOT_FOUND: "Product not found",
  VARIANT_NOT_FOUND: "Variant not found",
  ITEM_NOT_FOUND: "Item not found",
  
  // Coupon
  INVALID_COUPON: "Invalid coupon code",
  COUPON_INACTIVE: "Coupon is not available or has expired",
  COUPON_EXPIRED: "Coupon has expired",
  COUPON_INVALID: "Invalid or inactive coupon",
  COUPON_VALIDATE: "Error validating coupon",
  
  // Order
  ORDER_NOT_FOUND: "Order not found",
  ORDER_ITEM: "Item not found in the order",
  ORDER_FAILED: "Failed to place order",
  ORDERS_FETCH: "Unable to fetch orders",
  ORDER_DETAILS: "Invalid order or item details",
  PAYMENT_NOT_VERIFIED: "Payment not verified",

  // Return & Cancellation
  RETURN_STATUS: "Return requests can only be made for delivered items",
  RETURN_ERROR: "An error occurred while processing your return request",
  CANCEL_STATUS: "Cancellation is only allowed for items in 'Pending' or 'Shipped' status",
  CANCEL_ERROR: "An error occurred while processing your cancellation request",

  // Wallet & Payment
  INSUFFICIENT_FUND: "Insufficient funds in wallet",
  WALLET_ERROR: "Error loading wallet details",
  RAZORPAY: "Error creating Razorpay order",
  PAYMENT_DETAILS: "Missing payment details in request body",
  PAYMENT_SIGNATURE: "Invalid payment signature",
  PAYMENT_VERIFY: "Error verifying payment",

  // Wishlist
  WISHLIST_LOGIN: "Please log in to access the wishlist",
  WISHLIST_UPDATE: "Please log in to update your wishlist",
  WISHLIST_REMOVE: "Error removing item from wishlist",

  REVIEW: "Review not allowed"
});
