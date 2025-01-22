const User = require("../../models/userSchema.js");
const Address = require("../../models/addressSchema.js");
const bcrypt = require("bcrypt");
const { securePassword } = require("../../helpers/userAuthendication.js") // authentication helper

const loadProfilePage = async (req, res) => {
    try {
        res.render("profilePage", {title: "profilePage", user: req.session.user || null})
    } catch (error) {
        console.log("err while loading profile page",error.message)
    }
}

const loadEditProfilePage = async (req, res) => {
    try {
        res.render("editProfile", {title:"edit profile"})
    } catch (error) {
        console.log("error while loading edit profile page",error.message)
    }
}

const editProfilePage = async (req, res) => {
    try {
        const {name, phone} = req.body;
        const {id} = req.session.user;

        const updatedUser = await User.findByIdAndUpdate(id, {name, phone});
        req.session.user.name = name 
        res.redirect("/profile/")
    } catch (error) {
        console.log("error while editing profile",error.message)
    }
}

const loadChangePasswordCheck = async (req, res) => {
    try {
        res.render("changePasswordCheck", {title:"change password checker"})
    } catch (error) {
        console.log("error while loading change password checker",error.message)
    }
}

const changePasswordCheck = async (req, res) => {
    try {
        const {password} = req.body;
        const {id} = req.session.user;
        const findUser = await User.findById(id);
        const passwordMatch = await bcrypt.compare(password, findUser.password);
        if(!passwordMatch){
            req.flash("error", "wrong password click forget password if you dont remember the password");
            return res.redirect("/profile/loadChangePasswordCheck")
        }
        res.redirect("/profile/changePassword")
    } catch (error) {
        console.log("error while checking change password",error.message)
    }
}

const loadChangePasswordForm = async (req, res) => {
    try {
        res.render("changePasswordForm",{title:"change password"})
    } catch (error) {
        console.log("error while loading change password form",error.message)
    }
}

const changePassword = async (req, res) => {
    try {
        const {id} = req.session.user;
        const {password, confirmPassword} = req.body;
        if(password !== confirmPassword){
            req.flash("error", "password must match");
            return res.redirect("/profile/changePassword");
        }
        const passwordHash = await securePassword(password);  // hash the password using secure fn
        const updatePassword = await User.findByIdAndUpdate(id, {password:passwordHash});
        res.redirect("/logout")
        
    } catch (error) {
     console.log("Error while changeing password",error.message)   
    }
}

const loadAddressPage = async (req, res) => {
    try {
        const {id} = req.session.user;
        const findUser = await User.findById(id).populate("address");
        console.log(findUser)
        res.render("address", {title:"Address", user:findUser})
    } catch (error) {
        console.log("error while loading address page",error.message)
    }
}

const loadAddressAddPage = async (req, res) => {
    try {
        res.render("add-address",{title:"Add Address"})
    } catch (error) {
        console.log("error while loading add address page",error.message)
    }
}



const addAddress = async (req, res) => {
    try {
        const { id } = req.session.user;
        const findUser = await User.findById(id);
        if (findUser.address.length >= 6) {
            req.flash("error", "You already have too many addresses");
            return res.redirect("/profile/address")
        }
        const newAddress = new Address(req.body.address);
        findUser.address.push(newAddress);
        await newAddress.save();
        await findUser.save();
        res.redirect("/profile/address");
    } catch (error) {
        console.log("error while adding address",error.message)
    }
}



const deleteAddress = async (req, res) => {
    try {
        const {id} = req.session.user;
        const {addressId} = req.query;
        await User.findByIdAndUpdate(id, {$pull:{address:addressId}});
        await Address.findByIdAndDelete(addressId);
        res.redirect("/profile/address")
    } catch (error) {
        console.log("error while deleteing an address",error.message)
    }
}
const loadAddressEditPage = async (req, res) => {
    try {
        const {id} = req.session.user;
    const {addressId} = req.query;
    const findUser = await User.findById(id);
    if(!findUser){
        req.flash("error", "user not found");
        return res.redirect("/profile/address")
    }
    const address = await Address.findById(addressId);
    if(!address){
        req.flash("error", "address not found");
        return res.redirect("/profile/address")
    }

    res.render("editAddress", {
        title:"Edit Address",
        address:address
    })
    } catch (error) {
        console.log("error while loading the edit address page",error.message)
    }
}

const editAddress = async (req, res) => {
    try {
        const {id} = req.session.user
        const {addressId} = req.query;
        const findUser = await User.findById(id);
        if(!findUser){
            req.flash("error", "user not found");
            return res.redirect("/profile/address")
        }

        const updateAddress = await Address.findByIdAndUpdate(addressId, req.body.address, {new:true});
        if(!updateAddress){
            req.flash("error", "updation failed");
            return res.redirect("/profile/address");
        }

        res.redirect("/profile/address")
    } catch (error) {
        console.log("error while editing address",error.message)
    }
}
module.exports = {
    loadProfilePage,
    loadEditProfilePage,
    editProfilePage,
    loadChangePasswordCheck,
    changePasswordCheck,
    loadChangePasswordForm,
    changePassword,
    loadAddressPage,
    loadAddressAddPage,
    addAddress,
    deleteAddress,
    loadAddressEditPage,
    editAddress
}