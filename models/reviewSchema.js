const mongoose = require("mongoose");
const { Schema } = mongoose;

const reviewSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  order: {
    type: Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },
  orderItem: {
    type: Schema.Types.ObjectId,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    required: true,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Review", reviewSchema);