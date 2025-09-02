const express = require('express');
const router = express.Router();
const Product = require('../controllers/Product');
const { verifyFirebaseToken } = require('../middleware/FirebaseAuth');

// Apply Firebase authentication middleware to all routes
router.use(verifyFirebaseToken);

// Get all products with filters
router.get('/', Product.getAll);

// Get featured products with highest ratings
router.get('/featured', Product.getFeatured);

// Get products by main category
router.get('/category/:categoryId', Product.getByMainCategory);

// Get products by subcategory
router.get('/subcategory/:subcategoryId', Product.getBySubcategory);

// Get products by element
router.get('/element/:elementId', Product.getByElement);

// Search products
router.get('/search', Product.search);

// Get product by ID
router.get('/:id', Product.getById);

// Create a new product
router.post('/', Product.create);

// Update product
router.put('/:id', Product.updateById);

// Delete product
router.delete('/:id', Product.deleteById);

module.exports = router;