const nodemailer = require("nodemailer")

async function sendInvoiceEmail(email, orderDetails) {
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
        });

        // Extract order details
        const { items, totalAmount, shippingAddress, paymentMethod, orderId } = orderDetails;

        // Generate the items list in HTML
        const itemsHTML = items.map(item => `
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">${item.productName}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">₹${item.price.toFixed(2)}</td>
            </tr>
        `).join("");

        // Generate the HTML email content
        const emailContent = `
            <h2>Thank you for your order!</h2>
            <p>Dear User,</p>
            <p>We are delighted to confirm your order. Below are your order details:</p>
            
            <h3>Order ID: <strong>${orderId}</strong></h3>
            
            <h4>Shipping Address:</h4>
            <p>${shippingAddress.houseAddress}, ${shippingAddress.state} - ${shippingAddress.pincode}</p>
            
            <h4>Order Summary:</h4>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                    <tr>
                        <th style="padding: 10px; border: 1px solid #ddd;">Product Name</th>
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Quantity</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>
            
            <h4>Payment Method:</h4>
            <p>${paymentMethod}</p>
            
            <h4>Total Amount:</h4>
            <p><strong>₹${totalAmount.toFixed(2)}</strong></p>

            <p>Thank you for shopping with us!</p>
            <br>
            <p>Best regards,</p>
            <p><strong>Tech Shop Support Team</strong></p>
        `;

        const info = await transporter.sendMail({
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: "Your Order Invoice - Tech Shop",
            html: emailContent
        });

        return info.accepted.length > 0;
    } catch (error) {
        console.error("Error sending invoice email:", error);
        return false;
    }
}


module.exports = {
    sendInvoiceEmail
};