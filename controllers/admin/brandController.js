const fs = require("fs");
const path = require("path")
const Brand = require("../../models/brandSchema.js");

// displaying customer details
const brandInfo = async (req, res) => {
    try {
        let search = "";
        if (req.query.search) {  // to search for a custemor if admin have searched for anything it will be in the search field 
            search = req.query.search;
        }
        // pagination
        const page = parseInt(req.query.page) || 1;
        const limit = 5;   // number of documnet in a single page
        const skip = (page - 1) * limit;  // how much to skip since 5 is the limit in the first page 0 , then 5, 10, 15

        const brandData = await Brand.find({
            $or: [   // search for a user 
                { brandName: { $regex: ".*" + search + ".*", $options: "i" } }, // 
            ]
        })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })


        const totalCount = await Brand.countDocuments();   // for counting the document
        const totalPages = Math.ceil(totalCount / limit);   // finding the total pages required

        res.render("brands", {
            admin: req.session.admin,
            title: "brands",
            brandData,
            search,
            page,
            totalPages
        });
    } catch (error) {
        console.log("Error while loading category info", error.message);
    }
};

const loadAddBrandPage = (req, res) => {
    try {
        res.render("addBrand", { title: "Add brand" })
    } catch (error) {
        console.log("Error while loading add brand page", error.message)
    }
}

const brandUnlist = async (req, res) => {
    try {
        let { id } = req.query;  // id of the user from the query
        await Brand.updateOne({ _id: id }, { $set: { isListed: false } });
        res.redirect(`/admin/brands/?search=${req.query.search || ''}&page=${req.query.page || 1}`);
    } catch (error) {
        console.log("Error while unlising category", error.message);
    }
};

const brandList = async (req, res) => {
    try {
        let { id } = req.query;
        await Brand.updateOne({ _id: id }, { $set: { isListed: true } });


        res.redirect(`/admin/brands/?search=${req.query.search || ''}&page=${req.query.page || 1}`);
    } catch (error) {
        console.log("Error while listing category", error.message);
    }
};



const addBrand = async (req, res) => {
    try {
        const brandName = req.body.brandName.trim().toLowerCase();
        const findBrand = await Brand.findOne({ brandName });
        if (findBrand) {
            req.flash("error", "brand already exists");
            return res.redirect("/admin/brands/add");
        }

        const image = req.file.filename;
        const newBrand = new Brand({
            brandName: brandName,
            logo: image
        });
        await newBrand.save();
        req.flash("success", "New Brand Added")
        res.redirect("/admin/brands");

    } catch (error) {
        console.log("Error while adding brand:", error);
        res.redirect("/Pageerror");
    }
};

const loadEditBrand = async (req, res) => {
    const { id } = req.query;
    const brandData = await Brand.findById(id);
    if (!brandData) {
        req.flash("error", "brand did not find");
        return res.redirect("/admin/brands")
    }
    res.render("editbrand", { title: "edit brand", brandData })
}



const editBrand = async (req, res) => {
    try {

        const { id } = req.query;
        const brandName = req.body.brandName?.trim().toLowerCase();
        const newLogo = req.file;

        const existingBrand = await Brand.findById(id);
        if (!existingBrand) {
            req.flash("error", "Brand not found");
            return res.redirect("/admin/brands");
        }

        const brandNameExists = await Brand.findOne({
            brandName,
            _id: { $ne: id },
        });
        if (brandNameExists) {
            req.flash("error", "Brand name already exists");
            return res.redirect(`/admin/brands/edit?id=${id}`);
        }
        if (newLogo) {
            const oldLogoPath = path.join(
                __dirname,
                "..",
                "uploads",
                "brands",
                path.basename(existingBrand.logo || "")
            );
            if (fs.existsSync(oldLogoPath)) {
                fs.unlinkSync(oldLogoPath);
            }
        }

        // Prepare updated data
        const updatedData = {};
        if (brandName) updatedData.brandName = brandName;
        if (newLogo) updatedData.logo = newLogo.filename;

        // Update the brand in the database
        const updatedBrand = await Brand.findByIdAndUpdate(id, updatedData, {
            new: true,
            runValidators: true,
        });

        req.flash("success", "Brand edited successfully");
        res.redirect("/admin/brands");
    } catch (error) {
        console.error("Error while editing the brand:", error.message);
        req.flash("error", "An error occurred while editing the brand");
        res.redirect("/admin/brands");
    }
};

module.exports = {
    brandInfo,
    loadAddBrandPage,
    addBrand,
    brandList,
    brandUnlist,
    loadEditBrand,
    editBrand
}