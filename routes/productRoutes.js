// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Definisi rute
router.get('/', productController.getAllProducts);    // GET semua produk
router.post('/', productController.createProduct);    // POST tambah produk
router.put('/:id', productController.updateProduct);  // PUT update produk
router.delete('/:id', productController.deleteProduct); // DELETE hapus produk

module.exports = router;
