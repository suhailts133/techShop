const User = require("../../models/userSchema.js");
const Product = require("../../models/productSchema.js")
const Cart = require("../../models/cartSchema.js")
const Address = require("../../models/addressSchema.js");
const bcrypt = require("bcrypt");
const { securePassword } = require("../../helpers/userAuthendication.js"); // authentication helper
const Wallet = require("../../models/walletSchema.js");

const loadProfilePage = async (req, res) => {
    try {
        if(!req.session.user){
            req.flash("error", "login first")
            return res.redirect("/")
        }
        const {id} = req.session.user;
        const findUser = await User.findById(id);

        res.render("profilePage", { title: "profilePage", user: findUser })
    } catch (error) {
        console.log("err while loading profile page", error.message)
    }
}

const loadEditProfilePage = async (req, res) => {
    try {
        const findUser = await User.findById(req.session.user.id);
        
        res.render("editProfile", {
             title: "edit profile",
             name: findUser.name || null,
             phone: findUser.phone || null
             })
    } catch (error) {
        console.log("error while loading edit profile page", error.message)
    }
}

const editProfilePage = async (req, res) => {
    try {
        const { name, phone } = req.body;
        const { id } = req.session.user;

        const updatedUser = await User.findByIdAndUpdate(id, { name, phone });
        req.session.user.name = name
        res.redirect("/profile/")
    } catch (error) {
        console.log("error while editing profile", error.message)
    }
}

