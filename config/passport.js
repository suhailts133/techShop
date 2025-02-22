const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userSchema.js");
const Coupon = require("../models/couponsSchema.js")
const env = require("dotenv").config();

const callbackURL = process.env.NODE_ENV === "production" ?
 "https://www.techlux.shop/auth/google/callback": "http://localhost:3000/auth/google/callback"
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:callbackURL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // if user exists but has no Google ID which mean not logged in by google
          if (!user.googleId) {
            user.googleId = profile.id;
            user.name = profile.displayName;
            await user.save();
          }
          return done(null, user);
        } else {
          // Creating a new user
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
          });

          await user.save();

          // Find the first available coupon, or create one if none exist
          let signupCoupon = await Coupon.findOne();
          if (!signupCoupon) {
            signupCoupon = new Coupon({
              name: "Welcome Coupon",
              discountValue: 2000, 
              minPurchase: 10000, 
              validityDuration: 30, 
            });
            await signupCoupon.save();
          }

          // Assign the coupon to the new user
          user.coupons.push({
            couponId: signupCoupon._id,
            expiresAt: new Date(Date.now() + signupCoupon.validityDuration * 24 * 60 * 60 * 1000),
          });

          await user.save();

          return done(null, user);
        }
      } catch (error) {
        console.error("Error during Google authentication:", error);
        return done(error, null);
      }
    }
  )
);

// Serialize user into session (store user._id in session)
passport.serializeUser(function (user, done) {
  done(null, user._id);
});

// Deserialize user from session (retrieve user by _id from DB)
passport.deserializeUser(async function (id, done) {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
