const express  = require("express");
const router = express.Router();

// controllers
const orderController = require("../controllers/admin/orderController.js");
const adminController = require("../controllers/admin/adminController.js")
const customerController = require("../controllers/admin/customerController.js")
const categoryController = require("../controllers/admin/categoryController.js")
const brandController = require("../controllers/admin/brandController.js")
const productController = require("../controllers/admin/productController.js")
const couponController = require("../controllers/admin/couponController.js")
const walletController = require("../controllers/admin/walletController.js")
const extrasContoller = require("../controllers/admin/extrasContoller.js")


// authentication middlewares
const {adminCheckAuth, adminCheckAuthLogin} = require("../middlewares/auth.js")
// multer 
const multer = require("multer");
const storage = require("../helpers/multer.js")
const uploadBrand = multer({storage:storage.storageForBrands});
const uploadProduct = multer({storage:storage.storageForProducts})


// login loading
router.get("/", adminCheckAuthLogin, adminController.adminLoadLogin);
router.post("/",adminCheckAuthLogin, adminController.adminLogin);

router.get("/dashboard", adminCheckAuth, adminController.loadDashboard)
router.get('/sales-report', adminCheckAuth,adminController.getSalesReport);
router.get("/best-selling", adminCheckAuth,extrasContoller.bestSelling)
router.get("/ledger-book",adminCheckAuth, extrasContoller.ledgerBook)

// customer routes
router.get("/users", adminCheckAuth, customerController.customerInfo)
router.get("/users/toggle",adminCheckAuth, customerController.custemorToggle)

// category routes

router.get("/categories",  adminCheckAuth, categoryController.categoryInfo) // displaying category data
router.get("/categories/add", adminCheckAuth, categoryController.loadAddCategory) // loadin the add category
router.post("/categories/add", adminCheckAuth, categoryController.addCategory) // addin the category
router.get("/categories/toggle", adminCheckAuth, categoryController.categoryToggle);  
router.get("/categories/edit", adminCheckAuth, categoryController.loadEditCategory);  
router.post("/categories/edit", adminCheckAuth, categoryController.editCategory);

// brands
router.get("/brands",  adminCheckAuth,brandController.brandInfo);
router.get("/brands/add", adminCheckAuth, brandController.loadAddBrandPage)
router.post("/brands/add", adminCheckAuth,uploadBrand.single("image"), brandController.addBrand)

router.get("/brands/toggle",adminCheckAuth, brandController.brandToggle)
router.get("/brands/edit", adminCheckAuth, brandController.loadEditBrand);
router.post("/brands/edit",adminCheckAuth,  uploadBrand.single("image"),brandController.editBrand);
// products
router.get("/products", adminCheckAuth, productController.productInfo);
router.get("/products/add" , adminCheckAuth, productController.loadAddProductPage);
router.post("/products/add", adminCheckAuth,  uploadProduct.array("images",3), productController.addProduct)
router.get("/products/edit" , adminCheckAuth, productController.editProductPage);
router.post("/products/edit",  adminCheckAuth, uploadProduct.array("images",3), productController.editProduct)
router.get("/products/toggle", adminCheckAuth, productController.productToggle)

// order Mangemnet;
router.get("/orders",adminCheckAuth, orderController.orderManagment);  
router.get("/orders/view",adminCheckAuth, orderController.orderDetails)
router.get("/orders/itemDetails", adminCheckAuth, orderController.itemDetails)
router.post("/orders/itemDetails/update", adminCheckAuth, orderController.updateItemStatus)  // to update the status of a single order item

router.get("/logout", adminController.logout)

// coupon 
router.get("/coupon", adminCheckAuth,couponController.allCoupons);
router.get("/coupon/add", adminCheckAuth,couponController.loadAddCoupon);
router.post("/coupon/add", adminCheckAuth, couponController.addCoupon);
router.get("/coupon/edit", adminCheckAuth, couponController.loadEditCoupon);
router.post("/coupon/edit", adminCheckAuth, couponController.editCoupon);
router.get("/coupon/activate", adminCheckAuth, couponController.toggleCouponStatus);
router.get("/coupon/deactivate",adminCheckAuth, couponController.toggleCouponStatus);
router.get("/coupon/delete",  adminCheckAuth, couponController.deleteCoupon);


// wallet 
router.get("/wallet",adminCheckAuth, walletController.walletTransation);
router.get("/wallet/walletDetails",adminCheckAuth, walletController.walletTransationDetail);

module.exports = router