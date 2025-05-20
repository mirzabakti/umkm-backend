// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

// Definisi rute
router.get('/', productController.getAllProducts);    // GET semua produk (public)
router.post('/', authMiddleware.verifyToken, authMiddleware.isAdmin, productController.createProduct);    // POST tambah produk (admin/owner)
router.put('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, productController.updateProduct);  // PUT update produk (admin/owner)
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, productController.deleteProduct); // DELETE hapus produk (admin/owner)
router.get('/:id', productController.getProductById);

module.exports = router;
