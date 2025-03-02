/*
 displaying category data
 adding new category
 searching for particular category
editing , listing, unlisting
 */

// external files
const Category = require("../../models/categorySchema.js");


// displaying categroy details
const categoryInfo = async (req, res) => {
    try {
        // for searching for particular data
        let search = "";
        if (req.query.search) {  // if there is a search query reassign the data to search  
            search = req.query.search;
        }
        // pagination
        const page = parseInt(req.query.page) || 1;
        const limit = 5;   // number of documnet in a single page
        const skip = (page - 1) * limit;  // how much to skip since 5 is the limit in the first page 0 , then 5, 10, 15

        const categoryData = await Category.find({
            $or: [   // find all category if the search is empty 
            // else only the searched category
                { name: { $regex: ".*" + search + ".*", $options: "i" } }, 
            ]
        })
            .skip(skip)
            .limit(limit)
            .sort({createdAt:-1})


        const totalCount = await Category.countDocuments();   // for counting the document
        const totalPages = Math.ceil(totalCount / limit);   // finding the total pages required

        res.render("category", {
            admin: req.session.admin,
            title: "category",
            categoryData,
            search,
            page,
            totalPages
        });
    } catch (error) {
        console.log("Error while loading category info", error.message);
    }
};

// brand islist toggleing
const categoryToggle = async (req, res) => {
    try {
        let { id } = req.query; // id of the brand
        const categoryStatus = await Category.findById(id);
        let flag = true;  // by default the item is already listed
        if(categoryStatus.isListed){ //if the item is listed 
            categoryStatus.isListed=false; // make the item unlist
            flag=false  // then set the flag as false
            await categoryStatus.save()
        }else{ //  if the item is already unlisted make it listed
            categoryStatus.isListed=true; //  make islistd as true 
            flag=true; // set the flag as true since the item is listed
            await categoryStatus.save();
        }
        res.json({ success: true, isListed: flag });  // return the json response with flag 

    } catch (error) {
        console.log("Error while listing category", error.message);
    }
};



// // block a  category
// const categoryUnlist = async (req, res) => {
//     try {
//         let { id } = req.query;  // id of the category from the query
//         await Category.updateOne({ _id: id }, { $set: { isListed: false } }); // unlist it by setting it false
//         res.redirect(`/admin/categories/?search=${req.query.search || ''}&page=${req.query.page || 1}`);
//     } catch (error) {
//         console.log("Error while unlising category", error.message);
//     }
// };


// // lisitng the category
// const categoryList = async (req, res) => {
//     try {
//         let { id } = req.query;  // id of the category from the query
//         await Category.updateOne({ _id: id }, { $set: { isListed: true } });  // unlist it by setting it true
//         res.redirect(`/admin/categories/?search=${req.query.search || ''}&page=${req.query.page || 1}`);
//     } catch (error) {
//         console.log("Error while listing category", error.message);
//     }
// };


// load the new category page
const loadAddCategory = async (req, res) => {
    try {
        res.render("addCategory",
            {
                title: "add new category"
            })
    } catch (error) {
        console.log("error while loading add category page", error.message)
    }
}


// add new category page
const addCategory = async (req, res) => {
    try {
        // reformat the data by trimming and maeking it into lower case and other validation 
        const { name, description,categoryOffer } = req.body;
        const trimmedName = name?.trim() || "";
        const trimmedDescription = description?.trim() || "";

        if (!trimmedName || !trimmedDescription) {
            req.flash("error", "Name or description cannot be empty");
            return res.redirect("/admin/categories/add");
        }
       
        if (trimmedName.length < 3 || trimmedDescription.length < 3) {
            req.flash("error", "Name and description must be at least 3 characters long");
            return res.redirect("/admin/categories/add");
        }
        if(categoryOffer < 0){
            req.flash("error", "category offer must be either zero or a positive number")
            return res.redirect("/admin/categories/add");
        }

        const loweredName = trimmedName.toLowerCase();
// check if the category already exists
        const existingCategory = await Category.findOne({ name: loweredName }); 
        if (existingCategory) {
            req.flash("error", "Category already exists");
            return res.redirect("/admin/categories/add");
        }
// add the new category
        const newCategory = new Category({
            name: loweredName,
            description: trimmedDescription,
            categoryOffer: categoryOffer
        });
        await newCategory.save();

        req.flash("success", "New category added successfully");
        res.redirect("/admin/categories");
    } catch (error) {
        console.error("Error while adding a new category:", error.message);
        req.flash("error", "An unexpected error occurred. Please try again.");
        res.redirect("/admin/categories/add");
    }
};


// load the edit category page
const loadEditCategory = async (req, res) => {
    const {id} = req.query;   // id of the category 
    const categoryData = await Category.findById(id); // data fetching
    if(!categoryData){
        req.flash("error", "category did not find");
        res.redirect("/admin/categories")
    }
    res.render("editCategory", {title:"edit category", categoryData})
}


// edit catefory
const editCategory = async (req, res) => {
    try {
        // reformating the data
        const { id } = req.query;
        const { name, description, categoryOffer  } = req.body;
        if (!name.trim() || !description.trim()) {
            req.flash("error", "name or description is empty")
            return res.redirect(`/admin/categories/edit?id=${id}`);
        }
        // check if the category already exists
        const existingCategory = await Category.findOne({
            name: name.trim().toLowerCase(),
            _id: { $ne: id },
        });
        // if the category already exists show error
        if (existingCategory) {
            req.flash("error", "category already exists")
            return res.redirect(`/admin/categories/edit?id=${id}` );
        }
        // check the category offer is less than zero
        if(categoryOffer < 0){
            req.flash("error", "category offer must be either zero or a positive number")
            return res.redirect(`/admin/categories/edit?id=${id}` );
        }
        // add the updated category
        await Category.findByIdAndUpdate(id, {
            name: name.trim().toLowerCase(),
            description: description.trim(),
            categoryOffer: categoryOffer
        });
        req.flash("success", "added new category")
        res.redirect('/admin/categories');
    } catch (error) {
        console.error("Error editing category:", error);
        res.status(500).send("An error occurred while editing the category.");
    }
};





module.exports = {
    categoryInfo,
    categoryToggle,
    loadAddCategory,
    addCategory,
    loadEditCategory,
    editCategory
}

const string = "hello";


