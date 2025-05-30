const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const multer = require('multer');
const path = require('path');
const { body, validationResult, param } = require('express-validator');

// Middleware untuk mengecek hasil validasi (disalin dari file lain)
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../uploads/payment_proofs');
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

router.get('/', orderController.getAllOrders);

// POST tambah pesanan baru + detail dengan validasi
router.post('/',
  [
    body('customer_id').isInt({ gt: 0 }).withMessage('ID customer tidak valid'),
    body('items').isArray({ min: 1 }).withMessage('Order harus memiliki minimal satu item'),
    body('items.*.product_id').isInt({ gt: 0 }).withMessage('ID produk item tidak valid'),
    body('items.*.quantity').isInt({ gt: 0 }).withMessage('Kuantitas item harus positif'),
    body('items.*.price').isFloat({ gt: 0 }).withMessage('Harga item harus positif'),
  ],
  handleValidationErrors,
  orderController.createOrder
);

router.get('/:id', orderController.getOrderDetail); // detail per order
router.get('/customer/:customer_id', orderController.getOrdersByCustomer);

// Update status order dengan validasi
router.patch('/:id/status',
  [
    param('id').isInt({ gt: 0 }).withMessage('ID order tidak valid'),
    body('status').notEmpty().withMessage('Status tidak boleh kosong'), // Bisa diperketat dengan .isIn(['status1', 'status2']) jika status fix
  ],
  handleValidationErrors,
  orderController.updateOrderStatus
);

router.patch('/:id/payment-proof', upload.single('payment_proof'), orderController.uploadPaymentProof);

module.exports = router;
