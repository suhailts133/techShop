const env = require("dotenv").config();
const bcrypt = require("bcrypt")
const Category = require("../../models/categorySchema.js");
const Product = require("../../models/productSchema.js")
const Wallet = require("../../models/walletSchema.js")
const Wishlist = require("../../models/wishlishSchema.js")
const Cart = require("../../models/cartSchema.js")
const fuzzy = require("fuzzy");
// external files and functions
const User = require("../../models/userSchema.js") // user model
const { generateOtp, securePassword, sendVerificationEmail } = require("../../helpers/userAuthendication.js") // authentication helper
const Coupon = require("../../models/couponsSchema.js")


const loadHomePage = async (req, res) => {
    try {
        const categories = await Category.find({ isListed: true });

        let newArivals = await Product.find({
            isBlocked: false,
            category: { $in: categories.map(category => category._id) },
            variants: { $elemMatch: { quantity: { $gt: 0 } } }
        }).populate("category").sort({ createdAt: -1 }).limit(4);

        let bestSelling = await Product.find({
            isBlocked: false,
            category: { $in: categories.map(category => category._id) },
            variants: { $elemMatch: { quantity: { $gt: 0 } } }
        }).populate("category").sort({ purchaseCount: -1 }).limit(4);

        let wishlistItems = [];
        let cartQuantity = 0;
        if (req.session.user) {
            const userWishlist = await Wishlist.findOne({ userId: req.session.user.id }).lean();
            wishlistItems = userWishlist ? userWishlist.items.map(item => ({
                productId: item.productId.toString(),
                variantId: item.variantId.toString()
            })) : [];
            const cartItems = await Cart.findOne({ userId: req.session.user.id }).lean()
            cartQuantity = cartItems?.items?.length || 0
        }
        return res.render("home", {
            user: req.session.user || null,
            title: "Home",
            products: newArivals,
            bestSelling,
            wishlistItems,
            cartQuantity

        });
    } catch (error) {
        console.error("Error while loading the home page:", error.message);
        res.redirect("/pageNotFound");
    }
};

const searchRecomendation = async (req, res) => {
    try {
        const { text } = req.body;

        const products = await Product.find();
        let options = {
            extract: function (el) { return el.productName }
        };
        let results = fuzzy.filter(text, products, options);
        let matches = results.map(function (el) { return el.string });
        console.log(matches)
        const allDetails = await Product.find({ productName: { $in: matches } }, { productName: 1, _id: 1 })
        res.json(allDetails)
    } catch (error) {
        console.log("error on search recomdation", error.message)
    }
}

// loading registration page
const loadSignup = async (req, res) => {
    try {
        return res.render('signup', { title: "Sign up" })
    } catch (error) {
        console.log("Sign up page loading error", error.message);
        res.status(500).send("Server error")
        res.redirect("/pageNotFound");
    }
}

// verifying user deatil while registering
const signup = async (req, res) => {
    try {
        const { name, phone, email, password, confirmPassword, Referalcode } = req.body;

        if (password !== confirmPassword) { // checking password and confirm password is same
            req.flash("error", "password does not match")
            return res.redirect("/signup");
        }

        const findUser = await User.findOne({ email });  //  find the user with a email
        console.log("Find user result:", findUser);

        if (findUser) { // if user already exists redirect to signup page
            console.log("User already exists");
            req.flash("error", "the email already exists")
            return res.redirect("/signup");
        }

        if (Referalcode) {
            const userReferalCode = await User.findOne({ Referalcode: Referalcode });
            if (!userReferalCode) {
                req.flash("error", "unknown referal code");
                return res.redirect("/signup");
            }
        }
        const otp = generateOtp(); // generate the otp

        const emailSent = await sendVerificationEmail(email, otp); // send otp to the mail 
        console.log("Email sent status:", emailSent);

        if (!emailSent) {  // if error occur while sending email
            return res.json("email-error");
        }
        // set otp in the session after sending the otp use this for otp verification
        req.session.userOtp = otp;

       
        // set userdata in the session so that it can be use adding to db after otp verification
        req.session.userData = { name, phone, email, password, Referalcode };

        res.redirect("/otp");  // redirect to otp page
        console.log("otp sent", otp)
    } catch (error) {
        console.error("Error in signup function:", error.message);
        res.status(500).send("server error")
    }
};
// load the otp page
const loadOtp = async (req, res) => {
    try {
        console.log("otp page loaded")
        res.render("otp")
    } catch (error) {
        console.log("error while loading otp", error.message);
        res.redirect("/pageNotFound");
    }
}
// verify the otp
const verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        
        // Check the OTP from the OTP page with the OTP in the session
        if (otp === req.session.userOtp) {
            const user = req.session.userData; // User data from the session
            const passwordHash = await securePassword(user.password); // Hash the password

            // Add the new user to the database
            const newUser = new User({
                name: user.name,
                email: user.email,
                phone: user.phone,
                password: passwordHash,
                googleId: null,
            });

            await newUser.save(); // Save the user

            // Referral system
            if (user.Referalcode) {
                newUser.wallet += 200; // 200 is the referral bonus for the new user

                const newWalletReferal = new Wallet({
                    userId: newUser._id,
                    amount: 200,
                    action: "Credited",
                    purpose: "Referral",
                });

                await newWalletReferal.save();
                newUser.WalletHistory = newWalletReferal._id;
                await newUser.save();
            }

            // Find the first available coupon or create a new one
            let signupCoupon = await Coupon.findOne();
            if (!signupCoupon) {
                signupCoupon = new Coupon({
                    name: "Welcome Coupon",
                    discountValue: 2000,
                    minPurchase: 10000,
                    validityDuration: 30,
                });
                await signupCoupon.save();
            }

            // Assign the coupon to the new user
            newUser.coupons.push({
                couponId: signupCoupon._id,
                expiresAt: new Date(Date.now() + signupCoupon.validityDuration * 24 * 60 * 60 * 1000),
            });

            await newUser.save();

            // Referral bonus for the referring user
            const findUser = await User.findOne({ Referalcode: user.Referalcode });
            if (findUser) {
                findUser.redeemedUsers.push(newUser._id);
                findUser.wallet += 500; // Referral amount for the referrer

                const newWalletRefered = new Wallet({
                    userId: findUser._id,
                    amount: 500,
                    action: "Credited",
                    purpose: "Referral",
                });

                await newWalletRefered.save();
                findUser.WalletHistory = newWalletRefered._id;
                await findUser.save();
            }

            // Set user session
            req.session.user = { id: newUser._id, name: newUser.name, email: newUser.email };
            console.log("session from verify otp", req.session.user);

            // Destroy session OTP and user data
            req.session.userOtp = null;
            req.session.userData = null;

            res.json({ success: true, redirectUrl: "/" });
        } else {
            res.status(400).json({ success: false, message: "Invalid OTP, please try again" });
        }
    } catch (error) {
        console.error("Error while verifying OTP", error.message);
        res.status(500).json({ success: false, message: "An error occurred" });
    }
};

