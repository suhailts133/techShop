const Brand = require("../../models/brandSchema.js")
const Category = require("../../models/categorySchema.js")
const Product = require("../../models/productSchema.js")


const bestSelling = async (req, res) => {
    const bestSellingProducts = await Product.find().sort({purchaseCount: -1}).limit(3)
    const bestSellingCategory = await Category.find().sort({purchaseCount: -1}).limit(3)
    const bestSellingBrand = await Brand.find().sort({purchaseCount: -1}).limit(3)
}

module.exports = {
    bestSelling
}