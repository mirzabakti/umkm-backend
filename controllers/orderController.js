const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

// Menampilkan semua pesanan (tanpa detail)
exports.getAllOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.order_id, c.customer_name, o.order_date, o.status, o.payment_proof
      FROM orders o
      JOIN customers c ON o.customer_id = c.customer_id
      ORDER BY o.order_id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Tambah pesanan baru + detail
exports.createOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    const { customer_id, items } = req.body;

    await client.query('BEGIN');

    // 1. Insert Orders
    const orderRes = await client.query(
      'INSERT INTO orders (customer_id, status) VALUES ($1, $2) RETURNING order_id',
      [customer_id, 'Menunggu Pembayaran']
    );
    const order_id = orderRes.rows[0].order_id;

    // 2. Insert Order_Details untuk setiap item
    for (let item of items) {
      await client.query(
        'INSERT INTO order_details (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [order_id, item.product_id, item.quantity, item.price]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ order_id, message: 'Order created successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Server Error');
  } finally {
    client.release();
  }
};

// Ambil detail pesanan berdasarkan order_id
exports.getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // Ambil informasi utama pesanan
    const orderResult = await pool.query(`
      SELECT o.order_id, o.order_date, c.customer_name, o.status
      FROM orders o
      JOIN customers c ON o.customer_id = c.customer_id
      WHERE o.order_id = $1
    `, [id]);

    // Jika tidak ditemukan
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Ambil detail item dari pesanan
    const itemsResult = await pool.query(`
      SELECT od.product_id, p.product_name, od.quantity, od.price
      FROM order_details od
      JOIN products p ON od.product_id = p.product_id
      WHERE od.order_id = $1
    `, [id]);

    // Gabungkan dan kirim
    res.json({
      ...orderResult.rows[0],
      items: itemsResult.rows
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Ambil semua order berdasarkan customer_id
exports.getOrdersByCustomer = async (req, res) => {
  try {
    const { customer_id } = req.params;
    const result = await pool.query(`
      SELECT o.order_id, o.order_date, o.status
      FROM orders o
      WHERE o.customer_id = $1
      ORDER BY o.order_date DESC
    `, [customer_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update status order
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query('UPDATE orders SET status = $1 WHERE order_id = $2', [status, id]);
    res.json({ message: 'Status order berhasil diupdate' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Upload bukti pembayaran
exports.uploadPaymentProof = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const filePath = `/uploads/payment_proofs/${req.file.filename}`;
    await pool.query('UPDATE orders SET payment_proof = $1 WHERE order_id = $2', [filePath, id]);
    res.json({ message: 'Bukti pembayaran berhasil diupload', payment_proof: filePath });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
