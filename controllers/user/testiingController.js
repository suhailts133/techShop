const fuzzy = require("fuzzy");
const Product = require("../../models/productSchema.js");

const loadpage = async (req, res) => {
    try {
        res.render("test")
    } catch (error) {
        console.log("error while loadin the page",error.message)
    }
}



const textingFuzzy = async (req, res) => {
    try {
        const {text} = req.body;
        console.log(text)
    const products = await Product.find();
    var options = {
        extract: function(el) {return el.productName}
    };
    var results = fuzzy.filter(text, products, options);
    var matches = results.map(function(el) {return el.string});
    console.log(matches)
    const allDetails = await Product.find({productName:{$in:matches}},{productName:1, _id:1})
    res.json(allDetails)
    } catch (error) {
        console.log("error while filtering",error.message)
    }
}

const product = async (req, res) => {
    try {
        const {id} = req.query;
        console.log(id)
        const findProudct = await Product.findById(id);
        console.log(findProudct);
        res.render("test2", {p:findProudct})
    } catch (error) {
        console.log("error while seeing product",error.message)
    }
}

module.exports = {
    textingFuzzy,
    loadpage,
    product,
}