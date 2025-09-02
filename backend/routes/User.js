const express = require('express');
const userController = require('../controllers/User');
const VerifyToken = require('../middleware/VerifyToken');
const router = express.Router();

console.log('becomeSeller:', typeof userController.becomeSeller);
console.log('becomeVendor:', typeof userController.becomeVendor);
console.log('signup:', typeof userController.signup);
console.log('login:', typeof userController.login);
console.log('checkAuth:', typeof userController.checkAuth);
console.log('getById:', typeof userController.getById);
console.log('updateById:', typeof userController.updateById);
console.log('getSellerDashboard:', typeof userController.getSellerDashboard);
console.log('adminAnalytics:', typeof userController.adminAnalytics);

router
  .post('/signup', userController.signup)
  .post('/login', userController.login)
  // .post('/verify-otp', userController.verifyOtp)
  // .post('/resend-otp', userController.resendOtp)
  // .post('/forgot-password', userController.forgotPassword)
  // .post('/reset-password', userController.resetPassword)
  .get('/check-auth', VerifyToken, userController.checkAuth)
  .get('/:id', userController.getById)
  .patch('/:id', userController.updateById)
  .post('/become-seller', VerifyToken, userController.becomeSeller)
  .post('/become-vendor', VerifyToken, userController.becomeVendor)
  .get('/seller/dashboard', VerifyToken, userController.getSellerDashboard)
  .get('/admin/analytics', userController.adminAnalytics)
  .post('/:id/approve-seller', VerifyToken, userController.approveSeller)
  .post('/:id/reject-seller', VerifyToken, userController.rejectSeller);

module.exports = router;