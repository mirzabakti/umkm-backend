// routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { body, validationResult } = require('express-validator'); // Import express-validator

// Middleware untuk mengecek hasil validasi (disalin dari authRoutes.js)
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Daftar rute
router.get('/', customerController.getAllCustomers);

// POST tambah customer dengan validasi (mungkin hanya untuk admin/owner)
router.post('/',
  [
    body('customer_name').notEmpty().withMessage('Nama customer tidak boleh kosong'),
    body('address').notEmpty().withMessage('Alamat tidak boleh kosong'),
    body('phone_number').notEmpty().withMessage('Nomor telepon tidak boleh kosong'),
    body('email').isEmail().withMessage('Format email tidak valid').normalizeEmail(),
  ],
  handleValidationErrors,
  customerController.createCustomer
);

// PUT update customer dengan validasi
router.put('/:id',
  [
    body('customer_name').notEmpty().withMessage('Nama customer tidak boleh kosong'),
    body('address').notEmpty().withMessage('Alamat tidak boleh kosong'),
    body('phone_number').notEmpty().withMessage('Nomor telepon tidak boleh kosong'),
    body('email').isEmail().withMessage('Format email tidak valid').normalizeEmail(),
  ],
  handleValidationErrors,
  customerController.updateCustomer
);

router.delete('/:id', customerController.deleteCustomer);
router.get('/user/:user_id', customerController.getCustomerByUserId);

module.exports = router;
