const Product = require("../../models/productSchema.js")
const Category = require("../../models/categorySchema.js")
const Brand = require("../../models/brandSchema.js");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");


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
            .sort({ createdAt: -1 })
            .lean()

        console.log(JSON.stringify(productData, null, 2))
        const totalCount = await Product.countDocuments();
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
        const brand = await Brand.find({ isListed: true });
        const category = await Category.find({ isListed: true })
        res.render("addProducts", { title: "Add Product", brand, category })
    } catch (error) {
        console.log("error while loadin add new product page", error.message)
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
                        .resize({ width: 600, height: 600, fit: "cover" })
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

        // Directly use the 'variants' array from req.body
        const variants = products.variants || [];

        // Create a new product with variants
        const newProduct = new Product({
            productName: products.productName,
            productOffer: products.productOffer,
            description: products.description,
            brand: products.brand,
            category: category._id,
            productImage: images,
            variants: variants, // Directly assign the variants array
            productOffer: products.productOffer || 0,
            status: "Available",
        });

        await newProduct.save();
        req.flash("success", "New Product Added")
        return res.redirect("/admin/products");
    } catch (error) {
        console.error("Error while saving product:", error);

        return res.redirect("/admin/pageerror");
    }
};

const editProductPage = async (req, res) => {
    try {
        const productId = req.query.id;
        const product = await Product.findById(productId);
        const categories = await Category.find();
        const brands = await Brand.find();

        if (!product) {
            return res.status(404).send('Product not found');
        }

        res.render('editProduct', {
            title: 'Edit Product',
            product: product,
            category: categories,
            brand: brands
        });
    } catch (error) {
        console.error("error while loadin edit product page", error.message);
        res.status(500).send('Server error');
    }
};


const editProduct = async (req, res) => {
    try {
        const productId = req.query.id;
        const updatedData = req.body;

        // Find the existing product to update
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json("Product not found");
        }

        // Check if the new product name already exists
        const productExists = await Product.findOne({
            productName: updatedData.productName,
            _id: { $ne: productId }, // Exclude the current product from the check
        });

        if (productExists) {
            req.flash("error", "Product already exists");
            return res.redirect(`/admin/products/edit?id=${productId}`);
        }

        // Handle images (resizing and saving)
        let images = product.productImage; // Keep existing images if no new images are uploaded
        if (req.files && req.files.length > 0) {
            // Delete old images from the server (optional)
            product.productImage.forEach((img) => {
                fs.unlinkSync(path.join("public", "uploads", "products", img));
            });

            images = []; // Reset the images array

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
                        .resize({ width: 600, height: 600, fit: "cover" })
                        .toFile(resizedImagePath);

                    images.push(uniqueFilename);

                    fs.unlinkSync(originalImagePath); // Remove the original image after processing
                } catch (err) {
                    console.error("Error resizing or deleting image:", err);
                    return res.status(500).json({ message: "Failed to process image" });
                }
            }
        }

        // Check for a valid category
        const category = await Category.findOne({ name: updatedData.category });
        if (!category) {
            return res.status(400).json("Invalid category name");
        }

        // Handle variants
        const variants = updatedData.variants || [];

        // Update the product details
        product.productName = updatedData.productName;
        product.description = updatedData.description;
        product.productOffer =  updatedData.productOffer;
        product.brand = updatedData.brand;
        product.category = category._id;
        product.productImage = images; // Update images
        product.variants = variants; // Update variants
        product.productOffer = updatedData.productOffer || 0;
        product.status = updatedData.status || "Available";

        // Save the updated product
        await product.save();

        return res.redirect("/admin/products");
    } catch (error) {
        console.error("Error while updating the product:", error);
        return res.redirect("/admin/pageerror");
    }
};


const unblockProduct = async (req, res) => {
    try {
        const id = req.query.id;


        await Product.updateOne({ _id: id }, { isBlocked: false });

        res.redirect("/admin/products");
    } catch (error) {
        console.error("Error while unlisting category:", error);
        res.status(500).send("Server Error");
    }
};


const blockProduct = async (req, res) => {
    try {
        const id = req.query.id;


        await Product.updateOne({ _id: id }, { isBlocked: true });

        res.redirect("/admin/products");
    } catch (error) {
        console.error("Error while listing category:", error);
        res.status(500).send("Server Error");
    }
};

module.exports = {
    productInfo,
    loadAddProductPage,
    addProduct,
    editProductPage,
    editProduct,
    blockProduct,
    unblockProduct
}