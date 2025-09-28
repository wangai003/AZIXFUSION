const express = require('express');
const router = express.Router();
const exportProductController = require('../controllers/ExportProductController');
const verifyToken = require('../middleware/VerifyToken');

// Authentication middleware for protected routes
const requireAuth = verifyToken;

// Export product CRUD operations
router.post('/', requireAuth, exportProductController.createExportProduct);
router.get('/', exportProductController.getAllExportProducts);
router.get('/:id', exportProductController.getExportProductById);
router.put('/:id', requireAuth, exportProductController.updateExportProduct);
router.delete('/:id', requireAuth, exportProductController.deleteExportProduct);

// Exporter-specific routes
router.get('/exporter/products', requireAuth, exportProductController.getExporterProducts);

// Featured and special product routes
router.get('/featured/list', exportProductController.getFeaturedExportProducts);

// Category-based routes
router.get('/category/:category', exportProductController.getExportProductsByCategory);
router.get('/category/:category/:subcategory', exportProductController.getExportProductsByCategory);

// Search route
router.get('/search/products', exportProductController.searchExportProducts);

// Inquiry and analytics routes
router.post('/:id/inquiry', requireAuth, exportProductController.submitProductInquiry);
router.get('/:id/analytics', requireAuth, exportProductController.getProductAnalytics);

module.exports = router;