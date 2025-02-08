const checkAuth = (req, res, next) => {
    if (!req.session.user) {
        if (req.xhr || req.headers.accept.includes('application/json')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Check if it's a fetch request and return JSON instead of redirecting
        if (req.headers["sec-fetch-mode"] === "cors") {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        return res.redirect("/login"); // Normal redirect for browser requests
    }
    next();
};
const checkAuthUserLogin = (req, res, next) => {
    if (req.session.user) {
        return res.redirect("/");
    }
    next()
};
const checkAuthUserSignUp = (req, res, next) => {
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
   
    if (req.session.admin) {
      
        return res.redirect("/admin/dashboard");
    }
  
    next();
};



module.exports = {
    checkAuth,
    adminCheckAuth,
    adminCheckAuthLogin,
    checkAuthUserLogin,
    checkAuthUserSignUp,

    
    
}