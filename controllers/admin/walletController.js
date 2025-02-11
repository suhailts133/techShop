const User = require("../../models/userSchema.js")
const Wallet = require("../../models/walletSchema.js");


const walletTransation = async (req, res) => {
    try {
        const wallet = await Wallet.find()
            .populate("userId")
            .populate('orderId')
            .lean();
        console.log(wallet);
        res.render('allWallet', {
            title: "Wallet Managment",
            wallet
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