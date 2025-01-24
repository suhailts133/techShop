const User = require("../../models/userSchema.js")
const Address = require("../../models/addressSchema.js")
const Cart = require("../../models/cartSchema.js")
const Order = require("../../models/orderSchema.js")
const Product = require("../../models/productSchema.js")

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
        const { shippingAddress, paymentMethod } = req.body;

        if (!shippingAddress || !paymentMethod) {
            req.flash("error", "All fields are required");
            return res.redirect("/checkout");
        }
        console.log("Session user:", req.session.user);
     
        const user = await User.findById(id); 
        if (!user || !user.address || user.address.length === 0) {
            req.flash("error", "No addresses found for the user");
            return res.redirect("/profile/address"); 
        }

        const address = user.address.find(address => address._id.toString() === shippingAddress);
        const addressdetail = await Address.findById(address);
        console.log("shipping address", address)
        if (!address) {
            req.flash("error", "Invalid shipping address");
            return res.redirect("/checkout");
        }

        // Fetch the cart for the user
        const cart = await Cart.findOne({userId: id}).populate("items.productId");
        console.log("cart form checkout while placing order", cart);
        if (!cart || cart.items.length === 0) {
            req.flash("error", "Your cart is empty");
            return res.redirect("/profile/cart");
        }

        // Create the order
        const order = new Order({
            orderId: uuidv4(),
            userId: id,
            items: cart.items.map(item => ({
                productId: item.productId._id,
                variantId: item.variantId,
                quantity: item.quantity,
                price: item.totalPrice,
            })),
            totalAmount: cart.totalAmount,
            shippingAddress: address._id, 
            paymentMethod,
        });
        await order.save(); 

        if (user) {
            user.orderHistory.push(order._id); 
            await user.save(); 
        }

    
        for (const item of cart.items) {
            const product = await Product.findById(item.productId);
            const variant = product.variants.find(v => v._id.toString() === item.variantId.toString());
            if (variant) {
                variant.quantity -= item.quantity; 
                await product.save(); 
            }
        }

        
        cart.items = []; 
        cart.totalAmount = 0; 
        await cart.save();

        req.session.orderId = order._id;
        const orderPopulated = await Order.findById(order._id).populate("items.productId");
        const orderDetails = {
            orderId: orderPopulated.orderId,
            items: orderPopulated.items.map(item => ({
                productName: item.productId.productName,
                quantity: item.quantity,
                price: item.price,
            })),
            totalAmount: orderPopulated.totalAmount,
            shippingAddress: addressdetail,
            paymentMethod: orderPopulated.paymentMethod
        };
        console.log("order details", orderDetails);
        console.log("order shipping address", orderDetails.shippingAddress);

        const emailSuccess = await sendInvoiceEmail(req.session.user.email, orderDetails);
        if (emailSuccess) {
            req.flash("success", "Order placed successfully and invoice sent to your email!");
            return res.redirect("/orders"); 
        } else {
            req.flash("success", "Order placed successfully, but we failed to send the invoice email.");
            return res.redirect("/orders");
        }

    } catch (error) {
        console.log("Error during checkout:", error.message); 
        req.flash("error", "Something went wrong during checkout");
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




module.exports = {
    loadCheckOutPage,
    checkOut,
    orderConfirmed
};
