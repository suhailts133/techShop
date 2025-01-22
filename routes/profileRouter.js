const express  = require("express");
const router = express.Router();

const  profileController = require("../controllers/user/profileController.js")

router.get("/", profileController.loadProfilePage);
// edit profile page for username and phone
router.get("/edit", profileController.loadEditProfilePage);
router.post("/edit", profileController.editProfilePage),
// change password
router.get("/loadChangePasswordCheck", profileController.loadChangePasswordCheck); // checker
router.post("/loadChangePasswordCheck", profileController.changePasswordCheck); // checker post
// real change password
router.get("/changePassword", profileController.loadChangePasswordForm);
router.post("/changePassword", profileController.changePassword);
// address
router.get("/address", profileController.loadAddressPage);
router.get("/address/add", profileController.loadAddressAddPage); // add address
router.post("/address/add", profileController.addAddress);
router.get("/address/delete", profileController.deleteAddress); // delete address
router.get("/address/edit", profileController.loadAddressEditPage)
router.post("/address/edit", profileController.editAddress);


module.exports = router