const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/Message');
const VerifyToken = require('../middleware/VerifyToken');

router.post('/', VerifyToken, MessageController.create);
router.get('/user/:id', VerifyToken, MessageController.getByUserId);
router.get('/order/:id', VerifyToken, MessageController.getByOrderId);
router.get('/service/:id', VerifyToken, MessageController.getByServiceId);

module.exports = router; 