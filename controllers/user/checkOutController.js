/*
1. check out page loading
2. checkout "MAIN"
order creation
wallet creation 
updation of the item
sending main with invoice
coupon validaion
3. coupon valdaion before checout 
*/


// schemas
const User = require("../../models/userSchema.js")
const Cart = require("../../models/cartSchema.js")
const Order = require("../../models/orderSchema.js")
const Brand = require("../../models/brandSchema.js")
const Product = require("../../models/productSchema.js")
const Coupon = require("../../models/couponsSchema.js")
const Wallet = require("../../models/walletSchema.js");
const Transaction = require("../../models/transactionSchema.js")
const Category = require("../../models/categorySchema.js")

const {getRandomCoupon} = require("../../helpers/couponsHelper.js")
const {sendInvoiceEmail} = require("../../helpers/invoice.js")
const { v4: uuidv4 } = require("uuid");



// load the checkout page
/*
 load the checkout page with address if have any
 and cart 
 payment method desided in the front end
*/
const loadCheckOutPage = async (req, res) => {
    try {
        const { id } = req.session.user; // id of  the current user form the session

        const findUser = await User.findById(id).populate("address"); // find the user and populate with address
        
        const cart = await Cart.findOne({ userId: id }).populate("items.productId"); // find the cart of the user and populate the items
     
        if (!cart || cart.items.length === 0) { // check if the cart exists of if the cart is empty
            // then redirect them to the cart page with an error
            req.flash("error", "Your cart is empty");
            return res.redirect("/profile/cart");
        }
       // cart quantity for the navbar
        let cartQuantity = 0;
            const cartItems = await Cart.findOne({userId:req.session.user.id}).lean()
            cartQuantity = cartItems?.items?.length || 0

        res.render("checkout", {
            cart,
            user: findUser,
            title: "Check Out",
            cartQuantity
        });
    } catch (error) {
        console.log("Error while loading checkout page", error.message);
        req.flash("error", "Something went wrong. Please try again later.");
        res.redirect("/profile/cart");
    }
};


// check out logic  "MAIN"

const checkOut = async (req, res) => {
    try {
        const { id } = req.session.user; // user id from the session
        const { shippingAddress, paymentMethod, couponCode,razorpay_payment_id } = req.body; 
     
        if (!shippingAddress || !paymentMethod) {
            req.flash("error", "All fields are required");
            return res.redirect("/checkout");
        }

        if (paymentMethod === 'Razorpay' && !razorpay_payment_id) { // if the payment is razorpay and there is not razorpayid
            // show error that payment is not verified
            req.flash("error", "Payment not verified");
            return res.redirect("/checkout");
          }
// additional validtion on address if the address is not found
        const user = await User.findById(id).populate("address");
        if (!user?.address?.length) {
            req.flash("error", "No addresses found");
            return res.redirect("/profile/address");
        }
// check if user mentioned address is listed
        const address = user.address.find(a => a._id.toString() === shippingAddress);
        if (!address) {
            req.flash("error", "Invalid shipping address");
            return res.redirect("/checkout");
        }
// find the cart
        const cart = await Cart.findOne({ userId: id }).populate("items.productId");
        if (!cart?.items?.length) {
            req.flash("error", "Cart is empty");
            return res.redirect("/profile/cart");
        }
        // if(paymentMethod === "COD" && cart.totalAmount >= 50000){
        //     req.flash("error", "COD is only available for orders under ₹50000");
        //     return res.redirect("/checkout")
        // }
        // variables needed for the order
        let totalAmount = cart.totalAmount;  // cart total amound
        let usedCoupon = null; //
        let allowedDiscount = 0  // total discount
        /*
        length of the cart is used for the splitting the coupon amount order the order item
        */
        const lengthOfCart = cart.items.length;
      // check if the coupon is provided by the user
        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode }); // find the coupons user entered form the coupon collection
            if (!coupon) { // if coupon is invalid
                req.flash("error", "Invalid coupon code");
                return res.redirect("/checkout");
            }
            const userCoupon = user.coupons.find(c =>  
                c.couponId.equals(coupon._id) &&   // check if the user has the coupon by comparing the couponid in the user.coupons and the coupon user entered
                !c.isUsed &&   // check if the coupon is already used
                new Date() < c.expiresAt // check if the coupon is expired
            );
