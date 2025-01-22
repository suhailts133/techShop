const multer = require("multer")
const path = require("path");

const storageForBrands = multer.diskStorage({
    destination:(req, file, cb)=> {
        cb(null, path.join(__dirname, "../public/uploads/brands"))
    },
    filename:(req, file, cb) => {
        cb(null, Date.now()+"-"+file.originalname)
    }
})
const storageForProducts = multer.diskStorage({
    destination:(req, file, cb)=> {
        cb(null, path.join(__dirname, "../public/uploads/products"))
    },
    filename:(req, file, cb) => {
        cb(null, Date.now()+"-"+file.originalname)
    }
})

module.exports = {
    storageForBrands,storageForProducts
}