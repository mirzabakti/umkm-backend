const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/', orderController.getAllOrders);
router.post('/', orderController.createOrder);
router.get('/:id', orderController.getOrderDetail); // detail per order
router.get('/customer/:customer_id', orderController.getOrdersByCustomer);

module.exports = router;