// if the coupon is invalid or expired
            if (!userCoupon) {
                req.flash("error", "Coupon not available or expired");
                return res.redirect("/checkout");
            }
            /*allowedDiscount is used to give discount to the item in the cart according to the length of the cart 
             accroding to length split the discount value 
            example lengthOfCart = 2 discount = 1000 then 500 per item
            */
            allowedDiscount = coupon.discountValue / lengthOfCart
            totalAmount = cart.totalAmount - coupon.discountValue; // reduct the coupon amount form the cart total amount

            user.coupons.pull(userCoupon._id); // pull only one coupon with the id only one because user can have multiple coupon with same id
            usedCoupon = coupon;
        }
        if(paymentMethod === "Wallet"){ // if the payment is wallet
            if(user.wallet < totalAmount){ // check if wallet have sufficent balance for the transation
                req.flash("error", "Insufficent amount in wallet");
                return res.redirect("/checkout");
            }
            user.wallet -= totalAmount // reduce the amount
        }
        await user.save();
        const items = cart.items.map(item => { // map the items in the cart for the order.items
            const variant = item.productId.variants.id(item.variantId);
            
            if (!variant) {
                throw new Error("Variant not found");
            }
            
            return {
                productId: item.productId._id,
                variantId: item.variantId,
                product: item.productId.productName,
                itemDiscount:allowedDiscount  || 0,
                ogRegularPrice: variant.price,
                ogSalePrice: variant.salePrice,
                quantity: item.quantity,
                noDiscountPrice:item.price,
                price: item.totalPrice - allowedDiscount,
                orderStatus: "Pending"
            };
        });
        // create a new order and add the mapped items to the items 
        const order = new Order({
            orderId: uuidv4(),
            userId: id,
            items: items, 
            totalAmount: totalAmount, 
            shippingAddress: address._id,
            paymentMethod,
            paymentId: paymentMethod === 'Wallet' ? 'wallet' : razorpay_payment_id || null, 
            couponRefrence: usedCoupon?._id  || null,
            couponUsed: usedCoupon ? true : false,
            discount: usedCoupon?.discountValue || 0
        });
        

        await order.save();

        
        if(paymentMethod === "Wallet") {  // for wallet transation
            const newWallet = new Wallet({
                userId:user._id,
                amount:totalAmount,
                action:"Debited",
                purpose:"Purchase",
                orderId:order._id
            })

            await newWallet.save()
            user.WalletHistory.push(newWallet._id);
            await user.save()
        }
        user.orderHistory.push(order._id);
        await user.save();

        // assign new coupon only if no coupon was used
        if (!usedCoupon) {
            const randomCoupon = await getRandomCoupon();  // return a random coupon from the function
            if (randomCoupon) {
                user.coupons.push({ // push the new coupon to the users.coupons
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
        // transcation for the ledger book
        if(paymentMethod === "Wallet" || paymentMethod === "Razorpay"){
            const onlineTransaction = new Transaction({
                orderId:order._id,
                userId:user._id,
                amount:order.totalAmount,
                paymentMethod,
                paymentStatus:"Purchase",
                action:"Credited"
            })
            await onlineTransaction.save()
        }
         // transcation for the ledger book
        if(paymentMethod === "COD"){
            const codTransaction = new Transaction({
                orderId:order._id,
                userId:user._id,
                amount:order.totalAmount,
                paymentMethod,
                paymentStatus:"Purchase",
                action:"Pending"
            })
            await codTransaction.save()
        }

        // update product stock
        for (const item of cart.items) {
            const product = await Product.findById(item.productId);
            const variant = product.variants.find(v => v._id.equals(item.variantId));
            if (variant) {
                variant.quantity -= item.quantity; // update the stock according to how many item quantity
            }
            /* update the purchase count for checking for best selling items
            same logic for the category brand and the product
            brand and category id can be found in the product
            so first check if the product and the particular variant exist
            update the purchasecount according to the quantity of the item

            */
            product.purchaseCount = (product.purchaseCount || 0) + item.quantity;
            await product.save()
            const category = await Category.findById(product.category);
            if(category){
                category.purchaseCount = (category.purchaseCount || 0) + item.quantity;
                await category.save();
            }
            const brand = await Brand.findOne({brandName: product.brand})
            if(brand){
                brand.purchaseCount = (brand.purchaseCount || 0) + item.quantity;
                await brand.save()
            }
        }

        // clear the current user card
        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();
        req.session.orderId = order._id; // for displaying the order id in the order confirmed page

        // Send confirmation email
        const orderPopulated = await Order.findById(order._id).populate("items.productId");
        const orderDetails = {
            orderId: orderPopulated.orderId,
            items: orderPopulated.items.map(item => ({
                productName: item.productId.productName,
                quantity: item.quantity,
                unitPrice:item.noDiscountPrice,
                price: item.price,
            })),
            totalAmount: orderPopulated.totalAmount,
            shippingAddress: address, 
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
        let cartQuantity = 0;
        if(req.session.user){
         
        const cartItems = await Cart.findOne({userId:req.session.user.id}).lean()
        cartQuantity = cartItems?.items?.length || 0
        }
        res.render("orderConfirmed", {title:"Order Placed", order, cartQuantity})
    } catch (error) {
        console.log("error while loading order confirmed page");

    }
}

// coupon validation
// while entering the coupon code
const validateCoupon = async (req, res) => {
    const { couponCode, cartTotal } = req.body;
  
    try {
      const coupon = await Coupon.findOne({ code: couponCode, status: 'active' }); // find the coupon and check if it is active
  
      if (!coupon) { // if coupon not found send a error message
        return res.status(400).json({ success: false, message: 'Invalid or inactive coupon' });
      }
  
      if (cartTotal < coupon.minPurchase) { // if the coupon min amount not reached send err msg
        return res.status(400).json({ 
          success: false, 
          message: `Minimum purchase of ₹${coupon.minPurchase} required` 
        });
      }
  
      const now = new Date();
      if (now > coupon.expiresAt) { // check if the coupon has expired by checking the current date
        return res.status(400).json({ success: false, message: 'Coupon has expired' });
      }
   // if all good display coupon is applied
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
