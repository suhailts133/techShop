const User = require("../../models/userSchema.js")

// display the coupons 
const allCoupons = async (req, res) => {
    try {
        const { id } = req.session.user;
        const user = await User.findById(id).populate("coupons.couponId"); // find all the coupon id from the user

     
       // filter out the coupon which has already expired by comparing the current date and the expiry date in the coupon.user
        const validCoupons = user.coupons.filter(coupon => new Date() <= coupon.expiresAt);  

    // save the valid coupons 
        if (validCoupons.length !== user.coupons.length) {
            user.coupons = validCoupons;
            await user.save();
        }

        const coupons = validCoupons.map(coupon => ({ // coupon details for the front end
            code: coupon.couponId.code,
            couponId: coupon.couponId,
            discount: coupon.couponId.discountValue,
            minPurchase: coupon.couponId.minPurchase,
            expiresAt: coupon.expiresAt,
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