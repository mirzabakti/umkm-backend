const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const multer = require('multer');
const path = require('path');

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
router.post('/', orderController.createOrder);
router.get('/:id', orderController.getOrderDetail); // detail per order
router.get('/customer/:customer_id', orderController.getOrdersByCustomer);
router.patch('/:id/status', orderController.updateOrderStatus);
router.patch('/:id/payment-proof', upload.single('payment_proof'), orderController.uploadPaymentProof);

module.exports = router;
