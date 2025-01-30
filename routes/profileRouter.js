const express  = require("express");
const router = express.Router();

const  profileController = require("../controllers/user/profileController.js")
const orderController = require("../controllers/user/orderController.js")
const wishlistController = require("../controllers/user/wishlistController.js")
const couponController = require("../controllers/user/userCouponController.js")
const { checkAuth } = require("../middlewares/auth.js")

router.get("/", checkAuth,  profileController.loadProfilePage);
// edit profile page for username and phone
router.get("/edit",  checkAuth, profileController.loadEditProfilePage);
router.post("/edit", checkAuth, profileController.editProfilePage),
// change password
router.get("/loadChangePasswordCheck",  checkAuth,profileController.loadChangePasswordCheck); // checker
router.post("/loadChangePasswordCheck",  checkAuth,profileController.changePasswordCheck); // checker post
// real change password
router.get("/changePassword",  checkAuth,profileController.loadChangePasswordForm);
router.post("/changePassword", checkAuth, profileController.changePassword);
// address
router.get("/address", checkAuth, profileController.loadAddressPage);
router.get("/address/add", checkAuth, profileController.loadAddressAddPage); // add address
router.post("/address/add", checkAuth,profileController.addAddress);
router.get("/address/delete",checkAuth, profileController.deleteAddress); // delete address
router.get("/address/edit", checkAuth,profileController.loadAddressEditPage)
router.post("/address/edit",checkAuth, profileController.editAddress);
// cart
router.get("/cart",checkAuth, profileController.cartPage)  
router.get("/cart/delete",checkAuth, profileController.deleteCartItem)
router.post("/cart/update",checkAuth, profileController.updateCartItem)
// wishlist
router.get("/wishlist", wishlistController.wishlistPage)
router.get("/wishlist/delete", wishlistController.deleteWishlistItem)


// orders
router.get("/orders",checkAuth, orderController.getUserOrders)
router.get("/orders/orderDetails",checkAuth, orderController.getItemDetails)
router.post("/orders/returnItem",checkAuth, orderController.requestReturn)
// coupons 
router.get("/coupons", checkAuth, couponController.allCoupons)

module.exports = router