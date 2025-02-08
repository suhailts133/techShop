const Product = require("../../models/productSchema.js")
const Cart = require("../../models/cartSchema.js")
const User = require("../../models/userSchema.js")

const getProductDetails = async (req, res) => {
    try {
        const productId = req.query.id;


        const product = await Product.findById(productId)
            .populate('category')
            .populate({
                path: 'reviews',
                populate: {
                    path: 'user',
                    select: 'name email'
                }
            })
            .lean();

        if (!product) {
            req.flash("error", "Product not found");
            return res.redirect("/");
        }


        const applicableOffer = product.productOffer > 0
            ? product.productOffer
            : product.category?.categoryOffer || 0;


        product.variants = product.variants.map(variant => ({
            ...variant,
            discountedPrice: Math.floor((variant.salePrice * (100 - applicableOffer) / 100)),
            applicableOffer: parseFloat(((variant.price - variant.salePrice) / variant.price) * 100).toFixed(2)
        }));


        const relatedProducts = await Product.find({
            category: product.category._id,
            _id: { $ne: product._id }
        })
            .populate('category')
            .lean();

        const processedRelated = relatedProducts.map(prod => {
            const offer = prod.productOffer > 0
                ? prod.productOffer
                : prod.category?.categoryOffer || 0;

            return {
                ...prod,
                variants: prod.variants.map(v => ({
                    ...v,
                    discountedPrice: (v.salePrice * (100 - offer) / 100).toFixed(2),
                    applicableOffer: parseFloat(((v.price - v.salePrice) / v.price) * 100).toFixed(2)
                }))
            };
        });

        res.render('productDetails', {
            product,
            relatedProducts: processedRelated,
            title: "Product Details"
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};
const updateVariantDetails = async (req, res) => {
    try {
        const { productId, variantId } = req.body;

        // Get product with populated category
        const product = await Product.findById(productId)
            .populate('category');

        if (!product) return res.status(404).send('Product not found');

        const variant = product.variants.id(variantId);
        if (!variant) return res.status(404).send('Variant not found');

        // Calculate applicable offer
        const applicableOffer = product.productOffer > 0
            ? product.productOffer
            : product.category?.categoryOffer || 0;

        // Calculate discounted price
        const discountedPrice = Math.floor((variant.salePrice * (100 - applicableOffer) / 100))

        res.json({
            salePrice: discountedPrice, // Send discounted price
            originalPrice: variant.price.toFixed(2),
            quantity: variant.quantity,
            size: variant.size,
            applicableOffer
        });
    } catch (error) {
        console.error("Error in updateVariantDetails:", error.message);
        res.status(500).send('Server Error');
    }
};

const addToCart = async (req, res) => {
    try {
        const { productId, variantId, quantity, productImage } = req.body;
        // console.log(quantity);

        // Check if user is logged in
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Please login first. Redirecting you in 2 sec',
                redirectTo: '/login'
            });
        }

        const { id } = req.session.user;

        // Validate required fields
        if (!productId || !variantId || !quantity || !productImage) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required.'
            });
        }

        // Find the user
        const user = await User.findById(id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Please login first. Redirecting you in 2 sec',
                redirectTo: '/login'
            });
        }

        // Find the product and populate the category
        const product = await Product.findById(productId).populate('category');
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found.'
            });
        }

        // Find the variant
        const variant = product.variants.id(variantId);
        if (!variant) {
            return res.status(404).json({
                success: false,
                message: 'Variant not found.'
            });
        }

        // Check if the variant is in stock
        if (variant.quantity <= 0) {
            return res.status(404).json({
                success: false,
                message: 'Out of Stock'
            });
        }

        // Calculate the applicable offer
        const applicableOffer = product.productOffer > 0
            ? product.productOffer
            : product.category?.categoryOffer || 0;

        // Calculate the discounted price
        const discountedPrice = Math.floor((variant.salePrice * (100 - applicableOffer) / 100));

        // Calculate the total price for the item
        const totalPrice = discountedPrice * quantity;

        // Find or create the user's cart
        let cart = await Cart.findOne({ userId: user._id });
        if (!cart) {
            cart = new Cart({
                userId: user._id,
                items: [],
                totalAmount: 0,
            });
            await cart.save();
            user.cart = cart._id;
            await user.save();
        }

        // Check if the item already exists in the cart
        const existingItemIndex = cart.items.findIndex(
            (item) => item.productId.toString() === productId && item.variantId === variantId
        );

        if (existingItemIndex > -1) {
            return res.status(404).json({
                success: true,
                message: 'Itme already in the cart',
                redirectTo: '/profile/cart'

            });
        } else {
            cart.items.push({
                productId: productId,
                variantId: variantId,
                color: variant.color,
                size: variant.size,
                quantity: quantity,
                price: discountedPrice,
                productImage: productImage,
                totalPrice: totalPrice,
                applicableOffer: applicableOffer
            });
        }

        // Recalculate the total amount of the cart
        cart.totalAmount = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);

        // Save the cart
        await cart.save();


        // Respond with success message and the updated cart
        return res.status(200).json({
            success: true,
            message: 'Product added to cart successfully! Redirecting you to cart in 2 sec',
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