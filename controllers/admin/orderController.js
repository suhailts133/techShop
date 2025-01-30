const Order = require("../../models/orderSchema.js")
const User = require("../../models/userSchema.js");
const Product = require("../../models/productSchema.js")


const orderManagment = async (req, res) => {
  try {
    // Get the current page from query params, default to 1 if not provided
    const page = parseInt(req.query.page) || 1;
    const pageSize = 10; // Number of orders per page

    // Calculate the total number of orders
    const totalOrders = await Order.countDocuments();

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalOrders / pageSize);

    // Fetch orders for the current page with pagination
    const orders = await Order.find()
      .populate("userId")
      .populate("items.productId")
      .populate("shippingAddress")
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize) // Skip orders based on current page
      .limit(pageSize); // Limit the number of orders per page

    // Get the search query if any
    const search = req.query.search || '';

    res.render("orderManagment", {
      title: "Manage Orders",
      orders,
      page,
      totalPages,
      search
    });
  } catch (error) {
    console.log("Error while loading order management:", error.message);
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


const itemDetails = async (req, res) => {
  try {
    const { orderId, itemId } = req.query;


    const order = await Order.findById(orderId).populate("items.productId").populate("shippingAddress");

    if (!order) {
      req.flash("error", "Order not found");
      return res.redirect("/admin/orders");
    }


    const item = order.items.find((i) => i._id.toString() === itemId.toString());

    if (!item) {
      req.flash("error", "Item not found in the order");
      return res.redirect(`/admin/orders/view?id=${orderId}`);
    }


    res.render("adminItemDetails", { title: "Item Details", order, item });
  } catch (error) {
    console.error("Error while loading item details:", error.message);
    res.redirect("/admin/orders");
  }
};


const updateStatus = async (req, res) => {
  try {
    const { id } = req.query;
    const { status } = req.body
    const availableStatus = ["Pending", "Shipped", "Delivered", "Return Accepted", "Returned"]
    if (!availableStatus.includes(status)) {
      req.flash("error", "Invalid order status.");
      return res.redirect(`/admin/orders/view?id=${id}`);
    }
    const order = await Order.findByIdAndUpdate(id, { orderStatus: status }, { new: true });
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

const updateItemStatus = async (req, res) => {
  try {
    const { orderId, itemId } = req.query;
    const { status } = req.body;


    const order = await Order.findById(orderId)
      .populate("userId")
      .populate("couponRefrence")

    if (!order) {
      req.flash("error", "Order not found");
      return res.redirect("/admin/orders");
    }

    const item = order.items.find((i) => i._id.toString() === itemId);
    if (!item) {
      req.flash("error", "Item not found");
      return res.redirect(`/admin/orders/view?id=${orderId}`);
    }

    item.orderStatus = status;
    await order.save();
    if (status === "Returned" && order.couponRefrence) {
      const user = await User.findById(order.userId);
      const couponCountBefore = user.coupons.length;
      user.coupons = user.coupons.filter(coupon =>
        !coupon.orderRefrence || coupon.orderRefrence.toString() !== order._id.toString()
      );
      if (user.coupons.length < couponCountBefore) {
        await user.save();
        order.couponRefrence = undefined;
        await order.save()
      }


    }

    req.flash("success", "Item status updated successfully");
    res.redirect(`/admin/orders/itemDetails?orderId=${orderId}&itemId=${itemId}`);
  } catch (error) {
    console.error("Error while updating item status:", error.message);
    res.redirect("/admin/orders");
  }
};



module.exports = {
  orderManagment,
  orderDetails,
  updateStatus,
  itemDetails,
  updateItemStatus
}