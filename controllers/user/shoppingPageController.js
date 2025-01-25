const Category = require("../../models/categorySchema.js");
const Product = require("../../models/productSchema.js")
const Brand = require("../../models/brandSchema.js")
const User = require("../../models/userSchema.js")


const loadShoppingPage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const skip = (page - 1) * limit;

        const sort = req.query.sort || null;  
        const category = req.query.category || null;
        const brand = req.query.brand || null;

        const categories = await Category.find({ isListed: true }).lean();
        const brands = await Brand.find({ isListed: true }).lean();

        const query = {
            isBlocked: false,
            variants: { $elemMatch: { quantity: { $gt: 0 } } }
        };

        if (category) {
            query.category = categories._id;
        }
        if (brand) {
            query.brand = brands.brandName;
        }

        let sortQuery = {};
        if (sort === 'price-asc') {
            sortQuery = { 'variants.salePrice': 1 };
        } else if (sort === 'price-desc') {
            sortQuery = { 'variants.salePrice': -1 };
        } else if (sort === 'name-asc') {
            sortQuery = { productName: 1 };
        } else if (sort === 'name-desc') {
            sortQuery = { productName: -1 };
        }

        const products = await Product.find(query)
            .sort(sortQuery)
            .skip(skip)
            .limit(limit)
            .lean();

        const totalCount = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalCount / limit);

        res.render("shop", {
            title: "Shop",
            products,
            page,
            totalPages,
            category: categories,
            brand: brands,
            selectedCategory: category,  
            selectedBrand: brand,        
            selectedSort: sort           
        });

    } catch (error) {
        console.log("Error while loading shop", error.message);
    }
};

const filterProducts = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const skip = (page - 1) * limit;

        // Get filters from query string
        const category = req.query.category;
        const brand = req.query.brand;
        const sort = req.query.sort;

        // Find the selected category and brand if they exist
        const findCategory = category ? await Category.findOne({ _id: category }) : null;
        const findBrand = brand ? await Brand.findOne({ _id: brand }) : null;

        const brands = await Brand.find({ isListed: true }).lean();
        const categories = await Category.find({ isListed: true }).lean();

        const query = {
            isBlocked: false,
            variants: { $elemMatch: { quantity: { $gt: 0 } } }
        };

        // Add category and brand filters if available
        if (findCategory) {
            query.category = findCategory._id;
        }
        if (findBrand) {
            query.brand = findBrand.brandName;
        }
        let sortQuery = {};
        if (sort === 'price-asc') {
            sortQuery = { 'variants.salePrice': 1 };
        } else if (sort === 'price-desc') {
            sortQuery = { 'variants.salePrice': -1 };
        } else if (sort === 'name-asc') {
            sortQuery = { productName: 1 };
        } else if (sort === 'name-desc') {
            sortQuery = { productName: -1 };
        }
      
        let findProducts = await Product.find(query)
            .sort(sortQuery)
            .skip(skip)
            .limit(limit)
            .lean();

       
        const totalCount = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalCount / limit);

        
        res.render("shop", {
            title: "Shop",
            products: findProducts,
            page,
            totalPages,
            brand: brands,
            category: categories,
            selectedCategory: category || null,
            selectedBrand: brand || null,
            selectedSort: sort || null   
        });
    } catch (error) {
        console.log("Error while filtering", error.message);
    }
};

module.exports = {
    loadShoppingPage,
    filterProducts
}