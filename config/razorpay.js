const Razorpay = require('razorpay');
const env = require("dotenv").config();

const razorpay = new Razorpay({
  key_id: "rzp_test_BP19IdbtnXoghn",
  key_secret: "gsNSHOJLGWXRZ9tDkKbsVKiU"
});

module.exports = razorpay;