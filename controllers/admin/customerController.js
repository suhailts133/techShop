const User = require("../../models/userSchema");


// displaying customer details
const customerInfo = async (req, res) => {
    try {
        let search = "";
        if (req.query.search) {  // to search for a custemor if admin have searched for anything it will be in the search field 
            search = req.query.search;
        }
        // pagination
        const page = parseInt(req.query.page) || 1;
        const limit = 5;   // number of documnet in a single page
        const skip = (page - 1) * limit;  // how much to skip since 5 is the limit in the first page 0 , then 5, 10, 15

        const userData = await User.find({
            isAdmin: false,  // find the users who are not admin
            $or: [   // search for a user 
                { name: { $regex: ".*" + search + ".*", $options: "i" } }, // 
                { email: { $regex: ".*" + search + ".*", $options: "i" } }
            ]
        })
            .skip(skip)
            .limit(limit)
            .sort({createdOn:-1});


        const totalCount = await User.countDocuments({ isAdmin: false });   // for counting the document
        const totalPages = Math.ceil(totalCount / limit);   // finding the total pages required

        res.render("customers", {  
            admin: req.session.admin,
            title: "Customers",
            userData,
            search,
            page,
            totalPages
        });
    } catch (error) {
        console.log("Error while loading customer info", error.message);
    }
};


// block a  customer
const customerBlocked = async (req, res) => {
    try {
        let { id } = req.query;  // id of the user from the query
        await User.updateOne({ _id: id }, { $set: { isBlocked: true } });  // update the specific document
        res.redirect(`/admin/users/?search=${req.query.search || ''}&page=${req.query.page || 1}`);  
    } catch (error) {
        console.log("Error while blocking user", error.message);
    }
};

const customerUnblock = async (req, res) => {
    try {
        let { id } = req.query;
        await User.updateOne({ _id: id }, { $set: { isBlocked: false } });


        res.redirect(`/admin/users/?search=${req.query.search || ''}&page=${req.query.page || 1}`);
    } catch (error) {
        console.log("Error while unblocking user", error.message);
    }
};

module.exports = {
    customerInfo,
    customerBlocked,
    customerUnblock
}