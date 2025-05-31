const express = require('express');
const router = express.Router();
const { getAllDiscounts, getDiscountById, createDiscount, updateDiscount, deleteDiscount } = require('../controllers/discountController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { body } = require('express-validator'); // Need body for validation
const handleValidationErrors = require('../middleware/handleValidationErrors'); // Import the validation error handler

// Protect routes and authorize admin/owner
// router.use(protect);
// router.use(authorize(['admin', 'owner']));

router.get('/', getAllDiscounts);
router.get('/:id', getDiscountById);

router.post('/',
  [
    body('discount_percentage').isFloat({ gt: 0, lte: 100 }).withMessage('Persentase diskon harus antara 0-100'),
    body('start_date').isISO8601().toDate().withMessage('Format tanggal mulai tidak valid'),
    body('end_date').isISO8601().toDate().withMessage('Format tanggal berakhir tidak valid'),
    body('product_id').optional({ nullable: true }).isInt({ gt: 0 }).withMessage('ID Produk tidak valid'), // product_id can be null
    body('discount_category_id').optional({ nullable: true }).isInt({ gt: 0 }).withMessage('ID Kategori Diskon tidak valid'), // discount_category_id can be null
  ],
  handleValidationErrors,
  createDiscount
);

router.put('/:id',
  [
    body('discount_percentage').isFloat({ gt: 0, lte: 100 }).withMessage('Persentase diskon harus antara 0-100'),
    body('start_date').isISO8601().toDate().withMessage('Format tanggal mulai tidak valid'),
    body('end_date').isISO8601().toDate().withMessage('Format tanggal berakhir tidak valid'),
     body('product_id').optional({ nullable: true }).isInt({ gt: 0 }).withMessage('ID Produk tidak valid'), // product_id can be null
    body('discount_category_id').optional({ nullable: true }).isInt({ gt: 0 }).withMessage('ID Kategori Diskon tidak valid'), // discount_category_id can be null
  ],
  handleValidationErrors,
  updateDiscount
);

router.delete('/:id', deleteDiscount);

module.exports = router; 