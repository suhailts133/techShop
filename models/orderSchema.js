const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const { Schema } = mongoose

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        default: () => uuidv4(), // Unique order ID
        unique: true
    },
    couponRefrence: {
        type: Schema.Types.ObjectId,
        ref: "Coupon"
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            variantId: {
                type: Schema.Types.ObjectId,
            },
            quantity: {
                type: Number,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            orderStatus: {  // Order status for each item
                type: String,
                enum: [
                    "Pending",
                    "Shipped",
                    "Delivered",
                    "Return Requested",
                    "Return Accepted",
                    "Returned"
                ],
                default: "Pending"
            },
            returnReason: {  // Added returnReason for each item
                type: String,
                required: function () { return this.orderStatus === 'Return Requested'; } // Only required if orderStatus is "Return Requested"
            }
        },
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    shippingAddress: {
        type: Schema.Types.ObjectId,
        ref: "Address",
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ["COD", "Card", "UPI"],
        required: true
    },
    paymentId: { // Added paymentId field
        type: String,
        required: function () { return this.paymentMethod !== 'COD'; } // Required for non-COD payments
    },
    orderStatus: {  // Overall order status
        type: String,
        enum: [
            "Pending",
            "Shipped",
            "Delivered",
            "Return Requested",
            "Return Accepted",
            "Returned"
        ],
        default: "Pending"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model("Order", orderSchema);
