const Order = require("../../models/orderSchema.js")
const User = require("../../models/userSchema.js");
const Transaction = require("../../models/transactionSchema.js")
const Wallet = require("../../models/walletSchema.js");

const orderManagment = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const pageSize = 10;

    const totalOrders = await Order.countDocuments();

    const totalPages = Math.ceil(totalOrders / pageSize);


    const orders = await Order.find()
      .populate("userId")
      .populate("items.productId")
      .populate("shippingAddress")
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

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



const updateItemStatus = async (req, res) => {
  try {
    const { orderId, itemId } = req.query;
    const { status } = req.body;


    const order = await Order.findById(orderId)
      .populate("userId")
      .populate("couponRefrence");

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
    const user = await User.findById(order.userId);
    if (user) {
      if (status === "Returned") {

        user.wallet += item.price;
        const returnWallet = new Wallet({
          userId: user._id,
          amount: item.price,
          action: "Credited",
          orderItemId: item._id,
          purpose: "Refund",
          orderId: order._id
        })
        await returnWallet.save();
        user.WalletHistory.push(returnWallet._id);
        await user.save();
        const returnTransaction = new Transaction({
          orderId: order._id,
          userId: user._id,
          amount: item.price,
          paymentMethod: "Wallet",
          paymentStatus: "Refund",
          action: "Debited"
        })
        await returnTransaction.save()
      } else if (status === "Cancelled" && (order.paymentMethod === "Wallet" || order.paymentMethod === "Razorpay")) {

        user.wallet += item.price;
        const cancelWallet = new Wallet({
          userId: user._id,
          amount: item.price,
          action: "Credited",
          orderItemId: item._id,
          purpose: "Refund",
          orderId: order._id
        })
        await cancelWallet.save();
        user.WalletHistory.push(cancelWallet._id);
        await user.save();

        const cancelledTransaction = new Transaction({
          orderId: order._id,
          userId: user._id,
          amount: item.price,
          paymentMethod: "Wallet",
          paymentStatus: "Cancelled",
          action: "Debited"
        })
        await cancelledTransaction.save()
      }
      if (order.couponRefrence) {
        const couponCountBefore = user.coupons.length;
        user.coupons = user.coupons.filter(
          (coupon) =>
            !coupon.orderRefrence || coupon.orderRefrence.toString() !== order._id.toString()
        );

        if (user.coupons.length < couponCountBefore) {
          await user.save();
          order.couponRefrence = undefined;
          await order.save();
        }
      }
    }

 
const statuses = order.items.map(item => item.orderStatus);
let newOrderStatus = null;
if (statuses.every(status => status === "Delivered")) {
  newOrderStatus = "Delivered";
} else if (statuses.every(status => status === "Returned")) {
  newOrderStatus = "Returned";
} else if (statuses.every(status => status === "Cancelled")) {
  newOrderStatus = "Cancelled";
} else if (statuses.every(status => status === "Shipped")) {
  newOrderStatus = "Shipped";
} else {
  
  if (statuses.includes("Returned")) {
    newOrderStatus = "Partially Returned";
  } else if (statuses.includes("Delivered")) {
    newOrderStatus = "Partially Delivered";
  } else if (statuses.includes("Cancelled")) {
    newOrderStatus = "Partially Cancelled";
  } else if (statuses.includes("Shipped")) {
    newOrderStatus = "Partially Shipped";
  }
}

if (newOrderStatus) {
  order.orderStatus = newOrderStatus;
  if (newOrderStatus === "Delivered") {
    await Transaction.findOneAndUpdate(
      { orderId: orderId },
      {
        $set: {
          action: "Credited",
          updatedAt: new Date()
        }
      },
      { new: true }
    );
  }
  
  await order.save();
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
  itemDetails,
  updateItemStatus
}