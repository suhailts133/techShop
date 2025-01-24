const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        default: () => uuidv4(), // Unique order ID
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [
        {
          
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            variantId: {
                type: mongoose.Schema.Types.ObjectId,
            },
            quantity: {
                type: Number,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
        },
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    shippingAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ["COD", "Card", "UPI"],
        required: true
    },
    orderStatus: {
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
    returnReason:{
        type:String,
        required:true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model("Order", orderSchema);
