const razorpay = require("../../config/razorpay.js")
const crypto = require("crypto")

const createRazorpayOrder = async (req, res) => {
    try {
        const { amount, currency } = req.body;

        // Create a Razorpay order
        const options = {
            amount: amount, // Amount in paise (e.g., 1000 = ₹10)
            currency: currency || 'INR',
            receipt: `receipt_${Date.now()}`, // Unique receipt ID
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
            },
        });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating Razorpay order',
        });
    }
};


const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Generate the expected signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        // Compare the signatures
        if (expectedSignature === razorpay_signature) {
            res.json({ success: true, message: 'Payment verified successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying payment',
        });
    }
};

module.exports = {
    createRazorpayOrder,
    verifyPayment
}