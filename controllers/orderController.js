const pool = require('../config/db');

// Menampilkan semua pesanan (tanpa detail)
exports.getAllOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.order_id, c.customer_name, o.order_date
      FROM Orders o
      JOIN Customers c ON o.customer_id = c.customer_id
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
      'INSERT INTO Orders (customer_id) VALUES ($1) RETURNING order_id',
      [customer_id]
    );
    const order_id = orderRes.rows[0].order_id;

    // 2. Insert Order_Details untuk setiap item
    for (let item of items) {
      await client.query(
        'INSERT INTO Order_Details (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
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
      SELECT o.order_id, o.order_date, c.customer_name
      FROM Orders o
      JOIN Customers c ON o.customer_id = c.customer_id
      WHERE o.order_id = $1
    `, [id]);

    // Jika tidak ditemukan
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Ambil detail item dari pesanan
    const itemsResult = await pool.query(`
      SELECT od.product_id, p.product_name, od.quantity, od.price
      FROM Order_Details od
      JOIN Products p ON od.product_id = p.product_id
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
