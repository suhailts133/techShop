const mongoose = require("mongoose");
const { Schema } = mongoose;

const wishListSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    items:[
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            variantId: {
                type: Schema.Types.ObjectId,
                required: true,
            },
            productName:{
                type:String,
                required:true,
            },
            color: {
                type: String,
                required: true,
            },
            size: {
                type: String,
                required: true,
            },
        }
    ],
    updatedOn: {
        type: Date,
        default: Date.now,
    },
})

const Wishlist = mongoose.model("Wishlist", wishListSchema);
module.exports = Wishlist;
