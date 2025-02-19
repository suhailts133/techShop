const Category = require("../../models/categorySchema.js");
const Product = require("../../models/productSchema.js");
const Brand = require("../../models/brandSchema.js");
const Wishlist = require("../../models/wishlishSchema.js");

const loadShoppingPage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const skip = (page - 1) * limit;

        const { sort, category, brand } = req.query;


        const categories = await Category.find({ isListed: true }).lean();
        const brands = await Brand.find({ isListed: true }).lean();


        const query = {
            isBlocked: false,
            variants: { $elemMatch: { quantity: { $gt: 0 } } }
        };

        if (category) {
            query.category = category; 
        }

        if (brand) {
            const brandDoc = await Brand.findById(brand);
            if (brandDoc) query.brand = brandDoc.brandName;
        }

    
        let sortQuery = {};
        switch (sort) {
            case 'price-asc':
                sortQuery = { 'variants.salePrice': 1 };
                break;
            case 'price-desc':
                sortQuery = { 'variants.salePrice': -1 };
                break;
            case 'name-asc':
                sortQuery = { productName: 1 };
                break;
            case 'name-desc':
                sortQuery = { productName: -1 };
                break;
            case 'popularity-asc':
                sortQuery = { averageRating: -1, reviewCount: -1 };
                break;
            case 'popularity-desc':
                sortQuery = { averageRating: 1, reviewCount: 1 };
                break;
        }

   
        const products = await Product.find(query)
            .sort(sortQuery)
            .collation({ locale: "en", strength: 2 })
            .skip(skip)
            .limit(limit)
            .populate("category")
            .lean();


        const totalCount = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalCount / limit);

        let wishlistItems = [];
        if (req.session.user) {
            const userWishlist = await Wishlist.findOne({ userId: req.session.user.id }).lean();
            wishlistItems = userWishlist?.items.map(item => ({
                productId: item.productId.toString(),
                variantId: item.variantId.toString()
            })) || [];
        }

        res.render("shop", {
            title: "Shop",
            products,
            page,
            totalPages,
            wishlistItems,
            categories,
            brands,
            selectedCategory: category,
            selectedBrand: brand,
            selectedSort: sort
        });

    } catch (error) {
        console.log("Error while loading shop", error.message);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = {
    loadShoppingPage
};