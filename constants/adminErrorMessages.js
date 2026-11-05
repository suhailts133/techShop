
const ERROR_MESSAGES = Object.freeze({
    // Authentication & Authorization
    LOGOUT_ERROR: "Error logging out",
    NOT_ADMIN: "You are not an admin",

    // General Errors
    INTERNAL_SERVER_ERROR: "Internal server error",
    UNEXPECTED_ERROR: "An unexpected error occurred. Please try again.",

    // Category Errors
    CATEGORY_EDIT_ERROR: "An error occurred while editing the category",
    CATEGORY_NOT_FOUND: "Category not found",
    CATEGORY_ALREADY_EXISTS: "Category already exists",
    CATEGORY_NAME_DESC_REQUIRED: "Category name or description cannot be empty",
    CATEGORY_NAME_DESC_MIN_LENGTH:
        "Category name and description must be at least 3 characters long",
    CATEGORY_OFFER_INVALID:
        "Category offer must be zero or a positive number",
    CATEGORY_CREATED_SUCCESS: "New category added successfully",

    // Brand Errors
    BRAND_LOGO_REQUIRED: "Brand logo is required",
    BRAND_ALREADY_EXISTS: "Brand already exists",
    BRAND_NAME_ALREADY_EXISTS: "Brand name already exists",
    BRAND_NOT_FOUND: "Brand not found",
    BRAND_EDIT_ERROR: "An error occurred while editing the brand",

    // Coupon Errors
    COUPON_STATUS_TOGGLE_ERROR: "Error toggling coupon status",
    COUPON_NOT_FOUND: "Coupon not found",
    COUPON_NAME_REQUIRED: "Coupon name is required",
    COUPON_DISCOUNT_REQUIRED: "Discount value is required",
    COUPON_MIN_PURCHASE_REQUIRED: "Minimum purchase is required",
    COUPON_VALIDITY_REQUIRED: "Validity duration is required",
    COUPON_STATUS_REQUIRED: "Status is required",
    COUPON_DISCOUNT_INVALID: "Discount should be a positive number",
    COUPON_VALIDITY_DAYS_INSUFFICIENT:
        "Validity days are insufficient",

    // Product Errors
    PRODUCT_NOT_FOUND: "Product not found",
    PRODUCT_ALREADY_EXISTS: "Product already exists",
    PRODUCT_IMAGE_REQUIRED: "At least one image is required",
    PRODUCT_CATEGORY_NOT_FOUND: "Category not found",
    PRODUCT_SALE_PRICE_INVALID:
        "Sale price cannot be higher than the original price",

    // Order Errors
    ORDER_NOT_FOUND: "Order not found",
    ORDER_ITEM_NOT_FOUND: "Item not found in the order",
    ITEM_NOT_FOUND: "Item not found",

    // Ledger Errors
    LEDGER_LOAD_ERROR: "Error loading ledger book",
});

module.exports = {
    ERROR_MESSAGES
}