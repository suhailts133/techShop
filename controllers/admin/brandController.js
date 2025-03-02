/*
 displaying brand data
 adding new brand 
 searching for particular brand
editing , listing unlisting
 */


// external modules
const fs = require("fs");
const path = require("path")
// schema
const Brand = require("../../models/brandSchema.js");


// displaying brand details
const brandInfo = async (req, res) => {
    try {
        // for searching
        let search = "";
        if (req.query.search) { // if there is a search query reassign the data to search  
            search = req.query.search;
        }
        // pagination
        const page = parseInt(req.query.page) || 1;
        const limit = 5;   // number of documnet in a single page
        const skip = (page - 1) * limit;  // how much to skip since 5 is the limit in the first page 0 , then 5, 10, 15

        const brandData = await Brand.find({
            $or: [   // find all brand if the search is empty
                //  else only the searched brands
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


// load the add bew brand
const loadAddBrandPage = (req, res) => {
    try {
        res.render("addBrand", { title: "Add brand" })
    } catch (error) {
        console.log("Error while loading add brand page", error.message)
    }
}

// brand islist toggleing
const brandToggle = async (req, res) => {
    try {
        let { id } = req.query; // id of the brand
        const brandStatus = await Brand.findById(id);
        let flag = true;  // by default the item is already listed
        if(brandStatus.isListed){ //if the item is listed 
            brandStatus.isListed=false; // make the item unlist
            flag=false  // then set the flag as false
            await brandStatus.save()
        }else{ //  if the item is already unlisted make it listed
            brandStatus.isListed=true; //  make islistd as true 
            flag=true; // set the flag as true since the item is listed
            await brandStatus.save();
        }
        res.json({ success: true, isListed: flag });  // return the json response with flag 
        
        
    } catch (error) {
        console.log("Error while listing category", error.message);
    }
};


// add new brand
const addBrand = async (req, res) => {
    try {
        const brandName = req.body.brandName.trim().toLowerCase(); // brand name for the body trim it and make it into lowecase
        const findBrand = await Brand.findOne({ brandName }); // check if the brand already exists
        if (findBrand) { // if the brand exists display a error message
            req.flash("error", "brand already exists");
            return res.redirect("/admin/brands/add");
        }
        const image = req.file.filename; // brand image
        const newBrand = new Brand({ // add the new brand if there is no error
            brandName: brandName,
            logo: image
        });
        await newBrand.save(); // save the brand
        req.flash("success", "New Brand Added")
        res.redirect("/admin/brands");
    } catch (error) {
        console.log("Error while adding brand:", error);
        res.redirect("/Pageerror");
    }
};


// load the edit brand page 
const loadEditBrand = async (req, res) => {
    const { id } = req.query; // get the brand id
    const brandData = await Brand.findById(id); // fetch the data of the particular id
    if (!brandData) { // if the id doesnt exist show error
        req.flash("error", "brand did not find");
        return res.redirect("/admin/brands")
    }
    // display the edit brand page with pre filled form
    res.render("editbrand", { title: "edit brand", brandData })
}


// edit brand
const editBrand = async (req, res) => {
    try {

        const { id } = req.query; // id of the brand
        const brandName = req.body.brandName?.trim().toLowerCase(); // name of the brand
        const newLogo = req.file; // file
        // check there is a brand with the id
        const existingBrand = await Brand.findById(id);
        if (!existingBrand) {
            req.flash("error", "Brand not found");
            return res.redirect("/admin/brands");
        }
        // check if the new name is already in use
        const brandNameExists = await Brand.findOne({
            brandName,
            _id: { $ne: id },
        });
        // if the brandname is already in use by another brand
        if (brandNameExists) {
            req.flash("error", "Brand name already exists");
            return res.redirect(`/admin/brands/edit?id=${id}`);
        }
        // remove the old logo if there is a new one
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
        // new data
        const updatedData = {};
        if (brandName) updatedData.brandName = brandName;
        if (newLogo) updatedData.logo = newLogo.filename;

        // Update the brand in the database
        const updatedBrand = await Brand.findByIdAndUpdate(id, updatedData, {
            new: true,
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
    brandToggle,
    loadEditBrand,
    editBrand
}