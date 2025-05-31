const express = require('express');
const router = express.Router();
const { getAllDiscountCategories, getDiscountCategoryById, createDiscountCategory, updateDiscountCategory, deleteDiscountCategory } = require('../controllers/discountCategoryController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');
const handleValidationErrors = require('../middleware/handleValidationErrors');

// Protect routes and authorize admin/owner
// router.use(protect);
// router.use(authorize(['admin', 'owner']));

router.get('/', getAllDiscountCategories);
router.get('/:id', getDiscountCategoryById);

router.post('/',
  [
    body('discount_category_name').notEmpty().withMessage('Nama kategori diskon tidak boleh kosong'),
  ],
  handleValidationErrors,
  createDiscountCategory
);

router.put('/:id',
  [
    body('discount_category_name').notEmpty().withMessage('Nama kategori diskon tidak boleh kosong'),
  ],
  handleValidationErrors,
  updateDiscountCategory
);

router.delete('/:id', deleteDiscountCategory);

module.exports = router; 