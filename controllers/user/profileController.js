const User = require("../../models/userSchema.js");
const Product = require("../../models/productSchema.js")
const Cart = require("../../models/cartSchema.js")
const Address = require("../../models/addressSchema.js");
const bcrypt = require("bcrypt");
const { securePassword } = require("../../helpers/userAuthendication.js"); // authentication helper
const Wallet = require("../../models/walletSchema.js");

// constants
const ERROR_MESSAGES = require("../../constants/userErrorMessages.js")
const SUCCESS_MESSAGES = require("../../constants/userSuccessMessages.js")
const HTTP_STATUS = require("../../constants/httpStatusCode.js")


const loadProfilePage = async (req, res) => {
    try {
        if(!req.session.user){
            req.flash("error", ERROR_MESSAGES.LOGIN)
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
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ // 400 Bad Request
                success: false,
                message: ERROR_MESSAGES.GOOGLE_PASSWORD
            });
        }

        const passwordMatch = await bcrypt.compare(password, findUser.password);
        if (!passwordMatch) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({ // 401 Unauthorized
                success: false,
                message: ERROR_MESSAGES.INCORRECT_PASSWORD
            });
        }

        res.json({ 
            success: true, 
            redirectTo: "/profile/changePassword",
            message: "Redirecting to password change page..." 
        });
    } catch (error) {
        console.error("Error in changePasswordCheck:", error.message);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
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
            req.flash("error", ERROR_MESSAGES.PASSWORD_NOT_MATCH);
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
            req.flash("error", ERROR_MESSAGES.ADDRESS_LIMIT);
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
            req.flash("error", ERROR_MESSAGES.USER_NOT_FOUND);
            return res.redirect("/profile/address")
        }
        const address = await Address.findById(addressId);
        if (!address) {
            req.flash("error", ERROR_MESSAGES.ADDRESS_NOT_FOUND);
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
            req.flash("error", ERROR_MESSAGES.USER_NOT_FOUND);
            return res.redirect("/profile/address")
        }

        const updateAddress = await Address.findByIdAndUpdate(addressId, req.body.address, { new: true });
        if (!updateAddress) {
            req.flash("error", ERROR_MESSAGES.UPDATE_FAILED);
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
            req.flash("error", ERROR_MESSAGES.CART_LOGIN);
            return res.redirect("/login")
        }
        const { id } = req.session.user;
        const findUser = await User.findById(id);
        if (!findUser) {
            req.flash("error", ERROR_MESSAGES.SIGNUP);
            return res.redirect("/signup")
        }
        const findCart = await Cart.findOne({ userId: id }).populate({
            path: 'items.productId',
        });
        // console.log(findCart)
        if (!findCart) {
            req.flash("error", ERROR_MESSAGES.CART_EMPTY);
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
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(ERROR_MESSAGES.CART_REMOVE);
    }
}

const updateCartItem = async (req, res) => {
    try {
        const { itemId } = req.query; // Get item ID from query
        const { id } = req.session.user; // Get user ID from session
        const { quantity } = req.body; // Extract quantity from the body

        if (!quantity || quantity < 1) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
                success: false, 
                message: ERROR_MESSAGES.QUANTITY,
            });
        }

        const cart = await Cart.findOne({ userId: id });
        if (!cart) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ 
                success: false, 
                message: ERROR_MESSAGES.CART_NOT_FOUND
            });
        }


        const cartItem = cart.items.find(item => item._id.toString() === itemId);
        if (!cartItem) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ 
                success: false, 
                message: ERROR_MESSAGES.ITEM_NOT_FOUND
            });
        }

        const product = await Product.findById(cartItem.productId);
        if (!product) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ 
                success: false, 
                message: ERROR_MESSAGES.PRODUCT_NOT_FOUND
            });
        }

        const variant = product.variants.id(cartItem.variantId);
        if (!variant) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ 
                success: false, 
                message: ERROR_MESSAGES.VARIANT_NOT_FOUND
            });
        }

        if (parseInt(quantity) > variant.quantity) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
                success: false, 
                itemPrice: cartItem.totalPrice, 
                totalAmount: cart.totalAmount,
                message: ERROR_MESSAGES.LIMITED_STOCK
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
            message: SUCCESS_MESSAGES.CART_QUANTITY
        });

    } catch (error) {
        console.log("Error while updating the cart:", error.message);
        req.flash("error", ERROR_MESSAGES.CART_UPDATE);
        res.redirect("/profile/cart");
    }
};

const displayWallet = async (req, res) => {
    try {
        if (!req.session.user) {
            req.flash("error", ERROR_MESSAGES.LOGIN);
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
        req.flash("error", ERROR_MESSAGES.WALLET_ERROR);
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