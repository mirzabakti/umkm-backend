const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware'); // Assuming auth middleware path

// Multer middleware setup is in the controller, we will use the controller function that includes upload

// Create a new payment record (with optional file upload handled in controller)
router.post('/', verifyToken, authorizeRoles('customer', 'admin', 'owner'), paymentController.createPayment);

// Update payment status (Admin/Owner only)
router.patch('/:id/status', verifyToken, authorizeRoles('admin', 'owner'), paymentController.updatePaymentStatus);

// Get payment details by Order ID (Customer/Admin/Owner - needs controller auth check)
router.get('/order/:orderId', verifyToken, authorizeRoles('customer', 'admin', 'owner'), paymentController.getPaymentByOrderId);

// Get all payments (Admin/Owner only)
router.get('/', verifyToken, authorizeRoles('admin', 'owner'), paymentController.getAllPayments);

module.exports = router; 