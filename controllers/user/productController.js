const Product = require("../../models/productSchema.js")
const category = require("../../models/categorySchema.js")
const Cart = require("../../models/cartSchema.js")
const User = require("../../models/userSchema.js")

const getProductDetails = async (req, res) => {
    try {
        const productId = req.query.id; // Get product ID from query params
        
        // Fetch the product details, including the variants and category
        const product = await Product.findById(productId).populate('category');
        const relatedProducts = await Product.find({ 
            category: product.category._id, 
            _id: { $ne: product._id } // Exclude current product 
        }).limit(4);
        if (!product) {
            req.flash("error", "product not found");
            res.redirect("/");
        }

        // Send product details to the frontend (productDetails.ejs)
        res.render('productDetails', {
            product,
            relatedProducts,
            title:"product Details"
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};


const updateVariantDetails = async (req, res) => {
    try {
        const { productId, variantId } = req.body; // Get product and variant IDs from request body
        console.log("update variant productid",productId)
        console.log("update variant variantid",variantId)
        // Fetch the product by ID
        const product = await Product.findById(productId);
        
        if (!product) {
            return res.status(404).send('Product not found');
        }

        // Find the selected variant by its ID
        const variant = product.variants.id(variantId);
        console.log(variant)
        if (!variant) {
            return res.status(404).send('Variant not found');
        }

        // Return the updated variant details (price, quantity, etc.)
        res.json({
            salePrice: variant.salePrice,
            price: variant.price,
            quantity: variant.quantity,
            sizeStorage: variant.size,
        });
    } catch (error) {
        console.error("erro while updating",error.message);
        res.status(500).send('Server Error');
    }
};

const addToCart = async (req, res) => {
    try {
        const { productId, variantId, quantity, productImage } = req.body;

        // Check if the user is logged in via session
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'please login first. redirecting you in 2 sec',
                redirectTo: '/login'  // Sending the redirect URL in the response
            });
        }

        const { id } = req.session.user;

        // Validate input fields
        if (!productId || !variantId || !quantity || !productImage) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required.'
            });
        }

        // Find the user from the database
        const user = await User.findById(id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'please login first. redirecting you in 2 sec',
                redirectTo: '/login'  // Sending the redirect URL in the response
            });
        }

        // Find the product and variant from the database
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found.'
            });
        }

        const variant = product.variants.id(variantId);
        if (!variant) {
            return res.status(404).json({
                success: false,
                message: 'Variant not found.'
            });
        }

        // Calculate total price for the item based on quantity
        const totalPrice = variant.salePrice * quantity;

        // Check if the user already has a cart
        let cart = await Cart.findOne({ userId: user._id });

        if (!cart) {
            // Create a new cart if not found
            cart = new Cart({
                userId: user._id,
                items: [],
                totalAmount: 0,
            });
            await cart.save();
            user.cart = cart._id
            await user.save();;
        }

        // Check if the product with the same variant is already in the cart
        const existingItemIndex = cart.items.findIndex(
            (item) => item.productId.toString() === productId && item.variantId === variantId
        );

        if (existingItemIndex > -1) {
            // Update the existing cart item if it's already in the cart
            cart.items[existingItemIndex].quantity += quantity;
            cart.items[existingItemIndex].totalPrice = cart.items[existingItemIndex].quantity * variant.salePrice;
        } else {
            // Add the new product to the cart
            cart.items.push({
                productId: productId,
                variantId: variantId,
                color: variant.color,
                size: variant.size,
                quantity: quantity,
                price: variant.salePrice,
                productImage: productImage,
                totalPrice: totalPrice,
            });
        }

        // Recalculate the total amount of the cart
        cart.totalAmount = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);

        // Save the cart
        await cart.save();

        // Respond with success message and the updated cart
        return res.status(200).json({
            success: true,
            message: 'Product added to cart successfully! redirecting you to cart in 2 sec',
            redirectTo: '/profile/cart'

        });

    } catch (error) {
        console.error('Error in /addToCart:', error.message);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while adding the product to the cart. Please try again later.',
        });
    }
};

module.exports = {
    getProductDetails,
    updateVariantDetails,
    addToCart
}