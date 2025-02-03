const User = require("../../models/userSchema.js")
const Address = require("../../models/addressSchema.js")
const Cart = require("../../models/cartSchema.js")
const Order = require("../../models/orderSchema.js")
const Product = require("../../models/productSchema.js")
const Coupon = require("../../models/couponsSchema.js")

const {getRandomCoupon} = require("../../helpers/couponsHelper.js")
const {sendInvoiceEmail} = require("../../helpers/invoice.js")
const { v4: uuidv4 } = require("uuid");



const loadCheckOutPage = async (req, res) => {
    try {
        const { id } = req.session.user;

        const findUser = await User.findById(id).populate("address");
        
        const cart = await Cart.findOne({ userId: id }).populate("items.productId");
        console.log("cart form load checkout page",cart)
        if (!cart || cart.items.length === 0) {
            req.flash("error", "Your cart is empty");
            return res.redirect("/profile/cart");
        }

        res.render("checkout", {
            cart,
            user: findUser,
            title: "Check Out"
        });
    } catch (error) {
        console.log("Error while loading checkout page", error.message);
        req.flash("error", "Something went wrong. Please try again later.");
        res.redirect("/profile/cart");
    }
};

const checkOut = async (req, res) => {
    try {
        const { id } = req.session.user;
        const { shippingAddress, paymentMethod, couponCode,razorpay_payment_id } = req.body;
        console.log(req.body)
        // Validate required fields
        if (!shippingAddress || !paymentMethod) {
            req.flash("error", "All fields are required");
            return res.redirect("/checkout");
        }
        if (paymentMethod === 'Razorpay' && !razorpay_payment_id) {
            req.flash("error", "Payment not verified");
            return res.redirect("/checkout");
          }

        // Get user with addresses
        const user = await User.findById(id).populate("address");
        if (!user?.address?.length) {
            req.flash("error", "No addresses found");
            return res.redirect("/profile/address");
        }

        // Validate shipping address
        const address = user.address.find(a => a._id.toString() === shippingAddress);
        if (!address) {
            req.flash("error", "Invalid shipping address");
            return res.redirect("/checkout");
        }

        // Get cart and validate
        const cart = await Cart.findOne({ userId: id }).populate("items.productId");
        if (!cart?.items?.length) {
            req.flash("error", "Cart is empty");
            return res.redirect("/profile/cart");
        }

        let totalAmount = cart.totalAmount;
        let usedCoupon = null;

        // Coupon handling
        if (couponCode) {
            // 1. Find the coupon document
            const coupon = await Coupon.findOne({ code: couponCode });
            if (!coupon) {
                req.flash("error", "Invalid coupon code");
                return res.redirect("/checkout");
            }

            // 2. Find user's coupon instance
            const userCoupon = user.coupons.find(c => 
                c.couponId.equals(coupon._id) && 
                !c.isUsed && 
                new Date() < c.expiresAt
            );

            if (!userCoupon) {
                req.flash("error", "Coupon not available or expired");
                return res.redirect("/checkout");
            }

            // 3. Apply discount
            totalAmount = cart.totalAmount - coupon.discountValue;

            // 4. Remove the coupon from user's coupons
            user.coupons.pull(userCoupon._id); // Remove by subdocument ID
            usedCoupon = coupon;
        }
        if(paymentMethod === "Wallet"){
            if(user.wallet < totalAmount){
                req.flash("error", "Insufficent amount in wallet");
                return res.redirect("/checkout");
            }
            user.wallet -= totalAmount
        }
        await user.save();
        // Create order with final amount
        const order = new Order({
            orderId: uuidv4(),
            userId: id,
            items: cart.items.map(item => ({
                productId: item.productId._id,
                variantId: item.variantId,
                quantity: item.quantity,
                price: item.totalPrice,
                orderStatus: "Pending"
            })),
            totalAmount: totalAmount, 
            shippingAddress: address._id,
            paymentMethod,
            paymentId: paymentMethod === 'Wallet' ? 'wallet' : razorpay_payment_id || null,
            couponRefrence: usedCoupon?._id  || null,
            couponUsed: usedCoupon? true:false,
            discount:usedCoupon?.discountValue || 0

        });

        await order.save();

        // Add to order history
        user.orderHistory.push(order._id);
        await user.save();

        // Assign new coupon only if no coupon was used
        if (!usedCoupon) {
            const randomCoupon = await getRandomCoupon();
            if (randomCoupon) {
                user.coupons.push({
                    couponId: randomCoupon._id,
                    expiresAt: new Date(Date.now() + randomCoupon.validityDuration * 24 * 60 * 60 * 1000),
                    isUsed: false,
                    orderRefrence: order._id
                });
                order.couponRefrence = randomCoupon._id;
                await user.save();
                await order.save();
            }
        }

        // Update product stock
        for (const item of cart.items) {
            const product = await Product.findById(item.productId);
            const variant = product.variants.find(v => v._id.equals(item.variantId));
            if (variant) {
                variant.quantity -= item.quantity;
                await product.save();
            }
        }

        // Clear cart
        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();
        req.session.orderId = order._id;

        // Send confirmation email
        const orderPopulated = await Order.findById(order._id).populate("items.productId");
        const orderDetails = {
            orderId: orderPopulated.orderId,
            items: orderPopulated.items.map(item => ({
                productName: item.productId.productName,
                quantity: item.quantity,
                price: item.price,
            })),
            totalAmount: orderPopulated.totalAmount,
            shippingAddress: address, // Use the address object directly
            paymentMethod: orderPopulated.paymentMethod
        };
        
        // Send confirmation email
        const emailSuccess = await sendInvoiceEmail(user.email, orderDetails);
        if (emailSuccess) {
            req.flash("success", "Order placed successfully and invoice sent to your email!");
        } else {
            req.flash("success", "Order placed successfully, but we failed to send the invoice email.");
        }
        res.redirect("/orders");
    } catch (error) {
        console.error("Checkout error:", error);
        req.flash("error", "Failed to place order");
        res.redirect("/checkout");
    }
};

const orderConfirmed = async (req, res) => {
    try {
        const id = req.session.orderId
        console.log("orderid for confirmation",id)
        const order = await Order.findById(id).populate("userId").populate("items.productId").populate("shippingAddress");
        // console.log(order);
        res.render("orderConfirmed", {title:"Order Placed", order})
    } catch (error) {
        console.log("error while loading order confirmed page");

    }
}


const validateCoupon = async (req, res) => {
    const { couponCode, cartTotal } = req.body;
  
    try {
      const coupon = await Coupon.findOne({ code: couponCode, status: 'active' });
  
      if (!coupon) {
        return res.status(400).json({ success: false, message: 'Invalid or inactive coupon' });
      }
  
      if (cartTotal < coupon.minPurchase) {
        return res.status(400).json({ 
          success: false, 
          message: `Minimum purchase of ₹${coupon.minPurchase} required` 
        });
      }
  
      const now = new Date();
      if (now > coupon.expiresAt) {
        return res.status(400).json({ success: false, message: 'Coupon has expired' });
      }
  
      res.status(200).json({ 
        success: true, 
        discountAmount: coupon.discountValue,
        message: 'Coupon applied successfully' 
      });
    } catch (error) {
      console.error('Error validating coupon:', error.messge);
      res.status(500).json({ success: false, message: 'Error validating coupon' });
    }
  };

module.exports = {
    loadCheckOutPage,
    checkOut,
    orderConfirmed,
    validateCoupon
};
