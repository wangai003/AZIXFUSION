const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Category = require('../models/Category');

async function populateProduct(item) {
    let productObj = null;
    let brandObj = null;
    let categoryObj = null;
    if (item.product) {
        productObj = await Product.findById(item.product);
        if (productObj) {
            // Populate brand
            if (productObj.brand) {
                brandObj = await Brand.findById(productObj.brand);
            }
            // Populate category
            if (productObj.category) {
                categoryObj = await Category.findById(productObj.category);
            }
            productObj = {
                ...productObj,
                price: Number(productObj.price),
                brand: brandObj ? { _id: brandObj._id, name: brandObj.name } : null,
                category: categoryObj ? { _id: categoryObj._id, name: categoryObj.name } : null,
            };
        }
    }
    // If product is missing, return null to filter out
    if (!productObj) return null;
    return {
        ...item,
        product: productObj,
    };
}

exports.create = async (req, res) => {
    try {
        // Only store user and product ID
        const created = await Wishlist.create({
            user: req.body.user,
            product: req.body.product,
            note: req.body.note || ''
        });
        res.status(201).json(created);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error adding to wishlist, please try again later' });
    }
};

exports.getByUserId = async (req, res) => {
    try {
        const { id } = req.params;
        const wishlistItems = await Wishlist.find({ user: id });
        const populatedWishlistItems = (await Promise.all(wishlistItems.map(populateProduct))).filter(Boolean);
        res.status(200).json(populatedWishlistItems);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error fetching wishlist, please try again later' });
    }
};

exports.deleteById = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Wishlist.deleteById(id);
        res.status(200).json(deleted);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error deleting wishlist item, please try again later' });
    }
};

exports.deleteByUserId = async (req, res) => {
    try {
        const { id } = req.params;
        await Wishlist.deleteMany({ user: id });
        res.sendStatus(204);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error clearing wishlist, please try again later' });
    }
};