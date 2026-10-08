const mongoose = require("mongoose");
const { Schema } = mongoose;

const variantSchema = new Schema({
    color: { type: String, required: true },
    size: { type: String, required: true },
    quantity: { type: Number, default: 0 },
    price: { type: Number, required: true },
    salePrice: { type: Number, required: true },
});


const imageSchema = new Schema(
    {
        path: { type: String, required: true },     
        filename: { type: String, required: true }, 
    },
    { _id: false }
);

const productSchema = new Schema({
    productName: { type: String, required: true },
    purchaseCount: { type: Number, default: 0 },
    description: { type: String, required: true },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    brand: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    variants: [variantSchema],
    productImage: {
        type: [imageSchema],
        validate: {
            validator: (arr) => arr.length >= 1 && arr.length <= 3,
            message: "A product must have between 1 and 3 images",
        },
    },
    productOffer: { type: Number, default: 0 },
    isBlocked: { type: Boolean, default: false },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    status: {
        type: String,
        enum: ["Available", "Out of Stock", "Discontinued"],
        required: true,
        default: "Available",
    },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
module.exports = Product;