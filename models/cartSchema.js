const mongoose = require("mongoose");
const { Schema } = mongoose;

const cartSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    items: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            variantId: {
                type: String,
                required: true,
            },
            color: {
                type: String,
                required: true,
            },
            size: {
                type: String,
                required: true,
            },
            quantity: {
                type: Number, // Use `Number` for numeric values
                required: true,
            },
            price: {
                type: Number, // Store the price for this variant
                required: true,
            },
            totalPrice: {
                type: Number, // Pre-calculated: quantity * price
                required: true,
            },
        },
    ],
    totalAmount: {
        type: Number, // Total for all items in the cart
        required: true,
        default: 0,
    },
    updatedOn: {
        type: Date,
        default: Date.now,
    },
});

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