// resending the otp
const resendOtp = async (req, res) => {
    try {
        const { email } = req.session.userData; // retriving email from session
        if (!email) {
            return res.status(400).json({ success: false, message: "Email not found in session" })
        }
        const otp = generateOtp(); // generate the resend otp
        req.session.userOtp = otp; // set the new otp in the session
        const emailSent = await sendVerificationEmail(email, otp);  // send the email with the otp

        if (emailSent) {  // if email is send 
            console.log("Resend otp", otp);
            res.status(200).json({ success: true, message: "OTP Resend Successfully" }) // set success msg 
        } else {
            res.status(500).json({ success: false, message: "Failed to resend OTP. Please try again" }) // set erro msg
        }
    } catch (error) {
        console.error("Error resending  OTP", error.message);
        res.status(500).json({ success: false, message: "server error pleae try again" })
    }
}
// load login page
const loadLogin = async (req, res) => {
    try {
        res.render("login", { title: "login" })
    } catch (error) {
        console.error("error while loadin login page", error.message)
        res.redirect("/pageNotFound");
    }
}
// verify the user login credientails 
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const findUser = await User.findOne({ email });  // find the user from the db
        if (!findUser) {  // check if the email exists in the db
            req.flash("error", "incorrect credential if you are using google login/signup use google login");
            return res.redirect("/login");
        }
        if (findUser.isBlocked) {  // check if the user is blocked by the admin
            req.flash("error", "you are blocked by the admin");
            return res.redirect("/login");
        }
        /* if the user is signed in with google there wont be any password stored in the db for the particular user
        so check wheather the particular user has a password */
        if (!findUser.password) {
            req.flash("error", "incorrect credential if you are using google login/signup use google login");
            return res.redirect("/login")
        }
        const passwordMatch = await bcrypt.compare(password, findUser.password);  // compare the password from the body and the db
        if (!passwordMatch) {
            req.flash("error", "incorrect credential if you are using google login/signup use google login")
            return res.redirect("/login");
        }
        req.session.user = { id: findUser._id, name: findUser.name, email: findUser.email };  // set the user details in the session name is used for the home page
        console.log("session from login", req.session.user)
        res.redirect("/");
    } catch (error) {
        console.log("error while loggin in the user", error.message)
        res.status(500).send("server error ")
    }

}
// logout route
const logout = (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error("Error destroying session", err.message);
                return res.status(500).send("Error logging out");
            }
            res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");

            res.redirect("/login");
        });
    } catch (error) {
        console.log("error while logging out the user", error.message)
        res.redirect("/pageNotFound")
    }
};

const pageError = async (req, res) => {
    try {
        res.render("page-404");
    } catch (error) {
        console.log("error while loading the page 404 page", error.message
        )
    }
}

module.exports = {
    loadHomePage,
    loadSignup,
    signup,
    loadOtp,
    verifyOtp,
    resendOtp,
    loadLogin,
    login,
    logout,
    pageError,
    searchRecomendation
}

