const Brand = require("../../models/brandSchema.js")
const Category = require("../../models/categorySchema.js")
const Product = require("../../models/productSchema.js")


const bestSelling = async (req, res) => {
    try {
        const bestSellingProducts = await Product.find().sort({ purchaseCount: -1 }).limit(3)
        const bestSellingCategorys = await Category.find().sort({ purchaseCount: -1 }).limit(3)
        const bestSellingBrands = await Brand.find().sort({ purchaseCount: -1 }).limit(3)
        let categoryTotalCount = 0;
        for (let i = 0; i < bestSellingCategorys.length; i++) {
            categoryTotalCount += bestSellingCategorys[i].purchaseCount;
        }

        let productTotalCount = 0;
        for (let i = 0; i < bestSellingProducts.length; i++) {
            productTotalCount += bestSellingProducts[i].purchaseCount;
        }

        let brandTotalCount = 0;
        for (let i = 0; i < bestSellingBrands.length; i++) {
            brandTotalCount += bestSellingBrands[i].purchaseCount;
        }


        res.render('bestSelling', {
            title: "Top items",
            categoryTotalCount,
            productTotalCount,
            brandTotalCount,
            bestSellingProducts,
            bestSellingBrands,
            bestSellingCategorys
        })
    } catch (error) {
        console.log("error while loading best sellin section", error.message)
    }
}

const ledgerBook = async (req, res) => {
    try {
        res.render("ledgerBook")
    } catch (error) {
        console.log("error while loadin ledger book", error.message)
    }
}

module.exports = {
    bestSelling,
    ledgerBook
}