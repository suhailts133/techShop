const Order = require("../../models/orderSchema.js")
const User = require("../../models/userSchema.js");
const Product = require("../../models/productSchema.js")


const orderManagment = async (req, res) => {
    try {
        const orders = await Order.find().populate("userId").populate("items.productId").populate("shippingAddress").sort({createdAt:-1});
        res.render("orderManagment", { title: "orders", orders })
    } catch (error) {
        console.log("error while loading order managment", error.message)
    }
}


const orderDetails = async (req, res) => {
    try {
        const { id } = req.query;
        const order = await Order.findById(id).populate("userId").populate("items.productId").populate("shippingAddress");
        if (!order) {
            req.flash("error", "order not found");
            res.redirect("/admin/orders")
        }
        res.render("orderDetails", { title: "order details", order })
    } catch (error) {
        console.log("error while loading order managment", error.message)
    }
}


const updateStatus = async (req, res) => {
    try {
        const {id} = req.query;
        const {status} = req.body
        const availableStatus = ["Pending","Shipped","Delivered","Return Accepted", "Returned"]
        if (!availableStatus.includes(status)) {
            req.flash("error", "Invalid order status.");
            return res.redirect(`/admin/orders/view?id=${id}`);
        }

        const order = await Order.findByIdAndUpdate(id, { orderStatus:status }, { new: true });
    if (!order) {
      req.flash("error", "Order not found.");
      return res.redirect("/admin/orders");
    }
    req.flash("success", `Order status updated to ${status}.`);
    res.redirect(`/admin/orders/view?id=${id}`);
    } catch (error) {
        console.log("error while updateing the status", error.message)
    }
}

module.exports = {
    orderManagment,
    orderDetails,
    updateStatus
}