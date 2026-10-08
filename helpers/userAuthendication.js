const bcrypt = require("bcrypt");
require("dotenv").config();

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log("error while hashing password ", error.message);
    }
};

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendVerificationEmail(email, otp) {
    try {
        const res = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "api-key": process.env.BREVO_API_KEY,
                "Content-Type": "application/json",
                accept: "application/json",
            },
            body: JSON.stringify({
                sender: { name: "Tech Shop", email: process.env.BREVO_SENDER },
                to: [{ email }],
                subject: "Verify Your Account",
                textContent: `Dear User,
Your One-Time Password (OTP) for verifying your account is ${otp}.
Please enter this OTP on the verification page to complete the process. For security reasons, do not share this code with anyone.
If you did not request this email, please ignore it or contact our support team immediately.
Thank you for choosing our services!
Best regards,
Tech shop Support Team`,
                htmlContent: `
                    <p>Dear User,</p>
                    <p>Your One-Time Password (OTP) for verifying your account is:</p>
                    <h2>${otp}</h2>
                    <p>Please enter this OTP on the verification page to complete the process. <strong>Do not share this code with anyone</strong>.</p>
                    <p>If you did not request this email, please ignore it or <a href="mailto:support@example.com">contact our support team</a> immediately.</p>
                    <br>
                    <p>Thank you for choosing our services!</p>
                    <p>Best regards,</p>
                    <p><strong>Tech shop Support Team</strong></p>
                `,
            }),
        });

        if (!res.ok) {
            console.error("error sending email", await res.text());
            return false;
        }
        return true;
    } catch (error) {
        console.error("error sending email", error);
        return false;
    }
}

module.exports = {
    sendVerificationEmail,
    securePassword,
    generateOtp,
};