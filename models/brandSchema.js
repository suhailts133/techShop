const mongoose = require("mongoose");
const { Schema } = mongoose

const brandSchema = new Schema({
    brandName: {
        type: String,
        required: true
    },
    purchaseCount: {
        type: Number,
        default: 0
    },
    logo: {
        type: String,
        required: true
    },
    isListed: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});


const Brand = mongoose.model("Brand", brandSchema);
module.exports = Brand