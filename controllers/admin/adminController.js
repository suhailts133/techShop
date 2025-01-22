const env = require("dotenv").config();
const bcrypt = require("bcrypt");
const User = require("../../models/userSchema");


const adminLoadLogin = async (req, res) => {
    try {
        res.render("adminLogin")
    } catch (error) {
        console.log("error while login the admin login",error.message)
    }
}

const adminLogin = async (req, res) => {
    try {
        const {email, password} = req.body;
        
        const findAdmin = await User.findOne({email});
        if(!findAdmin){
            req.flash("error", "not admin");
            return res.redirect("/admin/")
        }
        if(!findAdmin.isAdmin){
            req.flash("error", "not admin");
            return res.redirect("/admin/")
        }
        const passwordMatch = await bcrypt.compare(password, findAdmin.password);
        if(!passwordMatch){
            req.flash("error", "not admin")
            return res.redirect("/admin/")
        }
        req.session.admin = {id:findAdmin._id, name:findAdmin.name};
        console.log("admin logging in",req.session.admin);
        res.redirect("/admin/dashboard");
    } catch (error) {
        console.log("error while logging in the admin",error.message)
    }
}

const loadDashboard = async (req, res) => {
    try {
        console.log("session from load dashboard", req.session.admin)
        res.render("dashboard", {admin: req.session.admin || null, title:"dashboard"})
    } catch (error) {
        console.log("error while loading admin dashboard",error.message);
    }
}


const logout = (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error("Error destroying session", err.message);
                return res.status(500).send("Error logging out");
            }
            res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");

            res.redirect("/admin/");
        });
    } catch (error) {
        console.log("error while logging out the user", error.message)
        res.redirect("/pageNotFound")
    }
};



module.exports = {
    adminLoadLogin,
    adminLogin,
    loadDashboard,
    logout
}