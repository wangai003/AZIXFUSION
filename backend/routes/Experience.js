const express = require('express');
const router = express.Router();
const experienceController = require('../controllers/ExperienceController');
const verifyToken = require('../middleware/VerifyToken');

// Authentication middleware for protected routes
const requireAuth = verifyToken;

// Experience CRUD operations
router.post('/', requireAuth, experienceController.createExperience);
router.get('/', experienceController.getAllExperiences);
router.get('/:id', experienceController.getExperienceById);
router.put('/:id', requireAuth, experienceController.updateExperience);
router.delete('/:id', requireAuth, experienceController.deleteExperience);

// Host-specific routes
router.get('/host/experiences', requireAuth, experienceController.getHostExperiences);

// Featured and special experience routes
router.get('/featured/list', experienceController.getFeaturedExperiences);

// Category-based routes
router.get('/category/:category', experienceController.getExperiencesByCategory);
router.get('/category/:category/:subcategory', experienceController.getExperiencesByCategory);

// Search route
router.get('/search', experienceController.searchExperiences);

module.exports = router;