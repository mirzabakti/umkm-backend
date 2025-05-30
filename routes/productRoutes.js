// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator'); // Import express-validator

// Middleware untuk mengecek hasil validasi
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Definisi rute
router.get('/', productController.getAllProducts);    // GET semua produk (public)

// POST tambah produk (admin/owner) dengan validasi
router.post('/', authMiddleware.verifyToken, authMiddleware.isAdmin,
  [ // Middleware validasi
    body('product_name').notEmpty().withMessage('Nama produk tidak boleh kosong'),
    body('price').isFloat({ gt: 0 }).withMessage('Harga harus angka positif'),
    body('stock').isInt({ gt: -1 }).withMessage('Stok harus angka non-negatif'), // Stok bisa 0
    body('category_id').isInt({ gt: 0 }).withMessage('ID kategori tidak valid'), // Asumsikan category_id > 0
    //body('description').optional().trim(), // Deskripsi opsional
    //body('image_url').optional().isURL().withMessage('URL gambar tidak valid'), // Jika menggunakan URL gambar
  ],
  handleValidationErrors,
  productController.createProduct
);

// PUT update produk (admin/owner) dengan validasi
router.put('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin,
  [ // Middleware validasi
    body('product_name').notEmpty().withMessage('Nama produk tidak boleh kosong'),
    body('price').isFloat({ gt: 0 }).withMessage('Harga harus angka positif'),
    body('stock').isInt({ gt: -1 }).withMessage('Stok harus angka non-negatif'),
    body('category_id').isInt({ gt: 0 }).withMessage('ID kategori tidak valid'),
    //body('description').optional().trim(),
    //body('image_url').optional().isURL().withMessage('URL gambar tidak valid'),
  ],
  handleValidationErrors,
  productController.updateProduct
);

router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, productController.deleteProduct); // DELETE hapus produk (admin/owner)
router.get('/:id', productController.getProductById);

module.exports = router;
