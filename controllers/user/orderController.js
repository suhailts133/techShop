const Order = require("../../models/orderSchema.js");
const Product = require("../../models/productSchema.js")
const Review = require('../../models/reviewSchema.js')

// constants
const ERROR_MESSAGES = require("../../constants/userErrorMessages.js")
const SUCCESS_MESSAGES = require("../../constants/userSuccessMessages.js")
const HTTP_STATUS = require("../../constants/httpStatusCode.js")

const getUserOrders = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const page = parseInt(req.query.page)  || 1
        const limit = 4
        const skip = (page - 1) * limit
        const totalOrders = await Order.countDocuments({userId})
        const orders = await Order.find({ userId })
            .populate('items.productId')
            .sort({createdAt:-1})
            .skip(skip)
            .limit(limit)

        
        orders.forEach(order => {
            order.items.forEach(item => {
                const product = item.productId;
                if (product && product.variants) {

                    const variant = product.variants.find(
                        v => v._id.toString() === item.variantId.toString()
                    );
                    item.variantDetails = variant || null;
                }
            });
        });
        const totalPages = Math.ceil(totalOrders / limit);
        res.render("userOrders", {
            title: "Your Orders",
            orders,
            currentPage: page,
            totalPages
        });
    } catch (error) {
        console.error("Error loading user orders:", error.message);
        req.flash("error", ERROR_MESSAGES.ORDERS_FETCH);
        res.redirect("/profile");
    }
};
const getItemDetails = async (req, res) => {
    try {
        const { orderId, itemId } = req.query;


        const order = await Order.findOne({ orderId }).populate("items.productId");
        const item = order.items.id(itemId);
    
        if (!item) {-
            req.flash("error", ERROR_MESSAGES.ORDER_ITEM);
            return res.redirect("/profile/orders");
        }
        item.paymentOption = order.paymentMethod; 
        item.couponUsed = order.couponUsed;

 
        const product = item.productId;
        const variant = product.variants.find(v => v._id.toString() === item.variantId.toString());


        item.variantDetails = variant || {};


        res.render("itemDetails", {
            title: `Item Details - ${item.productId.productName}`,
            item,
            order
        });
    } catch (error) {
        console.error("Error loading item details:", error.message);
        res.redirect("/profile/orders");
    }
};
const requestReturn = async (req, res) => {
    try {
        const { orderId, itemId } = req.query;
        const { reason } = req.body;

        if (!orderId || !itemId) {
            req.flash("error", ERROR_MESSAGES.ORDER_DETAILS);
            return res.redirect("/profile/orders");
        }

        const order = await Order.findById(orderId);
        const item = order.items.find((i) => i._id.toString() === itemId);
        if (!item) {
            req.flash("error", ERROR_MESSAGES.ORDER_ITEM);
            return res.redirect("/profile/orders");
        }


        if (item.orderStatus !== "Delivered") {
            req.flash("error", ERROR_MESSAGES.RETURN_STATUS);
            return res.redirect(`/profile/orders/orderDetails?orderId=${orderId}&itemId=${itemId}`);
        }


        item.orderStatus = "Return Requested";
        item.returnReason = reason;


        await order.save();


        req.flash("success", SUCCESS_MESSAGES.RETURN_SUBMITTED);
        return res.redirect(`/profile/orders/orderDetails?orderId=${orderId}&itemId=${itemId}`);
    } catch (error) {
        console.error("Error while processing return request:", error.message);
        req.flash("error", ERROR_MESSAGES.RETURN_ERROR);
        res.redirect("/profile/orders");
    }
};
const requestCancel = async (req, res) => {
    try {
        const { orderId, itemId } = req.query;
        const { reason } = req.body;

 
        if (!orderId || !itemId) {
            req.flash("error", ERROR_MESSAGES.ORDER_DETAILS);
            return res.redirect("/profile/orders");
        }

 
        const order = await Order.findById(orderId);
        if (!order) {
            req.flash("error", ERROR_MESSAGES.ORDER_NOT_FOUND);
            return res.redirect("/profile/orders");
        }

        const item = order.items.find((i) => i._id.toString() === itemId);
        if (!item) {
            req.flash("error", ERROR_MESSAGES.ORDER_ITEM);
            return res.redirect("/profile/orders");
        }

      
        if (item.orderStatus !== "Pending" && item.orderStatus !== "Shipped") {
            req.flash("error", ERROR_MESSAGES.CANCEL_STATUS);
            return res.redirect(`/profile/orders/orderDetails?orderId=${orderId}&itemId=${itemId}`);
        }
        item.orderStatus = "Cancellation Requested";
        item.cancelReason = reason;
        await order.save();
        req.flash("success", SUCCESS_MESSAGES.CANCEL_SUBMITTED);
        return res.redirect(`/profile/orders/orderDetails?orderId=${orderId}&itemId=${itemId}`);
    } catch (error) {
        console.error("Error while processing cancellation request:", error.message);
        req.flash("error", ERROR_MESSAGES.CANCEL_ERROR);
        res.redirect("/profile/orders");
    }
};


const createReview = async (req, res) => {
    try {
        const { orderId, itemId } = req.query;
        const { rating, review } = req.body;
    
        // Find the order and item
        const order = await Order.findById(orderId);
        if(!order){
            return res.status(HTTP_STATUS.BAD_REQUEST).send(ERROR_MESSAGES.ORDER_NOT_FOUND)
        }
        const item = order.items.id(itemId);
        if(!item){
            return res.status(BAD_REQUEST).send(ERROR_MESSAGES.ITEM_NOT_FOUND)
        }
        
        // Verify eligibility
        if (item.orderStatus !== "Delivered" || item.review) {
          return res.status(BAD_REQUEST).send(ERROR_MESSAGES.REVIEW);
        }
    
        // Create review
        const newReview = new Review({
          product: item.productId,
          user: order.userId,
          order: orderId,
          orderItem: itemId,
          rating,
          review
        });
        await newReview.save();
        
        const  product = await Product.findById(item.productId);
        if(!product){
            return res.status(HTTP_STATUS.BAD_REQUEST).send(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
        }
        product.reviews.push(newReview._id);
        const previousTotal = product.averageRating * product.reviewCount;
        product.reviewCount += 1;
        product.averageRating = parseFloat(
            ((previousTotal + newReview.rating) / product.reviewCount).toFixed(1)
        );
        await product.save();
        // Mark item as reviewed
        item.review = true;
        await order.save();
    
        
        req.flash("review isERROR_MESSAGES. provided for this item")
        res.redirect(`/profile/orders/orderDetails?orderId=${orderId}&itemId=${itemId}`);
      } catch (err) {
        console.error(err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(ERROR_MESSAGES.SERVER_ERROR);
      }
}

module.exports = {
    getUserOrders,
    getItemDetails,
    requestReturn,
    requestCancel,
    createReview
}