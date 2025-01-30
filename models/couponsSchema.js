const mongoose = require("mongoose");
const { Schema } = mongoose
const { v4: uuidv4 } = require("uuid");

const couponSchema = new Schema({
    code: {
      type: String,
      default: () => uuidv4().split('-')[0].toUpperCase(), 
      unique: true,
      trim: true,
    },
    name:{
      type:String,
      required:true
    },
    discountValue: {
      type: Number,
      required: true,
    },
    minPurchase: {
      type: Number,
      default: 0,
    },
    validityDuration: {
      type: Number, // Validity in days
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  }, { timestamps: true });
  
const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon

  