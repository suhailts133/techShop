const Product = require("../../models/productSchema.js")
const Cart = require("../../models/cartSchema.js")
const User = require("../../models/userSchema.js")
const Wishlist = require("../../models/wishlishSchema.js")

// constants
const ERROR_MESSAGES = require("../../constants/userErrorMessages.js")
const SUCCESS_MESSAGES = require("../../constants/userSuccessMessages.js")
const HTTP_STATUS = require("../../constants/httpStatusCode.js")

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
            req.flash("error", ERROR_MESSAGES.PRODUCT_NOT_FOUND);
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

        // Get related products
        const relatedProducts = await Product.find({
            category: product.category._id,
            _id: { $ne: product._id }
        })
            .populate('category')
            .limit(4)
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
        let wishlistItems = [];
        let cartQuantity = 0;
        if (req.session.user) {
            const userWishlist = await Wishlist.findOne({ userId: req.session.user.id }).lean();
            wishlistItems = userWishlist ? userWishlist.items.map(item => ({
                productId: item.productId.toString(),
                variantId: item.variantId.toString()
            })) : [];
            const cartItems = await Cart.findOne({userId:req.session.user.id}).lean()
            cartQuantity = cartItems?.items?.length || 0
        }
       
        res.render('productDetails', {
            product,
            relatedProducts: processedRelated,
            wishlistItems,
            title: "Product Details",
            cartQuantity
        });
    } catch (error) {
        console.error(error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(ERROR_MESSAGES.SERVER_ERROR);
    }
};




const updateVariantDetails = async (req, res) => {
    try {
        const { productId, variantId } = req.body;

        const product = await Product.findById(productId)
            .populate('category');

        if (!product) return res.status(HTTP_STATUS.NOT_FOUND).send(ERROR_MESSAGES.PRODUCT_NOT_FOUND);

        const variant = product.variants.id(variantId);
        if (!variant) return res.status(HTTP_STATUS.NOT_FOUND).send(ERROR_MESSAGES.VARIANT_NOT_FOUND);

        const applicableOffer = product.productOffer > 0
            ? product.productOffer
            : product.category?.categoryOffer || 0;
            const offer = parseFloat(((variant.price - variant.salePrice) / variant.price) * 100).toFixed(2)


        const discountedPrice = Math.floor((variant.salePrice * (100 - applicableOffer) / 100))

        res.json({
            salePrice: discountedPrice, 
            originalPrice: variant.price.toFixed(2),
            quantity: variant.quantity,
            size: variant.size,
            applicableOffer:offer
        });
    } catch (error) {
        console.error("Error in updateVariantDetails:", error.message);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(ERROR_MESSAGES.SERVER_ERROR);
    }
};

const addToCart = async (req, res) => {
    try {
        const { productId, variantId, quantity, productImage } = req.body;
        if (!req.session.user) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: ERROR_MESSAGES.REDIRECT,
                redirectTo: '/login'
            });
        }

        const { id } = req.session.user;

        // Validate required fields
        if (!productId || !variantId || !quantity || !productImage) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: ERROR_MESSAGES.FIELDS_REQUIRED
            });
        }

        // Find the user
        const user = await User.findById(id);
        if (!user) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: ERROR_MESSAGES.REDIRECT,
                redirectTo: '/login'
            });
        }

        // Find the product and populate the category
        const product = await Product.findById(productId).populate('category');
        if (!product) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: ERROR_MESSAGES.PRODUCT_NOT_FOUND
            });
        }

        // Find the variant
        const variant = product.variants.id(variantId);
        if (!variant) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: ERROR_MESSAGES.VARIANT_NOT_FOUND
            });
        }

        // Check if the variant is in stock
        if (variant.quantity <= 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: ERROR_MESSAGES.OUT_OF_STOCK
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
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: true,
                message: SUCCESS_MESSAGES.ITEM_EXISTS,
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
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: SUCCESS_MESSAGES.CART_ADD,
            redirectTo: '/profile/cart'
        });

    } catch (error) {
        console.error('Error in /addToCart:', error.message);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.CART_ADD,
        });
    }
};

module.exports = {
    getProductDetails,
    updateVariantDetails,
    addToCart
}