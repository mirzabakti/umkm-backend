const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

// Middleware untuk mengecek hasil validasi
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Register (khusus customer) dengan validasi
router.post('/register',
  [
    body('name').notEmpty().withMessage('Nama tidak boleh kosong'),
    body('email').isEmail().withMessage('Format email tidak valid').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
  ],
  handleValidationErrors,
  authController.register
);

// Login (admin/customer)
router.post('/login', authController.login);

// router.get('/admin-only', authMiddleware.verifyToken, authMiddleware.isAdmin, authController.adminFunc);

// router.get('/customer-only', authMiddleware.verifyToken, authMiddleware.isCustomer, authController.customerFunc);

// router.get('/customer-area', authMiddleware.verifyToken, authMiddleware.isCustomer, authController.customerFunc);

// router.post('/admin-area', authMiddleware.verifyToken, authMiddleware.isAdmin, authController.adminFunc);

module.exports = router; 