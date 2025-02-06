const { Transaction } = require("mongodb");
const mongoose = require("mongoose");
const { Schema } = mongoose

const walletSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount:{
        type:Number,
        required:true
    },
    action: {
        type:String,
        enum:["Credited", "Debited"],
        required:true
    },
    purpose:{
        type:String,
        enum:["Referal", "Purchase", "Refund"],
        required:true
    },
    orderId:{
        type:Schema.Types.ObjectId,
        ref:"Order",
        default:null
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

const Wallet = mongoose.model("Wallet", walletSchema);
module.exports = Wallet;
