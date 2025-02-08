const User = require("../../models/userSchema.js");
const Wishlist = require("../../models/wishlishSchema.js");
const Product = require("../../models/productSchema.js");
const mongoose = require("mongoose")

const addToWishlist = async (req, res) => {
    try {
        const { productId, variantId } = req.body;
        console.log("productid", productId);
      console.log("variantid", variantId);
        // Ensure the user is logged in
        if (!req.session.user) {
          return res.status(401).json({ error: 'Please log in to update your wishlist.' });
        }
        const userId = req.session.user.id;
    
        // Retrieve (or create) the user's wishlist
        let wishlist = await Wishlist.findOne({ userId });
        if (!wishlist) {
          wishlist = new Wishlist({ userId, items: [] });
        }
    
        // Check if the variant is already in the wishlist
        const existingIndex = wishlist.items.findIndex(item =>
          item.productId.toString() === productId &&
          item.variantId.toString() === variantId
        );
    
        let added = false;
        if (existingIndex > -1) {
          // Remove the item if it exists
          wishlist.items.splice(existingIndex, 1);
        } else {
          // Retrieve product and variant details
          const product = await Product.findById(productId);
          if (!product) return res.status(404).json({ error: 'Product not found.' });
    
          const variant = product.variants.id(variantId);
          if (!variant) return res.status(404).json({ error: 'Variant not found.' });
    
          // Add the variant to the wishlist
          wishlist.items.push({
            productId,
            variantId,
            productName: product.productName,
            color: variant.color,
            size: variant.size,
          });
          added = true;
        }
    
        await wishlist.save();
        return res.json({ success: true, added });
      } catch (error) {
        console.error('Error toggling wishlist item:', error);
        return res.status(500).json({ error: 'An error occurred. Please try again.' });
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

const wishlistStatusCheck = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({ isInWishlist: false });
    }

    const userId = req.session.user.id;
    const { productId, variantId } = req.query;
    
    
    const wishlist = await Wishlist.findOne({ userId });
    console.log("whishlist for checking status",wishlist)
    if (!wishlist || !wishlist.items) {
      return res.json({ isInWishlist: false });
    }


    const isInWishlist = wishlist.items.some(
      (item) =>
        item.productId.toString() === productId &&
        item.variantId.toString() === variantId
    );
    console.log("is in wishlist",isInWishlist);
    
    res.json({ isInWishlist });
  } catch (error) {
    console.error("Error while checking wishlist item status:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
    addToWishlist,
    wishlistPage,
    deleteWishlistItem,
    wishlistStatusCheck
}