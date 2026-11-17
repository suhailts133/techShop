const VALIDATION_MESSAGES = Object.freeze({
    ADMIN: {
        EMAIL: "Please enter a valid email",
        WORNG_PASSWORD: "Password must be at least 8 characters with uppercase, lowercase, number, and special character.",
    },
    BRAND: {
        NAME_REQUIRED: "Brand name is required",
        INVALID: "Invalid brand name",
    },
    PRODUCT: {
        NAME_REQ: "Product name is required",
        DESC_REQ: "Product description is required",
        BRAND_REQ: "Valid brand is required",
        INVALID_VARIENT: "Invalid product variants",
        INVALID_VARIENT_PRICE: "Valid variant prices are required",
        INVALID_PROD_OFFER: "Invalid product offer",
        CATEGORY_REQ: "Valid category is required",
    },
    COUPON: {
        CODE_REQUIRED: "Valid coupon code is required",
        CART_TOTAL_INVALID: "Valid cart total is required",
    },
    USER: {
        PASSWORD_REQUIRED: "Password is required",
        CONFIRM_PASSWORD_REQUIRED: "Confirm password is required",
        WEAK_PASSWORD: "Password must be at least 8 characters with uppercase, lowercase, number, and special character.",
        NAME_REQUIRED: "Name is required",
        INVALID_NAME: "Name must be 2 to 50 characters and contain only letters and spaces",
        PHONE_REQUIRED: "Phone number is required",
        INVALID_PHONE: "Please enter a valid 10 digit phone number",
        CURRENT_PASSWORD_REQUIRED: "Current password is required",
        EMAIL_REQUIRED: "Email is required",
        INVALID_EMAIL: "Please enter a valid email",
        INVALID_REFERRAL_FORMAT: "Referral code must be 8 characters (0-9, A-F)",
    },
    ORDER: {
        REASON_REQUIRED: "Reason must be at least 5 characters long",
    },
});

module.exports = {
    VALIDATION_MESSAGES
};