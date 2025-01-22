const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer")
const env = require("dotenv").config();

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log("error while hashing password ", error.message)
    }
}

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendVerificationEmail(email, otp) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASSWORD
            }
        })
        const info = await transporter.sendMail({
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: "Verify Your Account",
            text: `Dear User,
        Your One-Time Password (OTP) for verifying your account is ${otp}.
        Please enter this OTP on the verification page to complete the process. For security reasons, do not share this code with anyone. 
        If you did not request this email, please ignore it or contact our support team immediately.
        Thank you for choosing our services!
        Best regards,
        Tech shop Support Team`,
            html: `
                <p>Dear User,</p>
                <p>Your One-Time Password (OTP) for verifying your account is:</p>
                <h2>${otp}</h2>
                <p>Please enter this OTP on the verification page to complete the process. <strong>Do not share this code with anyone</strong>.</p>
                <p>If you did not request this email, please ignore it or <a href="mailto:support@example.com">contact our support team</a> immediately.</p>
                <br>
                <p>Thank you for choosing our services!</p>
                <p>Best regards,</p>
                <p><strong>Tech shop Support Team</strong></p>
            `
        });
        return info.accepted.length > 0;
    } catch (error) {
        console.error("error sending email", error);
        return false
    }
}


module.exports = {
    sendVerificationEmail,
    securePassword,
    generateOtp
}