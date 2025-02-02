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
        ref: "Coupon",
        default:null
    },
    couponUsed: {
        type: Boolean,
        default:false
    },
    discount:{
        type:Number,
        default:0
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
            review:{
                type:Boolean,
                default:false
            },
            orderStatus: {  // Order status for each item
                type: String,
                enum: [
                    "Pending",
                    "Shipped",
                    "Delivered",
                    "Cancellation Requested",
                    "Cancelled",
                    "Return Requested",
                    "Return Accepted",
                    "Returned"
                ],
                default: "Pending"
            },
            returnReason: {  
                type: String,
                required: function () { return this.orderStatus === 'Return Requested'; } 
            },
            cancelReason: {  
                type: String,
                required: function () { return this.orderStatus === 'Cancellation Requested'; } 
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
        enum: ["COD", "Card", "UPI" , "Razorpay", "Wallet"],
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
            "Cancellation Request",
            "Cancelled",
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
