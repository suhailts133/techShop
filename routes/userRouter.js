// external lib
const express = require("express");
const passport = require("passport");

const router = express.Router();
// controllers
const razorpayController = require("../controllers/user/razorPayController.js")
const fuzzyController = require("../controllers/user/testiingController.js");
const userController = require("../controllers/user/userController.js");
const forgetPasswordController = require("../controllers/user/forgetPasswordController.js")
const productController = require("../controllers/user/productController.js")
const checkOutController = require("../controllers/user/checkOutController.js")
const shoppingPageController = require("../controllers/user/shoppingPageController.js")
const wishlistController = require("../controllers/user/wishlistController.js")
const { checkAuth,checkAuthUserLogin, checkAuthUserSignUp, checkAuthCart } = require("../middlewares/auth.js")

// home route
router.get("/", userController.loadHomePage);
router.post("/", userController.searchRecomendation)

// router.get("/", fuzzyController.loadpage);
// router.post("/", fuzzyController.textingFuzzy)
// router.get("/productDetails", fuzzyController.product);

// shop page
router.get("/shop", shoppingPageController.loadShoppingPage)
router.get("/filter", shoppingPageController.filterProducts)
// signup route
router.get("/signup",checkAuthUserSignUp, userController.loadSignup)
router.post("/signup", checkAuthUserSignUp,userController.signup)
// otp route
router.get("/otp",checkAuthUserSignUp,  userController.loadOtp)
router.post("/verify-otp", checkAuthUserSignUp, userController.verifyOtp)
router.post("/resend-otp",checkAuthUserSignUp, userController.resendOtp)
// google authentication
router.get("/auth/google", passport.authenticate('google', { scope: ["profile", "email"] }));
router.get("/auth/google/callback", 
  passport.authenticate('google', { failureRedirect: "/signup" }), 
  (req, res) => {
    req.session.user = { name: req.user.name, email: req.user.email,id:req.user._id };
    console.log(req.session.user);
    res.redirect("/"); 
  }
);
// login logout route
router.get("/login",checkAuthUserLogin, userController.loadLogin)
router.post("/login",checkAuthUserLogin, userController.login)
router.get("/logout", userController.logout)
// page 404 page 

// forget password;
router.get("/loadForgetPasswordPage", forgetPasswordController.loadForgetPasswordPage)
router.post("/loadForgetPasswordPage", forgetPasswordController.forgetPasswordOtpSend)
// forget password otp page load;
router.get("/forgetPassowordOtp", forgetPasswordController.loadForgetPasswordOtp);
router.post("/forgetPassowordOtp", forgetPasswordController.verifyForgetPasswordOtp);
router.get("/changePassword", forgetPasswordController.changePasswordpage);
router.post("/changePassword", forgetPasswordController.changePassword);

// product Details
router.get("/productDetails", productController.getProductDetails);
router.post("/updateVariant",  productController.updateVariantDetails)
// add to cart
router.post("/addToCart",checkAuth,   productController.addToCart);
//checkout
router.get("/checkout",checkAuth, checkOutController.loadCheckOutPage)
router.post("/checkout", checkAuth,checkOutController.checkOut)
router.post("/checkout/validate-coupon",checkAuth, checkOutController.validateCoupon)
// wishlist

// razorpay payment
router.post('/create-razorpay-order', razorpayController.createRazorpayOrder);

// Verify Razorpay payment
router.post('/verify-payment', express.json(), razorpayController.verifyPayment);

router.post("/wishlistToggle", checkAuth,wishlistController.addToWishlist)
router.get("/wishlistStatus", checkAuth, wishlistController.wishlistStatusCheck)

router.get("/orders",checkAuth, checkOutController.orderConfirmed)

router.get("/pageNotFound", userController.pageError)
module.exports = router