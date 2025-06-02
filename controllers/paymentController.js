const pool = require('../config/db');
const { validationResult } = require('express-validator');
const handleValidationErrors = require('../middleware/handleValidationErrors');
const multer = require('multer'); // Import multer
const path = require('path');

// Setup Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/payments'); // Directory to save payment proofs
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // 1MB file size limit
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
}).single('payment_proof'); // 'payment_proof' is the field name in the form

// Check file type
function checkFileType(file, cb){
    // Allowed ext
    const filetypes = /jpeg|jpg|png|pdf/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname){
        return cb(null,true);
    } else {
        cb('Error: Images and PDFs Only!');
    }
}

// Create a new payment record (including file upload)
const createPayment = async (req, res) => {
    upload(req, res, async (err) => {
        if(err) {
            // console.error('Multer upload error:', err);
            res.status(400).json({ message: err });
        } else if (req.file == undefined) {
            // Payment record without file upload is also possible initially
            // But for proof of payment, file is usually required.
            // Adjust logic based on whether proof is optional or required at this step.
            // For now, let's allow creation without file, proof path will be null.

            // Process data without file
            const { order_id, payment_method, amount, payment_date } = req.body;
             try {
                 const result = await pool.query(
                    'INSERT INTO payments (order_id, payment_method, amount, payment_date, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *'
                    , [order_id, payment_method, amount, payment_date, 'Menunggu Verifikasi']);
                 res.status(201).json(result.rows[0]);
             } catch (error) {
                 console.error('Error creating payment record without file:', error);
                 res.status(500).json({ message: 'Server error while creating payment record' });
             }

        } else {
            // File uploaded successfully
            // console.log('File uploaded successfully:', req.file);
            // console.log('Request body:', req.body);
            const { order_id, payment_method, amount, payment_date } = req.body;
            const payment_proof_path = `/uploads/payments/${req.file.filename}`;
            const status = 'Menunggu Verifikasi'; // Default status after proof upload

            try {
                const result = await pool.query(
                    'INSERT INTO payments (order_id, payment_method, amount, payment_date, payment_proof_path, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *'
                    , [order_id, payment_method, amount, payment_date, payment_proof_path, status]);

                // Optionally, update order status here as well, e.g., to 'Menunggu Verifikasi Pembayaran'
                // await pool.query('UPDATE orders SET status = $1, updated_at = NOW() WHERE order_id = $2', ['Menunggu Verifikasi Pembayaran', order_id]);

                res.status(201).json(result.rows[0]);
            } catch (error) {
                console.error('Error creating payment record with file:', error);
                res.status(500).json({ message: 'Server error while creating payment record' });
            }
        }
    });
};

// Update payment status (e.g., Admin marks as Verified)
const updatePaymentStatus = async (req, res) => {
    const { id } = req.params; // Payment ID
    const { status } = req.body; // New status

    // Basic validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const result = await pool.query(
            'UPDATE payments SET status = $1, updated_at = NOW() WHERE payment_id = $2 RETURNING *'
            , [status, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Payment record not found' });
        }

        // Trigger order status update based on payment status change
        const updatedPayment = result.rows[0];
        let newOrderStatus = null;

        if (status === 'Terverifikasi') {
            newOrderStatus = 'Terverifikasi'; // atau 'Sudah Dibayar', sesuaikan dengan alur Anda
        } else if (status === 'Ditolak') {
             newOrderStatus = 'Pembayaran Ditolak'; // Status baru untuk order yang pembayarannya ditolak
        } else if (status === 'Menunggu Verifikasi'){
            newOrderStatus = 'Menunggu Verifikasi Pembayaran';
        }
        // Tambahkan kondisi lain jika ada status pembayaran baru

        if (newOrderStatus) {
             try {
                 await pool.query('UPDATE orders SET status = $1, updated_at = NOW() WHERE order_id = $2', [newOrderStatus, updatedPayment.order_id]);
                 console.log(`Order ${updatedPayment.order_id} status updated to ${newOrderStatus}`);
             } catch (orderUpdateError) {
                 console.error('Error updating order status after payment update:', orderUpdateError);
                 // Pertimbangkan bagaimana menangani error ini, mungkin perlu logging atau notifikasi
             }
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({ message: 'Server error while updating payment status' });
    }
};

// Get payment details by Order ID (useful for both Customer and Admin)
const getPaymentByOrderId = async (req, res) => {
    const { orderId } = req.params;
    try {
        const result = await pool.query('SELECT * FROM payments WHERE order_id = $1', [orderId]);

        if (result.rows.length === 0) {
            // It's possible an order doesn't have payment info yet
            return res.status(404).json({ message: 'Payment information not found for this order' });
        }

        // TODO: Add authorization check here to ensure customer only sees payment for their own order

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching payment by Order ID:', error);
        res.status(500).json({ message: 'Server error while fetching payment by order ID' });
    }
};

// Get all payments (Admin/Owner only)
const getAllPayments = async (req, res) => {
    try {
        // JOIN with orders and customers to display relevant info
        const result = await pool.query(`
            SELECT
                p.*,
                o.order_date,
                c.customer_name
            FROM
                payments p
            JOIN
                orders o ON p.order_id = o.order_id
            JOIN
                customers c ON o.customer_id = c.customer_id
            ORDER BY
                p.created_at DESC
        `);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching all payments:', error);
        res.status(500).json({ message: 'Server error while fetching payments' });
    }
};

// Add other payment-related functions as needed (e.g., getAllPayments for admin)

module.exports = {
    createPayment,
    updatePaymentStatus,
    getPaymentByOrderId,
    getAllPayments,
    // Add other functions here
}; 