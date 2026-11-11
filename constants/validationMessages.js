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
});

module.exports = {
    VALIDATION_MESSAGES
};