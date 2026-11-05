const razorpay = require("../../config/razorpay.js")
const crypto = require("crypto")
const env = require("dotenv").config();

// constants
const ERROR_MESSAGES = require("../../constants/userErrorMessages.js")
const HTTP_STATUS = require("../../constants/httpStatusCode.js")

const createRazorpayOrder = async (req, res) => {
    try {
        console.log("request body form create razor pay order",req.body);
        
        const { amount, currency } = req.body;

        
        const options = {
            amount: amount,
            currency: currency || 'INR',
            receipt: `receipt_${Date.now()}`, 
        };

        const order = await razorpay.orders.create(options);
        console.log("options",order);
        
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
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.RAZORPAY,
        });
    }
};

const verifyPayment = async (req, res) => {
    try {
        console.log('Request Body:', req.body);

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: ERROR_MESSAGES.PAYMENT_DETAILS,
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
            res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: ERROR_MESSAGES.PAYMENT_SIGNATURE });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.PAYMENT_VERIFY,
        });
    }
};
module.exports = {
    createRazorpayOrder,
    verifyPayment
}