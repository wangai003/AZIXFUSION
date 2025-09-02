const express = require('express');
const router = express.Router();
const Category = require('../controllers/Category');

// Get all main categories
router.get('/main', Category.getMainCategories);

// Get subcategories by parent category ID
router.get('/subcategories/:parentId', Category.getSubcategories);

// Get elements by subcategory ID
router.get('/elements/:subcategoryId', Category.getElements);

// Get full category hierarchy
router.get('/hierarchy', Category.getFullHierarchy);

// Get category path (breadcrumb)
router.get('/path/:categoryId', Category.getCategoryPath);

// Get category by slug
router.get('/slug/:slug', Category.getBySlug);

// Get categories by type
router.get('/type/:type', Category.getByType);

// Get categories by level
router.get('/level/:level', Category.getByLevel);

// Search categories
router.get('/search', Category.search);

// Get category statistics
router.get('/statistics', Category.getStatistics);

// Get all categories (for backward compatibility)
router.get('/', Category.getAll);

// Get category by ID
router.get('/:id', Category.getById);

// Create a new category
router.post('/', Category.create);

// Bulk create categories (for seeding)
router.post('/bulk', Category.bulkCreate);

// Update a category
router.put('/:id', Category.updateById);

// Delete a category
router.delete('/:id', Category.deleteById);

// Clear all categories (for resetting)
router.delete('/clear/all', Category.clearAll);

module.exports = router;