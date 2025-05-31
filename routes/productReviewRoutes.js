const express = require('express');
const router = express.Router();
const { getAllProductReviews, getProductReviewById, createProductReview, updateProductReview, deleteProductReview } = require('../controllers/productReviewController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { body, param } = require('express-validator');
const handleValidationErrors = require('../middleware/handleValidationErrors');

// Protect routes? (Reviews might be viewable by anyone, creation/update/deletion only by customer/admin)
// router.use(protect); // Apply protection where needed

// Get all reviews (maybe allow anyone to view)
router.get('/', getAllProductReviews);
// Get review by ID
router.get('/:id', getProductReviewById);

// Create new review (requires customer or admin)
// router.post(
//   '/',
//   protect, // Middleware 1
//   authorizeRoles(['customer', 'admin', 'owner']), // Middleware 2
//   // Validator middleware array followed by error handler middleware
//   [
//     body('product_id').isInt({ gt: 0 }).withMessage('ID Produk tidak valid'),
//     body('customer_id').isInt({ gt: 0 }).withMessage('ID Customer tidak valid'), // Should match authenticated user's customer_id
//     body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating harus antara 1 dan 5'),
//     body('comment').trim().notEmpty().withMessage('Komentar tidak boleh kosong'),
//   ],
//   handleValidationErrors,
//   createProductReview // Final handler
// );

// Update review (requires original author or admin/owner)
// router.put(
//   '/:id',
//   protect,
//   authorizeRoles(['customer', 'admin', 'owner']),
//    // Validator middleware array followed by error handler middleware
//   [
//     param('id').isInt({ gt: 0 }).withMessage('ID Review tidak valid'),
//     body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating harus antara 1 dan 5'),
//     body('comment').trim().notEmpty().withMessage('Komentar tidak boleh kosong'),
//     // Note: product_id and customer_id are typically not changeable during update
//   ],
//   handleValidationErrors,
//   updateProductReview
// );

// Delete review (requires original author or admin/owner)
// router.delete(
//   '/:id',
//   protect,
//   authorizeRoles(['customer', 'admin', 'owner']),
//    // Validator middleware array followed by error handler middleware
//   [
//      param('id').isInt({ gt: 0 }).withMessage('ID Review tidak valid'),
//   ],
//   handleValidationErrors,
//   deleteProductReview
// );

module.exports = router; 