const Coupon = require("../models/couponsSchema.js");


const getRandomCoupon = async () => {
    try {
      
        const coupons = await Coupon.aggregate([
            { $match: { status: 'active' } },
            { $sample: { size: 1 } } 
        ]);
        return coupons[0];
    } catch (error) {
        console.error('Error fetching random coupon:', error);
        return null;
    }
};

module.exports = {
    getRandomCoupon
}