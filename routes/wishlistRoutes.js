const express = require('express');
const router = express.Router();
const { getWishlistByCustomerId, addProductToWishlist, removeProductFromWishlist } = require('../controllers/wishlistController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { body, param } = require('express-validator');
const handleValidationErrors = require('../middleware/handleValidationErrors');

// Get wishlist by customer ID (can be accessed by the customer themselves or admin/owner)
router.get('/:customer_id',
  verifyToken,
  authorizeRoles(['customer', 'admin', 'owner']),
  [
    param('customer_id').isInt({ gt: 0 }).withMessage('ID Customer tidak valid')
  ],
  handleValidationErrors,
  getWishlistByCustomerId
);

// Add product to wishlist
router.post('/',
  verifyToken,
  authorizeRoles(['customer', 'admin', 'owner']),
  [
    body('product_id').isInt({ gt: 0 }).withMessage('ID Produk tidak valid'),
    body('customer_id').isInt({ gt: 0 }).withMessage('ID Customer tidak valid')
  ],
  handleValidationErrors,
  addProductToWishlist
);

// Remove product from wishlist by wishlist_id
router.delete('/:wishlist_id',
  verifyToken,
  authorizeRoles(['customer', 'admin', 'owner']),
  [
    param('wishlist_id').isInt({ gt: 0 }).withMessage('ID Wishlist tidak valid')
  ],
  handleValidationErrors,
  removeProductFromWishlist
);

module.exports = router; 