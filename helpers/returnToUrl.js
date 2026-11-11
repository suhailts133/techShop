const captureReturnTo = (req, res, next) => {
    const returnTo = req.query.returnTo;
    if (returnTo) {
        req.session.returnTo = returnTo;
    }
    next();
};


const resetReturnTo = (req, res, next) => {
    if (!req.query.returnTo) delete req.session.returnTo;
    next();
};

module.exports = { captureReturnTo, resetReturnTo };