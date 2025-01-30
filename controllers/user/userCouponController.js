const User = require("../../models/userSchema.js")
const Coupon = require("../../models/couponsSchema.js")


const allCoupons = async (req, res) => {
    try {
        const { id } = req.session.user;
        const user = await User.findById(id).populate("coupons.couponId");

        const coupons = user.coupons.map(coupon => {
            const isExpired = new Date() > coupon.expiresAt;
            const status = coupon.isUsed ? 'Used' : isExpired ? 'Expired' : 'Active';

            return {
                code: coupon.couponId.code,
                couponId:coupon.couponId,
                discount: coupon.couponId.discountValue,
                minPurchase: coupon.couponId.minPurchase,
                expiresAt: coupon.expiresAt,
                isUsed: coupon.isUsed,
                status: status
            };
        });

        res.render('allCoupons', {
            title: 'My Coupons',
            coupons,
            moment: require('moment')
        }) 

    } catch (error) {
        console.log("error while displaying all the coupons in the user side", error.message)
    }
}

const deleteCouponUser = async (req, res) => {
    try {

    } catch (error) {
        console.log("error while user deleting the coupon", error.message)
    }
}


module.exports = {
    allCoupons
}