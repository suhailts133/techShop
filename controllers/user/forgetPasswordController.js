const User = require("../../models/userSchema.js");
const { generateOtp, securePassword, sendVerificationEmail } = require("../../helpers/userAuthendication.js") // authentication helper
// constants
const ERROR_MESSAGES = require("../../constants/userErrorMessages.js")
const SUCCESS_MESSAGES = require("../../constants/userSuccessMessages.js")
const HTTP_STATUS = require("../../constants/httpStatusCode.js")

const loadForgetPasswordPage = async (req, res) => {
    try {
        res.render("forgetPassword", {
            title: "forget password",
            user: req.session.user || null
        })
    } catch (error) {
        console.log("error while loading forget password page", error.message)
    }
}


const forgetPasswordOtpSend = async (req, res) => {
    try {
        if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            req.flash("error", VALIDATION_MESSAGES.ADMIN.EMAIL);
            return res.redirect("/signup");
        }

        const findUser = await User.findOne({ email });
        if (!findUser) {
            req.flash("error", ERROR_MESSAGES.SIGNUP);
            return res.redirect("/signup");
        }
        if (!findUser.password) {
            req.flash("error", ERROR_MESSAGES.GOOGLE_ACCOUNT);
            return res.redirect("/login");
        }
        const otp = generateOtp(); // generate the otp

        const emailSent = await sendVerificationEmail(email, otp); // send otp to the mail 
        console.log("Email sent status:", emailSent);

        if (!emailSent) {  // if error occur while sending email
            return res.json("email-error");
        }
        // set otp in the session after sending the otp use this for otp verification
        req.session.userOtp = otp;
        console.log("otp form session", req.session.userOtp)
        // set userdata in the session so that it can be use adding to db after otp verification
        req.session.userData = { email, id: findUser._id };

        res.redirect("/forgetPassowordOtp");  // redirect to otp page
        console.log("otp sent", otp)

    } catch (error) {
        console.log("error while senting otp for forget password", error.message)
    }
}

const loadForgetPasswordOtp = async (req, res) => {
    try {
        res.render("forgetPasswordOtp")
    } catch (error) {
        console.log("error while loading otp", error.message);
        res.redirect("/pageNotFound");
    }
}

const verifyForgetPasswordOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        console.log("otp form body verify", otp);
        console.log("otp form session verify", req.session.userOtp)
        // check the otp form the otp page with the otp in the session
        if (otp === req.session.userOtp) {
            req.session.userOtp = null;
            res.json({ success: true, redirectUrl: "/changePassword" });  // if all good use the redirecting url to use for ajax
        } else {
            res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: ERROR_MESSAGES.INVALID_OTP });
        }
    } catch (error) {
        console.error("Error while verifying OTP", error.message);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

const changePasswordpage = async (req, res) => {
    try {
        res.render("changepassword", { title: "change password" })
    } catch (error) {
        console.log("error while loading change passworg page")
    }
}

const changePassword = async (req, res) => {
    try {
        const { password, confirmPassword } = req.body;
        const { email, id } = req.session.userData;
        if (password !== confirmPassword) {
            req.flash("error", ERROR_MESSAGES.PASSWORD_NOT_MATCH);
            return res.redirect("/login");
        }
        if (!email) {
            req.flash("error", ERROR_MESSAGES.EMAIL_NOT_FOUND)
            return res.redirect("/signup")
        }
        const passwordHash = await securePassword(password);
        const findUser = await User.findByIdAndUpdate(id, { password: passwordHash });
        req.flash("success", SUCCESS_MESSAGES.PASSWORD_CHANGED)
        res.redirect("/login");
    } catch (error) {
        console.log("error while changeing password");
    }
}

module.exports = {
    loadForgetPasswordPage,
    forgetPasswordOtpSend,
    loadForgetPasswordOtp,
    verifyForgetPasswordOtp,
    changePasswordpage,
    changePassword
}