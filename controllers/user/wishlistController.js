const User = require("../../models/userSchema.js");
const Wishlist = require("../../models/wishlishSchema.js");
const Product = require("../../models/productSchema.js");
const mongoose = require("mongoose")

const addToWishlist = async (req, res) => {
    try {
        const { productId, variantId } = req.query;
        console.log("from add to wishlist",productId, variantId)
        if (!req.session.user) {
            req.flash("error", "login first to add items to wishlist");
            return res.redirect("/login")
        }
        const { id } = req.session.user;
        const findUser = await User.findById(id);
        if (!findUser) {
            req.flash("error", "user not found please sign up");
            return res.redirect("/signup");
        }
        const product = await Product.findById(new mongoose.Types.ObjectId(productId));
        console.log(product);
        
        if (!product) {
            req.flash("error", "product not found");
            return res.redirect("/");
        }
        const variant = product.variants.id(variantId);

        const variantColor = variant.color;
        const variantsize = variant.size;

        if (!variant) {
            req.flash("error", "variant not found");
            res.redirect("/");
        }
        let wishlist = await Wishlist.findOne({ userId: findUser._id });
        if (!wishlist) {
            wishlist = new Wishlist({
                userId: findUser._id,
                items: []
            });
            await wishlist.save();
            findUser.wishlist = wishlist._id;
            await findUser.save();
        }

        const variantExistCheck = wishlist.items.findIndex(
            item => item.productId.toString() === productId && item.variantId.toString() === variantId
        );
  
        if (variantExistCheck > -1) {
            req.flash("error", "variant already exists in the wishlist");
            return res.redirect(req.get("referer") || "/");
        } else {
            wishlist.items.push({
                productId: productId,
                variantId: variantId,
                productName: product.productName,
                color: variantColor,
                size: variantsize
            })
        }
        await wishlist.save();
        req.flash("success", "Item added to wishlist successfully");

   
        return res.redirect(req.get("referer") || "/");
    } catch (error) {
        console.log("error while adding item to wishlist", error)
    }

}
const wishlistPage = async (req, res) => {
    try {
        if (!req.session.user) {
            req.flash("error", "Login to access the wishlist");
            return res.redirect("/login");
        }

        const { id } = req.session.user;
        const findUser = await User.findById(id);
        
        if (!findUser) {
            req.flash("error", "User not found, sign up first");
            return res.redirect("/signup");
        }

        const wishlist = await Wishlist.findOne({ userId: id }).populate("items.productId");
        
        // Ensure items is always an array
        if (!wishlist) {
            return res.render("wishlist", { wishlist: { items: [] }, title: "Wishlist" });
        }

        // If wishlist is found, render the page with its items
        res.render("wishlist", { wishlist, title: "Wishlist" });
    } catch (error) {
        console.log("Error while loading wishlist page", error);
        req.flash("error", "Something went wrong");
        res.redirect("/profile");
    }
};

const deleteWishlistItem  = async (req, res) => {
    try {
        const { id } = req.session.user;
        const { itemId } = req.query;

        await Wishlist.findOneAndUpdate(
            { userId: id },
            { $pull: { items: { _id: itemId } } }
        );
        res.redirect("/profile/wishlist");
    } catch (error) {
        console.log("Error while deleting item from wishlist", error.message);
        res.status(500).send("Error removing item from wishlist");
    }
}

module.exports = {
    addToWishlist,
    wishlistPage,
    deleteWishlistItem
}