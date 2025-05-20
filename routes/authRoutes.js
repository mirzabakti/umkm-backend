const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Register (khusus customer)
router.post('/register', authController.register);
// Login (admin/customer)
router.post('/login', authController.login);

// router.get('/admin-only', authMiddleware.verifyToken, authMiddleware.isAdmin, authController.adminFunc);

// router.get('/customer-only', authMiddleware.verifyToken, authMiddleware.isCustomer, authController.customerFunc);

// router.get('/customer-area', authMiddleware.verifyToken, authMiddleware.isCustomer, authController.customerFunc);

// router.post('/admin-area', authMiddleware.verifyToken, authMiddleware.isAdmin, authController.adminFunc);

module.exports = router; 