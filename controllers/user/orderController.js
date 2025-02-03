const Order = require("../../models/orderSchema.js");
const Product = require("../../models/productSchema.js")
const Review = require('../../models/reviewSchema.js')

const getUserOrders = async (req, res) => {
    try {
        const userId = req.session.user.id;


        const orders = await Order.find({ userId }).populate('items.productId');

        if (orders.length === 0) {
            req.flash("error", "You don't have any orders yet.");
            return res.redirect("/profile");
        }

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

        res.render("userOrders", {
            title: "Your Orders",
            orders,
        });
    } catch (error) {
        console.error("Error loading user orders:", error.message);
        req.flash("error", "Unable to fetch orders.");
        res.redirect("/profile");
    }
};
const getItemDetails = async (req, res) => {
    try {
        const { orderId, itemId } = req.query;


        const order = await Order.findOne({ orderId }).populate("items.productId");
        // if (!order) {
        //     req.flash("error", "Order not found.");
        //     return res.redirect("/profile/orders");
        // }


        const item = order.items.find(i => i._id.toString() === itemId.toString());
        if (!item) {
            req.flash("error", "Item not found in the order.");
            return res.redirect("/profile/orders");
        }


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
            req.flash("error", "Invalid order or item details.");
            return res.redirect("/profile/orders");
        }

        const order = await Order.findById(orderId);
        const item = order.items.find((i) => i._id.toString() === itemId);
        if (!item) {
            req.flash("error", "Item not found in the order.");
            return res.redirect("/profile/orders");
        }


        if (item.orderStatus !== "Delivered") {
            req.flash("error", "Return request can only be made for delivered items.");
            return res.redirect(`/profile/orders/orderDetails?orderId=${orderId}&itemId=${itemId}`);
        }


        item.orderStatus = "Return Requested";
        item.returnReason = reason;


        await order.save();


        req.flash("success", "Return request submitted successfully.");
        return res.redirect(`/profile/orders/orderDetails?orderId=${orderId}&itemId=${itemId}`);
    } catch (error) {
        console.error("Error while processing return request:", error.message);
        req.flash("error", "An error occurred while processing your return request.");
        res.redirect("/profile/orders");
    }
};
const requestCancel = async (req, res) => {
    try {
        const { orderId, itemId } = req.query;
        const { reason } = req.body;

 
        if (!orderId || !itemId) {
            req.flash("error", "Invalid order or item details.");
            return res.redirect("/profile/orders");
        }

 
        const order = await Order.findById(orderId);
        if (!order) {
            req.flash("error", "Order not found.");
            return res.redirect("/profile/orders");
        }

        const item = order.items.find((i) => i._id.toString() === itemId);
        if (!item) {
            req.flash("error", "Item not found in the order.");
            return res.redirect("/profile/orders");
        }

      
        if (item.orderStatus !== "Pending" && item.orderStatus !== "Shipped") {
            req.flash("error", "Cancellation is only allowed for items in 'Pending' or 'Shipped' status.");
            return res.redirect(`/profile/orders/orderDetails?orderId=${orderId}&itemId=${itemId}`);
        }
        item.orderStatus = "Cancellation Requested";
        item.cancelReason = reason;
        await order.save();
        req.flash("success", "Cancellation request submitted successfully.");
        return res.redirect(`/profile/orders/orderDetails?orderId=${orderId}&itemId=${itemId}`);
    } catch (error) {
        console.error("Error while processing cancellation request:", error.message);
        req.flash("error", "An error occurred while processing your cancellation request.");
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
            return res.status(400).send("order not found")
        }
        const item = order.items.id(itemId);
        if(!item){
            return res.status(400).send("item not found")
        }
        
        // Verify eligibility
        if (item.orderStatus !== "Delivered" || item.review) {
          return res.status(400).send("Review not allowed");
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
            return res.status(400).send("product not found");
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
    
        
        req.flash("review is provided for this item")
        res.redirect(`/profile/orders/orderDetails?orderId=${orderId}&itemId=${itemId}`);
      } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
      }
}

module.exports = {
    getUserOrders,
    getItemDetails,
    requestReturn,
    requestCancel,
    createReview
}