/*
 displaying all user data
 searching for particular user using name or email
 listing, unlisting, 
 */

// schema
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


// brand islist toggleing
const custemorToggle = async (req, res) => {
    try {
        let { id } = req.query; // id of the brand
        const customerStatus = await User.findById(id);
        let flag = false;  // by default the user is already unblocked so flag as false
        if(customerStatus.isBlocked){ //if the user is blocked
            customerStatus.isBlocked=false; // make the user unblock
            flag=false  // then set the flag as false
            await customerStatus.save()
        }else{ //  if the user is alrady blocked
            customerStatus.isBlocked=true; //  make the user as blocked by setting isblockd as true 
            flag=true; // set the flag as true because user is blocked
            await customerStatus.save();
        }
        res.json({ success: true, isBlocked: flag });  // return the json response with flag 
        
       
    } catch (error) {
        console.log("Error while listing category", error.message);
    }
};


module.exports = {
    customerInfo,
    custemorToggle
}