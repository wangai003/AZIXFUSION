const express = require('express');
const router = express.Router();
const ServiceController = require('../controllers/Service');
const VerifyToken = require('../middleware/VerifyToken');

// Enhanced service routes
router.post('/', VerifyToken, ServiceController.create);
router.get('/', ServiceController.getAll);
router.get('/search', ServiceController.search);
router.get('/featured', ServiceController.getFeatured);
router.get('/category/:category', ServiceController.getByCategory);
router.get('/category/:category/:subcategory', ServiceController.getByCategory);
router.get('/:id', ServiceController.getById);
router.put('/:id', VerifyToken, ServiceController.updateById);
router.delete('/:id', VerifyToken, ServiceController.deleteById);

module.exports = router; 