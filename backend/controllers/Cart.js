const Cart = require('../models/Cart');
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
                price: Number(productObj.price), // Ensure price is a number
                brand: brandObj ? { _id: brandObj._id, name: brandObj.name } : null,
                category: categoryObj ? { _id: categoryObj._id, name: categoryObj.name } : null,
            };
        }
    }
    return {
        ...item,
        quantity: Number(item.quantity), // Ensure quantity is a number
        product: productObj,
    };
}

exports.create = async (req, res) => {
    try {
        const created = await Cart.create({
            ...req.body,
            quantity: Number(req.body.quantity) // Ensure quantity is a number
        });
        // Populate product, brand, and category for the response
        const populated = await populateProduct(created);
        res.status(201).json(populated);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error adding product to cart, please trying again later' });
    }
};

exports.getByUserId = async (req, res) => {
    try {
        const { id } = req.params;
        const cartItems = await Cart.find({ user: id });
        const populatedCartItems = await Promise.all(cartItems.map(populateProduct));
        res.status(200).json(populatedCartItems);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error fetching cart items, please trying again later' });
    }
};

exports.updateById = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Cart.updateById(id, {
            ...req.body,
            quantity: Number(req.body.quantity) // Ensure quantity is a number
        });
        // Populate product, brand, and category for the response
        const populated = await populateProduct(updated);
        res.status(200).json(populated);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error updating cart items, please trying again later' });
    }
};

exports.deleteById = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Cart.deleteById(id);
        res.status(200).json(deleted);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error deleting cart item, please trying again later' });
    }
};

exports.deleteByUserId = async (req, res) => {
    try {
        const { id } = req.params;
        await Cart.deleteMany({ user: id });
        res.sendStatus(204);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Some Error occured while resetting your cart' });
    }
};