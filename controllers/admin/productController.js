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

        const productExists = await Product.findOne({ // check if the product already exsist
            productName: products.productName,
        });

        if (productExists) {
            req.flash("error", "Product already exists");
            return res.redirect("/admin/products/add");
        }

        const images = [];
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                const originalImagePath = req.files[i].path;
                const uniqueFilename = `resized-${Date.now()}-${i}-${req.files[i].filename}`; // give a unique file name
                const resizedImagePath = path.join( // store it in the public/uploads/products
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

        const category = await Category.findOne({ name: products.category });
        if (!category) {
            req.flash("error", "Category not found");
            return res.redirect("/admin/products/add");
        }

        const variants = products.variants || [];  // take out the variants for the product
        const priceCheck = variants.some(v => Number(v.salePrice) > Number(v.price)); // check if any of the variant pricea has any iregualaries
        // saleprice greater than og price
        if (priceCheck) {
            req.flash("error", "Sale price cannot be higher than original price");
            return res.redirect("/admin/products/add");
        }

// if there is no probelm add the new product to the db
        const newProduct = new Product({
            productName: products.productName,
            productOffer: products.productOffer,
            description: products.description,
            brand: products.brand,
            category: category._id,
            productImage: images,
            variants: variants,
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
        const brands = await Brand.find({ isListed: true });
        const categories = await Category.find({ isListed: true })

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
      const variants = updatedData.variants || [];
  
      const priceCheck = variants.some(v => Number(v.salePrice) > Number(v.price));
      if (priceCheck) {
        req.flash("error", "Sale price cannot be higher than original price");
        return res.redirect(`/admin/products/edit?id=${productId}`);
      }
  
      const product = await Product.findById(productId);
      if (!product) {
        req.flash("error", "Product not found");
        return res.redirect("/admin/products");
      }
  
 
      const productExists = await Product.findOne({ 
        productName: updatedData.productName, 
        _id: { $ne: productId } 
      });
      if (productExists) {
        req.flash("error", "Product already exists");
        return res.redirect(`/admin/products/edit?id=${productId}`);
      }
  
      let images = [...product.productImage]; 
      
      if (req.files && req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          
          
          const match = file.filename.match(/cropped-image-(\d+)\./);
          if (match) {
            const imageIndex = parseInt(match[1]) - 1; 
  
          
            if (imageIndex >= 0 && imageIndex < 3) {
             
              if (images[imageIndex]) {
                try {
                  fs.unlinkSync(path.join("public", "uploads", "products", images[imageIndex]));
                } catch (unlinkError) {
                  console.warn(`Could not delete old image: ${images[imageIndex]}`, unlinkError);
                }
              }
  
              const originalImagePath = file.path;
              const uniqueFilename = `resized-${Date.now()}-${imageIndex}-${file.filename}`;
              const resizedImagePath = path.join("public", "uploads", "products", uniqueFilename);
  
              try {
                await sharp(originalImagePath)
                  .resize({ width: 600, height: 600, fit: "cover" })
                  .toFile(resizedImagePath);
  
                
                images[imageIndex] = uniqueFilename;
  
                
                fs.unlinkSync(originalImagePath);
              } catch (err) {
                console.error(`Error processing image at index ${imageIndex}:`, err);
                return res.status(500).json({ message: "Failed to process image" });
              }
            }
          }
        }
      }
  
      const category = await Category.findOne({ name: updatedData.category });
      if (!category) {
        req.flash("error", "Category not found");
        return res.redirect(`/admin/products/edit?id=${productId}`);
      }
  

      product.productName = updatedData.productName;
      product.description = updatedData.description;
      product.productOffer = updatedData.productOffer;
      product.brand = updatedData.brand;
      product.category = category._id;
      product.productImage = images;
      product.variants = variants;
      product.productOffer = updatedData.productOffer || 0;
      product.status = updatedData.status || "Available";
  
      
      await product.save();
  
      req.flash("success", "Product Edited Successfully");
      return res.redirect("/admin/products");
    } catch (error) {
      console.error("Error while updating the product:", error);
      return res.redirect("/admin/pageerror");
    }
  };

// brand islist toggleing
const productToggle = async (req, res) => {
    try {
        let { id } = req.query; // id of the brand
        const productStatus = await Product.findById(id);
        let flag = false;  // by default the user is already unblocked so flag as false
        if(productStatus.isBlocked){ //if the user is blocked
            productStatus.isBlocked=false; // make the user unblock
            flag=false  // then set the flag as false
            await productStatus.save()
        }else{ //  if the user is alrady blocked
            productStatus.isBlocked=true; //  make the user as blocked by setting isblockd as true 
            flag=true; // set the flag as true because user is blocked
            await productStatus.save();
        }
        res.json({ success: true, isBlocked: flag });  // return the json response with flag 
        
       
    } catch (error) {
        console.log("Error while listing category", error.message);
    }
};

module.exports = {
    productInfo,
    loadAddProductPage,
    addProduct,
    editProductPage,
    editProduct,
    productToggle
}