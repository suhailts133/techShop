const mongoose = require("mongoose");
const { Schema } = mongoose
const { v4: uuidv4 } = require("uuid");

const transactionSchema = new Schema({
    transactionId:{
        type:String,
        default: () => uuidv4(),
        unique:true,
        trim:true,
    },
    orderId: {
        type:Schema.Types.ObjectId,
        ref:"Order"
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    amount:{
        type:Number,
        default:0,
    },
    paymentMethod:{
        type:String,
        enum:["Wallet", "COD", "Razorpay"],
        required:true
    },
    paymentStatus:{
        type:String,
        enum:['Purchase', "Refund", "Cancelled"],
        required:true
    },
    action:{
        type:"String",
        enum:["Credited", "Debited" , "Pending"]
    },
    createdAt:{
        type:Date,
        default:Date.now
    }

})

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction