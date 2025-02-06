const razorpay = require("../../config/razorpay.js")
const crypto = require("crypto")
const env = require("dotenv").config();

const createRazorpayOrder = async (req, res) => {
    try {
        const { amount, currency } = req.body;

        
        const options = {
            amount: amount,
            currency: currency || 'INR',
            receipt: `receipt_${Date.now()}`, 
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
        console.log('Request Body:', req.body);

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Missing payment details in request body',
            });
        }

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        console.log('Expected Signature:', expectedSignature);
        console.log('Received Signature:', razorpay_signature);

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