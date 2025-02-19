const User = require("../../models/userSchema.js")
const Wallet = require("../../models/walletSchema.js");


const walletTransation = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;   // number of documnet in a single page
        const skip = (page - 1) * limit;  // how much to skip since 5 is the limit in the first page 0 , then 5, 10, 15
        const wallet = await Wallet.find()
            .populate("userId")
            .populate('orderId')
            .skip(skip)
            .limit(limit)
            .sort({createdAt:-1})
            .lean();
            const totalCount = await Wallet.countDocuments();   // for counting the document
            const totalPages = Math.ceil(totalCount / limit);   // finding the total pages required
    
        res.render('allWallet', {
            title: "Wallet Managment",
            wallet,
            page,
            totalPages
        })
    } catch (error) {
        console.log("error while loading wallet transations", error.message)
    }
}


const walletTransationDetail = async (req, res) => {
    try {
        const { transactionId } = req.query;
        const findTransaction = await Wallet.findOne({ transactionId })
            .populate('userId')
            .populate('orderId')
            .lean();
            const orderItemId = findTransaction.orderItemId;
            
            
            
        res.render("transactionDetail", { title: "Transation Details", t:findTransaction,orderItemId })
    } catch (error) {
        console.log("error while loading wallet transatin detail", error.message)
    }
}

module.exports = {
    walletTransation,
    walletTransationDetail
}