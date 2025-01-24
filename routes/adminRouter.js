const express  = require("express");
const router = express.Router();

// controllers
const orderController = require("../controllers/admin/orderController.js");
const adminController = require("../controllers/admin/adminController.js")
const customerController = require("../controllers/admin/customerController.js")
const categoryController = require("../controllers/admin/categoryController.js")
const brandController = require("../controllers/admin/brandController.js")
const productController = require("../controllers/admin/productController.js")
// authentication middlewares
const {adminCheckAuth, adminCheckAuthLogin} = require("../middlewares/auth.js")
// multer 
const multer = require("multer");
const storage = require("../helpers/multer.js")
const uploadBrand = multer({storage:storage.storageForBrands});
const uploadProduct = multer({storage:storage.storageForProducts})


// login loading
router.get("/", adminCheckAuthLogin, adminController.adminLoadLogin);
router.post("/", adminController.adminLogin);

router.get("/dashboard", adminCheckAuth, adminController.loadDashboard)

// customer routes
router.get("/users", adminCheckAuth, customerController.customerInfo)
router.get("/users/blockCustomer",adminCheckAuth, customerController.customerBlocked)
router.get("/users/unBlockCustomer",adminCheckAuth, customerController.customerUnblock)

// category routes

router.get("/categories",  categoryController.categoryInfo) // displaying category data
router.get("/categories/add",  categoryController.loadAddCategory) // loadin the add category
router.post("/categories/add", categoryController.addCategory) // addin the category
router.get("/categories/unlist", categoryController.categoryUnlist)  // unlist a category
router.get("/categories/list",  categoryController.categoryList)  // list a category
router.get("/categories/edit",  categoryController.loadEditCategory);
router.post("/categories/edit",  categoryController.editCategory);

// brands
router.get("/brands",  brandController.brandInfo);
router.get("/brands/add",  brandController.loadAddBrandPage)
router.post("/brands/add", uploadBrand.single("image"), brandController.addBrand)
router.get("/brands/list", brandController.brandList)
router.get("/brands/unlist", brandController.brandUnlist)
router.get("/brands/edit",  brandController.loadEditBrand);
router.post("/brands/edit",  uploadBrand.single("image"),brandController.editBrand);
// products
router.get("/products", productController.productInfo);
router.get("/products/add" , productController.loadAddProductPage);
router.post("/products/add",   uploadProduct.array("images",3), productController.addProduct)
router.get("/products/edit" ,  productController.editProductPage);
router.post("/products/edit", uploadProduct.array("images",3), productController.editProduct)
router.get("/products/unblock", productController.unblockProduct)
router.get("/products/block",  productController.blockProduct)

// order Mangemnet;
router.get("/orders", orderController.orderManagment);
router.get("/orders/view", orderController.orderDetails)
router.post("/orders/view/update", orderController.updateStatus)

router.get("/logout", adminController.logout)

module.exports = router