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
const cloudinaryService = require("../../services/cloudinaryService.js");


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
    let uploaded = null
    try {
        const brandName = req.body.brandName.trim().toLowerCase();
        if(!req.file){
            req.flash("error", "Brand logo is required");
            return res.redirect("/admin/brands/add");  
        }
        const findBrand = await Brand.findOne({ brandName }); 
        if (findBrand) { 
            req.flash("error", "brand already exists");
            return res.redirect("/admin/brands/add");
        }
        uploaded = await cloudinaryService.upload(req.file, "techshop/brands")
        const newBrand = new Brand({ 
            brandName: brandName,
            logo: {path:uploaded.path, filename:uploaded.filename}
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
    let uploaded = null;
    try {
        const { id } = req.query;
        const brandName = req.body.brandName?.trim().toLowerCase();
        const newLogo = req.file;

        const existingBrand = await Brand.findById(id);
        if (!existingBrand) {
            req.flash("error", "Brand not found");
            return res.redirect("/admin/brands");
        }

        if (brandName) {
            const brandNameExists = await Brand.findOne({
                brandName,
                _id: { $ne: id },
            });
            if (brandNameExists) {
                req.flash("error", "Brand name already exists");
                return res.redirect(`/admin/brands/edit?id=${id}`);
            }
        }

        const updatedData = {};
        if (brandName) updatedData.brandName = brandName;

        if (newLogo) {
            uploaded = await cloudinaryService.upload(newLogo, "techshop/brands");
            updatedData.logo = { path: uploaded.path, filename: uploaded.filename };
        }

        await Brand.findByIdAndUpdate(id, updatedData, { new: true });

        if (newLogo && existingBrand.logo?.filename) {
            await cloudinaryService.delete(existingBrand.logo.filename).catch(() => {});
        }

        req.flash("success", "Brand edited successfully");
        res.redirect("/admin/brands");
    } catch (error) {
        console.error("Error while editing the brand:", error.message);
    
        if (uploaded) await cloudinaryService.delete(uploaded.filename).catch(() => {});
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