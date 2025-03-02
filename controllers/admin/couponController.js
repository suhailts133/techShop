/*
 displaying all coupons data
 adding new coupons
 searching for particular coupons
editing , listing, unlisting, deleting
 */

// schema
const Coupon = require("../../models/couponsSchema.js");
// modules
const { v4: uuidv4 } = require("uuid");

const allCoupons = async (req, res) => {
    try {
        // for searching 
        let search = "";  // name iof the coupon
        let status = ""; // state of the coupon
        if (req.query.search) { // reassign the name of the coupon
            search = req.query.search;
        }

        if (req.query.status) { // reassign the coupon status for searching
            status = req.query.status;
        }
        // pagination
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;
        // setting the query 
        let query = {
            $or: [
                { name: { $regex: ".*" + search + ".*", $options: "i" } }
            ]
        };
        if (status) {
            query.status = status;
        }
        // fetch the coupons
        const couponData = await Coupon.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
            
        const totalCount = await Coupon.countDocuments(query); // for counting the document
        const totalPages = Math.ceil(totalCount / limit); // for checking for the number of the page needed
        res.render("coupons", {
            admin: req.session.admin,
            title: "Coupons",
            couponData,
            search,
            status,
            page,
            totalPages
        });
    } catch (error) {
        console.log("Error while loading coupon info", error.message);
    }
};


//load  add coupon page
const loadAddCoupon = async (req, res) => {
    try {
        res.render("addCoupon", { title: "Add new Coupon" })
    } catch (error) {
        console.log("error while loadig the addCoupons page", error.message)
    }
}


// add new coupon
const addCoupon = async (req, res) => {
    try {
        // coupon validation
        const { discountValue, minPurchase, validityDuration, status, name } = req.body;
        if (!discountValue) {
            req.flash("error", "discount value needed");
            return res.redirect("/admin/coupon/add")
        }
        if (!name) {
            req.flash("error", "coupon name needed");
            return res.redirect("/admin/coupon/add")
        }
        if (!minPurchase) {
            req.flash("error", "minimum purchase needed");
            return res.redirect("/admin/coupon/add")
        }
        if (!validityDuration) {
            req.flash("error", "validity duration needed");
            return res.redirect("/admin/coupon/add")
        }
        if (!status) {
            req.flash("error", "Status needed");
            return res.redirect("/admin/coupon/add")
        }

        if (discountValue <= 0) {
            req.flash("error", "discount should be a postive number ");
            return res.redirect("/admin/coupon/add")
        }
        if (validityDuration <= 0) {
            req.flash("error", "insufficent validity days needed");
            return res.redirect("/admin/coupon/add")
        }
      
        const couponCode = uuidv4().split('-')[0].toUpperCase(); // create coupon code
        const newCoupon = new Coupon({  // add new coupon
            name,
            code: couponCode,
            discountValue,
            minPurchase,
            validityDuration,
            status
        });
        await newCoupon.save();
    
        res.redirect('/admin/coupon');
    } catch (error) {
        console.log('Error while creating coupon', error.message);
        res.status(500).send('Internal Server Error');
    }
};


// edit coupon page loading
const loadEditCoupon = async (req, res) => {
    try {
        const {id} = req.query;
        const coupon = await Coupon.findById(id);
        res.render("editCoupon", {title:"Edit Coupon", coupon})
    } catch (error) {
        console.log("errror while loadin the edit coupon page",error.message)
    }
}


// edit coupon
const editCoupon = async (req, res) => {
    try {

        const {id} = req.query;
        // coupon validation
        const {couponEdit} = req.body;
        if (!couponEdit.discountValue) {
            req.flash("error", "discount value needed");
            return res.redirect(`/admin/coupon/edit?id=${id}`)
        }
        if (!couponEdit.name) {
            req.flash("error", "coupon name needed");
            return res.redirect(`/admin/coupon/edit?id=${id}`)
        }

        if (!couponEdit.minPurchase) {
            req.flash("error", "minimum purchase needed");
            return res.redirect(`/admin/coupon/edit?id=${id}`)
        }
        if (!couponEdit.validityDuration) {
            req.flash("error", "validity duration needed");
            return res.redirect(`/admin/coupon/edit?id=${id}`)
        }
        if (!couponEdit.status) {
            req.flash("error", "Status needed");
            return res.redirect(`/admin/coupon/edit?id=${id}`)
        }

        if (couponEdit.discountValue <= 0) {
            req.flash("error", "discount should be a postive number ");
            return res.redirect(`/admin/coupon/edit?id=${id}`)
        }
        if (couponEdit.validityDuration <= 0) {
            req.flash("error", "insufficent validity days needed");
            return res.redirect(`/admin/coupon/edit?id=${id}`)
        }
// if all good edit the coupon
        await Coupon.findByIdAndUpdate(id, couponEdit);
        req.flash("success", "Coupon edited successufully");
        res.redirect("/admin/coupon")

    } catch (error) {
        console.log("error while editing the coupon",error.message)
    }
}


// activating and deactivatin the coupon
const toggleCouponStatus = async (req, res) => {
    const { id } = req.query  // coupon id
    try {
      const coupon = await Coupon.findById(id); // check if the coupon exists
      if (!coupon) {
        req.flash("error", "coupon not found");
        return res.redirect(`/admin/coupon/?search=${req.query.search || ''}status=${coupon.status || ''}&page=${req.query.page || 1}`);
      }

      coupon.status = coupon.status === 'active' ? 'inactive' : 'active'; // change the status 
      // if the coupon staus is active make inactive vise versa
      await coupon.save();
      req.flash("success", "coupon status changed");
     res.redirect(`/admin/coupon/?search=${req.query.search || ''}&status=${coupon.status || ''}&page=${req.query.page || 1}`);
    } catch (err) {
      res.status(500).json({ message: 'Error toggling coupon status', error: err.message });
    }
  };



  // deleting the coupon
const deleteCoupon = async (req, res) => {
    try {
        const {id} = req.query;
        await Coupon.findByIdAndDelete(id);
        req.flash("success", "a coupon deleted");
     res.redirect(`/admin/coupon`);
    } catch (error) {
        console.log("error while delteing coupon", error.message)
    }
}

module.exports = {
    allCoupons,
    loadAddCoupon,
    addCoupon,
    loadEditCoupon,
    editCoupon,
    toggleCouponStatus,
    deleteCoupon
    
}