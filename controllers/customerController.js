// controllers/customerController.js
const pool = require('../config/db');

// Ambil semua pelanggan
exports.getAllCustomers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Tambah pelanggan baru
exports.createCustomer = async (req, res) => {
  try {
    const { customer_name, address, phone_number, email, password } = req.body;
    const result = await pool.query(
      'INSERT INTO customers (customer_name, address, phone_number, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [customer_name, address, phone_number, email, password]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update pelanggan
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_name, address, phone_number, email, password } = req.body;
    const result = await pool.query(
      'UPDATE customers SET customer_name=$1, address=$2, phone_number=$3, email=$4, password=$5 WHERE customer_id=$6 RETURNING *',
      [customer_name, address, phone_number, email, password, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Hapus pelanggan
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM customers WHERE customer_id=$1', [id]);
    res.send('Customer deleted');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Ambil customer berdasarkan user_id
exports.getCustomerByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    const result = await pool.query('SELECT * FROM customers WHERE user_id = $1', [user_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
