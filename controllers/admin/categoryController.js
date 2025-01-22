const Category = require("../../models/categorySchema.js");


// displaying customer details
const categoryInfo = async (req, res) => {
    try {
        let search = "";
        if (req.query.search) {  // to search for a custemor if admin have searched for anything it will be in the search field 
            search = req.query.search;
        }
        // pagination
        const page = parseInt(req.query.page) || 1;
        const limit = 5;   // number of documnet in a single page
        const skip = (page - 1) * limit;  // how much to skip since 5 is the limit in the first page 0 , then 5, 10, 15

        const categoryData = await Category.find({
            $or: [   // search for a user 
                { name: { $regex: ".*" + search + ".*", $options: "i" } }, // 
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

// block a  customer
const categoryUnlist = async (req, res) => {
    try {
        let { id } = req.query;  // id of the user from the query
        await Category.updateOne({ _id: id }, { $set: { isListed: false } });
        res.redirect(`/admin/categories/?search=${req.query.search || ''}&page=${req.query.page || 1}`);
    } catch (error) {
        console.log("Error while unlising category", error.message);
    }
};

const categoryList = async (req, res) => {
    try {
        let { id } = req.query;
        await Category.updateOne({ _id: id }, { $set: { isListed: true } });


        res.redirect(`/admin/categories/?search=${req.query.search || ''}&page=${req.query.page || 1}`);
    } catch (error) {
        console.log("Error while listing category", error.message);
    }
};

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

const addCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
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

        const loweredName = trimmedName.toLowerCase();

        const existingCategory = await Category.findOne({ name: loweredName });
        if (existingCategory) {
            req.flash("error", "Category already exists");
            return res.redirect("/admin/categories/add");
        }

        const newCategory = new Category({
            name: loweredName,
            description: trimmedDescription
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

const loadEditCategory = async (req, res) => {
    const {id} = req.query;
    const categoryData = await Category.findById(id);
    if(!categoryData){
        req.flash("error", "category did not find");
        res.redirect("/admin/categories")
    }
    res.render("editCategory", {title:"edit category", categoryData})
}

const editCategory = async (req, res) => {
    try {
        const { id } = req.query;
        const { name, description } = req.body;
        if (!name.trim() || !description.trim()) {
            req.flash("error", "name or description is empty")
            return res.redirect(`/admin/categories/edit?id=${id}`);
        }
        const existingCategory = await Category.findOne({
            name: name.trim(),
            _id: { $ne: id },
        });
        if (existingCategory) {
            req.flash("error", "category already exists")
            return res.redirect(`/admin/categories/edit?id=${id}` );
        }
        await Category.findByIdAndUpdate(id, {
            name: name.trim(),
            description: description.trim(),
        });
        req.flash("success", "added new category")
        res.redirect('/admin/categories');
    } catch (error) {
        console.error("Error editing category:", error);
        res.status(500).send("An error occurred while editing the category.");
    }
};




// const editCategory = async (req, res) => {
//     const {id} = req.query;
//     const {}
// }

module.exports = {
    categoryInfo,
    categoryList,
    categoryUnlist,
    loadAddCategory,
    addCategory,
    loadEditCategory,
    editCategory
}

const string = "hello";


