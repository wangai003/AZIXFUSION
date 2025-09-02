const express = require('express');
const router = express.Router();
const ServiceRequestController = require('../controllers/ServiceRequest');
const VerifyToken = require('../middleware/VerifyToken');

// Service Requests
router.post('/', VerifyToken, ServiceRequestController.create);
router.get('/', ServiceRequestController.getAll);
router.get('/:id', ServiceRequestController.getById);
router.patch('/:id', VerifyToken, ServiceRequestController.updateById);
router.delete('/:id', VerifyToken, ServiceRequestController.deleteById);

// Applications
router.post('/:id/apply', VerifyToken, ServiceRequestController.createApplication);
router.get('/:id/applications', ServiceRequestController.getApplications);
router.patch('/applications/:id', VerifyToken, ServiceRequestController.updateApplication);

module.exports = router; 