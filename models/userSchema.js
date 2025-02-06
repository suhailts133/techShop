const mongoose = require("mongoose");
const { Schema } = mongoose
const { v4: uuidv4 } = require("uuid");

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: false,
        sparse:true,
        default:null
    },
    googleId: {
        type: String,
        sparse: true
    },
    password:{
        type: String,
        required: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default:false
    },
    address:[{
        type:Schema.Types.ObjectId,
        ref: "Address",
    }],
    cart:[{
        type: Schema.Types.ObjectId,
        ref:"Cart",
    }],
    coupons:[
        {
            couponId:{
                type:Schema.Types.ObjectId,
                ref:"Coupon",
                required:true
            },
            assignedAt : {
                type:Date,
                default:Date.now
            },
            expiresAt:{
                type:Date
            },
            isUsed:{
                type:Boolean,
                default:false
            },
            orderRefrence: {
                type: Schema.Types.ObjectId,
                ref: "Order",
              }
        }
    ],
    wallet:{
        type:Number,
        default: 0,
    },
    wishlist:[{
        type: Schema.Types.ObjectId,
        ref:"Wishlist",
    }],
    orderHistory: [{
        type: Schema.Types.ObjectId,
        ref:"Order",
    }],
    createdOn:  {
        type: Date,
        default:Date.now
    },
    Referalcode: {
          type: String,
          default: () => uuidv4().split('-')[0].toUpperCase(), 
          unique: true,
          trim: true,
        },
    
    redeemedUsers: [{
        type: Schema.Types.ObjectId,
        ref:"User",
    }],
    WalletHistory:[{
        type:Schema.Types.ObjectId,
        ref:"Wallet"
    }]
})

const User = mongoose.model("User", userSchema);
module.exports = User;