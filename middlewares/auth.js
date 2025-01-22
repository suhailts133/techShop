const checkAuth = (req, res, next) => {
    if (req.session.user) {
        return res.redirect("/");
    }
    next()
};


const adminCheckAuth = (req, res, next) => {
    if (!req.session.admin) {
        req.flash("error", "you must be logged in to access the admin area")
        return res.redirect("/admin/");
    }
    next()
};

const adminCheckAuthLogin = (req, res, next) => {
    // Check if the admin session exists and the current route is the login page
    if (req.session.admin && req.originalUrl === "/admin/") {
        // If logged in, redirect to the dashboard instead of the login page
        return res.redirect("/admin/dashboard");
    }
    // Continue if the user is not logged in, or trying to access other routes
    next();
};




module.exports = {
    checkAuth,
    adminCheckAuth,
    adminCheckAuthLogin
    
    
}