const express = require('express');
const router = express.Router();
const { createDelivery, getAllDeliveries, getDeliveryById, getDeliveryByOrderId, updateDelivery, deleteDelivery } = require('../controllers/deliveryController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { body, param } = require('express-validator');
const handleValidationErrors = require('../middleware/handleValidationErrors');

// Middleware for admin/owner access
const requireAdmin = [verifyToken, authorizeRoles(['admin', 'owner'])];

// Middleware for customer or admin/owner access (for specific order/delivery)
// Note: Authorization logic to check if the customer owns the order needs to be implemented in the controller
const requireCustomerOrAdmin = [verifyToken, authorizeRoles(['customer', 'admin', 'owner'])];

// Create new delivery (Admin/Owner only)
router.post('/', requireAdmin,
  [
    body('order_id').isInt({ gt: 0 }).withMessage('ID Order tidak valid'),
    body('status').trim().notEmpty().withMessage('Status pengiriman tidak boleh kosong'),
    body('shipping_address').trim().notEmpty().withMessage('Alamat pengiriman tidak boleh kosong'),
    body('city').trim().notEmpty().withMessage('Kota tidak boleh kosong'),
    body('postal_code').trim().notEmpty().withMessage('Kode pos tidak boleh kosong'),
    body('country').trim().notEmpty().withMessage('Negara tidak boleh kosong'),
    body('delivery_date').optional().isISO8601().toDate().withMessage('Format tanggal pengiriman tidak valid (YYYY-MM-DD)'),
    body('tracking_number').optional().trim(),
  ],
  handleValidationErrors,
  createDelivery
);

// Get all deliveries (Admin/Owner only)
router.get('/', requireAdmin, getAllDeliveries);

// Get a single delivery by ID (Customer related to order or Admin/Owner)
router.get('/:id', requireCustomerOrAdmin,
  [
    param('id').isInt({ gt: 0 }).withMessage('ID Pengiriman tidak valid'),
  ],
  handleValidationErrors,
  getDeliveryById
);

// Get delivery by Order ID (Customer related to order or Admin/Owner)
router.get('/order/:orderId', requireCustomerOrAdmin,
   [
     param('orderId').isInt({ gt: 0 }).withMessage('ID Order tidak valid'),
   ],
   handleValidationErrors,
   getDeliveryByOrderId
);


// Update a delivery (Admin/Owner only)
router.put('/:id', requireAdmin,
  [
     param('id').isInt({ gt: 0 }).withMessage('ID Pengiriman tidak valid'),
     body('status').optional().trim().notEmpty().withMessage('Status pengiriman tidak boleh kosong'),
     body('tracking_number').optional().trim(),
     body('delivery_date').optional().isISO8601().toDate().withMessage('Format tanggal pengiriman tidak valid (YYYY-MM-DD)'),
     body('shipping_address').optional().trim().notEmpty().withMessage('Alamat pengiriman tidak boleh kosong'),
     body('city').optional().trim().notEmpty().withMessage('Kota tidak boleh kosong'),
     body('postal_code').optional().trim().notEmpty().withMessage('Kode pos tidak boleh kosong'),
     body('country').optional().trim().notEmpty().withMessage('Negara tidak boleh kosong'),
  ],
  handleValidationErrors,
  updateDelivery
);

// Delete a delivery (Admin/Owner only)
router.delete('/:id', requireAdmin,
  [
     param('id').isInt({ gt: 0 }).withMessage('ID Pengiriman tidak valid'),
  ],
  handleValidationErrors,
  deleteDelivery
);

module.exports = router; 