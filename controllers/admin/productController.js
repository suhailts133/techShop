const Product = require("../../models/productSchema.js")
const Category = require("../../models/categorySchema.js")
const Brand = require("../../models/brandSchema.js");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path")

const productInfo = async (req, res) => {
    try {
        let search = "";
        if (req.query.search) {  
            search = req.query.search;
        }
        // pagination
        const page = parseInt(req.query.page) || 1;
        const limit = 5;  
        const skip = (page - 1) * limit;  

        const productData = await Product.find({
            $or: [   // search for a user 
                { productName: { $regex: ".*" + search + ".*", $options: "i" } }, // 
            ]
        })
            .skip(skip)
            .limit(limit)
            .sort({createdAt:-1})


        const totalCount = await Category.countDocuments();  
        const totalPages = Math.ceil(totalCount / limit);   

        res.render("products", {
            admin: req.session.admin,
            title: "products",
            productData,
            search,
            page,
            totalPages
        });
    } catch (error) {
        console.log("Error while loading category info", error.message);
    }
};

const loadAddProductPage = async (req, res) => {
    try {
        const brand = await Brand.find({isListed:true});
        const category = await Category.find({isListed:true})
        res.render("addProducts", {title:"Add Product",brand,category})
    } catch (error) {
        console.log("error while loadin add new product page",error.message)
    }
}
const addProduct = async (req, res) => {
    try {
        const products = req.body;

        // Check if the product already exists
        const productExists = await Product.findOne({
            productName: products.productName,
        });

        if (productExists) {
            req.flash("error", "Product already exists");
            return res.redirect("/admin/products/add");
        }

        // Handle images
        const images = [];
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                const originalImagePath = req.files[i].path;
                const uniqueFilename = `resized-${Date.now()}-${i}-${req.files[i].filename}`;
                const resizedImagePath = path.join(
                    "public",
                    "uploads",
                    "products",
                    uniqueFilename
                );

                try {
                    await sharp(originalImagePath)
                        .resize({ width: 440, height: 440 })
                        .toFile(resizedImagePath);

                    images.push(uniqueFilename);

                    fs.unlinkSync(originalImagePath);
                } catch (err) {
                    console.error("Error resizing or deleting image:", err);
                    return res.status(500).json({ message: "Failed to process image" });
                }
            }
        }

        // Check for a valid category
        const category = await Category.findOne({ name: products.category });
        if (!category) {
            return res.status(400).json("Invalid category name");
        }

        // Transform variants into an array of objects
        const variants = Object.keys(products)
            .filter((key) => key.startsWith("variants["))
            .reduce((acc, key) => {
                const match = key.match(/variants\[(\d+)\]\.(.+)/); // Extract index and field name
                if (match) {
                    const index = parseInt(match[1], 10); // Variant index
                    const field = match[2];              // Field name

                    if (!acc[index]) acc[index] = {};    // Initialize object for this index
                    acc[index][field] = products[key];   // Assign value to the correct field
                }
                return acc;
            }, []);

        // Create a new product with variants
        const newProduct = new Product({
            productName: products.productName,
            description: products.description,
            brand: products.brand,
            category: category._id,
            productImage: images,
            variants: variants, // Transformed array of objects
            productOffer: products.productOffer || 0,
            status: "Available",
        });

        await newProduct.save();

        return res.redirect("/admin/products");
    } catch (error) {
        console.error("Error while saving product:", error);

        return res.redirect("/admin/pageerror");
    }
};

module.exports = {
    productInfo,
    loadAddProductPage,
    addProduct
}