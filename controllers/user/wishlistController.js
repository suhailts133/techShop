const User = require("../../models/userSchema.js");
const Wishlist = require("../../models/wishlishSchema.js");
const Product = require("../../models/productSchema.js");
const mongoose = require("mongoose")

// constants
const ERROR_MESSAGES = require("../../constants/userErrorMessages.js")
const SUCCESS_MESSAGES = require("../../constants/userSuccessMessages.js")
const HTTP_STATUS = require("../../constants/httpStatusCode.js")

const addToWishlist = async (req, res) => {
    try {
        const { productId, variantId } = req.body;
 
       
        if (!req.session.user) {
          return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: ERROR_MESSAGES.WISHLIST_UPDATE });
        }
        const userId = req.session.user.id;
    
        // take user's wishlist of have one
        let wishlist = await Wishlist.findOne({ userId });
        if (!wishlist) {
          wishlist = new Wishlist({ userId, items: [] }); // add new wihslist to the user if user dont have one
        }
    
        // check if item exists
        const existingIndex = wishlist.items.findIndex(item =>
          item.productId.toString() === productId &&
          item.variantId.toString() === variantId
        );
    
        let added = false; // flag used for toggling wishlist icon in the front end initially not added
        if (existingIndex > -1) {
          wishlist.items.splice(existingIndex, 1);  // remove the item if the item is existing
        } else {
          // Retrieve product and variant details
          const product = await Product.findById(productId);
          if (!product) return res.status(HTTP_STATUS.NOT_FOUND).json({ error: ERROR_MESSAGES.PRODUCT_NOT_FOUND });
    
          const variant = product.variants.id(variantId);
          if (!variant) return res.status(HTTP_STATUS.NOT_FOUND).json({ error: ERROR_MESSAGES.VARIANT_NOT_FOUND });
    
          
          wishlist.items.push({  // add the new item into the wishlist
            productId,
            variantId,
            productName: product.productName,
            color: variant.color,
            size: variant.size,
          });
          added = true; // set flag as true 
        }
    
        await wishlist.save();
        return res.json({ success: true, added }); // send the flag
      } catch (error) {
        console.error('Error toggling wishlist item:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: ERROR_MESSAGES.TRY_AGAIN });
      }
}
const wishlistPage = async (req, res) => {
    try {
        if (!req.session.user) {
            req.flash("error", ERROR_MESSAGES.WISHLIST_LOGIN);
            return res.redirect("/login");
        }

        const { id } = req.session.user;
        const findUser = await User.findById(id);
        
        if (!findUser) {
            req.flash("error", ERROR_MESSAGES.SIGNUP);
            return res.redirect("/signup");
        }

        const wishlist = await Wishlist.findOne({ userId: id }).populate("items.productId");
        
        
        if (!wishlist) {
            return res.render("wishlist", { wishlist: { items: [] }, title: "Wishlist" }); 
        }

        // If wishlist is found, render the page with its items
        res.render("wishlist", { wishlist, title: "Wishlist" });  // send the whislist to the front end
    } catch (error) {
        console.log("Error while loading wishlist page", error);
        req.flash("error", ERROR_MESSAGES.TRY_AGAIN);
        res.redirect("/profile");
    }
};
 
// deleteing the wishlist item from the wishlist page
const deleteWishlistItem  = async (req, res) => {
    try {
        const { id } = req.session.user;
        const { itemId } = req.query;

        await Wishlist.findOneAndUpdate(
            { userId: id },
            { $pull: { items: { _id: itemId } } } // pull the itemid from the query
        );
        res.redirect("/profile/wishlist");
    } catch (error) {
        console.log("Error while deleting item from wishlist", error.message);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(ERROR_MESSAGES.WISHLIST_REMOVE);
    }
}

// for ensuring the status of the wihslist items product detail page
const wishlistStatusCheck = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({ isInWishlist: false }); // flag set as flase if the item not found or user not logged in
    }

    const userId = req.session.user.id;
    const { productId, variantId } = req.query;
    
    
    const wishlist = await Wishlist.findOne({ userId }); 
   
    if (!wishlist || !wishlist.items) {
      return res.json({ isInWishlist: false });
    }


    const isInWishlist = wishlist.items.some(  // check if item is alreay in the wishlist
      (item) =>
        item.productId.toString() === productId &&
        item.variantId.toString() === variantId
    );
   
    
    res.json({ isInWishlist }); // if item is in the wishlist "true"
  } catch (error) {
    console.error("Error while checking wishlist item status:", error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: ERROR_MESSAGES.SERVER_ERROR });
  }
};

module.exports = {
    addToWishlist,
    wishlistPage,
    deleteWishlistItem,
    wishlistStatusCheck
}