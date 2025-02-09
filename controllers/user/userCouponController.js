const User = require("../../models/userSchema.js")
// const Coupon = require("../../models/couponsSchema.js")

const allCoupons = async (req, res) => {
    try {
        const { id } = req.session.user;
        const user = await User.findById(id).populate("coupons.couponId");

       
        const validCoupons = user.coupons.filter(coupon => new Date() <= coupon.expiresAt);

    
        if (validCoupons.length !== user.coupons.length) {
            user.coupons = validCoupons;
            await user.save();
        }

        const coupons = validCoupons.map(coupon => ({
            code: coupon.couponId.code,
            couponId: coupon.couponId,
            discount: coupon.couponId.discountValue,
            minPurchase: coupon.couponId.minPurchase,
            expiresAt: coupon.expiresAt,
            isUsed: coupon.isUsed,
            status: coupon.isUsed ? 'Used' : 'Active'
        }));

        res.render('allCoupons', {
            title: 'My Coupons',
            coupons,
            moment: require('moment')
        });

    } catch (error) {
        console.log("Error while displaying all the coupons in the user side:", error.message);
    }
};




module.exports = {
    allCoupons
}