const User = require("../../models/userSchema.js");
const { generateOtp, securePassword, sendVerificationEmail } = require("../../helpers/userAuthendication.js") // authentication helper

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
        const { email } = req.body;
        const findUser = await User.findOne({ email });

        if (!findUser) {
            req.flash("error", "user does not exist please sign up");
            return res.redirect("/signup");
        }
        if(!findUser.password){
            req.flash("error", "This account is signed up with google");
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
            res.status(400).json({ success: false, message: "Invalid OTP, please try again" });
        }
    } catch (error) {
        console.error("Error while verifying OTP", error.message);
        res.status(500).json({ success: false, message: "An error occurred" });
    }
};

const changePasswordpage = async (req, res) => {
    try {
        res.render("changepassword", {title:"change password"})
    } catch (error) {
        console.log("error while loading change passworg page")
    }
}

const changePassword = async (req, res) => {
    try {
        const { password, confirmPassword } = req.body;
        const {email, id} = req.session.userData;
        if(password !== confirmPassword ){
            req.flash("error", "password does not match");
            return res.redirect("/login");
        }
        if(!email){
            req.flash("error", "email not found")
            return res.redirect("/signup")
        }
        const passwordHash = await securePassword(password);
        const findUser = await User.findByIdAndUpdate(id, {password:passwordHash});
        req.flash("success", "password changed successfully")
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