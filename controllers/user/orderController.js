const Order = require("../../models/orderSchema.js");
const Product = require("../../models/productSchema.js")

const getUserOrders = async (req, res) => {
    try {
        const userId = req.session.user.id;

        // Fetch orders and populate product details
        const orders = await Order.find({ userId }).populate('items.productId');

        // Add variant details dynamically for each item
        orders.forEach(order => {
            order.items.forEach(item => {
                const product = item.productId;
                if (product && product.variants) {
                    // Find the matching variant in the product's variants array
                    const variant = product.variants.find(
                        v => v._id.toString() === item.variantId.toString()
                    );
                    item.variantDetails = variant || null; // Attach the variant details to the item
                }
            });
        });

        res.render("userOrders", {
            title: "Your Orders",
            orders, // Pass enriched orders to the view
        });
    } catch (error) {
        console.error("Error fetching user orders:", error.message);
        req.flash("error", "Unable to fetch orders.");
        res.redirect("/profile");
    }
};


const orderDetails = async (req, res) => {
    try {
        const { orderId } = req.query; // Get the orderId from the request params
        const userId = req.session.user.id;

        // Find the order by its orderId and userId
        const order = await Order.findOne({ orderId, userId })
            .populate('items.productId')
            .populate('shippingAddress');

        if (!order) {
            req.flash("error", "Order not found.");
            return res.redirect("/orders");
        }

        // Enrich items with variant details
        order.items = order.items.map(item => {
            const product = item.productId;
            if (product && product.variants) {
                const variant = product.variants.find(
                    v => v._id.toString() === item.variantId.toString()
                );
                item.variantDetails = variant || null;
            }
            return item;
        });

        res.render("orderDetail", {
            title: `Order Details - ${order.orderId}`,
            order,
        });
    } catch (error) {
        console.error("Error fetching order details:", error.message);
        req.flash("error", "Unable to fetch order details.");
        res.redirect("/orders");
    }
};

const requestReturn = async (req, res) => {
    try {
        const {orderId} = req.query;
        const userId = req.session.user.id;
        const {reason} = req.body;
        const order = await Order.findOne({orderId, userId});
        if(!order){
            req.flash("error", "order not found");
            return res.redirect("/profile/orders")
        }
        order.orderStatus = "Return Requested";
        order.returnReason = reason;
        await order.save();
        req.flash("success", "Return request submiited successfully");
        res.redirect(`/profile/orders/orderDetails?orderId=${orderId}`)
    } catch (error) {
        console.log("error while returning",error.message)
    }
}


module.exports = {
    getUserOrders,
    orderDetails,
    requestReturn,
}