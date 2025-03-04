/*
1. all the orders
displayed in a tabular form 
2. individual order detail with all the order items
3. individual item in a single order
4. updation of the items status
5. refund of the money if the item is returned and refund of the money if the item is cancelled only for wallet and razorpay
6. wallet creation
7. transaction creation
8. updation of the order status according to the item status
 */

// schemas
const Order = require("../../models/orderSchema.js")
const User = require("../../models/userSchema.js");
const Transaction = require("../../models/transactionSchema.js")
const Wallet = require("../../models/walletSchema.js");

const orderManagment = async (req, res) => {
  try {
// pagination with size of 10 doc per page
    const page = parseInt(req.query.page) || 1;
    const pageSize = 10;

    const totalOrders = await Order.countDocuments();

    const totalPages = Math.ceil(totalOrders / pageSize);

    //  find all the order 
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


// order detail controller
const orderDetails = async (req, res) => {
  try {
    const { id } = req.query; // id of the particular order
    const order = await Order.findById(id).populate("userId").populate("items.productId").populate("shippingAddress");
    if (!order) {  // if order not found
      req.flash("error", "order not found");
      res.redirect("/admin/orders")
    }
    // display the order detauk
    res.render("orderDetails", { title: "order details", order })
  } catch (error) {
    console.log("error while loading order managment", error.message)
  }
}


// item detail  individual order item
const itemDetails = async (req, res) => {
  try {
    const { orderId, itemId } = req.query; // take the item id and order id form the query

// find the order
    const order = await Order.findById(orderId).populate("items.productId").populate("shippingAddress");
// check if the order exists
    if (!order) {
      req.flash("error", "Order not found");
      return res.redirect("/admin/orders");
    }
    // const item = order.items.find((i) => i._id.toString() === itemId.toString());
    const item = order.items.id(itemId) // find te item

    if (!item) { // check if the item exists
      req.flash("error", "Item not found in the order");
      return res.redirect(`/admin/orders/view?id=${orderId}`);
    }
    // display the item details
    res.render("adminItemDetails", { title: "Item Details", order, item });
  } catch (error) {
    console.error("Error while loading item details:", error.message);
    res.redirect("/admin/orders");
  }
};


// for updateing individual items status with refund if needed
const updateItemStatus = async (req, res) => {
  try {
    const { orderId, itemId } = req.query; // orderID and itemID from the query
    const { status } = req.body;  // status for the item

// find the particular order and also populate the coupon 
// because if the order is cancelled then we have to remove the coupon too
    const order = await Order.findById(orderId)
      .populate("userId")
      .populate("couponRefrence");

    if (!order) {
      req.flash("error", "Order not found");
      return res.redirect("/admin/orders");
    }
    // const item = order.items.find((i) => i._id.toString() === itemId);
    const item = order.items.id(itemId) // find te item

    if (!item) {  // check if the item exists
      req.flash("error", "Item not found");
      return res.redirect(`/admin/orders/view?id=${orderId}`);
    } 
    item.orderStatus = status; // update the new item status
    await order.save();
    const user = await User.findById(order.userId);  // find the user of the particular order
    /*
    from down here is the code for refund returning the item
    cancelling the item and adding the money to the wallet 
    and coupon deletion for the cancelled item
     */
    if (user) {  
      if (status === "Returned") { // check if the status is returned
// if the status is returned add the price of the item to the user wallet
        user.wallet += item.price;
        // create a new wallet to track all the wallet transaction occured
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
        // create a transcation record for the ledger book
        const returnTransaction = new Transaction({
          orderId: order._id,
          userId: user._id,
          amount: item.price,
          paymentMethod: "Wallet",
          paymentStatus: "Refund",
          action: "Debited"
        })
        await returnTransaction.save()
        /* 
        only need to return the money for the item if the payment method of the purchse is wallet
        or razor pay 
        so chek if the item status is called ans also if the order payment method is wallet or razorpay
        */
      } else if (status === "Cancelled" && (order.paymentMethod === "Wallet" || order.paymentMethod === "Razorpay")) {
// then add the amount to the wallet
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
// transaction record for the ledger book
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
      // if the order has used a coupon while cancelling
      if (order.couponRefrence) {
        const couponCountBefore = user.coupons.length; // current total length of the coupon before  filtering
        user.coupons = user.coupons.filter( // filter out the coupons 
          (coupon) =>
            !coupon.orderRefrence || coupon.orderRefrence.toString() !== order._id.toString()
        );

        if (user.coupons.length < couponCountBefore) { // checking if the filtering worked by 
          await user.save();
          order.couponRefrence = undefined;
          await order.save();
        }
      }
    }

 /*
 here this is the code for updating the item status of the entire order
 map all the item status of the particular order then use every method to check 
 if all the item status is the same then update the order status to one of these
 deliverd, returned, cancelled, shipped
 */
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
  // if not all the status is not same 
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
// update the order statys
if (newOrderStatus) {
  order.orderStatus = newOrderStatus;
  if (newOrderStatus === "Delivered") {
    // for the ledger book 
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