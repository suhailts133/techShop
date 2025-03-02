/*
brand
top 3
 best selling products 
 best selling category 
 best selling brand
 and the count of the product, category and brand
 ledger book
 all tansation
 total amount recived pending amount and refunded amount
 */

// schemas
const Brand = require("../../models/brandSchema.js")
const Category = require("../../models/categorySchema.js")
const Product = require("../../models/productSchema.js")
const Transaction = require("../../models/transactionSchema.js")

const bestSelling = async (req, res) => {
    try {
        // fetch all the product category and brand is order of the purchase count and take the top 3 items
        const bestSellingProducts = await Product.find().sort({ purchaseCount: -1 }).limit(3)
        const bestSellingCategorys = await Category.find().sort({ purchaseCount: -1 }).limit(3)
        const bestSellingBrands = await Brand.find().sort({ purchaseCount: -1 }).limit(3)

        // total purchse in particular field
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


// ledger book geneartion
const ledgerBook = async (req, res) => {
    try {
        // pagination
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        const totalTransactions = await Transaction.countDocuments();
        const totalPages = Math.ceil(totalTransactions / limit);
        // find all transation
        const allTransactions = await Transaction.find();
        // sum of the total amount
        const totalAmount = allTransactions.reduce((sum, trans) => {
            if (trans.paymentStatus === 'Purchase') {
                return sum + trans.amount;
            }
            return sum;
        }, 0);
        // sum of pendin amount if the payment method is cod
        const pendingAmount = allTransactions.reduce((sum, trans) => {
            if (trans.action === 'Pending') {
                return sum + trans.amount;
            }
            return sum;
        }, 0);
        // sum of refunded and amount
        const returnRefundAmount = allTransactions.reduce((sum, trans) => {
            if (trans.paymentStatus === "Refund" || trans.paymentStatus === "Cancelled") {
                return sum + trans.amount;
            }
            return sum;
        }, 0);


        const transactions = await Transaction.find()
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit);

        res.render('ledgerBook', {
            title: "All Transaction",
            transactions,
            returnRefundAmount,
            currentPage: page,
            totalPages,
            totalTransactions,
            totalAmount,
            pendingAmount
        });
    } catch (error) {
        console.log("error while loading ledger book", error.message);
        res.status(500).send("Error loading ledger book");
    }
}
module.exports = {
    bestSelling,
    ledgerBook
}