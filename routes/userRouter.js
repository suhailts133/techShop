// external lib
const express = require("express");
const passport = require("passport");

const router = express.Router();
// controllers
const userController = require("../controllers/user/userController.js");
const forgetPasswordController = require("../controllers/user/forgetPasswordController.js")
const { checkAuth } = require("../middlewares/auth.js")

// home route
router.get("/", userController.loadHomePage);
// signup route
router.get("/signup", checkAuth, userController.loadSignup)
router.post("/signup", userController.signup)
// otp route
router.get("/otp", checkAuth, userController.loadOtp)
router.post("/verify-otp", checkAuth, userController.verifyOtp)
router.post("/resend-otp", checkAuth, userController.resendOtp)
// google authentication
router.get("/auth/google", checkAuth, passport.authenticate('google', { scope: ["profile", "email"] }));
router.get("/auth/google/callback", 
  passport.authenticate('google', { failureRedirect: "/signup" }), 
  (req, res) => {
    req.session.user = { name: req.user.name, email: req.user.email };
    console.log(req.session.user);
    res.redirect("/"); 
  }
);
// login logout route
router.get("/login", checkAuth, userController.loadLogin)
router.post("/login", userController.login)
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


router.get("/pageNotFound", userController.pageError)
module.exports = router