const loadChangePasswordCheck = async (req, res) => {
    try {
        res.render("changePasswordCheck", { title: "change password checker" })
    } catch (error) {
        console.log("error while loading change password checker", error.message)
    }
}
const changePasswordCheck = async (req, res) => {
    try {
        const { password } = req.body;
        const { id } = req.session.user;
        const findUser = await User.findById(id);
        
        if (!findUser.password) {
            return res.status(400).json({ // 400 Bad Request
                success: false,
                message: "Account is linked with Google. Cannot change password here."
            });
        }

        const passwordMatch = await bcrypt.compare(password, findUser.password);
        if (!passwordMatch) {
            return res.status(401).json({ // 401 Unauthorized
                success: false,
                message: "Incorrect password. Use 'Forgot Password' if needed."
            });
        }

        res.json({ 
            success: true, 
            redirectTo: "/profile/changePassword",
            message: "Redirecting to password change page..." 
        });
    } catch (error) {
        console.error("Error in changePasswordCheck:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}
const loadChangePasswordForm = async (req, res) => {
    try {
        res.render("changePasswordForm", { title: "change password" })
    } catch (error) {
        console.log("error while loading change password form", error.message)
    }
}

const changePassword = async (req, res) => {
    try {
        const { id } = req.session.user;
        const { password, confirmPassword } = req.body;
        if (password !== confirmPassword) {
            req.flash("error", "password must match");
            return res.redirect("/profile/changePassword");
        }
        const passwordHash = await securePassword(password);  // hash the password using secure fn
        const updatePassword = await User.findByIdAndUpdate(id, { password: passwordHash });
        res.redirect("/logout")

    } catch (error) {
        console.log("Error while changeing password", error.message)
    }
}

const loadAddressPage = async (req, res) => {
    try {
        const { id } = req.session.user;
        const findUser = await User.findById(id).populate("address");
        console.log(findUser)
        res.render("address", { title: "Address", user: findUser })
    } catch (error) {
        console.log("error while loading address page", error.message)
    }
}

const loadAddressAddPage = async (req, res) => {
    try {
        const returnTo = req.query.returnTo || "/profile/address"
        res.render("add-address", { title: "Add Address", returnTo })
    } catch (error) {
        console.log("error while loading add address page", error.message)
    }
}



const addAddress = async (req, res) => {
    try {
        const { id } = req.session.user;
        const findUser = await User.findById(id);
        if (findUser.address.length >= 6) {
            req.flash("error", "You already have too many addresses");
            return res.redirect("/profile/address")
        }
        const newAddress = new Address(req.body.address);
        findUser.address.push(newAddress);
        await newAddress.save();
        await findUser.save();
        const returnTo = req.query.returnTo || "/profile/address";
        res.redirect(returnTo);
    } catch (error) {
        console.log("error while adding address", error.message)
    }
}



const deleteAddress = async (req, res) => {
    try {
        const { id } = req.session.user;
        const { addressId } = req.query;
        await User.findByIdAndUpdate(id, { $pull: { address: addressId } });
        await Address.findByIdAndDelete(addressId);
        res.redirect("/profile/address")
    } catch (error) {
        console.log("error while deleteing an address", error.message)
    }
}
const loadAddressEditPage = async (req, res) => {
    try {
        const { id } = req.session.user;
        const { addressId } = req.query;
        const findUser = await User.findById(id);
        if (!findUser) {
            req.flash("error", "user not found");
            return res.redirect("/profile/address")
        }
        const address = await Address.findById(addressId);
        if (!address) {
            req.flash("error", "address not found");
            return res.redirect("/profile/address")
        }

        res.render("editAddress", {
            title: "Edit Address",
            address: address
        })
    } catch (error) {
        console.log("error while loading the edit address page", error.message)
    }
}

const editAddress = async (req, res) => {
    try {
        const { id } = req.session.user
        const { addressId } = req.query;
        const findUser = await User.findById(id);
        if (!findUser) {
            req.flash("error", "user not found");
            return res.redirect("/profile/address")
        }

        const updateAddress = await Address.findByIdAndUpdate(addressId, req.body.address, { new: true });
        if (!updateAddress) {
            req.flash("error", "updation failed");
            return res.redirect("/profile/address");
        }

        res.redirect("/profile/address")
    } catch (error) {
        console.log("error while editing address", error.message)
    }
}


const cartPage = async (req, res) => {
    try {
        if (!req.session.user) {
            req.flash("error", "login to access cart");
            return res.redirect("/login")
        }
        const { id } = req.session.user;
        const findUser = await User.findById(id);
        if (!findUser) {
            req.flash("error", "user not found please sign up");
            return res.redirect("/signup")
        }
        const findCart = await Cart.findOne({ userId: id }).populate({
            path: 'items.productId',
        });
        // console.log(findCart)
        if (!findCart) {
            req.flash("error", "cart is empty ");
            return res.redirect("/")
        }

        res.render("cart", { title: "cart page", cart: findCart });
    } catch (error) {
        console.log("error while loading cart page", error.message)
    }
}

const deleteCartItem = async (req, res) => {
    try {
        const { id } = req.session.user;
        const { itemId } = req.query;

        await Cart.findOneAndUpdate(
            { userId: id },
            { $pull: { items: { _id: itemId } } }
        );


        const cart = await Cart.findOne({ userId: id });
        cart.totalAmount = cart.items.reduce((total, item) => total + item.totalPrice, 0);
        await cart.save();

        res.redirect("/profile/cart");
    } catch (error) {
        console.log("Error while deleting item from cart", error.message);
        res.status(500).send("Error removing item from cart");
    }
}

const updateCartItem = async (req, res) => {
    try {
        const { itemId } = req.query; // Get item ID from query
        const { id } = req.session.user; // Get user ID from session
        const { quantity } = req.body; // Extract quantity from the body

        if (!quantity || quantity < 1) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid quantity",
            });
        }

        const cart = await Cart.findOne({ userId: id });
        if (!cart) {
            return res.status(404).json({ 
                success: false, 
                message: "Cart not found" 
            });
        }


        const cartItem = cart.items.find(item => item._id.toString() === itemId);
        if (!cartItem) {
            return res.status(404).json({ 
                success: false, 
                message: "Item not found" 
            });
        }

        const product = await Product.findById(cartItem.productId);
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: "Product not found" 
            });
        }

        const variant = product.variants.id(cartItem.variantId);
        if (!variant) {
            return res.status(404).json({ 
                success: false, 
                message: "Product variant not found" 
            });
        }

        if (parseInt(quantity) > variant.quantity) {
            return res.status(400).json({ 
                success: false, 
                itemPrice: cartItem.totalPrice, 
                totalAmount: cart.totalAmount,
                message: "Limited stock available. Please reduce the quantity."
            });
        }

        cartItem.quantity = parseInt(quantity);
        cartItem.totalPrice = cartItem.quantity * variant.salePrice;
        cart.totalAmount = cart.items.reduce((total, item) => total + item.totalPrice, 0);
        await cart.save();

        res.json({ 
            success: true, 
            itemPrice:cartItem.totalPrice,
            totalAmount:cart.totalAmount,
            message: "Quantity updated successfully" 
        });

    } catch (error) {
        console.log("Error while updating the cart:", error.message);
        req.flash("error", "An error occurred while updating the cart");
        res.redirect("/profile/cart");
    }
};

const displayWallet = async (req, res) => {
    try {
        if (!req.session.user) {
            req.flash("error", "Login first");
            return res.redirect("/");
        }

        const userId = req.session.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = 5; 
        const walletAmount = await User.findById(userId);
        const totalWalletCount = await Wallet.countDocuments({ userId });
        const totalPages = Math.ceil(totalWalletCount / limit);
        const walletDetails = await Wallet.find({ userId }).populate("orderId")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

       
        res.render("wallet", {
            walletDetails,
            currentPage: page,
            totalPages,
            wallet:walletAmount.wallet,
            title: "Wallet Transactions"
        });
    } catch (error) {
        console.log("Error while displaying wallet", error.message);
        req.flash("error", "Error loading wallet details");
        res.redirect("/profile");
    }
};


module.exports = {
    loadProfilePage,
    loadEditProfilePage,
    editProfilePage,
    loadChangePasswordCheck,
    changePasswordCheck,
    loadChangePasswordForm,
    changePassword,
    loadAddressPage,
    loadAddressAddPage,
    addAddress,
    deleteAddress,
    loadAddressEditPage,
    editAddress,
    cartPage,
    deleteCartItem,
    updateCartItem,
    displayWallet
}