const Order = require("../../models/orderSchema.js");
const Product = require("../../models/productSchema.js")

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
        console.error("Error fetching user orders:", error.message);
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

       
        const item = order.items.find(i => i._id.toString() === itemId);
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


        console.log("Order ID:", orderId);
        console.log("Item ID:", itemId);


        if (!orderId || !itemId) {
            req.flash("error", "Invalid order or item details.");
            return res.redirect("/profile/orders");
        }


        const order = await Order.findById(orderId);
        console.log(order)
        // if (!order) {
        //     req.flash("error", "Order not found.");
        //     return res.redirect("/profile/orders");
        // }


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


module.exports = {
    getUserOrders,
    getItemDetails,
    requestReturn,
}