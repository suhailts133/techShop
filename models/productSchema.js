const mongoose = require("mongoose");
const { Schema } = mongoose;

// Variant schema to represent individual colors/sizes and their quantities
const variantSchema = new Schema({
    color: {
        type: String,
        required: true
    },
    size: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: true
    },
    salePrice: {
        type: Number,
        required: true,
        validate: {
            validator: function(value) {
                return value <= this.price;
            },
            message: 'Sale price cannot be greater than regular price'
        }
    }
});

const productSchema = new Schema({
    productName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    variants: [variantSchema],  
    productImage: {
        type: [String],  
        required: true
    },
    productOffer: {
        type: Number,
        default: 0
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ["Available", "Out of Stock", "Discontinued"],
        required: true,
        default: "Available"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
